package routes

import (
	"movie-api/controllers"

	"github.com/gin-gonic/gin"
)

func SetupMovieRoutes(r *gin.Engine) {
	movieRoutes := r.Group("/api/movies")
	{
		movieRoutes.GET("/", controllers.GetMovies)
		movieRoutes.POST("/", controllers.CreateMovie)
		movieRoutes.GET("/:id", controllers.GetMovieByID)

		movieRoutes.GET("/export", controllers.ExportMovies)
		movieRoutes.POST("/import", controllers.ImportMovies)
	}
}
