<script setup lang="ts">
import { onMounted } from "vue";
import { main } from "./ma";
import { pie } from "./pie";

onMounted(() => {
  // main();
  pie();
});
</script>

<template>
  <div
    id="chartdiv"
    style="width: 100vw; height: 100vh; box-sizing: border-box"
  ></div>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
