<script setup lang="ts">
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import LogoutIcon from "vue-material-design-icons/Logout.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import ChatsView from "./ChatsView.vue";
import CommonChat from "./CommonChat.vue";
import MessageView from "./MessageView.vue";
import FindFriendsView from "./FindFriendsView.vue";
import { storeToRefs } from "pinia";
import { ref, onMounted } from "vue";
import { useAuthStore } from "../store/auth-store";
import { useMessageViewStore } from "../store/messageView-store";
import CommonMessageView from "../components/CommonMessageView.vue";
import DefaultView from "../components/DefaultView.vue";
import { useCommonChatStore } from "../store/common-chat-store";
import { useAuthStoreC } from "../store/use-auth.js";
const authStoreC = useAuthStoreC();
const { user: userC, logoutPopUpOpen, login } = storeToRefs(authStoreC);
const commonChatStore = useCommonChatStore();
const messageViewStore = useMessageViewStore();
const { messageViewOpen } = storeToRefs(messageViewStore);

const authStore = useAuthStore();
const { userDataForChat, user, showFindFriends, commonChat, currentChat } =
  storeToRefs(authStore);

onMounted(async () => {
  try {
    authStore.fetchPeerIDs();
    authStore.getAllUsers();

    authStore.getAllChatsByUser();
    authStore.getCommonChatsByUser();
  } catch (error) {
    console.log(error);
  }
});
const combinedFunc = async () => {
  authStoreC.logout();
  logoutPopUpOpen.value = logoutPopUpOpen.value;
};
</script>
<template>
  <div class="fixed w-full md:w-[420px] z-40 bg-gray-900 h-[100vh]">
    <div
      @click="combinedFunc()"
      class="text-white cursor-pointer absolute top-0 md:bottom-0 right-0 md:right-0 bg-gray-900 w-[100%] h-[70px] md:h-[70px] flex justify-center items-center gap-2"
      :class="
        logoutPopUpOpen
          ? ' -translate-y-0 transition-all duration-1000'
          : '-translate-y-[100%] transition-all duration-1000'
      "
    >
      <LogoutIcon fillColor="#FFFFFF" :size="20" class="cursor-pointer" />
      <p>Logout</p>
    </div>
    <div class="mx-4 my-4 flex items-center gap-4">
      <div>
        <img :src="userC.photoUrl" alt="" class="w-12 h-12 rounded-full" />
      </div>

      <div class="text-white font-light text-md">
        {{ userC.email }}
      </div>
    </div>
    <div id="Header" class="flex justify-between items-center px-4 py-2 pt-10">
      <div class="text-xl text-gray-200 font-medium">Chats dev</div>

      <div class="flex justify-between items-center gap-4 relative">
        <AccountGroupIcon fillColor="#FFFFFF" :size="25" />
        <DotsVerticalIcon
          @click="logoutPopUpOpen = !logoutPopUpOpen"
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

    <div v-if="!showFindFriends" class="overflow-auto h-[100vh]">
      <div><CommonChat /></div>
      <FindFriendsView />
    </div>

    <div v-if="showFindFriends">
      <ChatsView />
    </div>
  </div>
  <div>
    <div
      class="md:ml-[420px] md:w-[calc(100vw-420px)] w-full h-full text-center"
      v-if="commonChatStore.onCommonChat"
    >
      <CommonMessageView :chat="commonChat" />
    </div>
    <div v-else>
      <div v-if="userDataForChat.length && messageViewOpen">
        <MessageView :chat="currentChat" />
      </div>
      <div
        v-else
        class="md:ml-[420px] md:w-[calc(100vw-420px)] w-full h-[100vh] fixed text-center bg-gray-100"
      >
        <DefaultView />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
