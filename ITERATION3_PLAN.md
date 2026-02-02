# Iteration 3: Full Serverless Architecture

## 架构设计

### 后端 (AWS Serverless)
- **API Gateway WebSocket API**: 替代 Socket.io 的长连接
- **Lambda Functions**: 处理连接、消息、房间逻辑
- **DynamoDB**: 存储房间状态、用户连接、匹配数据
- **API Gateway REST API**: 提供 HTTP 接口（获取菜品列表等）

### 前端 (Amplify)
- 保持 Vue.js 架构
- 将 Socket.io 客户端改为原生 WebSocket
- 自动部署到 Amplify，自带 HTTPS

### 优势
1. **零成本闲置**: 没人用的时候完全不花钱
2. **自动 HTTPS**: API Gateway 自带合法证书
3. **自动扩展**: 流量大了自动扩容
4. **一键部署**: 推送代码即可

## 实施计划

### Phase 1: 后端重构
1. 创建 DynamoDB 表设计
2. 编写 Lambda 函数（Connect, Disconnect, Message, HTTP APIs）
3. 配置 API Gateway WebSocket
4. 使用 AWS SAM 或 Serverless Framework 部署

### Phase 2: 前端适配
1. 移除 socket.io-client
2. 实现原生 WebSocket 客户端
3. 适配新的消息格式

### Phase 3: 部署测试
1. 部署后端到 AWS
2. 更新前端环境变量
3. 推送到 GitHub，Amplify 自动构建
