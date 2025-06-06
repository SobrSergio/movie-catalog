// main.go

package main

import (
	"log"
	"os"

	"movie-api/controllers"
	"movie-api/database"
	"movie-api/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Если хотите переопределить секрет JWT из .env:
	//   export JWT_SECRET="любой_секрет"
	if key := os.Getenv("JWT_SECRET"); key != "" {
		controllers.JwtKey = []byte(key)
	}

	// Создаём новый Gin-роутер
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// Настройка CORS (для разработки разрешаем всё; в продакшене можно указать конкретные домены)
	r.Use(cors.New(cors.Config{
		// вместо "*" указываем конкретный origin:
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true, // при таком AllowOrigins не "*", всё нормально работает
	}))

	// Подключаем базу данных и выполняем миграции
	database.Connect()

	// Регистрируем маршруты
	routes.SetupMovieRoutes(r)

	// Читаем порт из переменной окружения или используем 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Запускаем сервер
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Не удалось запустить сервер: %v", err)
	}
}
