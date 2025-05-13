<template>
  <aside class="right-sidebar">
    <div class="card-action-zones">
      <div class="zone draw-zone" @click="drawCard">
        <img :src="drawCardImage" alt="카드 뽑기 이미지" class="zone-icon" />
      </div>
      <div class="zone discard-zone" @click="discardCard">
        <img :src="disCardImage" alt="카드 버리기 이미지" class="zone-icon" />
      </div>
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
  justify-content: space-around;
  align-items: center;
  position: fixed;
  top: 45px;
  right: 0;
  z-index: 10;
}

.card-action-zones {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

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
</style>
