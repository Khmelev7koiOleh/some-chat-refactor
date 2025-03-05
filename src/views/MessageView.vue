<script setup lang="ts">
import { ref, computed, watchEffect, onMounted, nextTick, watch } from "vue";
import moment from "moment";
import { storeToRefs } from "pinia";

import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import EmoticonExcitedOutlineIcon from "vue-material-design-icons/EmoticonExcitedOutline.vue";
import ArrowLeft from "vue-material-design-icons/ArrowLeft.vue";
import Paperclip from "vue-material-design-icons/Paperclip.vue";
import PlusIcon from "vue-material-design-icons/Plus.vue";
import SendIcon from "vue-material-design-icons/Send.vue";

import { useAuthStore } from "../store/auth-store";
import { useMessageViewStore } from "../store/messageView-store";

const messageViewStore = useMessageViewStore();

const authStore = useAuthStore();
const {
  userDataForChat,
  user,
  currentChatId,
  currentChat,
  showFindFriends,

  chats,
} = storeToRefs(authStore);

let message = ref("");

watchEffect(() => {
  console.log(currentChat);
});

const sendMessage = async () => {
  if (!message.value.trim()) return; // Prevent sending empty messages

  if (!userDataForChat.value.length || !userDataForChat.value[0]?.id) {
    console.error("Chat ID is missing!");
    return;
  }

  await authStore.sendMessage({
    message: message.value,
    chatId: currentChatId.value, // Now safely accessed
  });

  message.value = ""; // Clear input after sending
  const objDiv = document.getElementById("MessageSection");
  objDiv.scrollTo({
    top: objDiv.scrollHeight, // Scroll to the bottom
    behavior: "smooth", // Add smooth scrolling
  });
};

// Scroll to the last message on initial load
</script>
<template>
  <div
    class="ml-[0px] w-full z-50 md:ml-[420px] md:w-[calc(100vw-420px)] h-[100vh] fixed text-center bg-gray-300"
  >
    <div class="w-full flex justify-between items-center bg-black px-4">
      <div>
        <ArrowLeft
          fillColor="#ffffff"
          :size="24"
          @click="messageViewStore.messageViewOpen = false"
        />
      </div>
      <div class="w-full h-full flex items-center gap-4 px-4 py-2">
        <img
          :src="userDataForChat[0].picture"
          class="w-12 h-12 rounded-full"
          alt=""
        />

        <div class="text-white">{{ userDataForChat[0].name }}</div>
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
      class="pt-20 pb-8 z-[-1] overflow-auto touch-auto fixed ml-[0px] w-full md:ml-[420px] md:w-[calc(100vw-420px)] h-[calc(100vh-65px)]"
    >
      <div v-if="chats && chats.length > 0">
        <!-- Loop through all chats -->
        <div v-for="(chat, chatIndex) in currentChat" :key="chatIndex">
          <!-- Check if messages exist in chat -->
          <div v-if="chat">
            <!-- Loop through messages in each chat -->

            <div
              v-for="(msg, msgIndex) in chat"
              :key="msgIndex"
              class="px-20 text-sm"
            >
              <div
                v-if="msg.senderId !== user.localId"
                class="w-[calc(80%-100px)] flex justify-start items-center gap-2"
              >
                <div
                  v-if="msg.message"
                  class="inline-block bg-white p-2 rounded-md my-2 break-all"
                >
                  {{ msg.message }}
                </div>
                <div v-if="msg.createdAt">
                  {{
                    moment(msg.createdAt, "MMMM Do YYYY, h:mm:ss a").format(
                      "h:mm"
                    )
                  }}
                </div>
              </div>

              <div
                v-else
                class="w-[calc(80%-100px)] flex justify-end items-center space-x-1 float-right mt-8"
              >
                <div
                  class="inline-block bg-green-400 p-2 rounded-md my-2 break-all"
                >
                  {{ msg.message }}
                </div>
                <div>
                  {{
                    moment(msg.createdAt, "MMMM Do YYYY, h:mm:ss a").format(
                      "h:mm"
                    )
                  }}
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
      <div class="py-20"></div>
    </div>

    <div id="SendSection" class="fixed bottom-0 bg-black h-[60px] w-full">
      <div class="h-full w-full flex items-center">
        <div class="flex justify-between items-center gap-4 mx-6">
          <Paperclip
            fillColor="#FFFFFF"
            :size="24"
            class="flex items-center justify-center rotate-45"
          />
          <EmoticonExcitedOutlineIcon
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

<style scoped>
.break-letters {
  word-break: break-all;
}
</style>
