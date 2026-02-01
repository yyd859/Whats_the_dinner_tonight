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
            <button @click="createRoom" class="primary-btn" :disabled="connecting">
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import SwipeCard from './components/SwipeCard.vue';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
let socket = null;

const appError = ref('');

// Global error handler for this component
const handleError = (e) => {
  console.error(e);
  appError.value = e.message || 'Unknown error occurred';
}

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

// 创建房间
const createRoom = () => {
  connecting.value = true;
  errorMessage.value = '';

  socket.emit('create-room', (response) => {
    connecting.value = false;
    if (response.success) {
      roomCode.value = response.roomCode;
      dishes.value = response.dishes;
      currentDish.value = dishes.value[0];
      userCount.value = 1;
    } else {
      errorMessage.value = '创建房间失败';
    }
  });
};

// 加入房间
const joinRoom = () => {
  if (!joinRoomCode.value) return;

  connecting.value = true;
  errorMessage.value = '';

  socket.emit('join-room', { roomCode: joinRoomCode.value.toUpperCase() }, (response) => {
    connecting.value = false;
    if (response.success) {
      roomCode.value = response.roomCode;
      dishes.value = response.dishes;
      currentDish.value = dishes.value[0];
      userCount.value = response.userCount;
    } else {
      errorMessage.value = response.message || '加入房间失败';
    }
  });
};

// 复制房间号
const copyRoomCode = () => {
  navigator.clipboard.writeText(roomCode.value);
  alert('房间号已复制到剪贴板！');
};

// 处理滑动
const handleSwipe = (direction) => {
  const liked = direction === 'right';

  socket.emit('swipe', {
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
  socket.emit('reset-room', { roomCode: roomCode.value });
};

// Socket 事件监听
onMounted(() => {
  try {
    console.log('Connecting to socket URL:', socketUrl);
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'] // force generic transports
    });
    
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      // Don't show alert immediately to avoid annoyance, but log it
      errorMessage.value = `连接服务器失败: ${err.message} (URL: ${socketUrl})`;
    });

    socket.on('user-joined', () => {
      userCount.value = 2;
    });

    socket.on('user-left', () => {
      userCount.value = 1;
    });

    socket.on('match-found', ({ dish }) => {
      matches.value.push(dish);
      lastMatch.value = dish;
      showMatchAnimation.value = true;

      setTimeout(() => {
        showMatchAnimation.value = false;
      }, 3000);
    });

    socket.on('room-reset', (data) => {
      matches.value = [];
      currentIndex.value = 0;
      // 使用服务器发送的新打乱顺序
      if (data && data.dishes) {
        dishes.value = data.dishes;
      }
      currentDish.value = dishes.value[0];
    });
  } catch (e) {
    handleError(e);
  }
});

onUnmounted(() => {
  socket.disconnect();
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
</style>
