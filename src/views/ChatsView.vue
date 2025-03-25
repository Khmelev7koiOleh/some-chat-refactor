<script setup lang="ts">
import { ref, onMounted } from "vue";
import MessageRowComponent from "../components/MessageRowComponent.vue";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../store/auth-store";
import { useFirestore } from "../store/fireStore";

import { useAuthStoreC } from "../store/use-auth.js";
const authStoreC = useAuthStoreC();
const { user, logoutPopUpOpen, login } = storeToRefs(authStoreC);
const fireStore = useFirestore();

const {
  commonChat: commonChatF,
  currentChatId,
  userDataForChat,
} = storeToRefs(fireStore);

// const authStore = useAuthStore();
// const { userDataForChat, chats } = storeToRefs(authStore); // Remove `getChatById` here
const hideMyChat = (data) => {
  if (data === user.value.localId) {
    return false;
  } else {
    return true;
  }
};
onMounted(async () => {
  console.log("Chats data on mount:", chats.value);

  if (userDataForChat.value.length === 0 && userDataForChat.value[0]) {
    await authStore.getAllChatsByUser(userDataForChat.value[0].id);
  }
});

const openChat = async (chat) => {
  console.log("Opening chat:", chat);

  userDataForChat.value = [
    {
      id: chat.uid,
      name: chat.displayName,
      picture: chat.photoURL,
    },
  ];
  console.log(userDataForChat.value);
  try {
    await fireStore.getChatById(chat.uid, user.value.localId); // Use `authStore.getChatById`
  } catch (error) {
    console.error("Error fetching chat:", error);
  }
};
</script>

<template>
  <div
    id="Messages"
    class="z-0 pt-1 overflow-auto h-[calc(100vh-100px)] w-[420px]"
  >
    <div class="w-full flex flex-col justify-center items-center">
      <div class="text-green-200 text-xl">Available users</div>
      <div
        class="border-b border-blue-950 w-[50%] rounded-full py-1 mb-5"
      ></div>
    </div>

    <div v-for="chat in fireStore.allUsers" :key="chat.id">
      <div v-if="hideMyChat(chat.uid)" @click="openChat(chat)">
        <MessageRowComponent :chat="chat" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
