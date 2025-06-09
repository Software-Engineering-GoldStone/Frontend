import { describe, it, expect } from 'vitest'
import { mount, config } from '@vue/test-utils'
import Room from '../../src/views/Room.vue'

// Mock font-awesome-icon component
config.global.components = {
  'font-awesome-icon': {
    template: '<span />'
  }
}

interface Card {
  image: string;
  type: string;
  subtype?: string;
}

describe('Unit Test - revealGoalCard()', () => {
  it('map 카드가 아닐 경우 아무 동작도 하지 않음', () => {
    const wrapper = mount(Room, {
      data() {
        return {
          startCard: { image: '/img/cards/start.png' },
          goalCards: [
            { image: '/img/cards/goal_back.png' },
            { image: '/img/cards/goal_back.png' },
            { image: '/img/cards/goal_back.png' }
          ],
          draggedCard: null,
          cards: [],
          availableCards: [],
          round: 1,
          hoveredSlot: null,
          playerList: [
            { nickname: 'player1', role: '광부', gold: 0, image: '', highlight: false, status: [] }
          ],
          myNickname: 'player1',
          turnPlayer: 'player1',
          showGameResultPopup: false,
          showGoldstoneCardDistributionPopup: false,
          slots: Array(900).fill(null).map(() => ({ card: null })),
          offset: { x: 0, y: 0 },
          isDragging: false,
          dragStart: { x: 0, y: 0 },
          distributedCards: []
        }
      }
    })

    // @ts-ignore - 테스트 목적으로 타입 체크 무시
    wrapper.vm.draggedCard = { image: '/img/cards/not_map.png' }
    wrapper.vm.revealGoalCard(1)

    expect(wrapper.vm.goalCards[1].image).toBe('/img/cards/goal_back.png')
  })

  it('이미 공개된 goal 카드면 다시 공개되지 않음', () => {
    const wrapper = mount(Room, {
      data() {
        return {
          startCard: { image: '/img/cards/start.png' },
          goalCards: [
            { image: '/img/cards/goal_back.png' },
            { image: '/img/cards/goal_gold.png' },
            { image: '/img/cards/goal_back.png' }
          ],
          draggedCard: null,
          cards: [],
          availableCards: [],
          round: 1,
          hoveredSlot: null,
          playerList: [
            { nickname: 'player1', role: '광부', gold: 0, image: '', highlight: false, status: [] }
          ],
          myNickname: 'player1',
          turnPlayer: 'player1',
          showGameResultPopup: false,
          showGoldstoneCardDistributionPopup: false,
          slots: Array(900).fill(null).map(() => ({ card: null })),
          offset: { x: 0, y: 0 },
          isDragging: false,
          dragStart: { x: 0, y: 0 },
          distributedCards: []
        }
      }
    })

    // @ts-ignore - 테스트 목적으로 타입 체크 무시
    wrapper.vm.draggedCard = { image: '/img/cards/map.png' }
    wrapper.vm.revealGoalCard(1)

    expect(wrapper.vm.goalCards[1].image).toBe('/img/cards/goal_gold.png')
  })
}) 