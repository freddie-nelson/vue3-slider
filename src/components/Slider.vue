<template>
  <div id="slider">
    <div class="track"></div>
    <div class="track-filled"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
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
    },
    max: {
      type: Number,
      default: 100,
      required: true
    },
    min: {
      type: Number,
      default: 0,
      required: true
    },
    step: {
      type: Number,
      default: 1,
      required: true
    }
  },
  setup() {
    
  }
});
</script>

<style lang="scss" scoped vars="{ width, height, color, 'track-color': trackColor }">
#slider {
  box-sizing: border-box;
  width: var(--width);
  height: var(--height);
  position: relative;

  .track {
    background-color: var(--track-color);
    opacity: 0.1;
    width: 100%;
    height: 100%;
    border-radius: calc(var(--height) / 2);
  }

  .track-filled {
    @extend .track;

    position: absolute;
    left: 0;
    top: 0;
    width: auto;
    background-color: var(--color);
  }
}
</style>