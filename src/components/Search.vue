<script setup>
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import { useFirestore } from "../store/fireStore";
import { useGetChatsUserIn } from "../composables/getChatsUserIn.js";
import { useAuthStoreC } from "../store/use-auth.js";
import { auth } from "../firebase-init.js";
const authStoreC = useAuthStoreC();
const { user } = storeToRefs(authStoreC);
const { getChatsUserIn } = useGetChatsUserIn();
const fireStore = useFirestore();

const {
  userDataForChat,

  showFindFriends,
  commonChat,
  currentChat,
} = storeToRefs(fireStore);
const props = defineProps({
  data: { type: Object },
});
const { data } = storeToRefs(props);

const emit = defineEmits(["handleSearch"]);
const searchQuery = ref(""); // User input for search
let userOnSearch = ref(null);
const names = data.value.map((user) => user.displayName);
const filteredItems = computed(() => {
  return data.value.filter((user) =>
    (user.displayName || "")
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())
  );
});

const selectUser = (u) => {
  emit("handleSearch", u);
};
</script>
<template>
  <div class="mt-4">
    <div
      @click="showFindFriends = !showFindFriends"
      class="w-full flex justify-start items-center gap-3 px-2 py-1 border border-gray-200 rounded-lg cursor"
    >
      <MagnifyIcon
        fillColor="#FFFFFF"
        :size="18"
        class="flex items-center justify-center"
      />

      <div class="text-green-300">{{ userOnSearch }}</div>
      <div class="text-md text-green-300">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="showFindFriends ? 'Search by name' : 'Search'"
          class="focus:outline-none placeholder:text-gray-200 placeholder:text-md"
        />
      </div>
    </div>
    <div :class="showFindFriends ? 'py-3 h-[70vh] overflow-auto' : 'py-3'">
      <div
        v-if="showFindFriends"
        v-for="user in filteredItems"
        :key="userIndex"
        class="flex flex-col items-start justify-center py-2 px-2"
        @click="selectUser(user)"
      >
        <div
          class="flex justify-start items-center gap-3 bg-gray-900 w-full h-full px-2 py-1 rounded-xl"
        >
          <img class="w-[3rem] rounded-full" :src="user.photoURL" alt="" />
          <div class="text-white">{{ user.displayName }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
