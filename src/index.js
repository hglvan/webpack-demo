import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 引入路由

console.log('test-node', createApp);
createApp(App).use(router).mount('#app');
