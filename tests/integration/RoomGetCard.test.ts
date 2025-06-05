import { mount } from '@vue/test-utils';
import GameRoom from '../../src/views/Room.vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  global.fetch = vi.fn((url: string) => {
    if (url.includes('cards.json')) {
      return Promise.resolve({
        json: () => Promise.resolve([{ image: '/img/cards/a.png' }]),
      });
    } else if (url.includes('availablecards.json')) {
      return Promise.resolve({
        json: () => Promise.resolve([{ image: '/img/cards/test.png' }]),
      });
    }
    return Promise.reject(new Error('Unknown URL'));
  }) as any;
});

describe('GameRoom.vue', () => {
  it('getRandomCard가 cards에 카드를 추가한다', async () => {
    const wrapper = mount(GameRoom, {
      global: {
        mocks: {
          $route: {
            query: {
              roomId: 'testRoom',
              userId: 'testUser',
              nickname: '이혜민',
            },
          },
          stubs: ['font-awesome-icon'],
        },
      },
    });

    (wrapper.vm as any).availableCards = [{ image: '/img/cards/test.png' }];

    (wrapper.vm as any).getRandomCard();

    expect((wrapper.vm as any).cards.length).toBe(1); 
    expect((wrapper.vm as any).cards[0].image).toBe('/img/cards/test.png');
    expect((wrapper.vm as any).availableCards.length).toBe(0);
  });
});
