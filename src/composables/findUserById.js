import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import moment from "moment";
import { useFirestore } from "../store/fireStore";
import Close from "vue-material-design-icons/Close.vue";
import MessageOutlineIcon from "vue-material-design-icons/MessageOutline.vue";
import { useProfileStore } from "../store/profile-store.js";
import { useGetUserData } from "../composables/getUserData";

import { openChat } from "../composables/openChat";

export function useFindUserById() {
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

  const { openChatC } = openChat();
  const findUserById = (userId) => {
    const user = allUsers.value.find((user) => user.uid === userId);
    openChatC(user);
    profileStore.toggleOnProfileOpen();
  };

  return { findUserById };
}
