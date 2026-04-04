<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { onMounted } from 'vue'
import { useRecipeIndexStore } from '@/stores/recipeIndex'

const store = useRecipeIndexStore()
onMounted(() => store.load())
console.log('App mounted, recipe index store loaded')
</script>

<template>
  <HelloWorld />
</template>
