package handler

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	"ai-color-palette/ai"

	"github.com/gin-gonic/gin"
)

type ColorPaletteRequest struct {
	Prompt string `json:"prompt" binding:"required"`
}

type ColorPaletteResponse struct {
	Colors      []string `json:"colors"`
	Timestamp   int64    `json:"timestamp"`
	Description string   `json:"description"`
}

// GeneratePaletteHandler 使用AI生成配色方案，失败时降级到随机生成
func GeneratePaletteHandler(c *gin.Context) {
	var req ColorPaletteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 尝试使用AI生成配色
	log.Printf("[INFO] Using %s to create colors:\n", req.Prompt)
	colors, err := ai.GenerateColorPalette(req.Prompt)
	if err != nil {
		log.Printf("[ERROR] AI generation failed: %v, falling back to random generation", err)
		// 降级到随机生成
		rand.Seed(time.Now().UnixNano())
		colors = generateRandomColors(5, req.Prompt)
	}

	response := ColorPaletteResponse{
		Colors:      colors,
		Timestamp:   time.Now().Unix(),
		Description: fmt.Sprintf("根据提示词 '%s' 生成的配色方案", req.Prompt),
	}

	c.JSON(http.StatusOK, response)
}

// 生成随机配色
func generateRandomColors(count int, seed string) []string {
	colors := []string{}
	rand.Seed(int64(len(seed)))

	for i := 0; i < count; i++ {
		// 生成伪随机颜色
		color := fmt.Sprintf("#%06X", rand.Intn(0xFFFFFF))
		colors = append(colors, color)
	}

	return colors
}
