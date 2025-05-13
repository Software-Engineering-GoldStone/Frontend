<template>
  <aside class="sidebar">
    <div
      v-for="(player, index) in players"
      :key="index"
      :class="['player-box', { highlight: player.highlight }]">
      <img :src="player.image" alt="avatar" class="avatar" />
      <span>{{ player.name }}</span>
    </div>
  </aside>
</template>

<script>
export default {
  props: {
    players: {
      type: Array,
      required: true
    }
  }
};
</script>

<style scoped>
.sidebar {
  position: fixed; /* 사이드바를 화면에 고정 */
  top: 45px; /* 헤더 아래로 위치 */
  left: 0; /* 화면 왼쪽에 고정 */
  width: 200px;
  padding: 10px;
  background-color: #f2f2f2;
  height: calc(100vh - 45px); /* 헤더 높이를 제외한 영역 */
  overflow-y: auto;
}

.player-box {
  display: flex;
  align-items: center;
  background-color: #ddd;
  padding: 10px;
  margin-bottom: 10px;
}

.player-box.highlight {
  background-color: lime; /* 초록색 강조 */
}

.avatar {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  object-fit: cover;
  border-radius: 50%;
}
</style>
