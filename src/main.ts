import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// FontAwesome 관련 import
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPenToSquare, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// 사용할 아이콘을 라이브러리에 추가
library.add(faPenToSquare, faXmark)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon) // 전역 등록

app.use(createPinia())
app.use(router)

app.mount('#app')
