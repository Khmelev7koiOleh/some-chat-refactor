<template>
  <div class="">
    <div
      v-if="container"
      :class="
        expand
          ? 'fixed bottom-[12vh] right-10 bg-gray-400 z-[-1] p-1 rounded-full'
          : 'fixed bottom-[12vh] right-10 bg-gray-400 z-[1] p-1 rounded-full'
      "
      @click="scrollToLastMessage(container)"
    >
      <ArrowDown fillColor="#ffffff" />
    </div>
  </div>
</template>

<script setup>
import ArrowDown from "vue-material-design-icons/ArrowDown.vue";
import { toRefs, ref } from "vue";
import { storeToRefs } from "pinia";
import { useScrollTo } from "../composables/scrollTo";
import { useVideoCallOpen } from "../store/video-call-store";

const videoCall = useVideoCallOpen();
const { expand } = storeToRefs(videoCall);
const { scrollToLastMessage } = useScrollTo();

const props = defineProps({
  container: { type: Object },
});

const { container } = toRefs(props);
</script>

<style lang="scss" scoped></style>
