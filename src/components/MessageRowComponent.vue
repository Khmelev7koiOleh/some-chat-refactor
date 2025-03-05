<template>
  <div>
    <div class="w-full flex items-center px-4 py-3 cursor-pointer">
      <div>
        <img
          src="https://picsum.photos/id/233/200/300"
          alt=""
          class="w-12 h-12 rounded-full mr-8"
        />
      </div>
      <div class="w-full">
        <div class="flex justify-between items-center">
          <div class="text-white">{{ chat.id }}</div>

          <div class="text-white">{{ chat.messages[0].id }}</div>
        </div>

        <div class="flex items-center">
          <CheckAllIcon fillColor="#FFFFFF" :size="25" />
          <div class="text-white">Message ...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import moment from "moment";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import CheckAllIcon from "vue-material-design-icons/CheckAll.vue";

const props = defineProps({
  chat: { type: Object },
});
const { chat } = toRefs(props);
</script>

<style scoped></style>
