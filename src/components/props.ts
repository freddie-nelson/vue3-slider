import validateLength from "./utils/validateLength";

export default {
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
  },
  modelValue: {
    type: Number,
    required: true
  }
}