<script setup lang="ts">
import { ref, watchEffect, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import CheckAllIcon from "vue-material-design-icons/CheckAll.vue";
import { getDoc, collection, getDocs, docs } from "firebase/firestore";
import { db } from "../firebase-init.js";
import { onMounted } from "vue";
import { useMessageViewStore } from "../store/messageView-store";
import { useCommonChatStore } from "../store/common-chat-store";
import { useScrollTo } from "../composables/scrollTo";
import { useChangeBackground } from "../composables/changeBackground";
import { openChat } from "../composables/openChat";
import { useGetChatsUserIn } from "../composables/getChatsUserIn.js";
import { useAuthStoreC } from "../store/use-auth.js";
import { useFirestore } from "../store/fireStore";

const { getChatsUserIn } = useGetChatsUserIn();
const fireStore = useFirestore();
const { openChatC } = openChat();
const {
  commonChat: commonChatF,
  userDataForChat,
  userInChats,
} = storeToRefs(fireStore);
const authStoreC = useAuthStoreC();

const { user, logoutPopUpOpen, login } = storeToRefs(authStoreC);
const { changeBackground, random } = useChangeBackground();
const commonChatStore = useCommonChatStore();
const messageViewStore = useMessageViewStore();
const { messageViewOpen } = storeToRefs(messageViewStore);

const { scrollToLastMessage } = useScrollTo();
const currenrUserId = user.value.localId;
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

const handleOpenChat = (q) => {
  console.log(user.value.localId);
  getChatsUserIn(user.value.localId);
  openChatC(q);
  getChatsUserIn(user.value.localId);
};
const hideMyChat = (data) => {
  if (data === user.value.localId) {
    return false;
  } else {
    return true;
  }
};
const usersId = ref([]);

const chatForUser = computed(() => {
  return userInChats.value.filter((chat) =>
    chat.participants.includes(user.value.localId)
  );
  console.log(chatForUser);
});
// console.log(fireStore.allUsers);

const filteredUsers = computed(() => {
  const participantIds = chatForUser.value.flatMap((chat) => chat.participants);
  return fireStore.allUsers.filter((user) => participantIds.includes(user.uid));
});
</script>
<template>
  <div class="overflow-auto h-[60vh]">
    <div v-for="user in filteredUsers" :key="user.id">
      <!-- <div class="text-red-400">{{ user }}</div> -->
      <div @click="handleOpenChat(user)">
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

              <div class="text-white"></div>
            </div>

            <div class="flex items-center">
              <CheckAllIcon fillColor="#FFFFFF" :size="25" />
              <div class="text-white">Message ...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
