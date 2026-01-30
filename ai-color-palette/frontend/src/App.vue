<template>
  <div class="container">
    <div class="header">
      <h1>🎨 AI配色生成器</h1>
      <p>输入自然语言，AI为你生成完美配色方案</p>
    </div>

    <div class="main-content">
      <!-- 左侧：配色显示面板 -->
      <div class="panel panel-left">
        <ColorDisplay
          :colors="currentColors"
          :prompt="currentPrompt"
          :timestamp="currentTimestamp"
          @notify="showNotification"
        />
      </div>

      <!-- 右侧：功能面板 -->
      <div class="panel panel-right">
        <!-- Tab切换 -->
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab"
            :class="['tab-btn', { active: activeTab === tab }]"
            @click="activeTab = tab"
          >
            {{ tab === 'generate' ? '生成配色' : tab === 'history' ? '历史记录' : '检查工具' }}
          </button>
        </div>

        <!-- Tab内容 -->
        <div class="tab-content">
          <!-- 生成配色 Tab -->
          <GeneratePanel
            v-if="activeTab === 'generate'"
            :loading="loading"
            @generate="handleGenerate"
          />

          <!-- 检查工具 Tab -->
          <CheckPanel
            v-if="activeTab === 'check'"
            :colors="currentColors"
            @check-contrast="handleCheckContrast"
            @check-colorblind="handleCheckColorblind"
          />

          <!-- 历史记录 Tab -->
          <HistoryPanel
            v-if="activeTab === 'history'"
            :histories="histories"
            @select="handleSelectHistory"
          />
        </div>
      </div>
    </div>

    <!-- 通知 -->
    <Notification v-if="notification.show" :message="notification.message" :type="notification.type" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import ColorDisplay from './components/ColorDisplay.vue'
import GeneratePanel from './components/GeneratePanel.vue'
import CheckPanel from './components/CheckPanel.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import Notification from './components/Notification.vue'
import { generatePalette, healthCheck } from './utils/api'

const STORAGE_KEY = 'ai_color_palette_history'
const MAX_HISTORY = 20

export default {
  name: 'App',
  components: {
    ColorDisplay,
    GeneratePanel,
    CheckPanel,
    HistoryPanel,
    Notification
  },
  setup() {
    const activeTab = ref('generate')
    const tabs = ['generate', 'check', 'history']
    const loading = ref(false)
    const currentColors = ref([
      '#667eea',
      '#764ba2',
      '#f093fb',
      '#4facfe',
      '#00f2fe'
    ])
    const currentPrompt = ref('默认配色方案')
    const currentTimestamp = ref(Date.now())
    const histories = ref([])
    const notification = ref({ show: false, message: '', type: 'success' })

    // localStorage相关函数
    const loadHistoriesFromStorage = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          histories.value = JSON.parse(stored)
        }
      } catch (error) {
        console.error('加载历史记录失败:', error)
      }
    }

    const saveHistoriesToStorage = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(histories.value))
      } catch (error) {
        console.error('保存历史记录失败:', error)
      }
    }

    const handleGenerate = async (prompt) => {
      loading.value = true
      try {
        const response = await generatePalette(prompt)
        currentColors.value = response.data.colors
        currentPrompt.value = prompt
        currentTimestamp.value = response.data.timestamp * 1000

        // 保存到历史记录
        const newHistory = {
          id: Date.now(),
          prompt: prompt,
          colors: response.data.colors,
          timestamp: response.data.timestamp
        }
        
        histories.value.unshift(newHistory)

        // 最多保存20条记录
        if (histories.value.length > MAX_HISTORY) {
          histories.value.pop()
        }

        // 保存到localStorage
        saveHistoriesToStorage()

        showNotification('配色生成成功！', 'success')
      } catch (error) {
        console.error('生成配色失败:', error)
        showNotification('生成配色失败，请重试', 'error')
      } finally {
        loading.value = false
      }
    }

    const handleSelectHistory = (item) => {
      currentColors.value = item.colors
      currentPrompt.value = item.prompt
      currentTimestamp.value = item.timestamp * 1000
      activeTab.value = 'generate'
      showNotification('已加载历史配色', 'success')
    }

    const handleCheckContrast = () => {
      activeTab.value = 'check'
      showNotification('已切换到对比度检查', 'info')
    }

    const handleCheckColorblind = () => {
      activeTab.value = 'check'
      showNotification('已切换到色盲检查', 'info')
    }

    const showNotification = (message, type = 'success') => {
      notification.value = { show: true, message, type }
      setTimeout(() => {
        notification.value.show = false
      }, 3000)
    }

    onMounted(async () => {
      // 健康检查
      try {
        await healthCheck()
        showNotification('连接到服务器成功', 'success')
      } catch (error) {
        console.error('服务器连接失败:', error)
        showNotification('无法连接到服务器，请确保后端已启动', 'error')
      }

      // 从localStorage加载历史记录
      loadHistoriesFromStorage()
    })

    return {
      activeTab,
      tabs,
      loading,
      currentColors,
      currentPrompt,
      currentTimestamp,
      histories,
      notification,
      handleGenerate,
      handleSelectHistory,
      handleCheckContrast,
      handleCheckColorblind,
      showNotification
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 20px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.header p {
  font-size: 1rem;
  opacity: 0.9;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  gap: 0;
}

.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-left {
  background: #fafafa;
  border-right: 1px solid #e0e0e0;
}

.panel-right {
  background: white;
  display: flex;
  flex-direction: column;
}

.tabs {
  display: flex;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  padding: 0;
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
  font-weight: 500;
}

.tab-btn:hover {
  background: #f0f0f0;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: #f9f9ff;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }

  .panel-left {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .header h1 {
    font-size: 2rem;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .tab-btn {
    flex: 1 1 calc(33.333% - 10px);
  }
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 1.5rem;
  }

  .header {
    padding: 20px 15px;
  }

  .header p {
    font-size: 0.9rem;
  }

  .tab-content {
    padding: 15px;
  }

  .tabs {
    gap: 0;
  }

  .tab-btn {
    flex: 1;
    padding: 10px 12px;
    font-size: 0.9rem;
  }
}
</style>
