<script setup lang="ts">
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import ChatsView from "./ChatsView.vue";
import MessageView from "./MessageView.vue";
import FindFriendsView from "./FindFriendsView.vue";
import { storeToRefs } from "pinia";
import { ref, onMounted } from "vue";
import { useAuthStore } from "../store/auth-store";
import { useMessageViewStore } from "../store/messageView-store";

const messageViewStore = useMessageViewStore();

const authStore = useAuthStore();
const { userDataForChat, user, showFindFriends } = storeToRefs(authStore);

onMounted(async () => {
  try {
    authStore.getAllUsers();
    await authStore.getAllChatsByUser();
  } catch (error) {
    console.log(error);
  }
});
</script>
<template>
  <div class="fixed w-[100vw] md:w-[420px] z-10 bg-gray-800 h-[100vh]">
    <div class="mx-4 my-4 flex items-center gap-4">
      <div>
        <img
          :src="authStore.user.photoUrl"
          alt=""
          class="w-12 h-12 rounded-full"
        />
      </div>

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
          @click="showFindFriends = !showFindFriends"
          type="text"
          placeholder="Search"
          class="focus:outline-none placeholder:text-gray-200 placeholder:text-md"
        />
      </div>
    </div>
    <div
      v-if="!showFindFriends && !messageViewStore.messageViewOpen"
      class="bg-gray-900 h-[100vh]"
    >
      <FindFriendsView />
    </div>

    <div v-if="showFindFriends">
      <ChatsView />
    </div>
  </div>
  <div v-if="messageViewStore.messageViewOpen">
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
