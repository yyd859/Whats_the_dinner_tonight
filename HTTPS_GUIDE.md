# 后端 HTTPS & Amplify 部署指南 (HTTPS Deployment Guide)

本分支 (`iteration-2`) 已经修改了 `server.js`，使其支持 HTTPS 协议。为了让前端能够成功部署到 AWS Amplify（强制 HTTPS），后端也必须提供 HTTPS 服务，否则会出现 **Mixed Content** 错误。

## 核心任务概览

1.  **后端 (Elastic Beanstalk)**: 启用 HTTPS。
2.  **前端 (Amplify)**: 部署并连接到 HTTPS 后端。

---

## 方案一：使用 AWS Load Balancer (推荐，生产环境最佳实践)

这是最稳定、最简单的方案，不需要管理服务器上的证书文件。

### 1. 准备域名
你需要拥有一个域名 (例如 `mydinner.com`)。

### 2. 申请证书 (ACM)
1.  进入 **AWS Certificate Manager (ACM)** 控制台。
2.  点击 **Request a certificate** -> **Request a public certificate**.
3.  域名输入 `api.mydinner.com` (或者通配符 `*.mydinner.com`)。
4.  验证方式选择 **DNS validation** (如果域名在 Route 53，点击按钮自动添加记录即可)。

### 3. 配置 Elastic Beanstalk (EB)
1.  进入 EB 环境 -> **Configuration**。
2.  找到 **Load balancer** 分类，点击 **Edit**。
3.  点击 **Add listener**。
    *   **Port**: `443`
    *   **Protocol**: `HTTPS`
    *   **SSL certificate**: 选择刚才申请的 ACM 证书。
4.  保存并应用更改 (Apply)。
5.  **重要**: 确保你的 User Environment 仍然运行在端口 80 (或 3000)，Load Balancer 会负责将外部的 HTTPS 请求转换为 HTTP 转发给你的 Node.js 应用。你**不需要**设置 `USE_HTTPS=true` 环境变量，因为 SSL 在负载均衡器层就处理了。

### 4. 配置 DNS (Route 53)
1.  在 Route 53 中，创建一个 **A Record** `api.mydinner.com`。
2.  开启 **Alias**。
3.  选择 **Alias to Elastic Beanstalk environment**，选择你的环境。

---

## 方案二：服务器端直接 HTTPS (仅用于测试或无需 Load Balancer 的情况)

如果你不使用 Load Balancer，而是想让 Node.js 直接处理 HTTPS (本分支新增功能)。

### 1. 获取证书
你需要 `key.pem` (私钥) 和 `cert.pem` (公钥)。
*   本地开发可以使用 `mkcert` 生成。
*   生产环境可以使用 Let's Encrypt (Certbot)。

### 2. 配置环境变量
在 Elastic Beanstalk 的 Configuration -> Software -> Environment properties 中添加：

*   `USE_HTTPS`: `true`
*   `SSL_KEY_PATH`: (私钥文件在服务器上的绝对路径，或者你需要将证书内容作为变量传入代码，这需要额外修改代码) -> **注意**: 由于 EB 文件系统是临时的，直接上传 `pem` 文件比较麻烦。推荐方案一。

**如果必须使用方案二**，建议将证书内容存储在 S3，并在启动脚本中下载到本地。

---

## 前端配置 (Amplify)

一旦后端有了 HTTPS URL (例如 `https://api.mydinner.com`)：

1.  修改 `frontend/.env` 文件：
    ```
    VITE_SOCKET_URL=https://api.mydinner.com
    ```
2.  提交代码到 GitHub。
3.  在 AWS Amplify 控制台连接你的 GitHub 仓库。
4.  Amplify 会自动构建并部署。
5.  在 Amplify 的环境变量设置中，也可以覆盖 `VITE_SOCKET_URL` (如果在构建设置中配置了)。

## 下一步

请按照 **方案一** 配置 AWS 资源。代码层面已经准备好，但为了配合 Load Balancer，后端可以继续保持 HTTP 模式运行 (默认模式)，Load Balancer 负责加密。
