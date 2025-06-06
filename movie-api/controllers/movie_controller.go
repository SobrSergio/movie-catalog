package controllers

import (
	"fmt"
	"movie-api/database"
	"movie-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetMovies(c *gin.Context) {
	var movies []models.Movie
	query := database.DB.Model(&models.Movie{})

	// Фильтры
	if title := c.Query("title"); title != "" {
		query = query.Where("title LIKE ?", "%"+title+"%")
	}
	if director := c.Query("director"); director != "" {
		query = query.Where("director LIKE ?", "%"+director+"%")
	}
	if year := c.Query("year"); year != "" {
		query = query.Where("year = ?", year)
	}
	if minRating := c.Query("min_rating"); minRating != "" {
		query = query.Where("rating >= ?", minRating)
	}

	// Сортировка
	sortBy := c.DefaultQuery("sort_by", "id") // title, year, rating
	order := c.DefaultQuery("order", "asc")   // asc or desc
	query = query.Order(sortBy + " " + order)

	// Пагинация
	limit := 10
	page := 1
	if val := c.Query("limit"); val != "" {
		fmt.Sscanf(val, "%d", &limit)
	}
	if val := c.Query("page"); val != "" {
		fmt.Sscanf(val, "%d", &page)
	}
	offset := (page - 1) * limit
	query = query.Limit(limit).Offset(offset)

	result := query.Find(&movies)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, movies)
}

func CreateMovie(c *gin.Context) {
	var movie models.Movie
	if err := c.ShouldBindJSON(&movie); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Create(&movie)
	c.JSON(http.StatusOK, movie)
}

func GetMovieByID(c *gin.Context) {
	id := c.Param("id")
	var movie models.Movie
	result := database.DB.First(&movie, id)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Фильм не найден"})
		return
	}

	c.JSON(http.StatusOK, movie)
}

func ExportMovies(c *gin.Context) {
	var movies []models.Movie
	result := database.DB.Find(&movies)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.Header("Content-Disposition", "attachment; filename=movies.json")
	c.JSON(http.StatusOK, movies)
}

func ImportMovies(c *gin.Context) {
	var movies []models.Movie
	if err := c.ShouldBindJSON(&movies); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный формат JSON"})
		return
	}

	for _, movie := range movies {
		database.DB.Create(&movie)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Импорт завершён", "count": len(movies)})
}
