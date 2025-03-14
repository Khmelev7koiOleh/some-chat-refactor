<script setup lang="ts">
import { toRefs, ref, computed, watch, onMounted } from "vue";

import moment from "moment";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import EmoticonExcitedOutlineIcon from "vue-material-design-icons/EmoticonExcitedOutline.vue";
import ArrowLeftIcon from "vue-material-design-icons/ArrowLeft.vue";
import PlusIcon from "vue-material-design-icons/Plus.vue";
import SendIcon from "vue-material-design-icons/Send.vue";
import ScrollToBottomButton from "../components/ScrollToBottomButton.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import CheckAllIcon from "vue-material-design-icons/CheckAll.vue";
import { storeToRefs } from "pinia";
import { auth, db } from "../firebase-init";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  collection,
  serverTimestamp,
  where,
  updateDoc,
  arrayUnion,
  onSnapshot,
  query,
  Timestamp,
} from "firebase/firestore";
import { useCommonChatStore } from "../store/common-chat-store";
import { useMessageViewStore } from "../store/messageView-store";
import { useAuthStore } from "../store/auth-store";
import { useScrollTo } from "../composables/scrollTo";

const props = defineProps({
  chat: { type: Object },
});
const { chat } = toRefs(props);

// onMounted(() => {
//   scrollToLastMessage();
// });

const authStore = useAuthStore();
const { userDataForChat, localId, user: thisUser } = storeToRefs(authStore);
const messageViewStore = useMessageViewStore();
const commonChatStore = useCommonChatStore();
const chatContainerId = "MessageSection";

const { scrollToLastMessage } = useScrollTo();
let message = ref("");
const getChatsSize = document.getElementById("MessageSection");
const sendToCommonChat = async () => {
  if (!message.value.trim()) return;

  try {
    await addDoc(collection(db, "chat"), {
      text: message.value,
      createdAt: Timestamp.now(), // Store as Firestore Timestamp
      sender: thisUser.value.displayName,
      senderId: thisUser.value.localId,
      img: thisUser.value.photoUrl,
    });
    scrollToLastMessage(getChatsSize);

    message.value = ""; // Clear input after sending
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
const sortedMessages = computed(() => {
  return [...chat.value].sort((a, b) => {
    // Convert string timestamps to Date objects using moment
    const timeA = moment(a.createdAt, "MMMM Do YYYY, h:mm a").toDate();
    const timeB = moment(b.createdAt, "MMMM Do YYYY, h:mm a").toDate();
    return timeA.getTime() - timeB.getTime(); // Ascending order: earliest first
  });
});
watch(chat, () => {
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
    class="z-[50] overflow-auto touch-auto fixed md:w-[calc(100vw-420px)] w-full md:h-[calc(100vh-65px)]"
  >
    <div class="w-full z-50 fixed text-center">
      <div
        class="w-full h-[70px] flex justify-between items-center bg-black px-4 mb-[70px]"
      >
        <div class="w-full h-full flex items-center gap-4 px-4 py-2">
          <div>
            <ArrowLeftIcon
              fillColor="#ffffff"
              :size="24"
              @click="commonChatStore.onCommonChat = false"
            />
          </div>
          <div>
            <img
              :src="`https://picsum.photos/id/699/200/300`"
              alt=""
              class="w-12 h-12 rounded-full mr-0"
            />
          </div>
          <div class="text-white">Common chat</div>
        </div>

        <div>
          <DotsVerticalIcon
            fillColor="#ffffff"
            :size="24"
            class="flex items-center justify-center"
          />
        </div>
      </div>
    </div>

    <div
      id="MessageSection"
      v-if="chat.length"
      class="w-full flex min-h-[100vh)] overflow-auto touch-auto h-[100vh] justify-end items-start cursor-pointer"
    >
      <div
        class="w-full bg-gray-300 flex flex-col justify-between items-end pb-[150px] md:pb-[150px]"
      >
        <ScrollToBottomButton :container="chatContainerId" />
        <div
          class="w-full p-4"
          v-for="(chat, chatIndex) in sortedMessages"
          :key="chatIndex"
        >
          <div
            :class="
              chat.senderId === thisUser.localId
                ? 'w-[90%]  flex flex-col justify-center items-end'
                : 'w-[90%] flex flex-col justify-center items-start'
            "
          >
            <div class="flex">
              <div v-if="chat.senderId !== thisUser.localId">
                <img
                  :src="chat.img"
                  alt=""
                  class="w-12 h-12 rounded-full mr-2"
                />
              </div>
              <div
                :class="
                  chat.senderId === thisUser.localId
                    ? ' bg-green-500 max-h-[40px] flex flex-col justify-center items-center px-2 rounded-xl text-gray-200 break-all'
                    : 'bg-gray-500  max-h-[40px] flex flex-col justify-center items-center  py-[0px]  px-2 rounded-xl text-white break-all'
                "
              >
                <div class="text-[14px]">
                  {{ chat.text }}
                </div>
                <div
                  class="flex justify-end items-center text-gray-200 text-[11px] mx-1"
                >
                  {{
                    moment(chat.createdAt, "MMMM Do YYYY, h:mm:ss a").format(
                      "h:mm"
                    )
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- <div class="flex items-center">
          <CheckAllIcon fillColor="#FFFFFF" :size="25" />
          <div class="text-white">Message ...</div>
        </div> -->
      </div>
    </div>

    <div v-else class="w-full min-h-[100vh] h-full bg-gray-300">
      <div class="w-full h-full flex justify-center items-center">
        <div class="text-2xl text-gray-900">
          Here is no messages in the chat ...
        </div>
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
          @keyup.enter="sendToCommonChat"
          type="text"
          placeholder="Search"
          autocomplete="on"
          class="focus:outline-none appearance-none focus:shadow-none placeholder:text-gray-900 placeholder:text-md bg-white w-[55%] py-1 rounded-full px-4 relative"
        />
        <button
          @click="sendToCommonChat"
          class="p-4 flex items-center justify-center cursor-pointer"
        >
          <SendIcon fillColor="#FFFFFF" :size="25" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
