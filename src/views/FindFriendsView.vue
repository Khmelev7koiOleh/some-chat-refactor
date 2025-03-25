<script setup lang="ts">
import { ref, watchEffect, watch } from "vue";
import { storeToRefs } from "pinia";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import CheckAllIcon from "vue-material-design-icons/CheckAll.vue";

import { useAuthStore } from "../store/auth-store";
import { onMounted } from "vue";
import { useMessageViewStore } from "../store/messageView-store";
import { useCommonChatStore } from "../store/common-chat-store";
import { useScrollTo } from "../composables/scrollTo";
import { useChangeBackground } from "../composables/changeBackground";

import { useAuthStoreC } from "../store/use-auth.js";
import { useFirestore } from "../store/fireStore";
const fireStore = useFirestore();

const { commonChat: commonChatF } = storeToRefs(fireStore);
const authStoreC = useAuthStoreC();
const { user, logoutPopUpOpen, login } = storeToRefs(authStoreC);
const { changeBackground, random } = useChangeBackground();
const commonChatStore = useCommonChatStore();
const messageViewStore = useMessageViewStore();
const { messageViewOpen } = storeToRefs(messageViewStore);

const { scrollToLastMessage } = useScrollTo();
const authStore = useAuthStore();
const { userDataForChat, localId, user: thisUser } = storeToRefs(authStore);

const createNewChat = (user) => {
  userDataForChat.value = [];
  userDataForChat.value.push({
    id: "",
    sub: user.uid,
    name: user.displayName,
    picture: user.photoURL,
  });
  console.log("Creating new chat with user:", userDataForChat.value);
};
const hideMyChat = (data) => {
  if (data === user.value.localId) {
    return false;
  } else {
    return true;
  }
};
const openChat = async (q) => {
  changeBackground();
  console.log("Opening chat:", user.value.localId);
  scrollToLastMessage();
  userDataForChat.value = [
    {
      id: q.uid,
      name: q.displayName,
      picture: q.photoURL,
    },
  ];

  try {
    await fireStore.getChatById(q.uid, user.value.localId); // Use `authStore.getChatById`
  } catch (error) {
    console.error("Error fetching chat:", error);
  }
  commonChatStore.onCommonChat = false;
  changeBackground();

  if (false) {
    messageViewOpen.value = !messageViewOpen.value;
  } else messageViewOpen.value = true;
};
</script>
<template>
  <div v-for="user in authStore.allUsers" :key="user">
    <div @click="openChat(user)">
      <div
        v-if="hideMyChat(user.uid)"
        @click="createNewChat(user)"
        class="w-full bg-transparent flex items-center overflow-auto rounded-lg m-1 px-4 py-3 cursor-pointer hover:bg-gray-800"
      >
        <div>
          <img
            :src="user.photoURL || ''"
            alt=""
            class="w-12 h-12 rounded-full mr-8"
          />
        </div>
        <div class="w-full">
          <div class="flex justify-between items-center">
            <div class="text-white">{{ user.displayName }}</div>

            <div class="text-white">data</div>
          </div>

          <div class="flex items-center">
            <CheckAllIcon fillColor="#FFFFFF" :size="25" />
            <div class="text-white">Message ...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
