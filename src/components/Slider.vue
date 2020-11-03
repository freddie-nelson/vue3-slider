<template>
  <div id="slider">
    <div class="track"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import validateLength from "./utils/validateLength";

export default defineComponent({
  name: "Slider",
  props: {
    width: {
      type: String,
      default: "100%",
      validator: validateLength
    },
    height: {
      type: String,
      default: "6px",
      validator: validateLength
    },
    color: {
      type: String,
      default: "#FB2727",
    },
    trackColor: {
      type: String,
      default: "#F1F6F8"
    }
  }
});
</script>

<style lang="scss" scoped vars="{ width, height, color, 'track-color': trackColor }">
#slider {
  box-sizing: border-box;
  width: var(--width);
  height: var(--height);

  .track {
    background-color: var(--track-color);
    opacity: 0.1;
    width: 100%;
    height: 100%;
    border-radius: calc(var(--height) / 2);
  }
}
</style>