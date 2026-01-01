# 🍜 今晚吃什么 - 美食匹配应用

一个帮助情侣决定吃什么的网页应用！就像 Tinder 一样滑动卡片，双方都喜欢的菜品会自动匹配。

## ✨ 功能特点

- 🎴 卡片式滑动交互体验
- 👫 双人实时匹配
- 🎉 匹配成功动画提示
- 📱 支持触摸和鼠标操作
- 🏠 房间系统，通过房间号连接

## 🛠️ 技术栈

- **前端**: Vue 3 + Vite
- **后端**: Node.js + Express + Socket.IO
- **实时通信**: WebSocket (Socket.IO)

## 📦 安装与运行

### 1. 安装依赖

#### 后端
```bash
cd backend
npm install
```

#### 前端
```bash
cd frontend
npm install
```

### 2. 启动应用

#### 启动后端服务器
```bash
cd backend
npm start
```
服务器将在 http://localhost:3000 运行

#### 启动前端应用
打开新的终端窗口：
```bash
cd frontend
npm run dev
```
前端将在 http://localhost:5173 运行

### 3. 使用应用

1. 打开浏览器访问 http://localhost:5173
2. 一人点击"创建房间"，获得房间号
3. 另一人输入房间号，点击"加入房间"
4. 开始滑动卡片！
   - 向右滑 / 点击👍 = 喜欢
   - 向左滑 / 点击👎 = 不喜欢
5. 双方都喜欢的菜品会自动匹配并显示

## 📁 项目结构

```
Whats_the_dinner_tonight/
├── backend/                # 后端服务器
│   ├── server.js          # Express + Socket.IO 服务器
│   ├── package.json       # 后端依赖
│   └── data/
│       └── dishes.js      # 美食数据
├── frontend/              # Vue 前端
│   ├── index.html         # HTML 入口
│   ├── package.json       # 前端依赖
│   ├── vite.config.js     # Vite 配置
│   └── src/
│       ├── main.js        # Vue 入口
│       ├── App.vue        # 主组件
│       └── components/
│           └── SwipeCard.vue  # 卡片组件
└── README.md              # 说明文档
```

## 🎮 使用说明

### 创建房间
- 第一个用户点击"创建房间"按钮
- 系统会生成一个 6 位房间号
- 将房间号分享给另一半

### 加入房间
- 第二个用户输入收到的房间号
- 点击"加入房间"
- 等待连接成功

### 滑动卡片
- **鼠标操作**: 点击并拖拽卡片
- **触摸操作**: 在手机上直接滑动
- **按钮操作**: 点击下方的👍或👎按钮

### 查看匹配
- 匹配成功时会弹出动画提示
- 页面底部显示所有匹配成功的菜品
- 可以点击"重新开始"重置选择

## 🍳 预设菜品

应用预设了 20 道常见菜品：
- 川菜：宫保鸡丁、麻婆豆腐、鱼香肉丝、酸菜鱼、水煮牛肉、回锅肉、香辣虾
- 家常菜：番茄炒蛋、红烧肉、土豆炖牛肉、青椒肉丝、糖醋排骨、西红柿牛腩、红烧茄子
- 粤菜：清蒸鲈鱼
- 素菜：蒜蓉西兰花、炒青菜
- 凉菜：凉拌黄瓜、酸辣土豆丝
- 主食：蛋炒饭

## 🔧 自定义菜品

编辑 `backend/data/dishes.js` 文件，添加或修改菜品：

```javascript
{
  id: 21,                    // 唯一 ID
  name: "菜品名称",
  image: "图片 URL",         // 可以使用 Unsplash 等图片服务
  description: "菜品描述",
  category: "菜系分类",
  difficulty: "难度等级"     // 简单/中等/较难
}
```

## 💡 提示

- 建议使用 Chrome、Firefox 或 Safari 浏览器
- 支持手机浏览器访问
- 每个房间最多 2 人
- 断开连接后房间会自动清理

## 📝 开发模式

使用 nodemon 自动重启后端：
```bash
cd backend
npm run dev
```

## 🤝 贡献

欢迎提出建议和改进！

## 📄 许可

MIT License
