// routes/routes.go

package routes

import (
	"movie-api/controllers"

	"github.com/gin-gonic/gin"
)

func SetupMovieRoutes(r *gin.Engine) {
	// --- Роуты аутентификации ---
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
	}

	// --- Публичные маршруты фильмов ---
	movieRoutes := r.Group("/api/movies")
	{
		movieRoutes.GET("/", controllers.GetMovies)          // GET /api/movies
		movieRoutes.GET("/export", controllers.ExportMovies) // GET /api/movies/export
		movieRoutes.GET("/:id", controllers.GetMovieByID)    // GET /api/movies/:id
	}

	// --- Защищённые (только авторизованные) операции с фильмами ---
	secured := r.Group("/api/movies")
	secured.Use(controllers.AuthMiddleware())
	{
		secured.POST("/", controllers.CreateMovie)        // POST   /api/movies
		secured.PUT("/:id", controllers.UpdateMovie)      // PUT    /api/movies/:id
		secured.PATCH("/:id", controllers.UpdateMovie)    // PATCH  /api/movies/:id
		secured.DELETE("/:id", controllers.DeleteMovie)   // DELETE /api/movies/:id
		secured.POST("/import", controllers.ImportMovies) // POST   /api/movies/import
	}

	// --- Роуты избранного (только авторизованные) ---
	fav := r.Group("/api/favorites")
	fav.Use(controllers.AuthMiddleware())
	{
		fav.GET("/", controllers.GetFavorites)         // GET    /api/favorites
		fav.POST("/:id", controllers.AddFavorite)      // POST   /api/favorites/:id   (id = MovieID)
		fav.DELETE("/:id", controllers.RemoveFavorite) // DELETE /api/favorites/:id (id = MovieID)
	}
}
