// controllers/auth.go

package controllers

import (
	"fmt"
	"net/http"
	"time"

	"movie-api/database"
	"movie-api/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

var JwtKey = []byte("supersecretkey") // В продакшене можно загрузить из переменных окружения

// Register регистрирует нового пользователя
func Register(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required,min=3"`
		Password string `json:"password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Логин и пароль обязательны (минимум 3 и 6 символов)"})
		return
	}

	// Проверяем, нет ли уже такого пользователя
	var existing models.User
	if result := database.DB.Where("username = ?", input.Username).First(&existing); result.Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Пользователь с таким именем уже существует"})
		return
	}

	// Хешируем пароль
	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обработать пароль"})
		return
	}

	user := models.User{
		Username: input.Username,
		Password: string(hashed),
	}
	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать пользователя"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Регистрация прошла успешно"})
}

// Login аутентифицирует пользователя и возвращает JWT
func Login(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Не указан логин или пароль"})
		return
	}

	var user models.User
	if result := database.DB.Where("username = ?", input.Username).First(&user); result.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверные логин или пароль"})
		return
	}

	// Проверяем пароль
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверные логин или пароль"})
		return
	}

	// Создаём JWT
	expiration := time.Now().Add(24 * time.Hour)
	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"exp":      expiration.Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(JwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать токен"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": tokenString})
}

// AuthMiddleware проверяет JWT и устанавливает userID в контекст
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Требуется авторизация"})
			return
		}
		// Ожидаем формат "Bearer <token>"
		var tokenString string
		_, err := fmt.Sscanf(authHeader, "Bearer %s", &tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Некорректный заголовок Authorization"})
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Проверка метода подписи
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("неверный метод подписи")
			}
			return JwtKey, nil
		})
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Неверный токен"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Неверные данные в токене"})
			return
		}
		userIDf, ok := claims["user_id"].(float64)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Неверные данные в токене"})
			return
		}

		// Устанавливаем ID пользователя в контекст
		c.Set("userID", uint(userIDf))
		c.Next()
	}
}
