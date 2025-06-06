// main.go

package main

import (
	"log"
	"movie-api/database"
	"movie-api/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Создаём новый engine Gin с Logger и Recovery middleware
	r := gin.Default()

	// Настраиваем CORS: разрешаем все домены, методы и заголовки
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // или можно указать конкретные: []string{"http://localhost:5173"}
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
	}))

	// Подключаем базу данных и миграции
	database.Connect()

	// Регистрируем роуты
	routes.SetupMovieRoutes(r)

	// Запускаем сервер на порту 8080
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Не удалось запустить сервер: %v", err)
	}
}
