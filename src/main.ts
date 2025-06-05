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
axios.defaults.baseURL = 'http://172.17.78.133:8080'

// socket.io-client import 및 소켓 생성(백엔드와 실시간 연결)
import { io, Socket } from 'socket.io-client'
const socket: Socket = io('http://172.17.78.133:3031')

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
