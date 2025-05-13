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
      <Sidebar :players="playerList" />  <!-- 전체 플레이어 리스트 전달 -->

      <!-- 메인 화면 -->
      <div class="room-background">
        <!-- 여기에 게임 본문 UI 등 넣을 수 있음 -->
      </div>
    </div>

    <!-- 오른쪽 사이드바 -->
    <RightSidebar
      @draw-card="handleDrawCard"
      @discard-card="handleDiscardCard"
      @end-game="handleEndGame"
    />

    <!-- 푸터 -->
    <Footer :cards="cards" />

    <!-- 게임 결과 팝업 -->
    <GameResultPopup
      v-if="showGameResultPopup"
      :players="sortedPlayers"
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
      round: 2, // 라운드 번호

      // 각 플레이어의 정보를 playerList 배열에 담기
      playerList: [
        { nickname: '강승희', role: '광부', gold: 3, image: player1, highlight: false },
        { nickname: '이혜민', role: '사보타지', gold: 2, image: player2, highlight: false },
        { nickname: 'player3', role: '광부', gold: 4, image: player3, highlight: false },
        { nickname: 'player4', role: '사보타지', gold: 1, image: player4, highlight: false },
        { nickname: 'player5', role: '광부', gold: 5, image: player5, highlight: false }
      ],

      turnPlayer: '이혜민', // 현재 턴을 돌고 있는 플레이어

      showGameResultPopup: false, // 게임 결과 팝업 상태

      cards: [
        { type: 'action', image: map },
        { type: 'action', image: repair_cart },
        { type: 'action', image: repair_lantern },
        { type: 'path', image: path_right_1 },
        { type: 'path', image: path_right_2 },
        { type: 'path', image: path_right_3 },
        { type: 'path', image: path_right_4 },
        { type: 'path', image: path_left_1 }
      ]
    };
  },
  computed: {
    sortedPlayers() {
      // 금덩이 개수 기준으로 내림차순 정렬
      return this.playerList.slice().sort((a, b) => b.gold - a.gold);
    }
  },
  methods: {
    handleDrawCard() {
      console.log('카드 뽑기');
    },
    handleDiscardCard() {
      console.log('카드 버리기');
    },
    handleEndGame() {
      this.showGameResultPopup = true; // 게임 종료 시 팝업 띄우기
    },
    closeGameResultPopup() {
      this.showGameResultPopup = false; // 팝업 닫기
    }
  }
};
</script>

<style scoped>
/* 기존 스타일 유지 */
</style>
