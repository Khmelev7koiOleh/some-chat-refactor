<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import CheckAllIcon from "vue-material-design-icons/CheckAll.vue";
import { v4 as uuid } from "uuid";

import { onMounted } from "vue";
import { useMessageViewStore } from "../store/messageView-store";
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
import { useAuthStoreC } from "../store/use-auth.js";
import { useFirestore } from "../store/fireStore";
const fireStore = useFirestore();

const {
  commonChat: commonChatF,
  currentChatId,
  userDataForChat,
  chats,
} = storeToRefs(fireStore);
const messageViewStore = useMessageViewStore();
const authStoreC = useAuthStoreC();
const { user, localId } = storeToRefs(authStoreC);

const commonChatStore = useCommonChatStore();

const openChat = async () => {
  console.log("Opening chat:", user.value.localId);

  try {
    await fireStore.openCommonChat(user.uid, user.value.localId);
  } catch (error) {
    console.error("Error fetching chat:", error);
  }

  commonChatStore.onCommonChat = true;
};
</script>
<template>
  <div
    class="w-full flex items-center px-4 py-3 cursor-pointer"
    @click="openChat(user)"
  >
    <div>
      <img
        :src="`https://picsum.photos/id/699/200/300`"
        alt=""
        class="w-12 h-12 rounded-full mr-8"
      />
    </div>
    <div class="w-full">
      <div class="flex justify-between items-center">
        <div class="text-white">General chat</div>

        <div class="text-white"></div>
      </div>

      <div class="flex items-center">
        <CheckAllIcon fillColor="#FFFFFF" :size="25" />
        <div class="text-white">Message ...</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
