<template>
  <div class="w-full h-full bg-gray-100 flex justify-center items-center">
    <div class="block">
      <div class="mt-1 flex rounded-md shadow-sm">
        <input v-model="username" type="text" class="focus:ring-indigo-500 focus:border-indigo-500 z-10 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300" placeholder="Username">
        <button @click="action" class="hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:ring-indigo-500 focus:ring-2 active:bg-gray-200 focus:z-10 inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
          {{ !modeRegister ? 'Login' : 'Register' }}
        </button>
      </div>
      <a @click="toggle" class="inline-block py-3 hover:text-gray-700 text-sm text-gray-500 font-bold underline">{{ modeRegister ? 'Login' : 'Register' }}</a>
    </div>
  </div>
</template>

<script>
import WebAuthnService from '@/services/webauthn.js';

export default {
  name: 'Auth',
  data() {
    return {
      username: "",
      modeRegister: false,
    }
  },
  methods: {
    toggle() {
      this.modeRegister = !this.modeRegister;
    },
    async action() {
      if (!this.modeRegister) {
        await this.login();
      } else {
        await this.register();
      }
    },
    async login() {
      let result = await WebAuthnService.login(this.username);
      if (!result.ok) {
        alert(`Failed to login with username ${this.username}`);
        return;
      }
      alert(`Logon successful!`);
    },
    async register() {
      let result = await WebAuthnService.register(this.username);
      if (!result.ok) {
        alert(`Failed to register with username ${this.username}`);
        return;
      }
      alert(`Register successful!`);
    },
  }
}
</script>
