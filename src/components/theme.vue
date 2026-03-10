<script>
import { defineComponent, ref, computed } from 'vue'
import hljs from 'highlight.js'
import Item from './item.vue'

export default defineComponent({
    components: { Item },
    setup() {
        const dark = ref(true)
        const highlightCode = computed(() => {
            return hljs.highlight(
                `<StickyScroll\n    radius="60px"\n    :dark="${dark.value}"\n>`,
                {
                    language: 'xml',
                },
            )
        })

        const toggle = () => {
            dark.value = !dark.value
        }

        return { highlightCode, toggle, dark }
    },
})
</script>

<template lang="pug">
Item.item(title="主题与样式")
    .sticky_scroll(:class="{light: !dark}")
        StickyScroll(radius="60px", :dark="dark")
            ul
                li(v-for="i in 30", :key="i")
                    .content
                        .start {{i}}
                        .end end {{i}}
    template(v-slot:code)
        pre(v-html="highlightCode.value" )
        p 可以不用ul等节点包裹, 但加入父级元素便于编写样式
        button.btn(@click="toggle") 切换明暗
</template>

<style lang="scss" scoped>
.item {
    .sticky_scroll.light {
        // background: #3b3e3d;
        background: #f0f0f0;
    }
}
</style>
