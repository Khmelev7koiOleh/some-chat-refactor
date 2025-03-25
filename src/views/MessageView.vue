<script setup lang="ts">
import {
  ref,
  computed,
  watchEffect,
  onMounted,
  nextTick,
  watch,
  onBeforeMount,
} from "vue";
import moment from "moment";
import { storeToRefs } from "pinia";
import VideoCall from "../components/VideoCall.vue";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import EmoticonExcitedOutlineIcon from "vue-material-design-icons/EmoticonExcitedOutline.vue";
import VideoIcon from "vue-material-design-icons/Video.vue";
import ArrowLeftIcon from "vue-material-design-icons/ArrowLeft.vue";
import PlusIcon from "vue-material-design-icons/Plus.vue";
import SendIcon from "vue-material-design-icons/Send.vue";
import { useScrollTo } from "../composables/scrollTo";
import { useAuthStore } from "../store/auth-store";
import { useMessageViewStore } from "../store/messageView-store";
import { useVideoCallOpen } from "../store/video-call-store";
import ScrollToBottomButton from "../components/ScrollToBottomButton.vue";
import { useChangeBackground } from "../composables/changeBackground";
import EmojiPicker from "vue3-emoji-picker";
import "vue3-emoji-picker/css";
import { useAuthStoreC } from "../store/use-auth.js";
import { useFirestore } from "../store/fireStore";
const fireStore = useFirestore();

const {
  commonChat: commonChatF,
  currentChatId,
  userDataForChat,
} = storeToRefs(fireStore);
const authStoreC = useAuthStoreC();
const { user, logoutPopUpOpen, login } = storeToRefs(authStoreC);
const { changeBackground, random } = useChangeBackground();
const messageViewStore = useMessageViewStore();
const { messageViewOpen } = storeToRefs(messageViewStore);

const videoCall = useVideoCallOpen();
const { videoCallOpen, expand } = storeToRefs(videoCall);
const authStore = useAuthStore();
const {
  // userDataForChat,
  user: userAuth,
  currentChatId: currentChatIdAuth,
  currentChat: currentChatAuth,
  showFindFriends,
  peerUsers,
  chats,
} = storeToRefs(authStore);
const { currentChat } = storeToRefs(fireStore);

const chatContainerId = "MessageSection";

const { scrollToLastMessage } = useScrollTo();

let message = ref("");
let changeThemeOpen = ref(false);

const peerRef = ref("");

watchEffect(() => {
  console.log(currentChat);
});
const showPicker = ref(false);

const addEmoji = (emoji) => {
  message.value += emoji.i; // Append the selected emoji to the input
};
const sendMessage = async () => {
  if (!message.value.trim()) return; // Prevent sending empty messages

  if (!userDataForChat.value.length || !userDataForChat.value[0]?.id) {
    console.error("Chat ID is missing!");
    return;
  }

  await fireStore.sendMessage({
    message: message.value,
    chatId: currentChatId.value,
  });
  message.value = "";
  showPicker.value = false;
};

scrollToLastMessage(chatContainerId);
watch(currentChat, () => {
  scrollToLastMessage(chatContainerId);
});
onBeforeMount(() => {
  changeBackground();
});
onMounted(() => {
  console.log(random);
  console.log(random.value);

  setTimeout(() => {
    scrollToLastMessage(chatContainerId);
  }, 100);
});
</script>
<template>
  <div
    class="md:ml-[420px] md:w-[calc(100vw-420px)] w-full z-50 h-[100%] fixed text-center bg-gray-300"
  >
    <img
      class="w-full md:w-[calc(100vw-420px)] h-full fixed z-[-1]"
      :src="`https://picsum.photos/id/${random}/250/300`"
      alt=""
    />

    <div class="w-full flex justify-between items-center bg-black px-4">
      <div class="w-full h-full flex items-center gap-4 px-4 py-2">
        <div>
          <ArrowLeftIcon
            fillColor="#ffffff"
            :size="24"
            @click="messageViewOpen = false"
          />
        </div>
        <!-- <div class="text-white">{{ peerRef }}</div> -->
        <img
          :src="userDataForChat[0].picture"
          class="w-12 h-12 rounded-full"
          alt=""
        />

        <div class="text-white">{{ userDataForChat[0].name }}</div>
      </div>
      <div @click="videoCallOpen = !videoCallOpen">
        <VideoIcon
          fillColor="#ffffff"
          :size="24"
          class="flex w-full h-full items-center justify-end cursor-pointer"
        />
      </div>
      <div class="flex justify-center items-center">
        <div class="">
          <div class="flex items-center justify-end ml-6">
            <DotsVerticalIcon
              @click="changeThemeOpen = !changeThemeOpen"
              fillColor="#ffffff"
              :size="24"
              class="flex w-full h-full items-center justify-end cursor-pointer"
            />
          </div>

          <div
            :class="
              changeThemeOpen
                ? 'text-white fixed top-0 right-0 translate-y-[60px] duration-1000 px-4 py-4 bg-gray-950 flex flex-col rounded-md gap-3 '
                : 'text-white fixed top-0 right-0 translate-y-[-100vh] duration-1000 px-4 py-1 bg-gray-950 flex flex-col rounded-md gap-3'
            "
          >
            <button @click="changeBackground">Change the theme</button>
            <button @click="changeBackground">Change the theme</button>
            <button @click="changeBackground">Change the theme</button>
            <button @click="changeBackground">Change the theme</button>
            <button @click="changeBackground">Change the theme</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="videoCallOpen">
      <!-- <div @click="callUserToParticipant(currentChat.participants[0].peerId)">
        0
      </div> -->
      <div class="w-[300px] h-[300px] fixed top-[15%] left-[5vw] z-[-0]">
        <div class="flex items-center justify-center">
          <VideoCall :callTo="userDataForChat[0].id" />
        </div>
      </div>
      <div>
        {{}}
        <!-- <button @click="callToUser(userDataForChat[0].id)">0000</button>
        <h2>Available Users</h2>
        <ul>
          <li v-for="user in peerUsers" :key="user.id">
            <button v-if="user.peerId" class="text-white bg-black py-1 px-2">
              Call {{ user.displayName }}
            </button>
          </li>
        </ul> -->

        <!-- <div class="text-white">
          {{ peerUsers }}
        </div> -->

        <video id="remoteVideo" autoplay></video>
      </div>
    </div>
    <div class="text-green-800 text-center text-sm">check1</div>

    <div
      id="MessageSection"
      class="w-full min-h-[calc(100vh-150px))] overflow-auto touch-auto h-[calc(100vh-200px)] justify-end items-start cursor-pointer"
    >
      <ScrollToBottomButton :container="chatContainerId" />

      <div v-if="chats && chats.length > 0">
        <!-- Loop through all chats -->
        <div v-for="(chat, chatIndex) in currentChat" :key="chatIndex">
          {{ chat }}chat
          <!-- Check if messages exist in chat -->
          <div v-if="chat">
            <!-- Loop through messages in each chat -->
            {{ chat }}chat
            <div
              v-for="(msg, msgIndex) in chat"
              :key="msgIndex"
              class="md:px-16 px-4 text-sm"
            >
              {{ msg }} msg
              <div
                v-if="msg.senderId !== user.localId"
                class="w-[calc(80%-100px)] flex justify-start items-center gap-2"
              >
                <div
                  v-if="msg.message"
                  class="bg-white py-1 px-2 rounded-md my-2 break-all"
                >
                  <div class="text-[14px]">
                    {{ msg.message }}
                  </div>
                  <div v-if="msg.createdAt" class="text-[11px]">
                    {{
                      moment(msg.createdAt, "MMMM Do YYYY, h:mm:ss a").format(
                        "h:mm"
                      )
                    }}
                  </div>
                </div>
              </div>

              <div
                v-else
                class="w-[calc(80%-100px)] flex justify-end items-center space-x-1 float-right mt-8"
              >
                <div
                  class="bg-green-500 my-2 block text-gray-200 py-1 px-2 rounded-md break-all"
                >
                  <div class="inline-">
                    {{ msg.message }}
                  </div>
                  <div class="text-[11px]">
                    {{
                      moment(msg.createdAt, "MMMM Do YYYY, h:mm:ss a").format(
                        "h:mm"
                      )
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <p>No messages in this chat</p>
          </div>
        </div>
      </div>
      <div v-else>
        <p>No chats available</p>
      </div>
    </div>

    <div
      id="SendSection"
      :class="
        expand
          ? 'fixed bottom-0 bg-black z-[-1] h-[60px] w-full'
          : 'fixed bottom-0 bg-black z-[1] h-[60px] w-full'
      "
    >
      <div class="h-full w-full flex items-center">
        <div class="flex justify-between items-center gap-4 mx-6">
          <Paperclip
            fillColor="#FFFFFF"
            :size="24"
            class="flex items-center justify-center rotate-45"
          />

          <div class="w-[40px] h-full">
            <button @click="showPicker = !showPicker">
              <EmoticonExcitedOutlineIcon
                fillColor="#FFFFFF"
                :size="24"
                class="flex items-center justify-center"
              />
            </button>

            <div class="absolute bottom-15 left-0">
              <EmojiPicker v-if="showPicker" @select="addEmoji" />
            </div>
          </div>
        </div>

        <input
          v-model="message"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="Search"
          autocomplete="on"
          class="focus:outline-none appearance-none focus:shadow-none placeholder:text-gray-900 placeholder:text-md bg-white w-[55%] py-1 rounded-full px-4 relative"
        />
        <button
          @click="sendMessage"
          class="p-4 flex items-center justify-center cursor-pointer"
        >
          <SendIcon fillColor="#FFFFFF" :size="25" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.break-letters {
  word-break: break-all;
}
</style>
