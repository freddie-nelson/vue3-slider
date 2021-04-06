import { SetupContext } from "@vue/runtime-core";

import { Store } from "@/store";

export default function(store: Store, e: MouseEvent | TouchEvent, emit: SetupContext["emit"]) {
  if (store.holding.value) store.holding.value = false;

  if (e.type === "mouseup") {
    window.onmouseup = null;
    window.onmousemove = null;
  } else {
    window.ontouchend = null;
    window.ontouchmove = null;
  }

  emit("drag-end", store.formattedSliderValue.value, e);
}
