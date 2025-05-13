<template>
  <aside class="right-sidebar">
    <div class="card-action-wrapper">
      <div class="card-action-zones">
        <div class="zone draw-zone" @click="drawCard">
          <img :src="drawCardImage" alt="카드 뽑기 이미지" class="zone-icon" />
        </div>
        <div class="zone discard-zone" @click="discardCard">
          <img :src="disCardImage" alt="카드 버리기 이미지" class="zone-icon" />
        </div>
      </div>

      <!-- 게임 종료 버튼 -->
      <button class="end-game-button" @click="endGame">게임 종료</button>
    </div>
  </aside>
</template>

<script>
import drawCardImage from '@/assets/img/cards/playable_back.png';
import disCardImage from '@/assets/discard.png';

export default {
  data() {
    return {
      drawCardImage,
      disCardImage
    };
  },
  methods: {
    drawCard() {
      this.$emit('draw-card');
    },
    discardCard() {
      this.$emit('discard-card');
    },
    endGame() {
      // 게임 종료 이벤트 발생
      this.$emit('end-game');
    }
  }
};
</script>

<style scoped>
.right-sidebar {
  width: 160px;
  height: calc(100vh - 45px);
  border-left: 1px solid #ccc;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  top: 45px;
  right: 0;
  z-index: 10;
}

/* 감싸는 래퍼 */
.card-action-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 위쪽 정렬 */
  align-items: center;
  height: 100%;
  width: 100%;
}

/* 카드 뽑기/버리기 영역 */
.card-action-zones {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

/* 각 영역 공통 스타일 */
.zone {
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.zone-icon {
  width: 100%;
  height: 100px;
  object-fit: contain;
}

/* 게임 종료 버튼 */
.end-game-button {
  margin-top: 30px;
  padding: 10px 20px;
  width: 100%;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.end-game-button:hover {
  background-color: #c0392b;
}
</style>
