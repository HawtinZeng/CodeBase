<template>
  <div>
    <div style="border: 1px solid #000; height: 50px">top</div>
    <div style="height: calc(100vh - 50px); display: flex">
      <div style="border: 1px solid #000; width: 500px; display: flex">
        side
      </div>
      <div style="border: 1px solid #000; flex: 1 1 0; overflow: hidden">
        <div style="width: 100%; background-color: red">123</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted } from "vue";

onMounted(() => {
  const i = document.createElement("input");
  i.placeholder = "文字输入框";
  i.id = "this.id";
  // document.body.appendChild(i);
  nextTick(() => {
    console.log(i.focus);
  });
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
body {
  margin: 0;
}
* {
  box-sizing: border-box;
}
</style>
