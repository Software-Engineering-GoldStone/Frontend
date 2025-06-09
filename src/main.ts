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
import { SocketIoHelper } from '@/socket-helper/socketIo.helper.ts'
axios.defaults.baseURL = import.meta.env.VITE_API_URL

// 아이콘 라이브러리에 추가
library.add(faPenToSquare, faXmark)

const app = createApp(App)

// 전역 프로퍼티 설정
app.config.globalProperties.$axios = axios
app.config.globalProperties.$socket = new SocketIoHelper()
app.config.globalProperties.$defaultGameRoomId = import.meta.env.VITE_DEFAULT_GAME_ROOM_ID

app.component('font-awesome-icon', FontAwesomeIcon) // 전역 컴포넌트 등록

app.use(createPinia())
app.use(router)

app.mount('#app')

export default app
