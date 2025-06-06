// controllers/favorite.go
package controllers

import (
	"net/http"
	"strconv"

	"movie-api/database"
	"movie-api/models"

	"github.com/gin-gonic/gin"
)

// AddFavorite добавляет фильм в избранное текущего пользователя
func AddFavorite(c *gin.Context) {
	userIDRaw, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Требуется авторизация"})
		return
	}
	userID := userIDRaw.(uint)

	movieIDParam := c.Param("id")
	movieID64, err := strconv.ParseUint(movieIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный ID фильма"})
		return
	}
	movieID := uint(movieID64)

	// Проверяем, что фильм существует
	var movie models.Movie
	if err := database.DB.First(&movie, movieID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Фильм не найден"})
		return
	}

	// Проверяем, не добавлен ли уже в избранное
	var existing models.Favorite
	if err := database.DB.
		Where("user_id = ? AND movie_id = ?", userID, movieID).
		First(&existing).Error; err == nil {
		// Просто возвращаем 200 OK, если уже есть
		c.JSON(http.StatusOK, gin.H{"message": "Уже в избранном"})
		return
	}

	fav := models.Favorite{UserID: userID, MovieID: movieID}
	if err := database.DB.Create(&fav).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось добавить в избранное"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Добавлено в избранное"})
}

// RemoveFavorite убирает фильм из избранного
func RemoveFavorite(c *gin.Context) {
	userIDRaw, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Требуется авторизация"})
		return
	}
	userID := userIDRaw.(uint)

	movieIDParam := c.Param("id")
	movieID64, err := strconv.ParseUint(movieIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный ID фильма"})
		return
	}
	movieID := uint(movieID64)

	// Удаляем связь “пользователь–фильм”
	if err := database.DB.
		Where("user_id = ? AND movie_id = ?", userID, movieID).
		Delete(&models.Favorite{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось удалить из избранного"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Удалено из избранного"})
}

// GetFavorites возвращает список избранных фильмов текущего пользователя
func GetFavorites(c *gin.Context) {
	userIDRaw, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Требуется авторизация"})
		return
	}
	userID := userIDRaw.(uint)

	var favorites []models.Favorite
	if err := database.DB.
		Preload("Movie").
		Where("user_id = ?", userID).
		Find(&favorites).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить избранное"})
		return
	}

	var movies []models.Movie
	for _, fav := range favorites {
		movies = append(movies, fav.Movie)
	}

	c.JSON(http.StatusOK, movies)
}
