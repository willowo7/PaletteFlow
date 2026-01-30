package main

import (
	"log"

	"ai-color-palette/config"
	"ai-color-palette/handler"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 加载配置
	config.LoadConfig()

	router := gin.Default()

	// 配置CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://localhost:3000", "*"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	router.Use(cors.New(config))

	// 健康检查
	router.GET("/api/health", handler.HealthHandler)

	// 生成配色方案API
	router.POST("/api/generate-palette", handler.GeneratePaletteHandler)

	log.Println("Server starting on :8080")
	router.Run(":8080")
}
