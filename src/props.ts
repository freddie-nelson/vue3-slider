import validateLength from "./utils/validateLength";

export default {
  width: {
    type: String,
    default: "100%",
    validator: validateLength,
  },
  height: {
    type: Number,
    default: 6,
  },
  color: {
    type: String,
    default: "#FB2727",
  },
  trackColor: {
    type: String,
    default: "#f1f6f828",
  },
  max: {
    type: Number,
    default: 100,
    required: true,
  },
  min: {
    type: Number,
    default: 0,
    required: true,
  },
  step: {
    type: Number,
    default: 1,
    required: true,
    validator(val: number) {
      if (val !== 0) {
        return true;
      } else {
        console.error("[Vue3Slider] Error: Step cannot be 0");
        return false;
      }
    },
  },
  modelValue: {
    type: Number,
    default: 0,
    required: true,
  },
};
