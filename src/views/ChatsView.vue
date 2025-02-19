<script setup lang="ts">
import { ref, onMounted } from "vue";
import MessageRowComponent from "../components/MessageRowComponent.vue";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../store/auth-store";

const authStore = useAuthStore();
const { userDataForChat, chats } = storeToRefs(authStore); // Remove `getChatById` here

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
      id: chat.mesagges[0].localId,
      name: chat.displayName,
      picture: chat.photoURL,
    },
  ];

  try {
    await authStore.getChatById(chat.mesagges[0].id); // Use `authStore.getChatById`
  } catch (error) {
    console.error("Error fetching chat:", error);
  }
};
</script>

<template>
  <div id="Messages" class="z-0 pt-1 fixed h-[calc(100vh-100px)] w-[420px]">
    <div v-for="chat in chats" :key="chat.id">
      <div @click="openChat(chat)">
        <MessageRowComponent :chat="chat" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
