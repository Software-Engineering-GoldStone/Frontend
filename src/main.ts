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

import axios from 'axios'
axios.defaults.baseURL = 'http://localhost:3000'

// socket.io-client import 및 소켓 생성
import { io, Socket } from 'socket.io-client'
const socket: Socket = io('http://localhost:3000')

// 아이콘 라이브러리에 추가
library.add(faPenToSquare, faXmark)

const app = createApp(App)

// 전역 프로퍼티로 socket 등록
app.config.globalProperties.$socket = socket

app.component('font-awesome-icon', FontAwesomeIcon) // 전역 컴포넌트 등록

app.use(createPinia())
app.use(router)

app.mount('#app')

export default app
