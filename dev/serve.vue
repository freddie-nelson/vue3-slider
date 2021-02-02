<script lang="ts">
import { defineComponent } from "vue";
import Vue3Slider from "@/vue3-slider.vue";

export default defineComponent({
  name: "ServeDev",
  components: {
    Vue3Slider,
  },
  data() {
    return {
      sliderVal: 0,
    };
  },
});
</script>

<template>
  <vue3-slider class="slider" v-model="sliderVal" />
  <h1>{{ sliderVal }}</h1>
</template>

<style>
body {
  width: 100%;
  height: 100vh;
  background-color: #080a0d;
  margin: 0;
  padding: 8%;
  box-sizing: border-box;
}

#app {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

h1 {
  color: rgba(255, 255, 255, 0.8);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.slider {
  animation: color-shift 12s linear infinite;
}

@keyframes color-shift {
  0% {
    filter: hue-rotate(0deg);
  }

  50% {
    filter: hue-rotate(360deg);
  }

  100% {
    filter: hue-rotate(0deg);
  }
}
</style>
