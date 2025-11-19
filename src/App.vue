<script>
import { ref } from 'vue'
import SSD from './components/sticky_scroll_demo.vue'

export default {
  components: { SSD },
  setup() {
    const xxEl = ref(null)

    return {}
  },
}
</script>

<template lang="pug">
SSD
</template>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
}
</style>
