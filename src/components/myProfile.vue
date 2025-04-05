<script setup>
import { ref, computed, watch, watchEffect } from "vue";
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
import { useAuthStoreC } from "../store/use-auth.js";
const { findUserById } = useFindUserById();
const { openChatC } = openChat();
const profileStore = useProfileStore();
const { onMyProfile, onChangeNameOpen, onChangePhotoOpen } =
  storeToRefs(profileStore);
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
const authStoreC = useAuthStoreC();
const { user } = storeToRefs(authStoreC);
const newName = ref(null);
const newPhoto = ref(null);

const pic = ref(null);
const selectedFile = ref(null);

const getPic = (q) => {
  pic.value = q;
};

const handleUpload = () => {
  if (pic.value) {
    authStoreC.updatePhoto(pic.value);
  }
};

const avatarImages = [
  "https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png",
  "https://www.w3schools.com/w3images/avatar2.png",
  "https://www.w3schools.com/w3images/avatar3.png",
  "https://www.w3schools.com/w3images/avatar4.png",
  "https://api.dicebear.com/7.x/fun-emoji/svg?seed=SmileyUser",
  "https://www.w3schools.com/w3images/avatar5.png",
  "https://api.dicebear.com/6.x/micah/svg?seed=JaneDoe&size=150&backgroundColor=ffdfbf",

  "https://www.w3schools.com/w3images/avatar6.png",
  "https://www.w3schools.com/w3images/avatar1.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYJX12lqYhLPIlLqxNEpZT0kx8gqg1s2pzag&s",
];
const notActiveButton = ref(null);
const onChangeNamePhoto = (toggleValue) => {
  const newValue =
    typeof toggleValue === "boolean" ? toggleValue : !onChangeNameOpen.value;
  notActiveButton.value = newValue;
  if (newValue) {
    onChangePhotoOpen.value = false;
    onChangeNameOpen.value = true;
    notActiveButton.value = true;
  }
  if (!newValue) {
    onChangeNameOpen.value = false;
    onChangePhotoOpen.value = true;
    notActiveButton.value = false;
  }
};
const onMyProfileClose = () => {
  onChangeNameOpen.value = false;
  onChangePhotoOpen.value = false;
  notActiveButton.value = null;
  onMyProfile.value = !onMyProfile;
};
const changeName = (q) => {
  authStoreC.updateName(q);
  newName.value = "";
};
watch([onChangeNameOpen, onChangePhotoOpen], ([nameOpen, photoOpen]) => {
  if (nameOpen && photoOpen) {
    onChangePhotoOpen.value = false;
  }
});
</script>

<template>
  <div
    v-if="onMyProfile"
    class="md:min-w-[600px] w-[100vw] max-w-[600px] md:h-[70vh] h-[100vh] bg-gray-950 rounded-xl relative"
  >
    <!-- <div class="text-white">{{ fireStore.allUsers }}</div> -->
    <div class="absolute top-4 left-4">
      <Close fillColor="#ffff" @click="onMyProfileClose()" />
    </div>

    <div class="flex flex-col justify-center items-center gap-6 py-8">
      <img :src="user.photoUrl" class="w-[5rem] rounded-full" alt="" />
      <div class="flex flex-col justify-around items-center gap-4">
        <div class="text-white">Name: {{ user.displayName }}</div>
        <div class="text-white">Email: {{ user.email }}</div>
      </div>
    </div>
    <div class="flex justify-center items-center gap-4">
      <button
        @click="onChangeNamePhoto(true)"
        :class="
          notActiveButton === false
            ? ' bg-gray-900 text-amber-400 py-1 px-2 rounded-lg hover:scale-110 transition duration-300'
            : 'text-gray-900 bg-amber-400 py-1 px-2 rounded-lg hover:scale-110 transition duration-300' &&
              notActiveButton === null
            ? ' bg-gray-900 text-amber-400 py-1 px-2 rounded-lg hover:scale-110 transition duration-300'
            : 'text-gray-900 bg-amber-400 py-1 px-2 rounded-lg hover:scale-110 transition duration-300'
        "
      >
        Change my name
      </button>

      <button
        @click="onChangeNamePhoto(false)"
        :class="
          notActiveButton === true
            ? ' bg-gray-900 text-amber-400 py-1 px-2 rounded-lg hover:scale-110 transition duration-300'
            : 'text-gray-900 bg-amber-400 py-1 px-2 rounded-lg hover:scale-110 transition duration-300' &&
              notActiveButton === null
            ? ' bg-gray-900 text-amber-400 py-1 px-2 rounded-lg hover:scale-110 transition duration-300'
            : 'text-gray-900 bg-amber-400 py-1 px-2 rounded-lg hover:scale-110 transition duration-300'
        "
      >
        Change my photo
      </button>
    </div>
    <div
      v-if="onChangeNameOpen"
      class="flex flex-col justify-end items-center gap-4 py-4"
    >
      <div class="p-4">
        <input
          type="text"
          placeholder="Paste a new name"
          v-model="newName"
          class="text-amber-900 rounded-md placeholder:text-gray-900 bg-gray-200 px-2 py-1"
        />
      </div>
      <button
        @click="changeName(newName)"
        class="flex justify-center items-center gap-4 text-white border px-6 py-2 border-t-blue-500 rounded-2xl"
      >
        Change the name
      </button>
    </div>

    <div
      v-if="onChangePhotoOpen"
      class="flex flex-col justify-center items-center"
    >
      <div class="flex flex-wrap gap-8 p-8 justify-start items-center">
        <img
          v-for="(url, index) in avatarImages"
          :key="index"
          :src="url"
          class="w-[45px] md:w-[50px] rounded-full cursor-pointer border border-gray-300 hover:scale-115 transition"
          :class="pic === url ? ' p-1 bg-blue-500 ' : ''"
          @click="getPic(url)"
          alt="avatar"
        />
      </div>

      <button
        @click="handleUpload()"
        class="flex justify-center items-center gap-4 text-white border px-6 py-2 border-t-blue-500 rounded-2xl"
      >
        Change the photo
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
