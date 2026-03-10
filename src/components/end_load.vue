<script>
import { defineComponent, ref, computed } from 'vue'
import hljs from 'highlight.js'
import Item from './item.vue'

export default defineComponent({
    components: { Item },
    setup() {
        const myTip = ref(false)
        const countdown = ref(5)
        const highlightCode = computed(() => {
            const tip = `\n    <template v-slot:load_y>\n        <div> 自定义加载提示`
            return hljs.highlight(
                `<StickyScroll\n    :loadThresholdY="200"\n    @loadmoreY="loadmoreY"\n>${myTip.value ? tip : ''}`,
                {
                    language: 'xml',
                },
            )
        })

        const loadmoreData = ref([])
        const getMore = () => {
            const start = loadmoreData.value.length
            const newData = Array.from({ length: 20 }, (_, i) => start + i)
            loadmoreData.value.push(...newData)
        }
        const loadmoreY = () => {
            countdown.value = 5
            const interval = setInterval(() => {
                if (countdown.value > 0) {
                    countdown.value--
                } else {
                    getMore()
                    clearInterval(interval)
                }
            }, 1000)
        }
        const toggle = () => {
            myTip.value = !myTip.value
        }
        getMore()
        return { highlightCode, loadmoreData, loadmoreY, toggle, myTip, countdown }
    },
})
</script>

<template lang="pug">
Item.item(title="触底加载")
    .sticky_scroll
        StickyScroll(:loadThresholdY="200", @loadmoreY="loadmoreY")
            ul
                li(v-for="i in loadmoreData", :key="i") {{i}}
            template(v-if="myTip", v-slot:load_y)
                .load_y 自定义加载提示 {{countdown}}s
    template(v-slot:code)
        pre(v-html="highlightCode.value" )
        p 距底部200px时触发loadmoreY事件
        p 同样的有loadThresholdX和loadmoreX事件
        button.btn(@click="toggle") 切换自定义提示
</template>

<style lang="scss" scoped>
.item {
    .sticky_scroll {
        height: 500px;
    }
    ul {
        height: 100%;
    }
    li {
        width: 100%;
        padding: 15px;
    }
    .load_y {
        width: 80%;
        height: 100px;
        background-color: #202020;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
</style>
