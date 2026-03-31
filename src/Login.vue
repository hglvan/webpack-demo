<template>
  <div class="login">{{ msg }}</div>
</template>

<script setup>
import { ref } from 'vue';

const msg = ref('你好哦');

console.log('klsd');
</script>

<style>
@import './css/login.css';
</style>
