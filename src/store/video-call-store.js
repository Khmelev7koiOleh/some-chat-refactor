import { defineStore } from "pinia";

export const useVideoCallOpen = defineStore("videoCall", {
  state: () => ({
    videoCallOpen: false,
    expand: false,
    videoPeerId: "",
  }),

  actions: {
    toggleMessageView() {
      this.videoCallOpen = !this.videoCallOpen;
    },
  },
});
