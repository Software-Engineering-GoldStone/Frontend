<template>
  <aside class="sidebar">
    <div
      v-for="(player, index) in players"
      :key="index"
      @dragover.prevent
      @drop="$emit('drop-on-player', index)" 
      :class="['player-box', { highlight: player.highlight }]">
      <img :src="player.image" alt="avatar" class="avatar" />
      <div class="player-info">
        <span class="player-name" style="margin-right: 12px;">{{ player.nickname }}</span> <!-- 플레이어 이름 -->
      </div>
      <!-- 상태 아이콘 표시 -->
      <img
        v-if="Array.isArray(player.status) && player.status.includes('block_cart')"
        :src="blocked_icons.cart_blocked"
        class="status-icon"
      />
      <img
        v-if="Array.isArray(player.status) && player.status.includes('block_lantern')"
        :src="blocked_icons.lantern_blocked"
        class="status-icon"
      />
      <img
        v-if="Array.isArray(player.status) && player.status.includes('block_pickaxe')"
        :src="blocked_icons.pickaxe_blocked"
        class="status-icon"
      />

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
  },
  data() {
    return {
      blocked_icons: {
        cart_blocked: '/img/icons/cart_blocked.png',
        lantern_blocked: '/img/icons/lantern_blocked.png',
        pickaxe_blocked: '/img/icons/pick_blocked.png',
        cart_repaired: '/img/icons/cart_intact.png',
        lantern_repaired: '/img/icons/lantern_intact.png',
        pickaxe_repaired: '/img/icons/pick_intact.png'
      },
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

.player-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.player-name {
  margin: 2px 0;
  font-size: 14px;
}
</style>
