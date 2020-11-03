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
  background-color: #0b0a13;
}
</style>