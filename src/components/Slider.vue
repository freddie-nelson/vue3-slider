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
      default: "red",
    }
  }
});
</script>

<style lang="scss" scoped vars="{ width, height, color }">
#slider {
  width: var(--width);
  height: var(--height);
  border-radius: calc(var(--height) / 2);
}
</style>