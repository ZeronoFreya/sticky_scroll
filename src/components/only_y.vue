<script>
import { defineComponent, ref, computed } from 'vue'
import hljs from 'highlight.js'
import Item from './item.vue'

export default defineComponent({
    components: { Item },
    setup() {
        const reverse = ref(false)
        const highlightCode = computed(() => {
            const reverseStr = reverse.value ? '\n    reverseY' : ''
            return hljs.highlight(`<StickyScroll\n    scroll="y"${reverseStr}\n>`, {
                language: 'xml',
            })
        })
        const toggle = () => {
            reverse.value = !reverse.value
        }
        return { highlightCode, toggle, reverse }
    },
})
</script>

<template lang="pug">
Item.item(title="垂直滚动")
    .sticky_scroll
        StickyScroll(scroll="y", :reverseY="reverse")
            ul
                li(v-for="i in 30", :key="i") {{i}}
    template(v-slot:code)
        pre(v-html="highlightCode.value" )
        button.btn(@click="toggle") 切换滚动条位置
</template>

<style lang="scss" scoped>
.item {
    .sticky_scroll {
    }
    ul {
        height: 100%;
    }
    li {
        width: 100%;
        padding: 15px;
    }
}
</style>
