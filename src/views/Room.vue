<template>
  <div class="room-layout">
    <!-- 고정 헤더 -->
    <Header
      :nickname="playerList[0].nickname"
      :role="playerList[0].role"
      :turnPlayer="turnPlayer"
      :gold="playerList[0].gold"
      :round="round"
      :friends="playerList.map(p => p.nickname)"
    />

    <!-- 전체 레이아웃 -->
    <div class="content-wrapper">
      <!-- 왼쪽 사이드바 -->
      <Sidebar :players="playerList" 
      class="fixed-sidebar" 
      @drop-on-player="onDropOnPlayer"/>

      <!-- 메인 화면 (배경 이미지) -->
      <div ref="room-background" class="room-background" >
        <!-- 드래그하여 맵 탐색하기 구현 -->
        <div 
          class="map-draggable-wrapper"
          @mousedown="startDragging"
          @mousemove="onDragging"
          @mouseup="stopDragging"
          @mouseleave="stopDragging"
          :style="{ transform: `translate(${offset.x}px, ${offset.y}px)` }"
        >
          <!-- 슬롯들이 유동적으로 꽉 차게 배치됨 -->
          <div class="slot-grid">
            <!-- 출발지 카드 전용 wrapper -->
            <div class="start-wrapper">
              <!-- 출발지 카드 (고정) -->
              <div class="drop-slot start-card">
                <img :src="startCard.image" alt="Start Card" class="dropped-card" />
              </div>
            </div>
            <!-- 목표 카드 1 (1행 8열) -->
<div
  class="goal-wrapper goal-1"
  @dragover.prevent
  @drop.prevent="revealGoalCard(0)"
>
  <div class="drop-slot goal-card">
    <img :src="goalCards[0].image" alt="Goal Card 1" class="dropped-card" />
  </div>
</div>

<!-- 목표 카드 2 -->
<div
  class="goal-wrapper goal-2"
  @dragover.prevent
  @drop.prevent="revealGoalCard(1)"
>
  <div class="drop-slot goal-card">
    <img :src="goalCards[1].image" alt="Goal Card 2" class="dropped-card" />
  </div>
</div>

<!-- 목표 카드 3 -->
<div
  class="goal-wrapper goal-3"
  @dragover.prevent
  @drop.prevent="revealGoalCard(2)"
>
  <div class="drop-slot goal-card">
    <img :src="goalCards[2].image" alt="Goal Card 3" class="dropped-card" />
  </div>
</div>

            <div
              v-for="(slot, index) in slots" 
              :key="index"
              class="drop-slot"
              @mouseenter="hoveredSlot = index"
              @mouseleave="hoveredSlot = null"
              :class="{ hovered: hoveredSlot === index }"
              @dragover.prevent
              @drop.prevent="onCardDrop(index)"
            >
            <!-- 슬롯에 카드가 있으면 카드 렌더링 -->
              <img v-if="slot.card" :src="slot.card.image" alt="card" class="dropped-card" />
            </div>
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
      startCard: {
        image: '/img/cards/start.png'
      },
      goalCards: [
        { image: '/img/cards/goal_back.png' },
        { image: '/img/cards/goal_back.png' },
        { image: '/img/cards/goal_back.png' }
      ],
      round: 2,
      hoveredSlot: null,
      playerList: [
        { nickname: '강승희', role: '광부', gold: 3, image: player1, highlight: false, status: []},
        { nickname: '이혜민', role: '사보타지', gold: 2, image: player2, highlight: false, status: [] },
        { nickname: 'player3', role: '광부', gold: 4, image: player3, highlight: false, status: [] },
        { nickname: 'player4', role: '사보타지', gold: 1, image: player4, highlight: false, status: [] },
        { nickname: 'player5', role: '광부', gold: 5, image: player5, highlight: false, status: [] }
      ],

      turnPlayer: '이혜민',
      showGameResultPopup: false,

      cards: [
        { type: 'action', image: '/img/cards/map.png' },
        { type: 'action', subtype: 'rockfall', image: '/img/cards/rockfall.png' },
        { type: 'action', subtype: 'block_cart', image: '/img/cards/block_cart.png' },
        { type: 'action', subtype: 'block_lantern', image: '/img/cards/block_lantern.png' },
        { type: 'action', subtype: 'block_pickaxe', image: '/img/cards/block_pickaxe.png' },
        { type: 'action', subtype: 'repair_cart', image: '/img/cards/repair_cart.png' },
        { type: 'action', subtype: 'repair_lantern', image: '/img/cards/repair_lantern.png' },
        { type: 'action', subtype: 'repair_pickaxe', image: '/img/cards/repair_pickaxe.png' },
        { type: 'path', image: '/img/cards/path_right_1.png' },
        { type: 'path', image: '/img/cards/path_right_2.png' },
        { type: 'path', image: '/img/cards/path_right_3.png' },
        { type: 'path', image: '/img/cards/path_right_4.png' },
        { type: 'path', image: '/img/cards/path_left_1.png' },
        
      ],  
      draggedCard: null,
      slots: Array(900).fill(null).map(() => ({ card: null })), // 슬롯 배열 초기화
      offset: { x: 32, y: 288 },
      isDragging: false,
      dragStart: { x: 0, y: 0 },
    };
  },
  methods: {
    revealGoalCard(goalIndex) {
      // 드래그된 카드가 map 카드일 때만 실행
      if (!this.draggedCard || this.draggedCard.image !== '/img/cards/map.png') {
        console.log('map 카드가 아닙니다.');
        return;
      }

      // 이미 공개된 목표 카드면 무시
      const currentImage = this.goalCards[goalIndex].image;
      if (currentImage !== '/img/cards/goal_back.png') {
        console.log('이미 공개된 목표 카드입니다.');
        return;
      }

      // 랜덤하게 goal_gold / goal_rock_1 / goal_rock_2 중 하나 선택
      const goalImages = [
        '/img/cards/goal_gold.png',
        '/img/cards/goal_rock_1.png',
        '/img/cards/goal_rock_2.png'
      ];
      const randomIndex = Math.floor(Math.random() * goalImages.length);

      const selectedImage = goalImages[randomIndex];

      // 카드 일시적으로 공개
      this.goalCards[goalIndex].image = selectedImage;

      // 5초 후 다시 뒤집기
      setTimeout(() => {
        this.goalCards[goalIndex].image = '/img/cards/goal_back.png';
      }, 2000);

      // map 카드는 카드 목록에서 제거
      const index = this.cards.indexOf(this.draggedCard);
      if (index !== -1) {
        this.cards.splice(index, 1);
      }

      // 드래그 상태 초기화
      this.draggedCard = null;
    },
    handleDrawCard() {
      console.log('카드 뽑기');
    },
    handleDiscardCard() {
      console.log('카드 버리기');
      // 카드 목록에서 드래그한 카드 하나만 제거
      const index = this.cards.indexOf(this.draggedCard);
        if (index !== -1) {
          this.cards.splice(index, 1);
        }
        
        // 드래그 상태 초기화
        this.draggedCard = null;

    },
    handleEndGame() {
      this.showGameResultPopup = true;
    },
    closeGameResultPopup() {
      this.showGameResultPopup = false;
    },
    // 카드가 드래그되었을 때
    onCardDrag(card, event) {
      this.draggedCard = card;

      if (event && event.dataTransfer) {
        event.dataTransfer.setData('application/json', JSON.stringify(card));
      }  
    },
    // 카드가 드롭되었을 때 슬롯에 넣기
    onCardDrop(slotIndex) {
      if (!this.draggedCard) return;

      // 이미 카드가 있는 슬롯에 드롭 -> 두 카드 모두 삭제
      if (this.draggedCard && this.draggedCard.subtype === 'rockfall') {

        if (this.slots[slotIndex].card) {
            // 기존 슬롯 카드 삭제
          this.slots[slotIndex].card = null;

          // rockfall 카드도 카드 목록에서 삭제
          const index = this.cards.indexOf(this.draggedCard);
          if (index !== -1) {
            this.cards.splice(index, 1);
          }
        }
      } else if (this.draggedCard && this.draggedCard.type === 'action' && this.draggedCard.subtype !== 'rockfall') {
          console.log('이 action 카드는 슬롯에 놓을 수 없습니다.');
          return;
      } else {
          this.slots[slotIndex].card = this.draggedCard;

          const index = this.cards.indexOf(this.draggedCard);
          if (index !== -1) {
            this.cards.splice(index, 1);
          }

          this.draggedCard = null;
      }
    },
    onDropOnPlayer(playerIndex) {
      if (!this.draggedCard || this.draggedCard.type !== 'action') return;

      const subtype = this.draggedCard.subtype;
      const player = this.playerList[playerIndex];

      // 수리/블록 카드만 처리
      const validTypes = [
        'block_cart', 'block_lantern', 'block_pickaxe',
        'repair_cart', 'repair_lantern', 'repair_pickaxe'
      ];
      if (!validTypes.includes(subtype)) return;

      // 수리 카드 대응 관계 설정
      const repairToBlockMap = {
        repair_cart: 'block_cart',
        repair_lantern: 'block_lantern',
        repair_pickaxe: 'block_pickaxe'
      };

      if (subtype.startsWith('repair')) {
        const blockType = repairToBlockMap[subtype];

        // 플레이어가 해당 block 상태이면 제거
        if (player.status.includes(blockType)) {
          player.status = player.status.filter(s => s !== blockType);
        } else {
          return; // 짝 안 맞으면 아무것도 안 함
        }

      } else {
        // block 카드일 경우: 중복 없이 추가
        if (!player.status.includes(subtype)) {
          player.status.push(subtype);
        }
      }

      // 드래그한 카드 제거
      const cardIdx = this.cards.indexOf(this.draggedCard);
      if (cardIdx !== -1) {
        this.cards.splice(cardIdx, 1);
      }

      this.draggedCard = null;
    },
    

    // 맵 드래그하여 탐색할 때
    startDragging(event) {
      this.isDragging = true;
      this.dragStart = {
        x: event.clientX - this.offset.x,
        y: event.clientY - this.offset.y
      };
    },
    onDragging(event) {
      if (!this.isDragging) return;
      const newX = event.clientX - this.dragStart.x;
      const newY = event.clientY - this.dragStart.y;
      this.offset = {
        x: Math.max(-900, Math.min(900, newX)),
        y: Math.max(-1440, Math.min(1440, newY))
      };
    },
    stopDragging() {
      this.isDragging = false;
    }
  }
};
</script>