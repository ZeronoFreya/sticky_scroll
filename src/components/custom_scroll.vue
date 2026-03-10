<script>
import { defineComponent, ref } from 'vue'
import hljs from 'highlight.js'
import Item from './item.vue'

export default defineComponent({
    components: { Item },
    setup() {
        const highlightCode = hljs.highlight(
            `<StickyScroll\n    customScrollBar\n    @scroll_move="scrollMove"\n    @scroll_resize="scrollResize"\n>`,
            {
                language: 'xml',
            },
        )

        const ssEl = ref(null)
        const trackX = ref(null)
        const thumbX = ref(null)
        const trackY = ref(null)
        const thumbY = ref(null)

        let math_temp_x = 0
        let math_temp_y = 0
        let thumb_mouse_offset_x = 0
        let thumb_mouse_offset_y = 0

        const track_move_x = (e) => {
            let offset = e.offsetX - thumb_mouse_offset_x
            let val = Math.round(offset * math_temp_x)
            ssEl.value.scrollX(val)
        }
        const track_move_y = (e) => {
            let offset = e.offsetY - thumb_mouse_offset_y
            let val = Math.round(offset * math_temp_y)
            ssEl.value.scrollY(val)
        }

        const track_up_x = (e) => {
            const track = e.currentTarget
            track.removeEventListener('pointermove', track_move_x)
            track.removeEventListener('pointerup', track_up_x)
        }

        const track_up_y = (e) => {
            const track = e.currentTarget
            track.removeEventListener('pointermove', track_move_y)
            track.removeEventListener('pointerup', track_up_y)
        }

        const track_down_x = (e) => {
            const track = e.currentTarget

            track.addEventListener('pointerup', track_up_x)
            track.addEventListener('pointermove', track_move_x)
            track.setPointerCapture(e.pointerId)

            let offset = e.offsetX

            if (e.target === thumbX.value) {
                // 拖拽 thumb: 使用点击的位置
                thumb_mouse_offset_x = offset
            } else {
                // 在 track 拖拽: 使用 thumb 的中心
                thumb_mouse_offset_x = thumbX.value.offsetWidth / 2
                offset -= thumb_mouse_offset_x
                const val = Math.round(offset * math_temp_x)

                ssEl.value.scrollX(val)
            }
        }

        const track_down_y = (e) => {
            const track = e.currentTarget

            track.addEventListener('pointerup', track_up_y)
            track.addEventListener('pointermove', track_move_y)
            track.setPointerCapture(e.pointerId)

            let offset = e.offsetY

            if (e.target === thumbY.value) {
                // 拖拽 thumb: 使用点击的位置
                thumb_mouse_offset_y = offset
            } else {
                // 在 track 拖拽: 使用 thumb 的中心
                thumb_mouse_offset_y = thumbY.value.offsetHeight / 2
                offset -= thumb_mouse_offset_y
                const val = Math.round(offset * math_temp_y)

                ssEl.value.scrollY(val)
            }
        }

        const scrollMove = ({ scrollLeft, scrollTop, scrollWidth, scrollHeight }) => {
            const translateX =
                scrollWidth > 0 ? (trackX.value.offsetWidth * scrollLeft) / scrollWidth : 0
            thumbX.value.style.transform = `translate3d(${translateX}px, 0, 0)`
            const translateY =
                scrollHeight > 0 ? (trackY.value.offsetHeight * scrollTop) / scrollHeight : 0
            thumbY.value.style.transform = `translate3d(0, ${translateY}px, 0)`
        }

        const scrollResize = ({ offsetWidth, offsetHeight, scrollWidth, scrollHeight }) => {
            const width =
                scrollWidth > 0 ? (trackX.value.offsetWidth * offsetWidth) / scrollWidth : 0
            thumbX.value.style.width = width + 'px'

            const height =
                scrollHeight > 0 ? (trackY.value.offsetHeight * offsetHeight) / scrollHeight : 0
            thumbY.value.style.height = height + 'px'

            math_temp_x = scrollWidth / trackX.value.offsetWidth
            math_temp_y = scrollHeight / trackY.value.offsetHeight
        }

        return {
            highlightCode,
            scrollMove,
            scrollResize,
            ssEl,
            trackX,
            thumbX,
            trackY,
            thumbY,
            track_down_x,
            track_down_y,
        }
    },
})
</script>

<template lang="pug">
Item.item(title="自定义滚动条")
    .sticky_scroll
        StickyScroll(ref="ssEl", customScrollBar, @scroll_move="scrollMove", @scroll_resize="scrollResize")
            ul
                li(v-for="i in 30", :key="i")
                    .content
                        .start {{i}}
                        .end end {{i}}
        .sticky_scroll_x
            .track_x(ref="trackX", data-scroll="x", @pointerdown.stop="track_down_x")
                .thumb_x(ref="thumbX")
        .sticky_scroll_y
            .track_y(ref="trackY", data-scroll="y", @pointerdown.stop="track_down_y")
                .thumb_y(ref="thumbY")
    template(v-slot:code)
        pre(v-html="highlightCode.value" )
        p 可以不用ul等节点包裹, 但加入父级元素便于编写样式
</template>

<style lang="scss" scoped>
.item {
    .sticky_scroll {
        position: relative;
    }
    .sticky_scroll_x {
        position: absolute;
        left: 0;
        bottom: -40px;
        width: 100%;
        height: 30px;
        background-color: #636363;
        padding: 5px;
        .track_x {
            width: 100%;
            height: 100%;
        }
        .thumb_x {
            width: 0px;
            height: 100%;
            background-color: #202020;
            transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1);
        }
    }
    .sticky_scroll_y {
        position: absolute;
        top: 0;
        right: -40px;
        width: 30px;
        height: 300px;
        background-color: #636363;
        padding: 5px;
        .track_y {
            width: 100%;
            height: 100%;
        }
        .thumb_y {
            width: 100%;
            height: 0px;
            background-color: #202020;
            transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1);
        }
    }
}
</style>
