<template>
  <div class="swipe-card-container">
    <div
      class="swipe-card"
      ref="cardRef"
      :style="cardStyle"
      @mousedown="startDrag"
      @touchstart="startDrag"
    >
      <div class="card-image">
        <img :src="dish.image" :alt="dish.name" />
        <!-- 滑动提示 -->
        <div class="swipe-indicator left" :style="{ opacity: leftOpacity }">
          <span>👎</span>
          <p>不喜欢</p>
        </div>
        <div class="swipe-indicator right" :style="{ opacity: rightOpacity }">
          <span>👍</span>
          <p>喜欢</p>
        </div>
      </div>
      <div class="card-content">
        <h2>{{ dish.name }}</h2>
        <p class="description">{{ dish.description }}</p>
        <div class="tags">
          <span class="tag category">{{ dish.category }}</span>
          <span class="tag difficulty">难度：{{ dish.difficulty }}</span>
        </div>
      </div>
      
      <!-- 菜谱展开按钮 -->
      <div class="recipe-toggle" @click.stop="toggleRecipe" @mousedown.stop @touchstart.stop>
        <span>▼</span>
      </div>
    </div>

    <!-- 菜谱弹窗 -->
    <div v-if="showRecipe" class="recipe-modal-overlay" @click.stop="toggleRecipe" @mousedown.stop @touchstart.stop>
      <div class="recipe-modal" @click.stop @mousedown.stop @touchstart.stop>
        <div class="recipe-header">
          <h3>📋 {{ dish.name }} 做法</h3>
          <button class="close-btn" @click.stop="toggleRecipe">✕</button>
        </div>
        <div class="recipe-body">
          <p>{{ dish.recipe || '这里是绝密菜谱的占位符：\n1. 准备好新鲜食材~\n2. 注入满满的爱意开始烹饪！\n3. 出锅装盘，尽情享用😋' }}</p>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button @click="handleDislike" class="action-btn dislike">
        <span>👎</span>
        <p>不喜欢</p>
      </button>
      <button @click="handleLike" class="action-btn like">
        <span>👍</span>
        <p>喜欢</p>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  dish: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['swipe']);

const cardRef = ref(null);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const currentX = ref(0);
const currentY = ref(0);

const showRecipe = ref(false);

const toggleRecipe = () => {
  showRecipe.value = !showRecipe.value;
};

const cardStyle = computed(() => {
  if (!isDragging.value && currentX.value === 0) {
    return {};
  }

  const rotate = currentX.value / 20;
  return {
    transform: `translate(${currentX.value}px, ${currentY.value}px) rotate(${rotate}deg)`,
    transition: isDragging.value ? 'none' : 'transform 0.3s ease-out'
  };
});

const leftOpacity = computed(() => {
  if (currentX.value >= 0) return 0;
  return Math.min(Math.abs(currentX.value) / 100, 1);
});

const rightOpacity = computed(() => {
  if (currentX.value <= 0) return 0;
  return Math.min(currentX.value / 100, 1);
});

const startDrag = (e) => {
  isDragging.value = true;
  const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
  const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
  startX.value = clientX - currentX.value;
  startY.value = clientY - currentY.value;

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchmove', onDrag);
  document.addEventListener('touchend', endDrag);
};

const onDrag = (e) => {
  if (!isDragging.value) return;

  const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
  const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
  currentX.value = clientX - startX.value;
  currentY.value = clientY - startY.value;
};

const endDrag = () => {
  isDragging.value = false;

  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', endDrag);
  document.removeEventListener('touchmove', onDrag);
  document.removeEventListener('touchend', endDrag);

  const threshold = 100;

  if (Math.abs(currentX.value) > threshold) {
    const direction = currentX.value > 0 ? 'right' : 'left';
    animateSwipe(direction);
  } else {
    resetCard();
  }
};

const animateSwipe = (direction) => {
  const endX = direction === 'right' ? 500 : -500;
  currentX.value = endX;

  setTimeout(() => {
    emit('swipe', direction);
    resetCard();
  }, 300);
};

const resetCard = () => {
  currentX.value = 0;
  currentY.value = 0;
};

const handleLike = () => {
  animateSwipe('right');
};

const handleDislike = () => {
  animateSwipe('left');
};
</script>

<style scoped>
.swipe-card-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.swipe-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  cursor: grab;
  user-select: none;
  position: relative;
}

.swipe-card:active {
  cursor: grabbing;
}

.card-image {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.swipe-indicator {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  padding: 20px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  text-align: center;
  pointer-events: none;
}

.swipe-indicator.left {
  left: 20px;
}

.swipe-indicator.right {
  right: 20px;
}

.swipe-indicator span {
  font-size: 3rem;
  display: block;
  margin-bottom: 5px;
}

.swipe-indicator p {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.card-content {
  padding: 20px;
  padding-bottom: 40px;
}

.card-content h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tag {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.tag.category {
  background: #e0e7ff;
  color: #667eea;
}

.tag.difficulty {
  background: #fef3c7;
  color: #d97706;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
  padding: 0 20px;
}

.action-btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: none;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn span {
  font-size: 2rem;
}

.action-btn p {
  font-size: 0.7rem;
  margin-top: 2px;
  font-weight: 600;
}

.action-btn.dislike {
  color: #ef4444;
}

.action-btn.like {
  color: #10b981;
}

.action-btn.dislike:hover {
  background: #fee2e2;
}

.action-btn.like:hover {
  background: #d1fae5;
}

.recipe-toggle {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ccc;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
}

.recipe-toggle:hover {
  color: #888;
}

.recipe-toggle span {
  font-size: 1rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

.recipe-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.recipe-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 340px;
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.recipe-header {
  padding: 15px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.recipe-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #334155;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.2s;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.close-btn:hover {
  color: #475569;
}

.recipe-body {
  padding: 20px;
  overflow-y: auto;
}

.recipe-body p {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #475569;
  font-size: 0.95rem;
}
</style>
