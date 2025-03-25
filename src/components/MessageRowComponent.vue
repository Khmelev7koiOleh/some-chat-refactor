<script setup lang="ts">
import { toRefs } from "vue";
import moment from "moment";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import CheckAllIcon from "vue-material-design-icons/CheckAll.vue";
import { storeToRefs } from "pinia";
import { useAuthStoreC } from "../store/use-auth.js";

const authStoreC = useAuthStoreC();
const { user } = storeToRefs(authStoreC);

const props = defineProps({
  chat: { type: Object },
});
const { chat } = toRefs(props);
</script>

<template>
  <div>
    <div
      class="w-full bg-transparent flex items-center overflow-auto rounded-lg m-1 px-4 py-3 cursor-pointer hover:bg-gray-800"
    >
      <div>
        <img
          :src="chat.photoURL || ''"
          alt=""
          class="w-12 h-12 rounded-full mr-8"
        />
      </div>
      <div class="w-full">
        <div class="flex justify-between items-center">
          <div class="text-white">{{ chat.displayName }}</div>

          <div class="text-white">data</div>
        </div>

        <div class="flex items-center">
          <CheckAllIcon fillColor="#FFFFFF" :size="25" />
          <div class="text-white">Message ...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
