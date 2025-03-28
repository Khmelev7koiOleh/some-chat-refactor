<script setup>
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import moment from "moment";
import { useFirestore } from "../store/fireStore";
import Close from "vue-material-design-icons/Close.vue";
import MessageOutlineIcon from "vue-material-design-icons/MessageOutline.vue";
import { useProfileStore } from "../store/profile-store.js";
import { useGetUserData } from "../composables/getUserData";
import { useFindUserById } from "../composables/findUserById";
import { openChat } from "../composables/openChat";

const { findUserById } = useFindUserById();
const { openChatC } = openChat();
const profileStore = useProfileStore();
const { onProfileOpen, userProfileData } = storeToRefs(profileStore);
const fireStore = useFirestore();
const { getUserData } = storeToRefs(useGetUserData);
// const getUserData = useGetUserData();
const {
  userDataForChat,
  getAllUsers,
  allUsers,
  showFindFriends,
  commonChat,
  currentChat,
} = storeToRefs(fireStore);
</script>
<template>
  <div class="w-[33vw] h-[60vh] bg-gray-950 rounded-xl relative">
    <!-- <div class="text-white">{{ fireStore.allUsers }}</div> -->
    <div class="absolute top-4 left-4">
      <Close fillColor="#ffff" @click="profileStore.toggleOnProfileOpen" />
    </div>

    <div class="flex flex-col justify-center items-center gap-6 py-8">
      <img :src="userProfileData.img" class="w-[5rem] rounded-full" alt="" />
      <div class="text-white">{{ userProfileData.sender }}</div>
    </div>
    <div class="w-full flex justify-center items-center py-6">
      <button
        @click="findUserById(userProfileData.senderId)"
        class="flex justify-center items-center gap-4 text-white border px-6 py-2 border-t-blue-500 rounded-2xl"
      >
        Send DM <MessageOutlineIcon fillColor="#ffff" />
      </button>
    </div>
    <div
      class="flex flex-col justify-center items-center gap-4 fixed bottom-0 w-full py-4"
    >
      <div class="bg-blue-900 w-[90%] p-4 rounded-xl">
        <div class="text-white flex gap-2 break-all text-[12px]">
          <div>Selected message:</div>
          <div class="text-white text-[12px]">{{ userProfileData.text }}</div>
        </div>
        <div class="text-white flex gap-2 break-all text-[12px]">
          <div>Date of creation</div>
          <div>
            {{
              moment(
                userProfileData.createdAt,
                "MMMM Do YYYY, h:mm:ss a"
              ).format("MMMM:Do:YYYY:h:mm")
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
