<script setup>
import { storeToRefs } from "pinia";

import { ref, computed, watch } from "vue";
import { useAuthStoreC } from "../store/use-auth.js";
const authStoreC = useAuthStoreC();
const { logoutPopUpOpen, loginCo } = storeToRefs(useAuthStoreC);

const name = ref(null);
const email = ref(null);
const password = ref(null);
const errorMessage = ref("");
const authMode = ref("sign-in"); // 'signin' or 'signup'

// Switch between Sign In and Sign Up
const toggleAuthMode = (mode) => {
  authMode.value = mode;
};
const signInUpText = ref("Sign-in");
const funcSignInUpText = () => {
  errorMessage.value = "";
  signInUpText.value = authMode.value === "sign-in" ? "Sign-in" : "Sign-up";
};

const handleSignUpIn = (name, email, password) => {
  console.log("handle name", name);
  console.log("handle Email", email);
  console.log("handle password", password);

  if (authMode.value === "sign-in") {
    if (password.length >= 6) {
      authStoreC.signIn(name, email, password);
    } else {
      errorMessage.value = "at least 6 symbols";
    }
  }
  if (authMode.value === "sign-up") {
    if (password.length >= 6) {
      authStoreC.signIn(name, email, password);
    } else {
      errorMessage.value = "at least 6 symbols";
    }
  }
};

watch(authMode, funcSignInUpText, handleSignUpIn);
</script>

<template>
  <div
    id="Login"
    class="flex items-center justify-center w-[100vw] h-[100vh] bg-white"
  >
    <div
      class="bg-black w-[350px] h-[60%] rounded-2xl flex items-center justify-center relative"
    >
      <div class="flex flex-col items-center justify-center">
        <div
          class="flex flex-col items-center justify-center gap-4 m-4 absolute top-[20px]"
        >
          <div class="text-white text-xl mb-8">Login</div>

          <div class="flex gap-4 justify-center items-center z-50">
            <div
              @click="toggleAuthMode('sign-up')"
              :class="
                authMode === 'sign-up'
                  ? 'text-amber-400 border-b border-b-gray-200 rounded-xl px-2 py-1'
                  : 'text-white px-2 py-1'
              "
            >
              Sign up
            </div>

            <div
              @click="toggleAuthMode('sign-in')"
              :class="
                authMode === 'sign-in'
                  ? 'text-amber-400 border-b border-b-gray-200 rounded-xl px-2 py-1'
                  : 'text-white px-2 py-1'
              "
            >
              Sign in
            </div>
          </div>
          <div class="text-red-400">{{ errorMessage }}</div>
        </div>
        <div
          class="w-full h-full flex flex-col justify-end items-center gap-4 absolute bottom-[50px] right-0"
        >
          <div class="flex gap-4">
            <div
              v-if="authMode === 'sign-up'"
              class="max-w-[300px] h-full flex flex-col gap-4"
            >
              <div class="border border-blue-800 rounded-xl px-1 text-white">
                <input
                  v-model="name"
                  type="text"
                  placeholder="Name"
                  class="p-1 rounded-xl"
                />
              </div>
              <div class="border border-blue-800 rounded-xl px-1 text-white">
                <input
                  v-model="email"
                  type="text"
                  placeholder="Email"
                  class="p-1 rounded-xl"
                />
              </div>
              <div class="border border-blue-800 rounded-xl px-1 text-white">
                <input
                  v-model="password"
                  type="password"
                  placeholder="Password"
                  class="p-1 rounded-xl"
                />
              </div>
            </div>

            <div
              v-if="authMode === 'sign-in'"
              class="max-w-[300px] h-full flex flex-col gap-4"
            >
              <div class="border border-blue-800 rounded-xl px-1 text-white">
                <input
                  v-model="email"
                  type="text"
                  placeholder="Email"
                  class="p-1 rounded-xl"
                />
              </div>
              <div class="border border-blue-800 rounded-xl px-1 text-white">
                <input
                  v-model="password"
                  type="password"
                  placeholder="Password"
                  class="p-1 rounded-xl"
                />
              </div>
            </div>
          </div>
          <button
            @click="handleSignUpIn(name, email, password)"
            class="bg-blue-800 text-white px-4 py-1 rounded cursor-pointer"
          >
            {{ signInUpText }}
          </button>
          <button
            @click="authStoreC.loginCo"
            class="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
