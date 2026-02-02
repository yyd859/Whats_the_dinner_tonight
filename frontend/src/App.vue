<template>
  <div class="app-container">
    <!-- 头部 -->
    <header class="header">
      <h1>🍜 今晚吃什么？</h1>
      <p class="subtitle">左滑不喜欢，右滑喜欢，找到共同爱好吧！</p>
    </header>

    <!-- 房间状态 -->
    <div v-if="roomCode" class="room-info">
      <div class="room-code">
        <span>房间号：<strong>{{ roomCode }}</strong></span>
        <button @click="copyRoomCode" class="copy-btn">复制</button>
      </div>
      <div class="user-status">
        <span class="status-dot" :class="{ connected: userCount >= 2 }"></span>
        {{ userCount === 1 ? '等待对方加入...' : '双方已连接' }}
      </div>
    </div>

    <!-- 主界面 -->
    <div class="main-content">
      <!-- 未连接状态 -->
      <div v-if="!roomCode" class="welcome-screen">
        <p v-if="appError" class="error-message" style="background: white; padding: 10px; border-radius: 8px;">{{ appError }}</p>
        <div class="welcome-card">
          <h2>开始匹配美食</h2>
          <div class="button-group">
            <button @click="handleCreateClick" class="primary-btn" :disabled="connecting">
              {{ connecting ? '创建中...' : '创建房间' }}
            </button>
            <div class="divider">或</div>
            <input
              v-model="joinRoomCode"
              type="text"
              placeholder="输入房间号"
              class="room-input"
              @keyup.enter="joinRoom"
            />
            <button @click="joinRoom" class="secondary-btn" :disabled="!joinRoomCode || connecting">
              {{ connecting ? '加入中...' : '加入房间' }}
            </button>
          </div>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- 卡片滑动界面 -->
      <div v-else-if="userCount >= 2 && currentDish" class="swipe-container">
        <SwipeCard
          :dish="currentDish"
          @swipe="handleSwipe"
        />
        <div class="progress">
          {{ currentIndex + 1 }} / {{ dishes.length }}
        </div>
      </div>

      <!-- 等待对方 -->
      <div v-else-if="userCount < 2" class="waiting-screen">
        <div class="spinner"></div>
        <p>等待对方加入房间...</p>
        <p class="hint">将房间号分享给对方</p>
      </div>

      <!-- 所有卡片已滑完 -->
      <div v-else class="completed-screen">
        <h2>✅ 所有菜品已浏览完毕</h2>
        <p>查看下方的匹配结果吧！</p>
        <button @click="resetRoom" class="primary-btn">重新开始</button>
      </div>
    </div>

    <!-- 匹配结果 -->
    <div v-if="matches.length > 0" class="matches-section">
      <h3>🎉 匹配成功的菜品 ({{ matches.length }})</h3>
      <div class="matches-grid">
        <div v-for="dish in matches" :key="dish.id" class="match-card">
          <img :src="dish.image" :alt="dish.name" />
          <div class="match-info">
            <h4>{{ dish.name }}</h4>
            <p>{{ dish.description }}</p>
            <span class="category">{{ dish.category }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 匹配动画 -->
    <transition name="match-animation">
      <div v-if="showMatchAnimation" class="match-overlay">
        <div class="match-content">
          <div class="match-icon">🎊</div>
          <h2>匹配成功！</h2>
          <div class="matched-dish">
            <img :src="lastMatch?.image" :alt="lastMatch?.name" />
            <h3>{{ lastMatch?.name }}</h3>
            <p>{{ lastMatch?.description }}</p>
          </div>
        </div>
      </div>
    </transition>

    <!-- 分类选择弹窗 -->
    <transition name="fade">
      <div v-if="showCategoryModal" class="modal-overlay" @click.self="showCategoryModal = false">
        <div class="category-modal">
          <div class="modal-header">
            <h3>选择菜品范围</h3>
            <button @click="showCategoryModal = false" class="close-btn">×</button>
          </div>
          <div class="modal-body">
            <div class="select-all-box">
              <span>全选所有分类</span>
              <label class="switch">
                <input type="checkbox" :checked="isAllSelected()" @change="toggleAllCategories">
                <span class="slider round"></span>
              </label>
            </div>
            <div class="category-list">
              <div 
                v-for="cat in categories" 
                :key="cat.id" 
                class="category-item"
                :class="{ active: selectedCategories.includes(cat.id) }"
                @click="toggleCategory(cat.id)"
              >
                <div class="category-info">
                  <div class="category-name">{{ cat.name }}</div>
                  <div class="category-desc">{{ cat.desc }}</div>
                </div>
                <div class="category-checkbox">
                  <div class="custom-checkbox" :class="{ checked: selectedCategories.includes(cat.id) }"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="confirmCreateRoom" class="confirm-btn">确认并创建房间</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import SwipeCard from './components/SwipeCard.vue';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3000';
let ws = null;
let reconnectTimeout = null;

const appError = ref('');

// Global error handler for this component
const handleError = (e) => {
  console.error(e);
  appError.value = e.message || 'Unknown error occurred';
}

// 创建和加入相关
const roomCode = ref('');
const joinRoomCode = ref('');
const userCount = ref(0);
const connecting = ref(false);
const errorMessage = ref('');

const dishes = ref([]);
const currentIndex = ref(0);
const currentDish = ref(null);

const matches = ref([]);
const showMatchAnimation = ref(false);
const lastMatch = ref(null);

// 分类选择相关
const showCategoryModal = ref(false);
const selectedCategories = ref(['big', 'home']); // 默认全选
const categories = [
  { id: 'big', name: '🥢 精选大菜', desc: '川粤湘鲁等经典名菜，适合聚餐' },
  { id: 'home', name: '🏠 平淡家常', desc: '家常小炒、素菜凉菜，百点不厌' }
];

const toggleCategory = (id) => {
  const index = selectedCategories.value.indexOf(id);
  if (index > -1) {
    if (selectedCategories.value.length > 1) {
      selectedCategories.value.splice(index, 1);
    } else {
      alert('请至少选择一个分类');
    }
  } else {
    selectedCategories.value.push(id);
  }
};

const toggleAllCategories = () => {
  if (selectedCategories.value.length === categories.length) {
    // 如果已经全选，则只保留第一个（或者清空并报错，这里选择保留第一个）
    selectedCategories.value = [categories[0].id];
  } else {
    selectedCategories.value = categories.map(c => c.id);
  }
};

const isAllSelected = () => selectedCategories.value.length === categories.length;

// WebSocket 消息发送
const sendMessage = (action, data = {}) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ action, data }));
  } else {
    console.error('WebSocket is not connected');
    errorMessage.value = 'WebSocket 未连接';
  }
};

// 创建房间
const handleCreateClick = () => {
  showCategoryModal.value = true;
};

const confirmCreateRoom = () => {
  if (selectedCategories.value.length === 0) {
    alert('请至少选择一个分类');
    return;
  }
  showCategoryModal.value = false;
  connecting.value = true;
  errorMessage.value = '';
  sendMessage('create-room', { categories: selectedCategories.value });
};

// 加入房间
const joinRoom = () => {
  if (!joinRoomCode.value) return;

  connecting.value = true;
  errorMessage.value = '';
  sendMessage('join-room', { roomCode: joinRoomCode.value.toUpperCase() });
};

// 复制房间号
const copyRoomCode = () => {
  navigator.clipboard.writeText(roomCode.value);
  alert('房间号已复制到剪贴板！');
};

// 处理滑动
const handleSwipe = (direction) => {
  const liked = direction === 'right';

  sendMessage('swipe', {
    roomCode: roomCode.value,
    dishId: currentDish.value.id,
    liked
  });

  // 移动到下一张卡片
  currentIndex.value++;
  if (currentIndex.value < dishes.value.length) {
    currentDish.value = dishes.value[currentIndex.value];
  } else {
    currentDish.value = null;
  }
};

// 重置房间
const resetRoom = () => {
  sendMessage('reset-room', { roomCode: roomCode.value });
};

// 连接 WebSocket
const connectWebSocket = () => {
  try {
    console.log('Connecting to WebSocket URL:', socketUrl);
    ws = new WebSocket(socketUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      errorMessage.value = '';
      connecting.value = false;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);

        switch (message.type) {
          case 'room-created':
            connecting.value = false;
            if (message.data.success) {
              roomCode.value = message.data.roomCode;
              dishes.value = message.data.dishes;
              currentDish.value = dishes.value[0];
              userCount.value = 1;
            } else {
              errorMessage.value = '创建房间失败';
            }
            break;

          case 'room-joined':
            connecting.value = false;
            if (message.data.success) {
              roomCode.value = message.data.roomCode;
              dishes.value = message.data.dishes;
              currentDish.value = dishes.value[0];
              userCount.value = message.data.userCount;
            }
            break;

          case 'join-error':
            connecting.value = false;
            errorMessage.value = message.data.message || '加入房间失败';
            break;

          case 'user-joined':
            userCount.value = 2;
            break;

          case 'user-left':
            userCount.value = 1;
            break;

          case 'match-found':
            matches.value.push(message.data.dish);
            lastMatch.value = message.data.dish;
            showMatchAnimation.value = true;

            setTimeout(() => {
              showMatchAnimation.value = false;
            }, 3000);
            break;

          case 'room-reset':
            matches.value = [];
            currentIndex.value = 0;
            if (message.data && message.data.dishes) {
              dishes.value = message.data.dishes;
            }
            currentDish.value = dishes.value[0];
            break;

          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      errorMessage.value = `连接服务器失败 (URL: ${socketUrl})`;
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // 尝试重连（如果用户还在房间里）
      if (roomCode.value) {
        reconnectTimeout = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 3000);
      }
    };
  } catch (e) {
    handleError(e);
  }
};

// Socket 事件监听
onMounted(() => {
  connectWebSocket();
});

onUnmounted(() => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  if (ws) {
    ws.close();
  }
});
</script>

<style scoped>
.app-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 2rem;
  margin-bottom: 8px;
}

.subtitle {
  opacity: 0.9;
  font-size: 0.9rem;
}

.room-info {
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.room-code {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.room-code strong {
  font-size: 1.2rem;
  color: #667eea;
}

.copy-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.copy-btn:hover {
  background: #5568d3;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #666;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ccc;
  animation: pulse 2s infinite;
}

.status-dot.connected {
  background: #4ade80;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.main-content {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-screen {
  width: 100%;
}

.welcome-card {
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.welcome-card h2 {
  margin-bottom: 30px;
  color: #333;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.secondary-btn {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.secondary-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.divider {
  color: #999;
  font-size: 0.9rem;
}

.room-input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  text-align: center;
  text-transform: uppercase;
  transition: border-color 0.2s;
}

.room-input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  color: #ef4444;
  margin-top: 15px;
  font-size: 0.9rem;
}

.swipe-container {
  width: 100%;
  text-align: center;
}

.progress {
  margin-top: 20px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
}

.waiting-screen,
.completed-screen {
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.waiting-screen p {
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.hint {
  font-size: 0.9rem;
  opacity: 0.8;
}

.completed-screen h2 {
  margin-bottom: 15px;
}

.completed-screen p {
  margin-bottom: 20px;
  opacity: 0.9;
}

.matches-section {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 16px;
  margin-top: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.matches-section h3 {
  margin-bottom: 20px;
  color: #333;
}

.matches-grid {
  display: grid;
  gap: 15px;
}

.match-card {
  display: flex;
  gap: 15px;
  background: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.match-card:hover {
  transform: translateY(-2px);
}

.match-card img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.match-info {
  flex: 1;
  text-align: left;
}

.match-info h4 {
  margin-bottom: 5px;
  color: #333;
}

.match-info p {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
}

.category {
  display: inline-block;
  background: #f3f4f6;
  color: #667eea;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.match-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.match-content {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
  animation: bounceIn 0.5s;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.match-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.match-content h2 {
  color: #667eea;
  margin-bottom: 20px;
}

.matched-dish img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 15px;
}

.matched-dish h3 {
  margin-bottom: 8px;
  color: #333;
}

.matched-dish p {
  color: #666;
  font-size: 0.9rem;
}

.match-animation-enter-active,
.match-animation-leave-active {
  transition: opacity 0.3s;
}

.match-animation-enter-from,
.match-animation-leave-to {
  opacity: 0;
}

/* Category Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end; /* Slide up from bottom on mobile */
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

@media (min-width: 501px) {
  .modal-overlay {
    align-items: center;
  }
}

.category-modal {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 24px 24px 0 0;
  padding: 24px;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 -10px 25px rgba(0,0,0,0.1);
}

@media (min-width: 501px) {
  .category-modal {
    border-radius: 24px;
  }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 1.25rem;
  color: #1f2937;
}

.close-btn {
  background: #f3f4f6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.select-all-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #4b5563;
}

.category-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
  margin-bottom: 24px;
}

/* Custom Scrollbar */
.category-list::-webkit-scrollbar {
  width: 6px;
}
.category-list::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 12px;
  border: 2px solid #f1f5f9;
  transition: all 0.2s;
  cursor: pointer;
}

.category-item:hover {
  background: #f8fafc;
}

.category-item.active {
  border-color: #667eea;
  background: #f5f7ff;
}

.category-info {
  flex: 1;
}

.category-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.category-desc {
  font-size: 0.85rem;
  color: #6b7280;
}

.custom-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  transition: all 0.2s;
  position: relative;
}

.custom-checkbox.checked {
  background: #667eea;
  border-color: #667eea;
}

.custom-checkbox.checked::after {
  content: '✓';
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.9rem;
  font-weight: bold;
}

.confirm-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s;
}

.confirm-btn:active {
  transform: scale(0.98);
}

/* Switch Styles */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e2e8f0;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #667eea;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

