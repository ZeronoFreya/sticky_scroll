<script>
import { ref, onMounted } from 'vue'
import StickyScroll from './sticky_scroll/index.vue'

export default {
    components: { StickyScroll },
    // props: {
    //     data: {
    //         type: Object,
    //         required: true,
    //     },
    // },
    setup() {
        const liData = ref([...Array(35).keys()])

        const ssEl = ref(null)
        const trackY = ref(null)
        const thumbY = ref(null)

        let math_temp = 0
        let thumb_mouse_offset = 0

        const track_move = (e) => {
            let offset = e.offsetY - thumb_mouse_offset
            let val = Math.round(offset * math_temp)
            ssEl.value.scrollTo('y', val)
        }

        const track_up = (e) => {
            const track = e.currentTarget
            track.removeEventListener('pointermove', track_move)
            track.removeEventListener('pointerup', track_up)

            ssEl.value.scrollEnd()
        }

        const track_down = (e) => {
            const track = e.currentTarget

            track.addEventListener('pointerup', track_up)
            track.addEventListener('pointermove', track_move)
            track.setPointerCapture(e.pointerId)

            let offset = e.offsetY

            if (e.target === thumbY.value) {
                // 拖拽 thumb: 使用点击的位置
                thumb_mouse_offset = offset
            } else {
                // 在 track 拖拽: 使用 thumb 的中心
                thumb_mouse_offset = thumbY.value.offsetHeight / 2
                offset -= thumb_mouse_offset
                const val = Math.round(offset * math_temp)

                ssEl.value.scrollTo('y', val)
            }
        }

        const scrollMove = ({ scrollLeft, scrollTop, scrollWidth, scrollHeight }) => {
            const translateY =
                scrollHeight > 0 ? (trackY.value.offsetHeight * scrollTop) / scrollHeight : 0
            thumbY.value.style.transform = `translate3d(0, ${translateY}px, 0)`
        }

        const scrollResize = ({ offsetWidth, offsetHeight, scrollWidth, scrollHeight }) => {
            const height =
                scrollHeight > 0 ? (trackY.value.offsetHeight * offsetHeight) / scrollHeight : 0
            thumbY.value.style.height = height + 'px'

            math_temp = scrollHeight / trackY.value.offsetHeight
        }

        onMounted(() => {})

        return { liData, ssEl, trackY, thumbY, track_down, scrollMove, scrollResize }
    },
}
</script>

<template lang="pug">
.box
    h1 水平滚动
    .flex
        .left
            h2.mb10 下滚动条
            .scroll_x.pd5.x
                StickyScroll(scroll="x", radius="12px")
                    .xxxx
                        li(v-for="i in liData", :key="i")
                            .content {{i}}
        .right
            h2.mb10 上滚动条
            .scroll_x.pd5.reverse_x
                StickyScroll(scroll="x", radius="12px", reverseX)
                    .xxxx
                        li(v-for="i in liData", :key="i")
                            .content {{i}}
    h1 垂直滚动
    .flex
        .left
            h2.mb10 右滚动条    
            .scroll_y.pd5.y
                StickyScroll(scroll="y", radius="12px")
                    .yyyy
                        li(v-for="i in liData", :key="i")
                            .content {{i}}
        .right
            h2.mb10 左滚动条  
            .scroll_y.pd5.reverse_y
                StickyScroll(scroll="y", radius="12px", reverseY)
                    .yyyy
                        li(v-for="i in liData", :key="i")
                            .content {{i}}
    h1 水平垂直滚动
    .flex
        .left
            h2.mb10 右下滚动条    
            .scroll_xy.pd5.x.y
                StickyScroll(scroll="xy", radius="12px")
                    .xyxy
                        li(v-for="i in liData", :key="i")
                            .content
                                .start {{i}}
                                .end end {{i}}
        .right
            h2.mb10 左上滚动条  
            .scroll_xy.pd5.reverse_x.reverse_y
                StickyScroll(scroll="xy", radius="12px", reverseX, reverseY)
                    .xyxy
                        li(v-for="i in liData", :key="i")
                            .content
                                .start {{i}}
                                .end end {{i}}
    
    .flex
        .left
            h1 自定义滚动条
            .custom_scroll_bar
                .sticky_scroll_bar
                    .track_y(ref="trackY", data-scroll="y", @pointerdown.stop="track_down")
                        .thumb_y(ref="thumbY")
                .scroll_xy.pd5(style="width: 0; flex: 1;")
                    StickyScroll(ref="ssEl", scroll="xy", radius="12px", customScrollBar, @scroll_move="scrollMove", @scroll_resize="scrollResize")
                        .xyxy
                            li(v-for="i in liData", :key="i")
                                .content 
                                    .start {{i}}
                                    .end end {{i}}
        .right
            h1 自定义过界提示
            .scroll_xy.pd5.x.y
                StickyScroll(scroll="xy", radius="12px")
                    .xyxy
                        li(v-for="i in liData", :key="i")
                            .content
                                .start {{i}}
                                .end end {{i}}
                    template(v-slot:before_x)
                        .before_x before_x
                    template(v-slot:after_x)
                        .after_x after_x
                    template(v-slot:before_y)
                        .before_y before_y
                    template(v-slot:after_y)
                        .after_y after_y
</template>

<style lang="scss">
.mb10 {
    margin-bottom: 10px;
}
.flex {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 30px;
    width: 100%;
}
.left,
.right {
    flex: 1;
    width: 0;
    display: flex;
    flex-direction: column;
}
.center {
    width: 60%;
    height: 100%;
    margin: 0 auto;
}
li {
    list-style: none;
    color: #202020;

    // background-color: #fff;
    .content {
        background: greenyellow;
        border-radius: 6px;
        height: 30px;
        line-height: 30px;
        padding: 0 15px;
    }
}
.box {
    width: 80%;
    padding: 30px;
}

.scroll_x {
    width: 100%;
    background: goldenrod;
    margin-bottom: 15px;
    border-radius: 12px;
    li {
        width: 100px;
        padding: 0 5px;
    }
}
.r12 {
    border-radius: 12px;
}
.pd5 {
    padding: 5px;
}
.x {
    padding-bottom: 15px;
}
.reverse_x {
    padding-top: 15px;
}

.track_view {
    background: white;
}
.thumb_view {
    background: white;
}
.scroll_y {
    width: 100%;
    height: 50vh;
    background: goldenrod;
    margin-bottom: 15px;
    border-radius: 12px;
    li {
        padding: 5px 0;
    }
}
.y {
    padding-right: 15px;
}
.reverse_y {
    padding-left: 15px;
}

.scroll_xy {
    height: 50vh;
    background: goldenrod;
    margin-bottom: 15px;
    border-radius: 12px;
    // padding: 5px;
    .xyxy {
        width: 100vw;
    }
    li {
        padding: 5px 0;
        .content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }
}
.custom_scroll_bar {
    position: relative;
    display: flex;
    gap: 30px;
    // justify-content: center;
    // align-items: center;
    .sticky_scroll_bar {
        // position: absolute;
        // top: 0;
        // left: 30px;
        width: 60px;
        height: 300px;
        background-color: goldenrod;
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
.before_x,
.after_x {
    width: 100px;
    height: 80%;
    background-color: #202020;
}
.before_y,
.after_y {
    width: 80%;
    height: 100px;
    background-color: #202020;
}
</style>
