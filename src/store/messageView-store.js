import { defineStore } from "pinia";

export const useMessageViewStore = defineStore("messageView", {
  state: () => ({
    messageViewOpen: false,
  }),

  actions: {
    toggleMessageView() {
      this.messageViewOpen = !this.messageViewOpen;
    },
  },
});
