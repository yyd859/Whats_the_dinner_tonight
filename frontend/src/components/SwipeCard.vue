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
</style>
