<template>
  <div class="room-layout">
    <!-- 고정 헤더 -->
    <Header
      :nickname="playerList[0].nickname"
      :role="playerList[0].role"
      :turnPlayer="turnPlayer"
      :gold="playerList[0].gold"
      :round="round"
    />

    <!-- 전체 레이아웃 -->
    <div class="content-wrapper">
      <!-- 왼쪽 사이드바 -->
      <Sidebar :players="playerList" class="fixed-sidebar" />

      <!-- 메인 화면 (배경 이미지) -->
      <div class="room-background">
        <!-- 슬롯들이 유동적으로 꽉 차게 배치됨 -->
        <div class="slot-grid">
          <div
            v-for="(slot, index) in slots" 
            :key="index"
            class="drop-slot"
            @mouseenter="hoveredSlot = index"
            @mouseleave="hoveredSlot = null"
            :class="{ hovered: hoveredSlot === index }"
            @dragover.prevent
            @drop="onCardDrop(index)"
          >
           <!-- 슬롯에 카드가 있으면 카드 렌더링 -->
            <img v-if="slot.card" :src="slot.card.image" alt="card" class="dropped-card" />
          </div>
        </div>
      </div>
    </div>

    <!-- 오른쪽 사이드바 -->
    <RightSidebar
      @draw-card="handleDrawCard"
      @discard-card="handleDiscardCard"
      @end-game="handleEndGame"
    />

    <!-- 푸터  -->
    <Footer :cards="cards" @drag-card="onCardDrag" />

    <!-- 게임 결과 팝업 -->
    <GameResultPopup
      v-if="showGameResultPopup"
      :players="[...playerList]"
      :round="round"
      @close="closeGameResultPopup"
    />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import RightSidebar from '@/components/RightSidebar.vue';
import Footer from '@/components/Footer.vue';
import GameResultPopup from '@/components/GameResultPopup.vue';

import path_right_1 from '@/assets/img/cards/path_right_1.png';
import path_right_2 from '@/assets/img/cards/path_right_2.png';
import path_right_3 from '@/assets/img/cards/path_right_3.png';
import path_right_4 from '@/assets/img/cards/path_right_4.png';
import path_left_1 from '@/assets/img/cards/path_left_1.png';
import map from '@/assets/img/cards/map.png';
import repair_cart from '@/assets/img/cards/repair_cart.png';
import repair_lantern from '@/assets/img/cards/repair_lantern.png';
import player1 from '@/assets/player1.png';
import player2 from '@/assets/player2.png';
import player3 from '@/assets/player3.png';
import player4 from '@/assets/player4.png';
import player5 from '@/assets/player5.png';

export default {
  components: {
    Header,
    Sidebar,
    RightSidebar,
    Footer,
    GameResultPopup
  },
  data() {
    return {
      round: 2,
      hoveredSlot: null,
      playerList: [
        { nickname: '강승희', role: '광부', gold: 3, image: player1, highlight: false },
        { nickname: '이혜민', role: '사보타지', gold: 2, image: player2, highlight: false },
        { nickname: 'player3', role: '광부', gold: 4, image: player3, highlight: false },
        { nickname: 'player4', role: '사보타지', gold: 1, image: player4, highlight: false },
        { nickname: 'player5', role: '광부', gold: 5, image: player5, highlight: false }
      ],

      turnPlayer: '이혜민',
      showGameResultPopup: false,

      cards: [
        { type: 'action', image: map },
        { type: 'action', image: repair_cart },
        { type: 'action', image: repair_lantern },
        { type: 'path', image: path_right_1 },
        { type: 'path', image: path_right_2 },
        { type: 'path', image: path_right_3 },
        { type: 'path', image: path_right_4 },
        { type: 'path', image: path_left_1 }
      ],  
      draggedCard: null,
      slots: Array(100).fill(null).map(() => ({ card: null })) // 슬롯 배열 초기화
    };
  },
  methods: {
    handleDrawCard() {
      console.log('카드 뽑기');
    },
    handleDiscardCard() {
      console.log('카드 버리기');
    },
    handleEndGame() {
      this.showGameResultPopup = true;
    },
    closeGameResultPopup() {
      this.showGameResultPopup = false;
    },
    // 카드가 드래그되었을 때
    onCardDrag(card) {
      this.draggedCard = card;
    },
    // 카드가 드롭되었을 때 슬롯에 넣기
    onCardDrop(slotIndex) {
      if (this.draggedCard && !this.slots[slotIndex].card) {
        console.log(`카드가 슬롯 ${slotIndex}에 드롭되었습니다.`);

        // 슬롯에 카드 삽입
        this.slots[slotIndex].card = this.draggedCard;

        // 카드 목록에서 드래그한 카드 하나만 제거
        const index = this.cards.indexOf(this.draggedCard);
        if (index !== -1) {
          this.cards.splice(index, 1);
        }

        // 드래그 상태 초기화
        this.draggedCard = null;
      }
    }
  }
};
</script>