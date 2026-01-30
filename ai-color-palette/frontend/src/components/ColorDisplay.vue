<template>
  <div class="color-display">
    <!-- 配色卡片网格 -->
    <div class="color-cards">
      <div
        v-for="(color, index) in colors"
        :key="index"
        class="color-card"
        @click="copyToClipboard(color)"
      >
        <div class="color-preview" :style="{ backgroundColor: color }"></div>
        <div class="color-info">
          <div class="color-code">{{ color }}</div>
          <button class="copy-btn" title="复制颜色值">📋</button>
        </div>
      </div>
    </div>

    <!-- 配色信息 -->
    <div class="palette-info">
      <div class="info-item">
        <span class="label">提示词:</span>
        <span class="value">{{ prompt }}</span>
      </div>
      <div class="info-item">
        <span class="label">生成时间:</span>
        <span class="value">{{ formatTime(timestamp) }}</span>
      </div>
      <div class="info-item">
        <span class="label">颜色数量:</span>
        <span class="value">{{ colors.length }} 个</span>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <button class="action-btn" @click="exportAsCSS">📝 导出CSS</button>
      <button class="action-btn" @click="exportAsJSON">💾 导出JSON</button>
      <button class="action-btn" @click="exportAsImage">🖼️ 导出图片</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorDisplay',
  props: {
    colors: {
      type: Array,
      default: () => []
    },
    prompt: {
      type: String,
      default: '默认配色'
    },
    timestamp: {
      type: Number,
      default: 0
    }
  },
  emits: ['copy', 'notify'],
  methods: {
    copyToClipboard(color) {
      navigator.clipboard.writeText(color).then(() => {
        this.$emit('notify', { message: `已复制: ${color}`, type: 'success' })
      }).catch(() => {
        this.$emit('notify', { message: '复制失败', type: 'error' })
      })
    },
    formatTime(timestamp) {
      if (!timestamp) return '未知'
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN')
    },
    exportAsCSS() {
      let css = ':root {\n'
      this.colors.forEach((color, index) => {
        css += `  --color-${index + 1}: ${color};\n`
      })
      css += '}'

      this.downloadFile(css, 'colors.css', 'text/css')
    },
    exportAsJSON() {
      const data = {
        prompt: this.prompt,
        colors: this.colors,
        timestamp: this.timestamp
      }

      this.downloadFile(
        JSON.stringify(data, null, 2),
        'colors.json',
        'application/json'
      )
    },
    exportAsImage() {
      const canvas = document.createElement('canvas')
      const boxWidth = 100
      const boxHeight = 80
      const padding = 10

      canvas.width = boxWidth * this.colors.length + padding * (this.colors.length + 1)
      canvas.height = boxHeight + padding * 2

      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      this.colors.forEach((color, index) => {
        const x = padding + index * (boxWidth + padding)
        const y = padding

        ctx.fillStyle = color
        ctx.fillRect(x, y, boxWidth, boxHeight)

        ctx.fillStyle = '#000'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(color, x + boxWidth / 2, y + boxHeight + 20)
      })

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'colors.png'
        a.click()
        URL.revokeObjectURL(url)
      })
    },
    downloadFile(content, filename, type) {
      const blob = new Blob([content], { type })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }
  }
}
</script>

<style scoped>
.color-display {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  gap: 20px;
}

.color-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  flex-shrink: 0;
}

.color-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.color-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.color-preview {
  width: 100%;
  height: 100px;
  border-radius: 8px 8px 0 0;
}

.color-info {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  background: white;
}

.color-code {
  font-family: 'Courier New', monospace;
  font-weight: 500;
  color: #333;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0 5px;
  transition: transform 0.2s;
}

.copy-btn:hover {
  transform: scale(1.2);
}

.palette-info {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.95rem;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  color: #333;
  word-break: break-all;
}

.quick-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 100px;
  padding: 10px 15px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.3s;
  white-space: nowrap;
}

.action-btn:hover {
  background: #764ba2;
}

.action-btn:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .color-display {
    padding: 15px;
    gap: 15px;
  }

  .color-cards {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 10px;
  }

  .action-btn {
    flex: 1 1 calc(33.333% - 7px);
    padding: 8px 10px;
    font-size: 0.85rem;
  }
}
</style>
