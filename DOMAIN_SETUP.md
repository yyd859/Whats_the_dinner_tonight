# 自定义域名配置指南 (Custom Domain Guide)

要想将那一长串 S3 网址（如 `http://dinner-...s3-website...`）变成好记的 `www.your-name.com`，你需要**购买一个域名**。

## ⚠️ 重要警告：HTTPS 与 HTTP 的陷阱

在你开始之前，请务必理解这一点：
* 目前你的后端 (API) 是 **HTTP** 的。
* 如果你的新域名启用了 **HTTPS** (显示为安全锁头)，浏览器会**再次阻止**前端连接后端（Mixed Content 问题）。
* **最简单的方案**：先配置一个 **HTTP** 的自定义域名（虽然浏览器会提示"不安全"，但应用能正常运行）。

---

## 方案 A：配置 HTTP 自定义域名 (推荐新手，无需改动后端)

这是最快的方法，只要几步。

### 1. 购买域名
推荐使用 **AWS Route 53** 购买域名（如 `mydinner.com`），大约 $12/年。这样配置 DNS 最方便。
* 去 [Route 53 控制台](https://console.aws.amazon.com/route53/) -> **Registered domains** -> **Register domain**。

### 2. 重新创建 S3 存储桶 (关键！)
S3 的规则是：**存储桶的名字必须和域名完全一致**。
* 如果你想用 `www.mydinner.com`，你必须创建一个名字叫 `www.mydinner.com` 的存储桶。
* 按照之前的步骤（上传文件、开启静态托管、设置 Bucket Policy）重新部署到这个新桶。

### 3. 配置 DNS 解析 (Route 53)
1. 进入 **Hosted zones**，点击你的域名。
2. 点击 **Create record**。
3. **Record name**: 输入 `www`。
4. **Record type**: `A`。
5. 打开 **Alias** 开关。
6. **Route traffic to**: 选择 `Alias to S3 website endpoint`。
7. **Region**: 选择 `Asia Pacific (Tokyo)`。
8. 找到你刚才创建的那个同名存储桶。
9. 点击 **Create records**。

### 4. 完成
等待几分钟，访问 `http://www.mydinner.com` 即可！

---

## 方案 B：配置 HTTPS 安全域名 (专业版，复杂)

如果你想要那个绿色的安全锁头 (HTTPS)，你需要同时升级前端和后端，这涉及到大量工作。

1. **前端 HTTPS**:
   * 使用 AWS CloudFront 配合 S3。
   * 使用 AWS Certificate Manager (ACM) 申请免费 SSL 证书。
   * 将 CloudFront 绑定到你的域名。

2. **后端 HTTPS (必须做，否则连不上)**:
   * 你需要为 Elastic Beanstalk 配置 HTTPS 监听器。
   * 这通常需要配置 Load Balancer (负载均衡器) 和 ACM 证书。
   * 还需要在 Route 53 中为后端也配置一个子域名（如 `api.mydinner.com`）。

**建议**：先从 **方案 A** 开始，跑通流程后，再考虑升级到方案 B。
