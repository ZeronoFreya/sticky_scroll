<script>
import { defineComponent, ref, computed } from 'vue'
import hljs from 'highlight.js'
import Item from './item.vue'

export default defineComponent({
    components: { Item },
    setup() {
        const myTip = ref(false)
        const highlightCode = computed(() => {
            const tip = `\n    <template v-slot:before_y>\n        <div> 上\n    <template v-slot:after_x>\n        <div> 右`
            return hljs.highlight(
                `<StickyScroll\n    overscrollX\n    overscrollY\n>${myTip.value ? tip : ''}`,
                {
                    language: 'xml',
                },
            )
        })

        const toggle = () => {
            myTip.value = !myTip.value
        }
        return { highlightCode, toggle, myTip }
    },
})
</script>

<template lang="pug">
Item.item(title="过界提示")
    .sticky_scroll
        StickyScroll(:overscrollX="true", :overscrollY="true")
            ul
                li(v-for="i in 30", :key="i")
                    .content
                        .start {{i}}
                        .end end {{i}}
            template(v-if="myTip", v-slot:before_y)
                .before_y 上
            template(v-if="myTip", v-slot:after_x)
                .after_x 右
    template(v-slot:code)
        pre(v-html="highlightCode.value" )
        p 滚动到边缘后显示提示
        button.btn(@click="toggle") 切换自定义提示
        .pos_eg(v-if="myTip")
            .top before_y
            .right after_x
            .bottom after_y
            .left before_x
</template>

<style lang="scss" scoped>
.item {
    .after_x {
        width: 100px;
        height: 80%;
        background-color: #202020;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .before_y {
        width: 80%;
        height: 100px;
        background-color: #202020;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .pos_eg {
        width: 240px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 20px);
        gap: 10px;
        grid-template-areas:
            'pos1 pos2 pos3'
            'pos4 pos5 pos6'
            'pos7 pos8 pos9';
        .top {
            grid-area: pos2;
        }
        .right {
            grid-area: pos6;
        }
        .bottom {
            grid-area: pos8;
        }
        .left {
            grid-area: pos4;
        }
    }
}
</style>
