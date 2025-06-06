// database/db.go

package database

import (
	"log"
	"movie-api/models"
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Connect открывает БД и выполняет миграцию
func Connect() {
	var err error

	// Можно переопределить через переменную окружения: export DB_SOURCE="my.db"
	dsn := os.Getenv("DB_SOURCE")
	if dsn == "" {
		dsn = "movies.db"
	}

	DB, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Ошибка подключения к БД:", err)
	}

	// Мигрируем все модели сразу
	if err := DB.AutoMigrate(&models.Movie{}, &models.User{}, &models.Favorite{}); err != nil {
		log.Fatal("Ошибка миграции моделей:", err)
	}
}
