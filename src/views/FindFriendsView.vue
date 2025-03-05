<script setup lang="ts">
import { storeToRefs } from "pinia";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import CheckAllIcon from "vue-material-design-icons/CheckAll.vue";

import { useAuthStore } from "../store/auth-store";
import { onMounted } from "vue";

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
  if (data === authStore.user.localId) {
    return false;
  } else {
    return true;
  }
};
const openChat = async (user) => {
  console.log("Opening chat:", thisUser.value.localId);

  userDataForChat.value = [
    {
      id: user.uid,
      name: user.displayName,
      picture: user.photoURL,
    },
  ];

  try {
    await authStore.getChatById(user.uid, thisUser.value.localId); // Use `authStore.getChatById`
  } catch (error) {
    console.error("Error fetching chat:", error);
  }
};
</script>
<template>
  <div v-for="user in authStore.allUsers" :key="user">
    <div @click="openChat(user)">
      <div
        v-if="hideMyChat(user.uid)"
        @click="createNewChat(user)"
        class="w-full flex items-center px-4 py-3 cursor-pointer"
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
