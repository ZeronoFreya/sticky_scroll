<script>
import { defineComponent, ref } from 'vue'
import hljs from 'highlight.js'
import Item from './item.vue'

export default defineComponent({
    components: { Item },
    setup() {
        const highlightCode = hljs.highlight(
            `<div> <!--绿色outline-->\n    <StickyScroll>\n        <ul>\n            <li v-for>\n        </ul>\n    </StickyScroll>\n</div>`,
            {
                language: 'xml',
            },
        )
        return { highlightCode }
    },
})
</script>

<template lang="pug">
Item.item(title="最简状态（默认）")
    .sticky_scroll
        StickyScroll
            ul
                li(v-for="i in 30", :key="i")
                    .content
                        .start {{i}}
                        .end end {{i}}
    template(v-slot:code)
        pre(v-html="highlightCode.value" )
        p 可以不用ul等节点包裹, 但加入父级元素便于编写样式
</template>

<style lang="scss" scoped>
.item {
}
</style>
