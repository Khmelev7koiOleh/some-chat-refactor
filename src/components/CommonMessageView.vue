<script setup lang="ts">
import { toRefs, ref } from "vue";

import moment from "moment";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";

import EmoticonExcitedOutlineIcon from "vue-material-design-icons/EmoticonExcitedOutline.vue";
import ArrowLeftIcon from "vue-material-design-icons/ArrowLeft.vue";
import PlusIcon from "vue-material-design-icons/Plus.vue";
import SendIcon from "vue-material-design-icons/Send.vue";
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
} from "firebase/firestore";
import { useCommonChatStore } from "../store/common-chat-store";
import { useMessageViewStore } from "../store/messageView-store";
import { useAuthStore } from "../store/auth-store";
const authStore = useAuthStore();
const { userDataForChat, localId, user: thisUser } = storeToRefs(authStore);
const messageViewStore = useMessageViewStore();
const commonChatStore = useCommonChatStore();

let message = ref("");
const sendToCommonChat = async () => {
  if (!message.value.trim()) return;

  try {
    await addDoc(collection(db, "chat"), {
      text: message.value,
      //   userId: uuid(), // Sender's ID
      createdAt: serverTimestamp(),
      sender: thisUser.value.displayName,
      senderId: thisUser.value.localId,
      img: thisUser.value.photoUrl,
    });

    message.value = ""; // Clear input after sending
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
const openChat = async () => {
  console.log("Opening chat:", thisUser.value.localId);

  try {
    await authStore.openCommonChat(user.uid, thisUser.value.localId); // Use `authStore.openCommonChat`
  } catch (error) {
    console.error("Error fetching chat:", error);
  }

  commonChatStore.onCommonChat = true;
};
const props = defineProps({
  commonChat: { type: Object },
});
const { commonChat } = toRefs(props);
</script>

<template>
  <div>
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
      class="w-full h-[100vh] flex justify-end items-start px-10 py-20 cursor-pointer bg-gray-300"
    >
      <div class="w-full flex flex-col justify-between items-end">
        <div
          class="w-full p-4"
          v-for="(chat, chatIndex) in commonChat"
          :key="chatIndex"
        >
          <div
            :class="
              chat.senderId === thisUser.localId
                ? 'w-full flex justify-end items-center'
                : 'w-full flex justify-start items-center'
            "
          >
            <div v-if="chat.senderId !== thisUser.localId">
              <img :src="chat.img" alt="" class="w-12 h-12 rounded-full mr-8" />
            </div>
            <!-- <div class="text-black">{{ chat.sender }}</div> -->

            <div
              :class="
                chat.senderId === thisUser.localId
                  ? ' bg-green-600 py-1 px-2 rounded-xl text-gray-200'
                  : 'bg-gray-400 py-1 px-2 rounded-xl text-white'
              "
            >
              {{ chat.text }}
            </div>
          </div>
        </div>

        <!-- <div class="flex items-center">
          <CheckAllIcon fillColor="#FFFFFF" :size="25" />
          <div class="text-white">Message ...</div>
        </div> -->
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
