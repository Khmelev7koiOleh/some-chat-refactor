import { defineStore } from "pinia";

export const useCommonChatStore = defineStore("common-chat", {
  state: () => ({
    onCommonChat: false,
  }),
  actions: {
    toggleOnCommonChat() {
      this.onCommonChat = !this.onCommonChat;
    },
  },
});
