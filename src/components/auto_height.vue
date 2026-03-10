<script>
import { defineComponent, ref } from 'vue'
import hljs from 'highlight.js'
import Item from './item.vue'

export default defineComponent({
    components: { Item },
    setup() {
        const count = ref(3)
        const add = () => {
            count.value += 1
        }
        const del = () => {
            let c = count.value - 1
            count.value = Math.max(c, 1)
        }
        const highlightCode = hljs.highlight(
            `<StickyScroll \n    :autoH="true" \n    maxH="200px"\n>`,
            {
                language: 'xml',
            },
        )

        return {
            count,
            add,
            del,
            highlightCode,
        }
    },
})
</script>

<template lang="pug">
Item.item(title="自适应高度")
    .sticky_scroll
        StickyScroll(:autoH="true", maxH="200px")
            ul
                li(v-for="i in count", :key="i")
                    .content
                        .start {{i}}
                        .end end {{i}}
    template(v-slot:code)
        pre(v-html="highlightCode.value" )
        p 建议设置 maxH, 默认100%
        .btn_box
            button.btn(@click="del") 删除
            button.btn(@click="add") 添加
</template>

<style lang="scss" scoped>
.item {
    height: fit-content;
    .btn_box {
        margin-top: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 30px;
        .btn {
            width: 100px;
        }
    }
}
</style>
