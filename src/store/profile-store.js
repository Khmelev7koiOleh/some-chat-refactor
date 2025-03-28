import { defineStore } from "pinia";

export const useProfileStore = defineStore("profile-store", {
  state: () => ({
    onProfileOpen: false,
    userProfileData: null,
  }),

  actions: {
    toggleOnProfileOpen() {
      this.onProfileOpen = !this.onProfileOpen;
    },

    setUserProfileData(data) {
      this.userProfileData = data;
      this.onProfileOpen = !!data; // Open profile if data exists
    },
  },
});
