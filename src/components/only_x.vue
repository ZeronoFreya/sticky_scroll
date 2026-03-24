<script>
import { defineComponent, ref, computed } from 'vue'
import hljs from 'highlight.js'
import Item from './item.vue'

export default defineComponent({
    components: { Item },
    setup() {
        const reverse = ref(false)
        const autoH = ref(true)
        const highlightCode = computed(() => {
            const reverseStr = reverse.value ? '\n    reverseX' : ''
            return hljs.highlight(
                `<StickyScroll\n    scroll="x"\n    :autoH="${autoH.value}"${reverseStr}\n>`,
                {
                    language: 'xml',
                },
            )
        })
        return { highlightCode, reverse, autoH }
    },
})
</script>

<template lang="pug">
Item.item(title="水平滚动")
    .sticky_scroll
        StickyScroll(scroll="x", :reverseX="reverse", :autoH="autoH")
            ul
                li(v-for="i in 30", :key="i") {{i}}
    template(v-slot:code)
        pre(v-html="highlightCode.value" )
        p autoH 为 true 可以自动占满高度，否则
        p 内部列表需要设置一个合适的宽高
        p 无法动态修改，暂时解决不了
        button.btn(@click="reverse = !reverse") 切换滚动条位置

</template>

<style lang="scss" scoped>
.item {
    .btn_group {
        display: flex;
        gap: 30px;
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
