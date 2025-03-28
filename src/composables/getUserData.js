import { ref, watchEffect, watch } from "vue";
import { storeToRefs } from "pinia";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import CheckAllIcon from "vue-material-design-icons/CheckAll.vue";

import { onMounted } from "vue";
import { useMessageViewStore } from "../store/messageView-store";
import { useCommonChatStore } from "../store/common-chat-store";
import { useScrollTo } from "../composables/scrollTo";
import { useChangeBackground } from "../composables/changeBackground";
import { useProfileStore } from "../store/profile-store.js";
import { useAuthStoreC } from "../store/use-auth.js";
import { useFirestore } from "../store/fireStore";

export function useGetUserData() {
  const profileStore = useProfileStore();
  const { onProfileOpen, userProfileData } = storeToRefs(profileStore);
  const fireStore = useFirestore();
  const { commonChat: commonChatF, userDataForChat } = storeToRefs(fireStore);
  const authStoreC = useAuthStoreC();
  const { user, logoutPopUpOpen, login } = storeToRefs(authStoreC);

  const commonChatStore = useCommonChatStore();
  const messageViewStore = useMessageViewStore();
  const { messageViewOpen } = storeToRefs(messageViewStore);

  //_____________

  const getUserData = async (q) => {
    console.log(q);

    profileStore.setUserProfileData(q);

    //if
    onProfileOpen.value = !!q;
  };
  return { getUserData };
}
