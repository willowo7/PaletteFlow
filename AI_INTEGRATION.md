# AI配色生成集成说明

## 配置方式

### 1. 环境变量配置

编辑 `backend/.env` 文件：

```env
# AI API配置
AI_API_KEY=your-api-key-here
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-3.5-turbo
AI_TIMEOUT=30
```

### 2. 支持的AI服务

#### OpenAI
```env
AI_API_KEY=sk-xxxxxxxxxxxxx
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-3.5-turbo
```

#### 通义千问（阿里云）
```env
AI_API_KEY=sk-xxxxxxxxxxxxx
AI_API_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_MODEL=qwen-turbo
```

#### DeepSeek
```env
AI_API_KEY=sk-xxxxxxxxxxxxx
AI_API_BASE_URL=https://api.deepseek.com/v1
AI_MODEL=deepseek-chat
```

#### 智谱AI (ChatGLM)
```env
AI_API_KEY=xxxxxxxxxxxxx
AI_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
AI_MODEL=glm-4
```

### 3. 降级策略

如果AI调用失败（网络错误、配置错误、超时等），系统会自动降级到随机生成模式，确保服务可用性。

### 4. 测试AI生成

启动后端后，发送测试请求：

```powershell
curl -X POST http://localhost:8080/api/generate-palette `
  -H "Content-Type: application/json" `
  -d '{"prompt":"温暖的秋日色调"}'
```

如果配置正确，将返回AI生成的5个颜色代码。

### 5. 日志监控

查看后端日志，如果看到：
- `Warning: AI_API_KEY not set` - 需要配置API密钥
- `AI generation failed: ..., falling back to random generation` - AI调用失败，已降级

### 6. Prompt工程

AI系统提示词已优化为：
- 严格返回5个HEX颜色代码
- 格式：`#RRGGBB`
- 确保颜色协调美观
- 符合用户语义需求

## 架构说明

```
backend/
├── .env                    # 环境变量配置
├── .env.example           # 配置示例
├── config/
│   └── config.go          # 配置加载
├── ai/
│   └── client.go          # AI客户端（OpenAI兼容）
└── handler/
    └── palette.go         # 配色生成（AI + 降级）
```

## 安全建议

- ✅ 不要将 `.env` 文件提交到Git
- ✅ 使用 `.env.example` 作为模板
- ✅ 在生产环境使用环境变量而非文件
- ✅ 定期轮换API密钥
