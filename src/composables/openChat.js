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

import { useAuthStoreC } from "../store/use-auth.js";
import { useFirestore } from "../store/fireStore";

export function openChat() {
  const fireStore = useFirestore();

  const { commonChat: commonChatF, userDataForChat } = storeToRefs(fireStore);
  const authStoreC = useAuthStoreC();
  const { user, logoutPopUpOpen, login } = storeToRefs(authStoreC);
  const { changeBackground, random } = useChangeBackground();
  const commonChatStore = useCommonChatStore();
  const messageViewStore = useMessageViewStore();
  const { messageViewOpen } = storeToRefs(messageViewStore);

  const { scrollToLastMessage } = useScrollTo();

  const openChatC = async (q) => {
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
      await fireStore.getChatById(q.uid, user.value.localId);
    } catch (error) {
      console.error("Error fetching chat:", error);
    }
    commonChatStore.onCommonChat = false;
    changeBackground();

    if (false) {
      messageViewOpen.value = !messageViewOpen.value;
    } else messageViewOpen.value = true;
  };
  return { openChatC };
}
