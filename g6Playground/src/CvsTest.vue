<template>
  <canvas width="120" height="120">
    An alternative text describing what your canvas displays.
  </canvas>
</template>
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const canvas = document.querySelector('canvas')
  canvas.addEventListener('click', (evt) => {
    console.log(evt)
  })
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'green'
  // Add a rectangle at (10, 10) with size 100x100 pixels
  ctx.fillRect(10, 10, 100, 100)
})
</script>
