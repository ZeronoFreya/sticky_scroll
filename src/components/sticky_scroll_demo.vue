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
        const liData = ref([...Array(30).keys()])

        const ul = ref(null)
        const ulp = ref(null)
        const py = ref(null)
        const sbox = ref(null)
        const scroll = ({ currentTarget }) => {
            const { scrollLeft, scrollTop, scrollHeight, scrollWidth } = currentTarget

            ul.value.style.transform = `translate3d(${-scrollLeft}px, ${-scrollTop}px, 0)`
        }

        const options = {
            box: 'border-box', // 确保 CSS 计算尺寸时包括边框和内边距
        }
        let animationFrameId = null
        const observer = new ResizeObserver((entries) => {
            cancelAnimationFrame(animationFrameId)
            animationFrameId = requestAnimationFrame(() => {
                const { offsetWidth, offsetHeight } = ul.value
                py.value.style.height = offsetHeight + 'px'
                const computedStyle = window.getComputedStyle(sbox.value)
                const PB = parseInt(computedStyle.paddingBottom)
                const PT = parseInt(computedStyle.paddingTop)
                ulp.value.style.height = sbox.value.offsetHeight - PB - PT + 'px'
            })
        })
        const tky = ref(null)
        const tmy = ref(null)
        const move = (scrollLeft, scrollTop, scrollWidth, scrollHeight) => {
            tmy.value.style.transform = `translateY(${(tky.value.offsetHeight * scrollTop) / scrollHeight}px)`
        }

        const resize = (offsetWidth, offsetHeight, scrollWidth, scrollHeight) => {
            tmy.value.style.height = (tky.value.offsetHeight * offsetHeight) / scrollHeight + 'px'
        }

        onMounted(() => {
            observer.observe(ul.value, options)
        })

        return { liData, sbox, ul, ulp, py, scroll, move, tky, tmy, resize }
    },
}
</script>

<template lang="pug">
.box
    //- .top
    //-     div.x(v-scroll="{scroll:'x'}")
    //-         li(v-for="i in liData", :key="i") {{i}}
    .hhh
        .left
            //- div.y(v-scroll="{scroll:'xy', customScrollBar: {move, resize}  }")
            //-     li(v-for="i in liData", :key="i") {{i}}cccccccccccccccccccccccccdddddddddddddddddddddddddd
            //- .scrolly
            //-     .tracky(ref="tky")
            //-         .thumby(ref="tmy")
            //-             .thumbviewy
        .right
            div.xy(v-scroll="{scroll:'xy'}")
                li(v-for="i in liData", :key="i") {{i}}aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbc
    .ddd
        .ul-box
            .scroll-box.sticky_hide_default_scrollbar(ref="sbox", @scroll="scroll")
                .sticky
                    .ul-p(ref="ulp")
                        .ul(ref="ul")
                            li(v-for="i in liData", :key="i") {{i}}
                .py(ref="py")
            .scrolly
                .tracky
                    .thumby
                        .thumbviewy
</template>

<style lang="scss">
.box {
    width: 100vw;
    height: 100vh;
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 30px;
    // justify-content: center;
    // align-items: center;
    overflow: auto;
    padding: 50px;
    background: #f0f0f0;

    .ddd {
        display: none;
    }

    .overscroll_sticky_before_x,
    .overscroll_sticky_after_x {
        width: 100%;
        height: 100px;
        background: red;
    }
    .overscroll_sticky_before_y,
    .overscroll_sticky_after_y {
        width: 100px;
        height: 100%;
        background: red;
    }

    .ul-box {
        border-radius: 30px;
        max-height: 50vh;
        height: 100%; // 必须明确的设置高度, 如果是百分比, 必须设置max-height且必须是单位数值
        // background: goldenrod;
        // padding: 10px;
        position: relative;
        // overflow: auto;
        .scroll-box {
            overflow-y: auto;
            width: 100%;
            height: 100%;
            position: relative;
            padding: 10px;
            border-radius: 12px;
            background: gold;
        }
        .sticky {
            position: sticky;
            width: 100%;
            height: 0;
            top: 0;
        }
        .ul-p {
            position: relative;
            border-radius: 8px;
            overflow: hidden;
        }

        .ul {
            width: 100%;
            min-width: 300px;

            position: absolute;
            top: 0;
            left: 0;
            transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .py {
            width: 0;
        }
        .scrolly {
            position: absolute;
            right: -20px;
            top: 0;
            width: 16px;
            height: 100%;
            background: red;
            padding: 15px 0;
            .tracky {
                width: 100%;
                height: 100%;
                background: white;
            }
            .thumby {
                width: 100%;
                height: 100px;
                background: green;
            }
            .thumbviewy {
            }
        }
    }

    .top {
        height: 100px;
        // background: #353535;
    }

    .hhh {
        width: 100%;
        // display: none;
        display: flex;
        // justify-content: center;
        align-items: center;
        gap: 30px;
    }

    .x,
    .y,
    .xy {
        width: 100%;
        // background: #eee;
        // padding: 15px;
    }
    .x {
        height: 100px;
    }
    .y,
    .xy {
        // height: 60vh;
    }
    .xy {
        max-height: 50vh;
        height: 100%;
        background: gold;
        padding: 15px;
        border-radius: 12px;
        .scroll_box {
            border-radius: 12px;
        }
    }
    .y {
        // height: 100%;
        border-radius: 15px;
        background: goldenrod;
        // display: flex;
        // li {
        //     width: 100px;
        //     margin-bottom: 0;
        //     margin-right: 15px;
        //     overflow: hidden;
        // }
    }

    .left,
    .right {
        flex: 1;
        width: 40%;
        height: 100%;
    }
    .left {
        padding: 15px;
        background: gold;
        height: 100%;
        max-height: 50vh;
        position: relative;
        .scrolly {
            position: absolute;
            right: -20px;
            top: 0;
            width: 16px;
            height: 100%;
            background: red;
            padding: 15px 0;
            .tracky {
                width: 100%;
                height: 100%;
                background: white;
            }
            .thumby {
                width: 100%;
                height: 100px;
                background: green;
            }
            .thumbviewy {
            }
        }
    }

    li {
        font-size: 24px;
        padding: 15px;
        width: fit-content;
        background: olivedrab;
        width: 100%;
        border-radius: 12px;
        // word-break: break-all;
    }
    .x_mode {
        gap: 30px;
        li {
            width: 100px;
            // word-break: keep-all;
        }
    }
}
</style>
