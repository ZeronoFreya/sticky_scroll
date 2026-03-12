<script>
import { defineComponent, ref, computed } from 'vue'
import hljs from 'highlight.js'
import Item from './item.vue'

export default defineComponent({
    components: { Item },
    setup() {
        const theme = ref('')
        const out = ref(true)
        const highlightCode = computed(() => {
            const _theme = theme.value ? `\n    theme="${theme.value}"` : ''
            const html = hljs.highlight(
                `<StickyScroll\n    :out="${out.value}"\n    radius="60px"${_theme}\n>`,
                {
                    language: 'xml',
                },
            )
            const css = theme.value
                ? hljs.highlight(
                      `\n.ss_gold {\n    --hover_bg: gold;\n    --thumb_bg: goldenrod;\n    --track_bg: goldenrod;\n}`,
                      {
                          language: 'css',
                      },
                  )
                : ref('')
            return html.value + css.value
        })

        const toggle = () => {
            theme.value = theme.value ? '' : 'gold'
        }

        return { highlightCode, toggle, theme, out }
    },
})
</script>

<template lang="pug">
Item.item(title="主题与样式")
    .sticky_scroll
        StickyScroll(radius="60px", :theme="theme", :out="out")
            ul
                li(v-for="i in 30", :key="i")
                    .content
                        .start {{i}}
                        .end end {{i}}
    template(v-slot:code)
        pre(v-html="highlightCode" )
        p offsetX 与 offsetY 也能实现 out 的效果但方式不同
        p offset 直接修改定位, out 是 translate
        .btn_group
            button.btn(@click="toggle") 切换主题
            button.btn(@click="out = !out") 切换滚动条位置
</template>

<style lang="scss" scoped>
.item {
    .sticky_scroll.light {
        // background: #3b3e3d;
        // background: #f0f0f0;
    }
    .btn_group {
        display: flex;
        gap: 30px;
    }
    .ss_gold {
        --hover_bg: gold;
        --thumb_bg: goldenrod;
        --track_bg: goldenrod;
    }
}
</style>
