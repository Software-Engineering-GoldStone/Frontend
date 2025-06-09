<template>
  <div class="room-layout">
    <!-- 고정 헤더 -->
    <Header
      :nickname="nickname"
      :role="playerList.role"
      :turnPlayer="turnPlayer"
      :gold="myPlayer.gold"
      :round="round"
      :friends="playerList.map((p) => p.nickname)"
    />

    <!-- 전체 레이아웃 -->
    <div class="content-wrapper">
      <!-- 왼쪽 사이드바 -->
      <Sidebar :players="playerList" class="fixed-sidebar" @drop-on-player="onDropOnPlayer" />

      <!-- 메인 화면 (배경 이미지) -->
      <div ref="room-background" class="room-background">
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
            <div
              v-for="(slot, index) in slots"
              :key="index"
              class="drop-slot"
              @click="logSlotCoordinates(slot)"
              @mouseenter="hoveredSlot = index"
              @mouseleave="hoveredSlot = null"
              :class="{ hovered: hoveredSlot === index }"
              @dragover.prevent
              @drop.prevent="handleDrop(slot)"
            >
              <!-- 슬롯에 카드가 있으면 카드 렌더링 -->
              <img
                v-if="slot.x === 13 && slot.y === 15"
                :src="startCard.image"
                alt="start"
                class="dropped-card"
              />
              <img
                v-if="slot.x === 21 && slot.y === 13"
                :src="goalCards[0].image"
                alt="goal 1"
                class="dropped-card"
              />
              <img
                v-if="slot.x === 21 && slot.y === 15"
                :src="goalCards[1].image"
                alt="goal 2"
                class="dropped-card"
              />
              <img
                v-if="slot.x === 21 && slot.y === 17"
                :src="goalCards[2].image"
                alt="goal 3"
                class="dropped-card"
              />
              <img v-if="slot.card" :src="slot.card.image" alt="card" class="dropped-card" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 오른쪽 사이드바 -->
    <RightSidebar
      :deck-empty="availableCards && availableCards.length === 0"
      :user-id="userId"
      :game-room-id="gameRoomId"
      :host-player-id="hostPlayer ? hostPlayer.id : null"
      @dragover.prevent
      @drop.prevent="handleDiscardCard"
      @end-game="handleEndGame"
      @open-goldstone-popup="openGoldstonePopup"
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
    <!-- 금덩이 카드 분배 팝업 -->
    <GoldstoneCardDistributionPopup
      v-if="showGoldstoneCardDistributionPopup"
      :playerNames="playerNames"
      :distributedCards="distributedCards"
      :myNickname="myNickname"
      @confirm-gold="handleGoldConfirm"
      @close="closeGoldstoneCardDistributionPopup"
    />
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
import RightSidebar from '@/components/RightSidebar.vue'
import Footer from '@/components/Footer.vue'
import GameResultPopup from '@/components/GameResultPopup.vue'
import GoldstoneCardDistributionPopup from '@/components/GoldDistributionPopup.vue'
import player1 from '@/assets/player1.png'
import player2 from '@/assets/player2.png'
import player3 from '@/assets/player3.png'
import player4 from '@/assets/player4.png'
import player5 from '@/assets/player5.png'
import { getActionCardImageUrl, getPathCardImageUrl } from '@/utils.js'

export default {
  components: {
    Header,
    Sidebar,
    RightSidebar,
    Footer,
    GameResultPopup,
    GoldstoneCardDistributionPopup,
  },
  data() {
    return {
      gameRoomId: null,
      userId: null,
      hostPlayer: null,
      user: null,
      cards: [], // 유저 덱
      cardsFromServer: [], // 서버에서 가져온 카드 목록
      availablecards: [], // 카드 풀
      availableCardsFromServer: [], // 서버에서 가져온 카드 풀
      playerList: [], // 사이드바용 가공된 리스트
      users: [], // 소켓에서 직접 받는 사용자 리스트
      nickname: '',
      cellInfo: [],
      startCard: {
        image: '/img/cards/start.png',
      },
      goalCards: [
        { image: '/img/cards/goal_back.png' },
        { image: '/img/cards/goal_back.png' },
        { image: '/img/cards/goal_back.png' },
      ],
      round: 0,
      hoveredSlot: null,
      myNickname: null,
      turnPlayer: null,
      showGameResultPopup: false,
      showGoldstoneCardDistributionPopup: false,
      draggedCard: null,
      slots: Array.from({ length: 900 }, (_, index) => ({
        x: index % 30,
        y: Math.floor(index / 30),
        card: null,
      })),
      offset: { x: -256, y: -128 },
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      distributedCards: [],
    }
  },
  created() {
    this.gameRoomId = this.$route.query.roomId
    this.userId = this.$route.query.userId
    this.user = JSON.parse(localStorage.getItem('user'))
    this.myNickname = this.user.nickname

    this.$socket.emit('getGameRoomUsers', { gameRoomId: this.gameRoomId })
    this.$socket.on('gameRoomUsers', ({ users }) => {
      this.users = users.map(({ user }) => {
        return {
          id: user.id,
          nickname: user.nickname,
          role: user.role || '광부',
          birthDate: user.birthDate,
        }
      })

      // 첫 번째 유저를 호스트로 설정
      if (this.users.length > 0) {
        this.hostPlayer = this.users[0]
      }
    })
  },
  mounted() {
    this.$socket.on('errorEvent', (error) => {
      console.error(error)
      alert('서버 오류가 발생했습니다.')
    })

    this.$socket.on('gameStarted', (data) => {
      this.round = data.round
      this.$socket.emit('getGameState', { gameRoomId: this.gameRoomId })
    })
    this.$socket.on('yourRole', (data) => (this.playerList.role = data))
    this.$socket.on('yourCardDeck', (data) => {
      this.cardsFromServer = data.map((card) => {
        return {
          id: card.id,
          type: card.cardType,
          image:
            card.cardType === 'ACTION'
              ? getActionCardImageUrl(
                  card.actionCardType,
                  card.targetTool ? [card.targetTool] : card.repairableTools,
                )
              : getPathCardImageUrl(card.pathCardType),
        }
      })
    })
    this.$socket.on('gameState', ({ currentPlayerId, currentPlayerName, myCards }) => {
      this.turnPlayer = {
        id: currentPlayerId,
        name: currentPlayerName,
      }
      this.cardsFromServer = myCards.map((card) => {
        return {
          id: card.id,
          type: card.cardType,
          image:
            card.cardType === 'ACTION'
              ? getActionCardImageUrl(
                  card.actionCardType,
                  card.targetTool ? [card.targetTool] : card.repairableTools,
                )
              : getPathCardImageUrl(card.pathCardType),
        }
      })
    })

    this.nickname = this.user.nickname
  },
  watch: {
    users: {
      handler(data) {
        const images = [player1, player2, player3, player4, player5]

        this.playerList = data.map((user) => ({
          userId: user.id,
          nickname: user.nickname,
          role: user.role || '없음',
          gold: 0,
          image: player1,
          highlight: false,
          status: [],
        }))
      },
      immediate: true,
      deep: true,
    },
    cardsFromServer: {
      handler(data) {
        this.cards = data.map((card) => {
          return {
            id: card.id,
            type: card.type,
            image: card.image,
          }
        })
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    myPlayer() {
      return this.playerList.find((p) => p.nickname === this.myNickname) || { gold: 0 }
    },
    playerNames() {
      return this.playerList
        .filter((p) => p.role === '광부') // 광부만 선택
        .map((p) => p.nickname)
    },
  },
  methods: {
    getBoardState() {
      const payload = {
        gameRoomId: this.gameRoomId,
      }
      console.log('getBoardState() payload: ', payload)

      this.$socket.emit('getBoardInfo', payload, (response) => {
        console.log('callback of getBoardState(): ', response)

        if (response && response.cellInfo) {
          this.cellInfo = response.cellInfo
        } else {
          console.warn('Invalid cellInfo response: ', response)
        }
      })
    },

    revealGoalCard(goalIndex) {
      // 드래그된 카드가 map 카드일 때만 실행
      if (!this.draggedCard || this.draggedCard.image !== '/img/cards/MAP.png') {
        console.log('map 카드가 아닙니다.')
        return
      }

      // 이미 공개된 목표 카드면 무시
      const currentImage = this.goalCards[goalIndex].image
      if (currentImage !== '/img/cards/goal_back.png') {
        console.log('이미 공개된 목표 카드입니다.')
        return
      }

      const goalImages = [
        '/img/cards/goal_gold.png',
        '/img/cards/goal_rock_1.png',
        '/img/cards/goal_rock_2.png',
      ]
      const goalPos = [
        { x: 21, y: 13 },
        { x: 21, y: 15 },
        { x: 21, y: 17 },
      ]
      // const { x, y } =
      // const randomIndex = Math.floor(Math.random() * goalImages.length)

      const selectedImage = goalImages[randomIndex]

      // 카드 일시적으로 공개
      this.goalCards[goalIndex].image = selectedImage

      // 5초 후 다시 뒤집기
      setTimeout(() => {
        this.goalCards[goalIndex].image = '/img/cards/goal_back.png'
      }, 2000)

      this.removeDraggedCard()
      this.getRandomCard()
    },
    async handleDiscardCard() {
      const payload = {
        userId: this.userId,
        gameRoomId: this.gameRoomId,
        cardId: this.draggedCard.id,
      }

      this.$socket.emit('discardCard', payload, (response) => {
        console.log('payload: ', payload)
        if (response.success === 'true') {
          console.log('카드 버리기 성공: ', response.message)

          this.removeDraggedCard() // 로컬 카드에서 제거
          this.getRandomCard() // 새 카드 지급
        } else {
          console.error('카드 버리기 실패: ', response.message)
        }
      })
    },
    handleEndGame() {
      this.showGameResultPopup = true
    },
    closeGameResultPopup() {
      this.showGameResultPopup = false
    },
    openGoldstonePopup() {
      this.showGoldstoneCardDistributionPopup = true
    },
    closeGoldstoneCardDistributionPopup() {
      this.showGoldstoneCardDistributionPopup = false
    },
    // 카드가 드래그되었을 때
    onCardDrag(card, event) {
      this.draggedCard = card

      if (event && event.dataTransfer) {
        event.dataTransfer.setData('application/json', JSON.stringify(card))
      }
    },
    // 백엔드 좌표와 매치
    getGridStyle(x, y) {
      return {
        gridColumn: `${13 + x} / span 1`,
        gridRow: `${17 - y} / span 1`,
      }
    },
    // 디버깅
    logSlotCoordinates(slot) {
      console.log(`🟦 Slot clicked at: (${slot.x}, ${slot.y})`)
    },
    // 카드별
    handleDrop(slot) {
      // 출발지 카드의 경우
      if (slot.x === 13 && slot.y === 15) return

      // 목적지 카드의 경우
      if (slot.x === 21 && slot.y === 13) {
        this.revealGoalCard(0)
      } else if (slot.x === 21 && slot.y === 15) {
        this.revealGoalCard(1)
      } else if (slot.x === 21 && slot.y === 17) {
        this.revealGoalCard(2)
      }

      // 일반 슬롯의 경우
      else {
        this.onCardDrop(slot.x, slot.y)
      }
    },
    // 카드가 드롭되었을 때 슬롯에 넣기
    async onCardDrop(x, y) {
      if (!this.draggedCard) return

      // 좌표에 해당하는 슬롯 찾기
      const slotnow = this.slots.find((s) => s.x === x && s.y === y)
      const payload = {
        userId: this.userId,
        cardId: this.draggedCard.id,
        cardType: 'ACTION',
        actionCardType: 'ROCKFALL',
        roomId: this.gameRoomId,
        targetCellX: x - 13,
        targetCellY: 17 - y,
      }

      // 낙석 카드를 이미 카드가 있는 슬롯에 드롭 -> 두 카드 모두 삭제
      if (this.draggedCard && this.draggedCard.subtype === 'rockfall') {
        if (!slotnow.card) return

        this.$socket.emit('useFallingRockCard', payload, (response) => {
          console.log('payload: ', payload)
          if (response.success === 'true') {
            slotnow.card = null
            this.removeDraggedCard()
            this.getRandomCard()
            console.log('낙석 카드 사용 성공: ', response.message)
          } else {
            console.warn('낙석 카드 실패: ', response.message)
          }
        })

        return
      } else if (
        this.draggedCard &&
        this.draggedCard.type === 'action' &&
        this.draggedCard.subtype !== 'rockfall'
      ) {
        console.log('이 action 카드는 슬롯에 놓을 수 없습니다.')
        return
      } else {
        if (this.draggedCard.type === 'path') {
          this.$socket.emit('usePathCard', payload, (response) => {
            console.log('payload: ', payload)
            if (response.success === 'true') {
              slotnow.card = this.draggedCard
              this.removeDraggedCard()
              this.getRandomCard()
              console.log('길 카드 배치 성공: ', response.message)
            } else {
              console.warn('길 카드 실패: ', response.message)
            }
          })
        }
      }
    },
    //player에게 행동카드 사용할 때
    onDropOnPlayer(userId) {
      console.log('userId:', userId)
      console.log(
        'playerList ids:',
        this.playerList.map((p) => p.userId),
      )

      if (this.draggedCard.type !== 'action') return

      // userId로 정확한 player 객체 찾기
      const playerIndex = this.playerList.findIndex(
        (p) => String(p.userId).trim() === String(userId).trim(),
      )

      console.log('찾은 인덱스:', playerIndex)

      if (playerIndex !== -1) {
        const matchedPlayer = this.playerList[playerIndex]
        this.targetUserId = matchedPlayer.userId
        console.log('this.targetUserId:', this.targetUserId)
        console.log('찾은 플레이어 userId:', matchedPlayer.userId)
      } else {
        console.warn('해당 userId를 가진 플레이어를 찾을 수 없습니다.')
      }
      const subtype = this.draggedCard.subtype

      const player = this.playerList[playerIndex]
      console.log(
        'playerList:',
        this.playerList.map((p) => p.userId),
      )

      // 수리/블록 카드만 처리
      const validTypes = [
        'block_cart',
        'block_lantern',
        'block_pickaxe',
        'repair_cart',
        'repair_lantern',
        'repair_pickaxe',
        'repair_cart_lantern',
        'repair_cart_pickaxe',
        'repair_lantern_pickaxe',
      ]

      if (!validTypes.includes(subtype)) return

      // 수리 카드 대응 관계 설정
      const repairToBlockMap = {
        repair_cart: ['block_cart'],
        repair_lantern: ['block_lantern'],
        repair_pickaxe: ['block_pickaxe'],
        repair_cart_lantern: ['block_cart', 'block_lantern'],
        repair_cart_pickaxe: ['block_cart', 'block_pickaxe'],
        repair_lantern_pickaxe: ['block_lantern', 'block_pickaxe'],
      }

      if (subtype.startsWith('repair')) {
        const blockTypes = repairToBlockMap[subtype]

        // 플레이어가 수리 대상 block 중 하나라도 가지고 있는지 확인
        const hasMatchingBlock = blockTypes.some((block) => player.status.includes(block))

        if (hasMatchingBlock) {
          // 첫 번째 일치하는 block 하나만 제거
          const blockToRemove = blockTypes.find((block) => player.status.includes(block))
          if (blockToRemove) {
            const index = player.status.indexOf(blockToRemove)
            if (index !== -1) {
              player.status.splice(index, 1)
            }
          }

          this.getRandomCard()
        } else {
          return // 수리할 대상이 없으면 아무것도 하지 않음
        }

        const selectedTools = this.extractToolType(subtype)

        const payload = {
          userId: this.userId,
          //cardId: this.cardId
          cardType: 'ACTION',
          actionCardType: 'REPAIR',
          targetUserId: this.targetUserId,
          roomId: this.gameRoomId,
          selectedTool: selectedTools,
        }
        console.log('도구 수리 카드 emit payload:', payload) // 콘솔에 출력

        this.$socket.emit('useRepairToolCard', payload)
      } else {
        // block 카드일 경우: 중복 없이 추가
        if (!player.status.includes(subtype)) {
          const updatedStatus = [...player.status, subtype]
          const updatedPlayer = { ...player, status: updatedStatus }
          this.playerList[playerIndex] = updatedPlayer
          this.playerList[playerIndex].status = updatedStatus
          this.getRandomCard()
        }

        const selectedTools = this.extractToolType(subtype)

        const payload = {
          userId: this.userId,
          //cardId: this.cardId
          cardType: 'ACTION',
          actionCardType: 'DESTROY',
          targetUserId: this.targetUserId,
          roomId: this.gameRoomId,
          selectedTool: selectedTools,
        }
        console.log('도구 고장 카드 emit payload:', payload) // 콘솔에 출력

        this.$socket.emit('useRepairToolCard', payload)
      }

      this.removeDraggedCard()
    },
    extractToolType(subtype) {
      const tools = ['cart', 'lantern', 'pickaxe']
      return tools.filter((tool) => subtype.includes(tool))
    },

    // 맵 드래그하여 탐색할 때
    startDragging(event) {
      this.isDragging = true
      this.dragStart = {
        x: event.clientX - this.offset.x,
        y: event.clientY - this.offset.y,
      }
    },
    onDragging(event) {
      if (!this.isDragging) return
      const newX = event.clientX - this.dragStart.x
      const newY = event.clientY - this.dragStart.y
      this.offset = {
        x: Math.max(-960, Math.min(720, newX)),
        y: Math.max(-1680, Math.min(1440, newY)),
      }
    },
    stopDragging() {
      this.isDragging = false
    },
    handleGoldConfirm(goldAmount) {
      const me = this.playerList.find((p) => p.nickname === this.myNickname)
      if (me) {
        me.gold += goldAmount
      }
    },
    // 랜덤 카드 한 장 새로 획득
    getRandomCard() {
      if (this.availableCards && this.availableCards.length > 0) {
        // availableCards 는 카드 더미 (덱)
        const randomIndex = Math.floor(Math.random() * this.availableCards.length)
        const randomCard = this.availableCards[randomIndex]

        // 내 카드 배열(cards)에 추가
        this.cards.push(randomCard)

        // 덱(availableCards)에서는 제거
        this.availableCards.splice(randomIndex, 1)
      }
    },
    removeDraggedCard() {
      const index = this.cards.indexOf(this.draggedCard)
      if (index !== -1) {
        this.cards.splice(index, 1)
      }

      // 드래그 상태 초기화
      this.draggedCard = null
    },
  },
}
</script>
