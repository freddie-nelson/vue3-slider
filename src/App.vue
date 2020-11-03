<template>
  <Slider />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Slider from "./components/Slider.vue";

export default defineComponent({
  name: "App",
  components: {
    Slider
  }
});
</script>

<style>
body {
  background-color: #080A0D;
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
}

#app {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7%;
  box-sizing: border-box;
}
</style>