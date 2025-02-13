<script setup lang="ts">
import DotsVerticalIcon from "vue-material-design-icons/DotsVertical.vue";
import AccountGroupIcon from "vue-material-design-icons/AccountGroup.vue";
import MagnifyIcon from "vue-material-design-icons/Magnify.vue";
import EmoticonExcitedOutlineIcon from "vue-material-design-icons/EmoticonExcitedOutline.vue";
import PaperClipIcon from "vue-material-design-icons/PaperClip.vue";
import PlusIcon from "vue-material-design-icons/Plus.vue";
import SendIcon from "vue-material-design-icons/Send.vue";

import { ref } from "vue";
</script>
<template>
  <div
    class="ml-[420px] w-[calc(100vw-420px)] h-[100vh] fixed text-center bg-gray-300"
  >
    <div class="w-full flex justify-between items-center bg-black px-4">
      <div class="w-full h-full flex items-center gap-4 px-4 py-2">
        <img
          src="https://picsum.photos/id/125/200/300"
          class="w-12 h-12 rounded-full"
          alt=""
        />
        <div class="text-white">Name</div>
      </div>

      <div>
        <DotsVerticalIcon
          fillColor="#ffffff"
          :size="24"
          class="flex items-center justify-center"
        />
      </div>
    </div>

    <div
      id="MessageSection"
      class="pt-20 pb-8 z-[-1] overflow-auto touch-auto fixed w-[calc(100vw-420px)] h-[calc(100vh-65px)]"
    >
      <div class="px-20 text-sm">
        <div class="w-[calc(100%-100px)]">
          <div class="inline-block bg-white p-2 rounded-md my-1">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quaerat
            labore modi libero molestiae pariatur! Eveniet porro corporis
            voluptas totam natus laudantium? Unde non ad, tempora quis assumenda
            commodi ducimus recusandae.
          </div>
        </div>

        <div
          class="flex justify-end space-x-1 w-[calc(100%-100px)] float-right mt-8"
        >
          <div class="inline-block bg-green-400 p-2 rounded-md my-1">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quaerat
            labore modi libero molestiae pariatur! Eveniet porro corporis
            voluptas totam natus laudantium? Unde non ad, tempora quis assumenda
            commodi ducimus recusandae.
          </div>
        </div>
      </div>
    </div>

    <div id="SendSection" class="fixed bottom-0 bg-black h-[60px] w-full">
      <div class="h-full w-full flex items-center">
        <div class="flex justify-between items-center gap-4 mx-6">
          <EmoticonExcitedOutlineIcon
            fillColor="#FFFFFF"
            :size="24"
            class="flex items-center justify-center"
          />
          <PaperClipIcon
            fillColor="#FFFFFF"
            :size="24"
            class="flex items-center justify-center"
          />
        </div>

        <input
          type="text"
          placeholder="Search"
          autocomplete="on"
          class="focus:outline-none appearance-none focus:shadow-none placeholder:text-gray-900 placeholder:text-md bg-white w-[55%] py-1 rounded-full px-4 relative"
        />
        <button class="p-4 flex items-center justify-center">
          <SendIcon fillColor="#FFFFFF" :size="25" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
