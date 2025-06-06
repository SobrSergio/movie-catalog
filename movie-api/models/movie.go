// models/movie.go

package models

import (
	"time"

	"gorm.io/gorm"
)

// Movie модель фильма
type Movie struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Title     string    `json:"title" binding:"required,min=2"`
	Year      int       `json:"year" binding:"required,gte=1888,ltefield=CurrentYear"`
	Director  string    `json:"director" binding:"required,min=2"`
	Rating    float64   `json:"rating" binding:"required,gte=0,lte=10"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// CurrentYear используется лишь для валидации и не сохраняется в БД
	CurrentYear int `gorm:"-" json:"-"`
}

// BeforeCreate хук для установки CurrentYear перед валидацией
func (m *Movie) BeforeCreate(tx *gorm.DB) (err error) {
	m.CurrentYear = time.Now().Year()
	return
}

// BeforeUpdate хук для установки CurrentYear перед обновлением
func (m *Movie) BeforeUpdate(tx *gorm.DB) (err error) {
	m.CurrentYear = time.Now().Year()
	return
}

// User модель пользователя
type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"unique;not null" binding:"required,min=3"`
	Password  string    `json:"-" binding:"required,min=6"` // здесь будет храниться хеш
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Favorite связь "пользователь–фильм" (избранное/просмотренные)
type Favorite struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" binding:"required"`
	MovieID   uint      `json:"movie_id" binding:"required"`
	CreatedAt time.Time `json:"created_at"`

	User  User  `json:"user" gorm:"constraint:OnDelete:CASCADE;"`
	Movie Movie `json:"movie" gorm:"constraint:OnDelete:CASCADE;"`
}
