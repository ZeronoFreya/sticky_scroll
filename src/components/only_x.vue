<script>
import { defineComponent, ref, computed } from 'vue'
import hljs from 'highlight.js'
import Item from './item.vue'

export default defineComponent({
    components: { Item },
    setup() {
        const reverse = ref(false)
        const highlightCode = computed(() => {
            const reverseStr = reverse.value ? '\n    reverseX' : ''
            return hljs.highlight(`<StickyScroll\n    scroll="x"${reverseStr}\n>`, {
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
Item.item(title="水平滚动")
    .sticky_scroll
        StickyScroll(scroll="x", :reverseX="reverse")
            ul
                li(v-for="i in 30", :key="i") {{i}}
    template(v-slot:code)
        pre(v-html="highlightCode.value" )
        p 内部列表需要设置一个合适的宽高
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
        width: 100px;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
