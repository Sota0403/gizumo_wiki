<template lang="html">
  <div class="wrapper">
    <app-header />
    <div class="content">
      <app-sidebar v-if="isSignedin" />
      <main class="content-main">
        <div class="content-inner">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Header from '@Components/globals/Header';
import Sidebar from '@Components/globals/Sidebar';

export default {
  components: {
    appHeader: Header,
    appSidebar: Sidebar,
  },
  computed: {
    isSignedin() {
      return this.$store.state.auth.isSignedin;
    },
  },
};
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  margin-top: $headerHight;
  height: calc(100vh - #{$headerHight});
  &-main {
    width: 100%;
  }
  &-inner {
    margin: 0 auto;
    padding: 20px 0;
    width: 95%;
  }
}
</style>
