<template>
  <footer class="footer">
    <!-- 왼쪽: 행동카드 -->
    <div class="card-section">
      <h3>🪄 행동카드 존</h3>
      <div class="card-row">
        <div
          v-for="(card, index) in actionCards"
          :key="'action-' + index"
          class="card"
          @click="selectCard(card)"
        >
          <img :src="card.image" :alt="card.name" />
          <p>{{ card.name }}</p>
        </div>
      </div>
    </div>

    <!-- 오른쪽: 길카드 -->
    <div class="card-section">
      <h3>🛤️ 길카드 존</h3>
      <div class="card-row">
        <div 
          v-for="card in cards" 
          :key="card.id" 
          class="card" 
          draggable="true" 
          @dragstart="onCardDrag(card)"
        >
          <img :src="card.image" alt="card" />
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  props: {
    cards: {
      type: Array,
      required: true
    }
  },
  computed: {
    actionCards() {
      return this.cards.filter(card => card.type === 'action');
    },
    pathCards() {
      return this.cards.filter(card => card.type === 'path');
    }
  },
  methods: {
    selectCard(card) {
      this.$emit('cardSelected', card);
    },
    onCardDrag(card) {
      // 드래그된 카드 정보를 부모로 전달
      this.$emit('drag-card', card);
    }
  }
};
</script>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140px; /* 푸터 높이 */
  background-color: #ffffff;
  border-top: 2px solid #ccc;
  padding: 10px 20px;
  z-index: 9999; /* 다른 요소보다 우선순위 높임 */
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);

  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
}

.card-section {
  flex: 1;
  overflow-x: auto;
}

.card-section h3 {
  margin: 5px 0;
  font-size: 14px;
  color: #333;
}

.card-row {
  display: flex;
  gap: 15px;
  padding: 5px 0;
  justify-content: flex-start;
}

.card {
  width: 80px;
  height: 100px;
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border-radius: 8px;
  overflow: hidden; /* 이미지가 초과되는 것을 방지 */
  transition: transform 0.2s, border-color 0.2s;
  position: relative; /* 박스 크기 변환을 위해 필요 */
}

.card img {
  width: 100%;
  height: auto;
  max-height: 80px;
  object-fit: contain;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: transform 0.2s, border-color 0.2s;
}

.card:hover {
  transform: scale(1.05); /* 카드 박스 크기 확대 */
}

.card:hover img {
  transform: scale(1.05); /* 이미지 확대 */
}

.card p {
  font-size: 12px;
  margin-top: 5px;
  color: #444;
}
</style>
