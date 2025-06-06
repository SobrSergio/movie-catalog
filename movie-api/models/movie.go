package models

type Movie struct {
	ID       uint    `json:"id" gorm:"primaryKey"`
	Title    string  `json:"title"`
	Year     int     `json:"year"`
	Director string  `json:"director"`
	Rating   float64 `json:"rating"`
}
