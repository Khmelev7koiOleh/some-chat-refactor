<script setup lang="ts">
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import LogoutIcon from "vue-material-design-icons/Logout.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import ChatsView from "./ChatsView.vue";
import CommonChat from "../views/CommonChat.vue";
import MessageView from "./MessageView.vue";
import FindFriendsView from "./FindFriendsView.vue";
import Search from "../components/Search.vue";
import { storeToRefs } from "pinia";
import { ref, onMounted } from "vue";
import { useMessageViewStore } from "../store/messageView-store";
import CommonMessageView from "../components/CommonMessageView.vue";
import { openChat } from "../composables/openChat";
import DefaultView from "../components/DefaultView.vue";
import Profile from "../components/Profile.vue";
import { useCommonChatStore } from "../store/common-chat-store";
import { useAuthStoreC } from "../store/use-auth.js";
import { useVideoCallOpen } from "../store/video-call-store";
import { useFirestore } from "../store/fireStore";
import { useProfileStore } from "../store/profile-store.js";
import { useGetUserData } from "../composables/getUserData";
const videoCall = useVideoCallOpen();
const { expand, videoCallOpen } = storeToRefs(videoCall);
const profileStore = useProfileStore();
const { onProfileOpen } = storeToRefs(profileStore);
const { getUserData, userProfileData } = storeToRefs(useGetUserData);
const { openChatC } = openChat();
const authStoreC = useAuthStoreC();
const { user: userC, logoutPopUpOpen, login } = storeToRefs(authStoreC);

const fireStore = useFirestore();

const {
  userDataForChat,

  showFindFriends,
  commonChat,
  currentChat,
} = storeToRefs(fireStore);
const commonChatStore = useCommonChatStore();
const messageViewStore = useMessageViewStore();
const { messageViewOpen } = storeToRefs(messageViewStore);

const handleSearch = (user) => {
  console.log("User selected:", user);
  openChatC(user);
};
onMounted(async () => {
  try {
    fireStore.getAllUsers();
    fireStore.getChatById();
    fireStore.getAllChatsByUser();
    fireStore.getCommonChatsByUser();
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
  <div
    v-if="onProfileOpen"
    :class="
      videoCallOpen
        ? ' fixed top-1/3 z-60 left-1/2 transform -translate-x-1/2 -translate-y-1/3'
        : ' fixed top-1/3 z-60 left-1/2 transform -translate-x-1/2 -translate-y-1/3'
    "
  >
    <Profile />
  </div>
  <div
    :class="
      videoCallOpen
        ? 'fixed  w-full md:w-[420px] z-50 bg-gray-950 h-[100vh]'
        : 'fixed w-full md:w-[420px] z-50 bg-gray-950 h-[100vh]'
    "
  >
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
      <div class="text-xl text-gray-200 font-medium">Chats</div>

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

    <div id="Search" class="w-full px-4">
      <Search @handleSearch="handleSearch" :data="fireStore.allUsers" />
    </div>

    <div v-if="!showFindFriends" class="overflow-auto h-[100vh]">
      <div><CommonChat /></div>
      <div>
        <FindFriendsView />
      </div>
    </div>

    <!-- <div class="text-red-400" v-if="showFindFriends">
      <ChatsView />
    </div> -->
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
