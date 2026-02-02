# Serverless Backend 部署指南

## 前置条件

1. **安装 Serverless Framework**:
   ```bash
   npm install -g serverless
   ```

2. **配置 AWS 凭证**:
   ```bash
   serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY
   ```

## 部署步骤

### 1. 安装依赖
```bash
cd backend-serverless
npm install
```

### 2. 部署到 AWS
```bash
cd ..
serverless deploy
```

部署完成后，你会看到类似的输出:
```
Service Information
service: dinner-match-serverless
stage: dev
region: ap-northeast-1
stack: dinner-match-serverless-dev
endpoints:
  wss://xxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev
  https://xxxxxx.execute-api.ap-northeast-1.amazonaws.com
functions:
  connect: dinner-match-serverless-dev-connect
  disconnect: dinner-match-serverless-dev-disconnect
  message: dinner-match-serverless-dev-message
  getDishes: dinner-match-serverless-dev-getDishes
  healthCheck: dinner-match-serverless-dev-healthCheck
```

### 3. 记录 WebSocket URL
复制 `wss://` 开头的 WebSocket URL，这就是你的后端地址！

### 4. 更新前端环境变量
去 **Amplify 控制台** -> Environment variables，设置:
- Key: `VITE_SOCKET_URL`
- Value: `wss://xxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev`

### 5. 推送代码触发 Amplify 构建
```bash
git add .
git commit -m "feat: serverless backend complete"
git push
```

## 查看日志
```bash
serverless logs -f message -t
```

## 删除部署（如果需要）
```bash
serverless remove
```

## 成本估算
- **API Gateway WebSocket**: $1.00/百万条消息 + $0.25/百万分钟连接
- **Lambda**: 前 100 万次请求免费，之后 $0.20/百万次
- **DynamoDB**: 按需计费，前 25GB 存储免费

**预估**: 小规模使用（<1000 用户/月）基本在免费额度内！
