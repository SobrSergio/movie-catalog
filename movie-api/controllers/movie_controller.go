// controllers/movie.go

package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"movie-api/database"
	"movie-api/models"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// GetMovies возвращает список фильмов с фильтрацией/сортировкой/пагинацией
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
	if yearStr := c.Query("year"); yearStr != "" {
		if y, err := strconv.Atoi(yearStr); err == nil {
			query = query.Where("year = ?", y)
		}
	}
	if minRating := c.Query("min_rating"); minRating != "" {
		if r, err := strconv.ParseFloat(minRating, 64); err == nil {
			query = query.Where("rating >= ?", r)
		}
	}

	// Сортировка
	sortBy := c.DefaultQuery("sort_by", "id") // id, title, year, rating
	order := c.DefaultQuery("order", "asc")   // asc или desc
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

	// Считаем total
	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка подсчёта фильмов"})
		return
	}

	// Получаем сами данные
	result := query.Find(&movies)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Возвращаем обёртку с данными и total
	c.JSON(http.StatusOK, gin.H{
		"page":  page,
		"limit": limit,
		"total": total,
		"data":  movies,
	})
}

// CreateMovie добавляет новый фильм (только авторизованные)
func CreateMovie(c *gin.Context) {
	var input models.Movie

	// Для проверки текущего года
	input.CurrentYear = time.Now().Year()

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Создаём
	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось создать фильм"})
		return
	}

	c.JSON(http.StatusCreated, input)
}

// GetMovieByID возвращает фильм по ID
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

// UpdateMovie обновляет существующий фильм (только авторизованные)
func UpdateMovie(c *gin.Context) {
	id := c.Param("id")
	var movie models.Movie

	if err := database.DB.First(&movie, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Фильм не найден"})
		return
	}

	var input models.Movie
	input.CurrentYear = time.Now().Year()

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Обновляем поля
	movie.Title = input.Title
	movie.Year = input.Year
	movie.Director = input.Director
	movie.Rating = input.Rating

	if err := database.DB.Save(&movie).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить фильм"})
		return
	}

	c.JSON(http.StatusOK, movie)
}

// DeleteMovie удаляет фильм по ID (только авторизованные)
func DeleteMovie(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Movie{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось удалить фильм"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Фильм удалён"})
}

// ExportMovies экспортирует все фильмы в JSON
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

// ImportMovies импортирует список фильмов из JSON (только авторизованные)
func ImportMovies(c *gin.Context) {
	// 1) Считываем «сырое» тело JSON в []map[string]interface{}
	var rawArr []map[string]interface{}
	if err := c.ShouldBindJSON(&rawArr); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный формат JSON: " + err.Error()})
		return
	}

	// 2) Подготавливаем срез моделей Movie, заполняя CurrentYear
	imported := make([]models.Movie, 0, len(rawArr))
	currentYear := time.Now().Year()

	for idx, item := range rawArr {
		titleIfc, okTitle := item["title"].(string)
		yearIfc, okYear := item["year"].(float64) // JSON-числа → float64
		dirIfc, okDirector := item["director"].(string)
		ratingIfc, okRating := item["rating"].(float64) // JSON-числа → float64

		if !okTitle || !okYear || !okDirector || !okRating {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf(
					"Неверный формат в элементе #%d: должны быть поля {title: string, year: number, director: string, rating: number}",
					idx+1,
				),
			})
			return
		}

		yearInt := int(yearIfc)
		ratingFloat := ratingIfc

		m := models.Movie{
			Title:       titleIfc,
			Year:        yearInt,
			Director:    dirIfc,
			Rating:      ratingFloat,
			CurrentYear: currentYear,
		}
		imported = append(imported, m)
	}

	// 3) Валидируем каждый элемент через validator/v10
	validate := validator.New()
	for idx := range imported {
		if err := validate.Struct(imported[idx]); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Ошибка валидации в фильме #%d: %s", idx+1, err.Error()),
			})
			return
		}
	}

	// 4) Сохраняем все валидные объекты в БД
	for _, m := range imported {
		if err := database.DB.Create(&m).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сохранении фильма: " + err.Error()})
			return
		}
	}

	// 5) Успешный ответ
	c.JSON(http.StatusOK, gin.H{"message": "Импорт завершён", "count": len(imported)})
}
