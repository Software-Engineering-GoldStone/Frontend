// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import './assets/main.css'

// FontAwesome 관련 import
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPenToSquare, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

//기본 요청 주소 설정
import axios from 'axios'
axios.defaults.baseURL = import.meta.env.VITE_API_URL

// socket.io-client import 및 소켓 생성(백엔드와 실시간 연결)
import { io, Socket } from 'socket.io-client'
const socket: Socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ['websocket'],
  reconnection: false,
})

// 소켓 연결 완료 이벤트 핸들러
socket.on('connect', () => {
  console.log('Socket connected with id:', socket.id)
})

socket.on('connect_error', (err) => {
  console.error('Socket connection error in main.ts:', err)
})

// 아이콘 라이브러리에 추가
library.add(faPenToSquare, faXmark)

const app = createApp(App)

// 전역 프로퍼티 설정
app.config.globalProperties.$axios = axios
app.config.globalProperties.$socket = socket
app.config.globalProperties.$defaultGameRoomId = import.meta.env.VITE_DEFAULT_GAME_ROOM_ID

app.component('font-awesome-icon', FontAwesomeIcon) // 전역 컴포넌트 등록

app.use(createPinia())
app.use(router)

app.mount('#app')

export default app