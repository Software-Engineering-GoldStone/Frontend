<template>
  <div class="popup-overlay">
    <div class="popup-content">
      <h2>금덩이 카드 분배 결과</h2>
      <div class="card-grid">
        <div 
          v-for="(card, index) in distributedCards" 
          :key="index" 
          class="card-box"
        >
          <img 
            :src="getCardImage(card)" 
            alt="Gold Card" 
            @click="selectCard(index)" 
            :class="{ selected: selectedCardIndex === index }"
          />
        </div>
      </div>
      <p v-if="earnedGold !== null">획득한 금덩이: {{ earnedGold }}개</p>
      <button 
          @click="confirm" 
          :disabled="earnedGold === null"
        >확인</button>
      <button @click="$emit('close')">닫기</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    playerNames: {
      type: Array,
      default: () => ['강승희', '이혜민', 'player3']
    }
  },
  data() {
    return {
      goldCardCounts: {
        gold_1: 16,
        gold_2: 8,
        gold_3: 4
      },
      goldCardImages: {
        gold_1: '/img/cards/gold_1.png',
        gold_2: '/img/cards/gold_2.png',
        gold_3: '/img/cards/gold_3.png'
      },
      distributedCards: [],
      selectedCardIndex: null,
      earnedGold: null
    };
  },
  watch: {
    playerNames: {
      immediate: true,
      handler(newPlayers) {
        this.distributedCards = [];
        const availableCards = [];

        // card pool setting
        for (const [type, count] of Object.entries(this.goldCardCounts)) {
          for (let i = 0; i < count; i++) {
            availableCards.push(type);
          }
        }

        const shuffled = availableCards.sort(() => Math.random() - 0.5);
        for (let i = 0; i < newPlayers.length; i++) {
          const cardType = shuffled[i];
          this.distributedCards.push(cardType);
          this.goldCardCounts[cardType]--;
        }
      }
    }
  },
  methods: {
    selectCard(index) {
      this.selectedCardIndex = index;
      const selectedCard = this.distributedCards[index];

      if (selectedCard.includes('gold_1')) {
        this.earnedGold = 1;
      } else if (selectedCard.includes('gold_2')) {
        this.earnedGold = 2;
      } else if (selectedCard.includes('gold_3')) {
        this.earnedGold = 3;
      }
    },
    confirm() {
      if (this.earnedGold !== null) {
        this.$emit('confirm-gold', this.earnedGold); // 부모로 전달
        this.$emit('close'); // 팝업도 닫기
      }
    },
    getCardImage(cardType) {
      return this.goldCardImages[cardType];
    }
  }
};
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.popup-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  text-align: center;
}

.card-grid {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
  margin: 20px 0;
}

.card-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-box img {
  width: 80px;
  height: auto;
  border: 2px solid #ffd700;
  border-radius: 10px;
  cursor: pointer;
}

.card-box img.selected {
  transform: scale(1.1);
  box-shadow: 0 0 10px gold;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
