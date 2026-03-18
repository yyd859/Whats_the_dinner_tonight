# Iteration 5 规划 (卡片菜谱弹窗功能)

## 1. 核心任务目标 
在双方进入左滑右滑的匹配阶段时，**在卡片的正下方提供该道菜品的文字版菜谱**。
菜谱并不会直接完全展示，而是通过一个折叠/弹窗机制进行呈现：
- 在卡片矩形的下方中心处，添加一个“小向下三角形”按钮（或拉环提示）。
- 用户点击该小三角形时，会展开或弹出一个小弹窗（Modal/Popover）来显示详细的菜谱文本。
- 该小弹窗包含关闭按钮（或者点击背景区关闭）。

## 2. 后端及数据层适配 (Backend & Data)
- **更新菜品数据结构**：
  在 `backend-serverless/data/dishes.json` 中为每一道菜新增 `recipe` 字段。
  ```json
  // 示例
  {
    "id": 1,
    "name": "宫保鸡丁",
    "image": "...",
    "description": "经典川菜，甜酸微辣。",
    "category": "川菜",
    "difficulty": "中等",
    "recipe": "1. 鸡胸肉切丁，用料酒、生抽、淀粉腌制15分钟。\n2. 黄瓜丁、花生米备用。\n3. 热锅凉油，下干辣椒、花椒爆香，放入鸡丁炒至变色。\n4. 加入黄瓜丁翻炒，最后倒入糖醋汁和花生米，收汁即可出锅。"
  }
  ```
- 由于 `dishes.json` 直接加载提供给前端，修改 JSON 文件后无需大幅度调整 Lambda API 逻辑。

## 3. 前端交互与 UI 适配 (Frontend & UI)
**修改组件 `frontend/src/components/SwipeCard.vue`**：
1. **结构修改**：
   - 在 `.swipe-card` 结构内（或下方悬浮）新增一个小三角/折叠条按钮（Icon: `▼` 或 `ChevronDown`）。
   - 新增一个隐藏的弹窗蒙层（Dialog/Modal 层），或者卡片下方的展开面板。
2. **逻辑处理 (Vue Script)**：
   - 新增 `const showRecipe = ref(false)`。
   - 实现打开弹窗和关闭弹窗的交互逻辑。
   - 当点击三角按钮时 `showRecipe.value = true`。
3. **UI/CSS 细节设计**：
   - **小三角形**：可以悬停于卡片底边，增加轻微的上下浮动动画引诱点击。
   - **菜谱弹窗**：需要有一个干净的排版，支持多行文本 (`white-space: pre-wrap`)，字体稍微小一些，具备独立关闭按钮或点击空白区域关闭的功能。不干扰用户原本左右滑动的主流程。

## 4. 开发清单 (Checklist)
- [ ] 切换到 `iteration5` 分支。
- [ ] 更新 `backend-serverless/data/dishes.json` 或 `backend/data/dishes.js` 数据集，为所有预定义菜品补充简明扼要的 `recipe` 字段。
- [ ] 修改 `SwipeCard.vue` 模板，添加小三角形按钮。
- [ ] 修改 `SwipeCard.vue` 添加对应的 Recipe Popover/Modal 组件和 CSS 样式。
- [ ] 测试鼠标点击和触屏点击是否冲突（滑动时不能误触弹出菜谱）。
- [ ] 测试完毕后推送到 GitHub 并让 AWS Amplify 自动部署。
