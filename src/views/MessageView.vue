<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
import { storeToRefs } from "pinia";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import EmoticonExcitedOutlineIcon from "vue-material-design-icons/EmoticonExcitedOutline.vue";
import PaperClipIcon from "vue-material-design-icons/PaperClip.vue";
import PlusIcon from "vue-material-design-icons/Plus.vue";
import SendIcon from "vue-material-design-icons/Send.vue";

import { useAuthStore } from "../store/auth-store";

const authStore = useAuthStore();
const {
  userDataForChat,
  user,

  showFindFriends,
  currentChat,
  chats,
} = storeToRefs(authStore);

let message = ref("");

watchEffect(() => {
  console.log(currentChat);
});

const sendMessage = async () => {
  await authStore.sendMessage({
    message: message.value,

    chatId: userDataForChat.value[0].id,
  });
  if (message.value) {
    message.value = "";
  }
};
const sortedChats = computed(() => {
  return [chats].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
});
</script>
<template>
  <div
    class="ml-[420px] w-[calc(100vw-420px)] h-[100vh] fixed text-center bg-gray-300"
  >
    <div class="w-full flex justify-between items-center bg-black px-4">
      <div class="w-full h-full flex items-center gap-4 px-4 py-2">
        <div></div>
        <img
          :src="userDataForChat[0].picture"
          class="w-12 h-12 rounded-full"
          alt=""
        />
        <div class="text-white">{{ userDataForChat[0].name }}</div>
        <div class="text-white">{{ userDataForChat }}</div>
      </div>

      <div>
        <DotsVerticalIcon
          fillColor="#ffffff"
          :size="24"
          class="flex items-center justify-center"
        />
      </div>
    </div>

    <div
      id="MessageSection"
      class="pt-20 pb-8 z-[-1] overflow-auto touch-auto fixed w-[calc(100vw-420px)] h-[calc(100vh-65px)]"
    >
      <div v-if="chats && chats.length > 0">
        <!-- Loop through all chats -->
        <div v-for="(chat, chatIndex) in chats" :key="chatIndex">
          <!-- Check if messages exist in chat -->
          <div v-if="chat.mesagges && chat.mesagges.length > 0">
            <!-- Loop through messages in each chat -->
            <div
              v-for="(msg, msgIndex) in chat.mesagges"
              :key="msgIndex"
              class="px-20 text-sm"
            >
              <div
                v-if="msg.senderId !== user.localId"
                class="w-[calc(100%-100px)]"
              >
                <div class="inline-block bg-white p-2 rounded-md my-1">
                  {{ msg.messages }}
                </div>
              </div>

              <div
                v-else
                class="flex justify-end space-x-1 w-[calc(100%-100px)] float-right mt-8"
              >
                <div class="inline-block bg-green-400 p-2 rounded-md my-1">
                  {{ msg.messages }}
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <p>No messages in this chat</p>
          </div>
        </div>
      </div>
      <div v-else>
        <p>No chats available</p>
      </div>
    </div>

    <div id="SendSection" class="fixed bottom-0 bg-black h-[60px] w-full">
      <div class="h-full w-full flex items-center">
        <div class="flex justify-between items-center gap-4 mx-6">
          <EmoticonExcitedOutlineIcon
            fillColor="#FFFFFF"
            :size="24"
            class="flex items-center justify-center"
          />
          <PaperClipIcon
            fillColor="#FFFFFF"
            :size="24"
            class="flex items-center justify-center"
          />
        </div>

        <input
          v-model="message"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="Search"
          autocomplete="on"
          class="focus:outline-none appearance-none focus:shadow-none placeholder:text-gray-900 placeholder:text-md bg-white w-[55%] py-1 rounded-full px-4 relative"
        />
        <button
          @click="sendMessage"
          class="p-4 flex items-center justify-center cursor-pointer"
        >
          <SendIcon fillColor="#FFFFFF" :size="25" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
