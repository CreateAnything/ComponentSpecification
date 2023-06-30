<script setup lang="ts">
import { http } from '@/request/index'
import { Store } from '@/store/index'
import { onMounted } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
interface Student {
  name: string
  age: string
}
const user = Store.user()

const init = async () => {
  const res = await http.get<Student>({ url: 'localhost:5999' })
}

let a = 10

let as = 10

onMounted(() => {
  init()
})
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped lang="scss">
$a: 10px;
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
