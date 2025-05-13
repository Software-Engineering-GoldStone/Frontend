<template>
  <div class="room-layout">
    <!-- 고정 헤더 -->
    <Header
      :nickname="'강승희'"
      :role="'광부'"
      :turnPlayer="'이혜민'"
      :score="3"
      :round="2"
    />

    <!-- 전체 레이아웃 -->
    <div class="content-wrapper">
      <!-- 왼쪽 사이드바 -->
      <Sidebar :players="playerList" />

      <!-- 메인 화면 (배경 이미지) -->
      <div class="room-background">
        <!-- 여기에 게임 본문 UI 등 넣을 수 있음 -->
      </div>
    </div>

    <!-- 오른쪽 사이드바 -->
    <RightSidebar
      @draw-card="handleDrawCard"
      @discard-card="handleDiscardCard"
    />

    <!-- 푸터 추가 -->
    <Footer :cards="cards" />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Sidebar from '@/components/Sidebar.vue';
import RightSidebar from '@/components/RightSidebar.vue';
import Footer from '@/components/Footer.vue';

import path_right_1 from '@/assets/img/cards/path_right_1.png';
import path_right_2 from '@/assets/img/cards/path_right_2.png';
import path_right_3 from '@/assets/img/cards/path_right_3.png';
import path_right_4 from '@/assets/img/cards/path_right_4.png';
import path_left_1 from '@/assets/img/cards/path_left_1.png';
import map from '@/assets/img/cards/map.png';
import repair_cart from '@/assets/img/cards/repair_cart.png';
import repair_lantern from '@/assets/img/cards/repair_lantern.png';
import player1 from '@/assets/player1.png'
import player2 from '@/assets/player2.png'
import player3 from '@/assets/player3.png'
import player4 from '@/assets/player4.png'
import player5 from '@/assets/player5.png'

export default {
  components: {
    Header,
    Sidebar,
    RightSidebar,
    Footer
  },
  data() {
    return {
      playerList: [
          { name: '나', image: player1, highlight: false },
        { name: 'player2', image: player2, highlight: false },
        { name: 'player3', image: player3, highlight: true },
        { name: 'player4', image: player4, highlight: false },
        { name: 'player5', image: player5, highlight: false }
      ],
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
  methods: {
    handleDrawCard() {
      console.log('카드 뽑기!');
    },
    handleDiscardCard() {
      console.log('카드 버리기!');
    }
  }
};
</script>
