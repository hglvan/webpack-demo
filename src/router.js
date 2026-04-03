import Home from './Home.vue';
import Login from './Login.vue';
// import Router from 'vue-router';

// 1. 引入 vue-router 核心方法
import { createRouter, createWebHistory } from 'vue-router';

// 3. 路由配置
const routes = [
  {
    path: '/', // 地址
    name: 'home',
    component: Home, // 对应页面
  },
  {
    path: '/Login',
    name: 'login',
    component: Login,
  },
];

// 4. 创建路由实例
const router = createRouter({
  history: createWebHistory(), // 路由模式（不带#）
  routes,
});

// 5. 导出给 main.js 用
export default router;
