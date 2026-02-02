# Iteration 2: 最佳部署方案建议

针对你的目标："**直接上 Amplify，并且能和 GitHub 直连**"，这里是经过分析后的最佳方案。

## 结论：直接选择方案 A (使用 AWS Load Balancer)

为什么这是唯一推荐的方案？

1.  **Amplify 的强制安全要求**：
    *   AWS Amplify 部署的前端强制使用 `HTTPS`。
    *   现代浏览器（Chrome/Safari）禁止 `HTTPS` 网页请求 `HTTP` 接口（Mixed Content 错误）。
    *   这意味着后端 **必须** 拥有一个合法的、受信任的 SSL 证书。

2.  **为什么代码层面的 HTTPS (方案 B) 不适合**：
    *   **证书信任问题**：如果你自己在代码里加载证书，通常也是自签名的，浏览器会报红，Amplify 可能会拒绝连接。
    *   **维护噩梦**：手动购买证书并在 EB 上更新非常麻烦。
    *   **Let's Encrypt 困难**：在 Elastic Beanstalk 这种自动伸缩的环境里配置免费证书自动续期非常复杂。

3.  **GitHub 直连体验**：
    *   **前端**：Amplify Console 原生支持 GitHub。你只需绑定仓库，每次 `git push`，前端自动构建发布。这是 Amplify 的核心优势。
    *   **后端**：虽然 EB 没有那么直接的 "GitHub 按钮"，但那是另外一回事。你需要先解决 "能不能连上" 的问题（HTTPS），然后再解决 "怎么发版" 的问题。

---

## 实施路线图 (Step-by-Step)

### 第一阶段：基础设施 (只需做一次)

1.  **购买域名** (AWS Route 53): 比如 `mydinner.com`。
2.  **申请证书** (AWS ACM): 为 `api.mydinner.com` 申请免费证书。
3.  **配置后端**:
    *   进入 Elastic Beanstalk 环境配置。
    *   添加 Load Balancer (ELB)，监听 443 端口，挂载上面的证书。
    *   (此时你的后端有了合法的 `https://api.mydinner.com`)。

### 第二阶段：前端配置与部署

1.  **代码修改**:
    *   修改 `frontend/.env`，将 `VITE_SOCKET_URL` 改为你的新 HTTPS 地址。
    *   提交代码到 GitHub (`iteration-2` branch)。
2.  **连接 Amplify**:
    *   去 AWS Amplify 控制台 -> "Host web app"。
    *   选择 **GitHub** -> 选择你的仓库 -> 选择 `iteration-2` 分支。
    *   **Build Settings**: Amplify 会自动检测到是 Vite 项目，通常默认配置 (`npm run build`) 就可以。
    *   点击 **Save and Deploy**。

### 结果
*   你的网站地址：`https://iteration-2.dxxxxx.amplifyapp.com` (或者你可以绑定 `www.mydinner.com`)。
*   你的后端地址：`https://api.mydinner.com`。
*   **GitHub 联动**：当你修改前端代码并 push 之后，Amplify 会自动更新网站。

## 下一步行动
建议先去完成 **第一阶段** 的 1, 2, 3 步。需要我详细指导某一步吗？
