<script setup lang="ts">
import { toRefs, ref, computed, watch, onMounted, onBeforeMount } from "vue";

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
import { useScrollTo } from "../composables/scrollTo";
import { useChangeBackground } from "../composables/changeBackground";
import EmojiPicker from "vue3-emoji-picker";
import { addToFirestore } from "../composables/addTo";

const { error, loading, addToCollection, message } = addToFirestore();
const { changeBackground, random } = useChangeBackground();

import { useAuthStoreC } from "../store/use-auth.js";
const authStoreC = useAuthStoreC();
const { user, logoutPopUpOpen, login } = storeToRefs(authStoreC);
import { useFirestore } from "../store/fireStore";
const fireStore = useFirestore();

const { showFindFriends, commonChat, currentChat } = storeToRefs(fireStore);

const props = defineProps({
  chat: { type: Object },
});
const { chat } = toRefs(props);
// const message = ref("");
const showPicker = ref(false);

const messageViewStore = useMessageViewStore();
const commonChatStore = useCommonChatStore();
const chatContainerId = "MessageSection";

const { scrollToLastMessage } = useScrollTo();

let changeThemeOpen = ref(false);
const getChatsSize = document.getElementById("MessageSection");
const sendToCommonChat = async () => {
  addToCollection("chat", message);
  showPicker.value = false;
};

const addEmoji = (emoji) => {
  message.value += emoji.i; // Append the selected emoji to the input
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
onBeforeMount(() => {
  changeBackground();
});
onMounted(() => {
  setTimeout(() => {
    scrollToLastMessage(chatContainerId);
  }, 100);
});
</script>

<template>
  <div
    class="z-[50] overflow-auto touch-auto fixed md:w-[calc(100%-420px)] w-full md:h-[calc(100vh-65px)]"
  >
    <div class="w-[100%] md:w-[calc(100%-420px)] z-50 fixed text-center">
      <div
        class="w-[100%] flex justify-between items-center bg-black mb-[70px]"
      >
        <div class="w-[100%] flex items-center justify-between gap-4 px-4 py-2">
          <div class="flex items-center justify-start gap-4">
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
            <div class="text-white">General chat</div>
          </div>

          <div class="flex justify-center items-center">
            <div class="">
              <div class="flex items-center justify-end">
                <DotsVerticalIcon
                  @click="changeThemeOpen = !changeThemeOpen"
                  fillColor="#ffffff"
                  :size="24"
                  class="flex w-full h-full items-center justify-end cursor-pointer"
                />
              </div>

              <div
                :class="
                  changeThemeOpen
                    ? 'text-white fixed top-0 right-0 translate-y-[60px] duration-1000 px-4 py-4 bg-gray-950 flex flex-col rounded-md gap-3 '
                    : 'text-white fixed top-0 right-0 translate-y-[-100vh] duration-1000 px-4 py-1 bg-gray-950 flex flex-col rounded-md gap-3'
                "
              >
                <button @click="changeBackground">Change the theme</button>
                <button @click="changeBackground">Change the theme</button>
                <button @click="changeBackground">Change the theme</button>
                <button @click="changeBackground">Change the theme</button>
                <button @click="changeBackground">Change the theme</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      id="MessageSection"
      v-if="chat.length"
      class="w-full flex min-h-[100vh)] overflow-auto touch-auto h-[100vh] justify-end items-start cursor-pointer"
    >
      <img
        class="w-full md:w-[calc(100vw-420px)] h-full fixed z-[-1]"
        :src="`https://picsum.photos/id/${random}/200/300`"
        alt=""
      />
      <div
        class="w-full flex flex-col justify-between items-end pt-[100px] pb-[150px] md:pb-[150px]"
      >
        <ScrollToBottomButton :container="chatContainerId" />
        <div
          class="w-full p-4"
          v-for="(chat, chatIndex) in sortedMessages"
          :key="chatIndex"
        >
          <div
            :class="
              chat.senderId === user.localId
                ? 'w-[90%]  flex flex-col justify-center items-end'
                : 'w-[90%] flex flex-col justify-center items-start'
            "
          >
            <div class="flex">
              <div v-if="chat.senderId !== user.localId">
                <img
                  :src="chat.img"
                  alt=""
                  class="w-12 h-12 rounded-full mr-2"
                />
              </div>
              <div
                :class="
                  chat.senderId === user.localId
                    ? ' bg-green-500 max-h-[40px] flex flex-col justify-center items-center px-2 rounded-xl text-gray-200 break-all'
                    : 'bg-gray-500  max-h-[40px] flex flex-col justify-center items-center  py-[0px]  px-2 rounded-xl text-white break-all'
                "
              >
                <div class="text-[14px]">
                  {{ chat.text }}
                </div>
                <div
                  class="w-full flex justify-end items-center text-gray-200 text-[11px] mx-1"
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
          <div class="w-[40px] h-full">
            <button @click="showPicker = !showPicker">
              <EmoticonExcitedOutlineIcon
                fillColor="#FFFFFF"
                :size="24"
                class="flex items-center justify-center"
              />
            </button>

            <div class="absolute bottom-[10vh] left-0">
              <EmojiPicker v-if="showPicker" @select="addEmoji" />
            </div>
          </div>
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
