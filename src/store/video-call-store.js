import { defineStore } from "pinia";

export const useVideoCallOpen = defineStore("videoCall", {
  state: () => ({
    videoCallOpen: false,
  }),

  actions: {
    toggleMessageView() {
      this.videoCallOpen = !this.videoCallOpen;
    },
  },
});
