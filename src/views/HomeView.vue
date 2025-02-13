<script setup lang="ts">
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import ChatsView from "./ChatsView.vue";
import MessageView from "./MessageView.vue";

import { ref, onMounted } from "vue";
import { useAuthStore } from "../store/auth-store";

const authStore = useAuthStore();

let open = ref(true);

onMounted(() => {
  try {
    authStore.getAllUsers();
  } catch (error) {
    console.log(error);
  }
});
</script>
<template>
  <div class="fixed w-[420px] z-10 bg-gray-800 h-[100vh]">
    <div class="mx-4 my-4 flex items-center gap-4">
      <img
        :src="authStore.user.photoURL"
        class="w-10 h-10 rounded-full"
        alt="Profile"
      />

      <div class="text-white font-light text-md">
        {{ authStore.user.email }}
      </div>
    </div>
    <div id="Header" class="flex justify-between items-center px-4 py-2 pt-10">
      <div class="text-xl text-gray-200 font-medium">Chats</div>

      <div class="flex justify-between items-center gap-4">
        <AccountGroupIcon fillColor="#FFFFFF" :size="25" />
        <DotsVerticalIcon
          @click="authStore.logout"
          fillColor="#FFFFFF"
          :size="25"
          class="cursor-pointer"
        />
      </div>
    </div>

    <div id="Search" class="w-full my-4 px-4">
      <div
        class="w-full flex justify-start items-center gap-3 px-2 py-1 border border-gray-200 rounded-lg"
      >
        <MagnifyIcon
          fillColor="#FFFFFF"
          :size="18"
          class="flex items-center justify-center"
        />
        <input
          type="text"
          placeholder="Search"
          class="focus:outline-none placeholder:text-gray-200 placeholder:text-md"
        />
      </div>
    </div>

    <ChatsView />
  </div>
  <div v-if="open">
    <MessageView />
  </div>
  <div
    v-else
    class="ml-[420px] w-[calc(100vw-420px)] h-[100vh] fixed text-center bg-gray-100"
  >
    <div class="h-full w-full flex flex-col justify-center items-center">
      <div class="grid">
        <div class="w-full h-full flex justify-center items-center">
          <img
            src="/public/w-web-not-loaded-chat.png"
            class=""
            alt=""
            width="575"
          />
        </div>
        <div>
          <div class="text-3xl text-gray-500 font-medium mt-10">Some Chat</div>
          <div class="text-sm text-gray-500 font-light mt-4">
            Send and receive your messages without keeping your phone online.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
