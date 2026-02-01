# 方案补救：使用 CloudFront 免费为后端 "穿上" HTTPS 外衣

非常抱歉，我之前的判断有误。AWS Amplify 为了安全，确实**禁止**了转发请求到非 HTTPS 的地址。

既然我们**不买域名**，且后端目前只是 HTTP，最完美的解决方案是使用 **AWS CloudFront**。
它可以作为一层的 "SSL 包装壳"，不仅免费，而且自带合法的 HTTPS 证书 (`*.cloudfront.net`)。

### 架构图
`你的浏览器 (HTTPS)` -> `CloudFront (HTTPS)` -> `Elastic Beanstalk (HTTP)`
(浏览器看到的是全程绿色安全，CloudFront 在后台帮你转成 HTTP 连后端)

---

### 操作步骤 (约 5 分钟)

#### 1. 创建 CloudFront Distribution
1.  进入 **CloudFront 控制台** -> 点击 **Create distribution**。
2.  **Origin domain**: 点击输入框，从列表中选择你的 Elastic Beanstalk 地址 (`Dinner-match-backend-env...elasticbeanstalk.com`)。
    *   **⚠️ 重要**: 如果列表里没显示，直接复制完整域名粘贴进去。
3.  **Protocol**: 选择 **HTTP only** (这一步至关重要！告诉 CloudFront 用 HTTP 去连你的后端)。
4.  **Viewer protocol policy**: 选择 **Redirect HTTP to HTTPS**。
5.  **Allowed HTTP methods**: 选择 **GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE** (必须选全，否则 API 发不了数据)。
6.  **Cache key and origin requests** (缓存设置 - **最易错点**):
    *   **Cache policy**: 选择 **CachingDisabled** (必须禁用缓存，否则 Socket.io 和 API 会坏掉)。
    *   **Origin request policy**: 选择 **AllViewer** (把所有头信息转发给后端，这对 Socket.io 握手很重要)。
7.  拖到底部，点击 **Create distribution**。

#### 2. 获取 HTTPS 地址
1.  创建后，你会回到列表页，Status 会显示 `Deploying` (大约需要等待 2-5 分钟)。
2.  你可以看到 **Domain name** 一列，类似于 `d12345abcdef.cloudfront.net`。
3.  这就是你梦寐以求的 **后端 HTTPS 地址**！

#### 3. 更新前端配置
1.  拿到上面的地址后，修改本地 `frontend/.env` 文件：
    ```
    VITE_SOCKET_URL=https://d1xxxxxx.cloudfront.net
    ```
    (注意加上 `https://`)
2.  提交代码 (`git push`)。
3.  Amplify 会自动检测到更新并重新部署。

---

### 总结
*   **Amplify Rewrites**: 只保留 SPA 跳转规则 (我已经帮你改好了 `amplify-rewrites.json`)。
*   **连接方式**: 前端不再通过 Amplify 转发 API，而是直接连接 CloudFront URL。

请现在去控制台创建 CloudFront，拿到地址后告诉我，或者你自己更新到 `.env` 里。
