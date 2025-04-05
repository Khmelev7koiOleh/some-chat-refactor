import { defineStore } from "pinia";
import MyProfile from "../components/myProfile.vue";

export const useProfileStore = defineStore("profile-store", {
  state: () => ({
    onProfileOpen: false,
    userProfileData: null,
    onMyProfile: false,
    onChangeNameOpen: false,
    onChangePhotoOpen: false,
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
