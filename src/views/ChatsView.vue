<template>
  <div id="Messages" class="z-0 pt-1 fixed h-[clac(100vh-100px)] w-[420px]">
    <MessageRowComponent />
    <!-- <div class="flex justify-between items-center px-4 py-2">
      <div class="text-xl text-gray-200 font-medium">Chats</div>
      <div class="flex justify-between items-center gap-4">
        <AccountGroupIcon fillColor="#FFFFFF" :size="25" />
        <DotsVerticalIcon fillColor="#FFFFFF" :size="25" />
      </div> -->
    <!-- </div> -->
  </div>
</template>

<script setup lang="ts">
import MessageRowComponent from "../components/MessageRowComponent.vue";
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
</script>

<style scoped></style>
