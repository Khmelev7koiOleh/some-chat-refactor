<script setup lang="ts">
import { ref, computed, watchEffect, onMounted, nextTick, watch } from "vue";
import moment from "moment";
import { storeToRefs } from "pinia";
import ArrowDown from "vue-material-design-icons/ArrowDown.vue";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import EmoticonExcitedOutlineIcon from "vue-material-design-icons/EmoticonExcitedOutline.vue";
import ArrowLeftIcon from "vue-material-design-icons/ArrowLeft.vue";
import PlusIcon from "vue-material-design-icons/Plus.vue";
import SendIcon from "vue-material-design-icons/Send.vue";
import { useScrollTo } from "../composables/scrollTo";
import { useAuthStore } from "../store/auth-store";
import { useMessageViewStore } from "../store/messageView-store";

const messageViewStore = useMessageViewStore();
const { messageViewOpen } = storeToRefs(messageViewStore);
const authStore = useAuthStore();
const {
  userDataForChat,
  user,
  currentChatId,
  currentChat,
  showFindFriends,

  chats,
} = storeToRefs(authStore);
const chatContainerId = "MessageSection";

const { scrollToLastMessage } = useScrollTo();

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
};

scrollToLastMessage(chatContainerId);
watch(currentChat, () => {
  scrollToLastMessage(chatContainerId);
});
onMounted(() => {
  setTimeout(() => {
    scrollToLastMessage(chatContainerId);
  }, 100);
});
</script>
<template>
  <div
    class="md:ml-[420px] md:w-[calc(100vw-420px)] w-full z-50 h-[100%] fixed text-center bg-gray-300"
  >
    <div class="w-full flex justify-between items-center bg-black px-4">
      <div class="w-full h-full flex items-center gap-4 px-4 py-2">
        <div>
          <ArrowLeftIcon
            fillColor="#ffffff"
            :size="24"
            @click="messageViewOpen = false"
          />
        </div>
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
      class="pt-20 z-[-1] overflow-auto touch-auto fixed md:w-[calc(100vw-420px)] w-full md:h-[calc(100vh-65px)] min-h-[100vh] h-[100vh] pb-[180px]"
    >
      <div
        class="fixed bottom-[12vh] right-10 bg-gray-400 p-1 rounded-full"
        @click="scrollToLastMessage(chatContainerId)"
      >
        <ArrowDown fillCollor="#ffffff" />
      </div>
      <div v-if="chats && chats.length > 0">
        <!-- Loop through all chats -->
        <div v-for="(chat, chatIndex) in currentChat" :key="chatIndex">
          <!-- Check if messages exist in chat -->
          <div v-if="chat">
            <!-- Loop through messages in each chat -->

            <div
              v-for="(msg, msgIndex) in chat"
              :key="msgIndex"
              class="md:px-16 px-4 text-sm"
            >
              <div
                v-if="msg.senderId !== user.localId"
                class="w-[calc(80%-100px)] flex justify-start items-center gap-2"
              >
                <div
                  v-if="msg.message"
                  class="bg-white py-1 px-2 rounded-md my-2 break-all"
                >
                  <div class="text-[14px]">
                    {{ msg.message }}
                  </div>
                  <div v-if="msg.createdAt" class="text-[11px]">
                    {{
                      moment(msg.createdAt, "MMMM Do YYYY, h:mm:ss a").format(
                        "h:mm"
                      )
                    }}
                  </div>
                </div>
              </div>

              <div
                v-else
                class="w-[calc(80%-100px)] flex justify-end items-center space-x-1 float-right mt-8"
              >
                <div
                  class="bg-green-500 my-2 block text-gray-200 py-1 px-2 rounded-md break-all"
                >
                  <div class="inline-">
                    {{ msg.message }}
                  </div>
                  <div class="text-[11px]">
                    {{
                      moment(msg.createdAt, "MMMM Do YYYY, h:mm:ss a").format(
                        "h:mm"
                      )
                    }}
                  </div>
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
