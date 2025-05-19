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
        v-if="player.status.includes('block_cart')"
        :src="blocked_icons.cart_blocked"
        class="status-icon"
      />
      <img
        v-if="player.status.includes('block_lantern')"
        :src="blocked_icons.lantern_blocked"
        class="status-icon"
      />
      <img
        v-if="player.status.includes('block_pickaxe')"
        :src="blocked_icons.pickaxe_blocked"
        class="status-icon"
      />
      <img
        v-if="player.status.includes('repair_cart')"
        :src="blocked_icons.cart_repaired"
        class="status-icon"
      />
      <img
        v-if="player.status.includes('repair_lantern')"
        :src="blocked_icons.lantern_repaired"
        class="status-icon"
      />
      <img
        v-if="player.status.includes('repair_pickaxe')"
        :src="blocked_icons.pickaxe_repaired"
        class="status-icon"
      />
    </div>
  </aside>
</template>

<script>
import cart_blocked from '@/assets/img/icons/cart_blocked.png';
import lantern_blocked from '@/assets/img/icons/lantern_blocked.png';
import pickaxe_blocked from '@/assets/img/icons/pick_blocked.png';
import cart_repaired from '@/assets/img/icons/cart_intact.png';
import lantern_repaired from '@/assets/img/icons/lantern_intact.png';
import pickaxe_repaired from '@/assets/img/icons/pick_intact.png';
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
        cart_blocked,
        lantern_blocked,
        pickaxe_blocked,
        cart_repaired,
        lantern_repaired,
        pickaxe_repaired
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
