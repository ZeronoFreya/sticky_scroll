<script>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

import useScrollbar from './use_scrollbar'
import useOverscroll from './use_overscroll'

export default {
    components: {},
    props: {
        scroll: {
            // 滚动方式
            type: String,
            default: 'xy', // x, y, xy
        },
        radius: {
            // 滚动节点圆角,
            type: String,
            default: '0px',
        },
        dark: {
            // 暗色
            type: Boolean,
            default: true,
        },
        out: {
            // 滚动条偏移到框架外部
            type: Boolean,
            default: true,
        },
        reverseX: {
            // 水平滚动条的位置设置在顶部
            type: Boolean,
            default: false,
        },
        reverseY: {
            // 垂直滚动条的位置设置在左侧
            type: Boolean,
            default: false,
        },
        offsetX: {
            // 上下调整水平滚动条的位置
            type: String,
            default: '0px',
        },
        offsetY: {
            // 左右调整垂直滚动条的位置
            type: String,
            default: '0px',
        },
        customScrollBar: {
            // 自定义滚动条
            type: Boolean,
            default: false,
        },
        overscrollX: {
            // 显示水平过界
            type: Boolean,
            default: true,
        },
        overscrollY: {
            // 显示垂直过界
            type: Boolean,
            default: true,
        },
        loadThreshold: {
            // 加载阈值, 0代表不使用触底加载
            type: Number,
            default: 0,
        },
    },
    setup(props, { emit, expose }) {
        const refEl = {
            scroll_box: null,
            sticky_anchor: null,
            scroll_content: null,
            spacer_x: null,
            spacer_y: null,
            scrollbar: {
                scroll_x: null,
                scroll_y: null,
                track_x: null,
                track_y: null,
                thumb_x: null,
                thumb_y: null,
            },
            overscroll: {
                before_x: null,
                after_x: null,
                before_y: null,
                after_y: null,
                load_x: null,
                load_y: null,
            },
        }
        const setRef = (path) => (el) => {
            const keys = path.split('.')
            let obj = refEl
            for (let i = 0; i < keys.length - 1; i++) {
                obj = obj[keys[i]]
            }
            obj[keys[keys.length - 1]] = el
        }

        const loading = ref(false)

        const controller = new AbortController()
        const { signal } = controller

        const scrollCfg = computed(() => {
            const hasX = props.scroll.includes('x')
            const hasY = props.scroll.includes('y')

            const styleX = {}
            if (hasX) {
                const key = props.reverseX ? 'top' : 'bottom'
                styleX[key] = props.offsetX
                if (props.out) {
                    styleX.transform = `translateY(${props.reverseX ? '-100' : '100'}%)`
                }
            }

            const styleY = {}
            if (hasY) {
                const key = props.reverseY ? 'left' : 'right'
                styleY[key] = props.offsetY
                if (props.out) {
                    styleY.transform = `translateX(${props.reverseY ? '-100' : '100'}%)`
                }
            }

            return {
                showX: hasX,
                showY: hasY,
                styleX: hasX ? styleX : null,
                styleY: hasY ? styleY : null,
            }
        })

        const overscrollStateX = ref(false)
        const overscrollStateY = ref(false)
        const noMoreX = ref(false)
        const noMoreY = ref(false)

        const scrollStateX = ref(false)
        const scrollStateY = ref(false)

        const animeId = {
            resize: null,
            transform: null,
        }

        const refElTransform = () => {
            if (animeId.transform != null) {
                cancelAnimationFrame(animeId.transform)
            }
            animeId.transform = requestAnimationFrame(() => {
                const { scrollLeft, scrollTop } = refEl.scroll_box
                const translateX = scrollLeft + scrollDelta.x
                const translateY = scrollTop + scrollDelta.y

                refEl.scroll_content.style.transform = `translate3d(${translateX * -1}px, ${translateY * -1}px, 0)`

                if (refEl.overscroll.before_x) {
                    overscrollStateX.value = scrollDelta.x == 0 ? false : true
                    refEl.overscroll.before_x.style.transform = `translate3d(-100%, ${translateY}px, 0)`
                    refEl.overscroll.after_x.style.transform = `translate3d(100%, ${translateY}px, 0)`
                }
                if (refEl.overscroll.before_y) {
                    overscrollStateY.value = scrollDelta.y == 0 ? false : true
                    refEl.overscroll.before_y.style.transform = `translate3d(${translateX}px, -100%, 0)`
                    if (refEl.overscroll.after_y) {
                        refEl.overscroll.after_y.style.transform = `translate3d(${translateX}px, 100%, 0)`
                    }
                }
                if (refEl.overscroll.load_y) {
                    refEl.overscroll.load_y.style.transform = `translate3d(${translateX}px, 100%, 0)`
                }
            })
        }

        const { updateTime, mouseenter, mouseleave, scrollDelta, overX, overY, loadX, loadY } =
            useOverscroll(refEl, refElTransform, props.loadThreshold > 0)
        const { track_down, scroll_to, scroll_end } = useScrollbar(
            refEl,
            signal,
            scrollDelta,
            updateTime,
            refElTransform,
        )

        const _resize = () => {
            const { offsetWidth: scrollWidth, offsetHeight: scrollHeight } = refEl.scroll_content
            if (refEl.spacer_x) {
                refEl.spacer_x.style.width = scrollWidth + 'px'
            }
            if (refEl.spacer_y) {
                refEl.spacer_y.style.height = scrollHeight + 'px'
            }
            // const scrollWidth = offsetWidth
            // const scrollHeight = offsetHeight

            const { scrollLeft, scrollTop, offsetWidth, offsetHeight } = refEl.scroll_box

            scrollStateX.value =
                refEl.scrollbar.scroll_x && scrollWidth <= offsetWidth ? true : false

            scrollStateY.value =
                refEl.scrollbar.scroll_y && scrollHeight <= offsetHeight ? true : false

            if (props.customScrollBar) {
                emit('scroll_resize', {
                    offsetWidth,
                    offsetHeight,
                    scrollWidth,
                    scrollHeight,
                })
            } else {
                if (refEl.scrollbar.thumb_x) {
                    const width =
                        scrollWidth > 0
                            ? (refEl.scrollbar.track_x.offsetWidth * offsetWidth) / scrollWidth
                            : 0
                    refEl.scrollbar.thumb_x.style.width = width + 'px'

                    const translateX =
                        scrollWidth > 0
                            ? (refEl.scrollbar.track_x.offsetWidth * scrollLeft) / scrollWidth
                            : 0
                    refEl.scrollbar.thumb_x.style.transform = `translate3d(${translateX}px, 0, 0)`
                }
                if (refEl.scrollbar.thumb_y) {
                    const height =
                        scrollHeight > 0
                            ? (refEl.scrollbar.track_y.offsetHeight * offsetHeight) / scrollHeight
                            : 0
                    refEl.scrollbar.thumb_y.style.height = height + 'px'

                    const translateY =
                        scrollHeight > 0
                            ? (refEl.scrollbar.track_y.offsetHeight * scrollTop) / scrollHeight
                            : 0
                    refEl.scrollbar.thumb_y.style.transform = `translate3d(0, ${translateY}px, 0)`
                }
            }

            if (refEl.overscroll.before_x) {
                refEl.overscroll.before_x.style.height = offsetHeight + 'px'
                refEl.overscroll.after_x.style.height = offsetHeight + 'px'
            }
            if (refEl.overscroll.before_y) {
                refEl.overscroll.before_y.style.width = offsetWidth + 'px'

                if (refEl.overscroll.after_y) {
                    refEl.overscroll.after_y.style.width = offsetWidth + 'px'
                }
            }
            if (refEl.overscroll.load_y) {
                refEl.overscroll.load_y.style.width = offsetWidth + 'px'
            }

            loading.value = false
        }

        watch(
            () => props.scroll,
            () => {
                _resize()
            },
            { flush: 'post' },
        )

        const sizeObserver = new ResizeObserver((entries) => {
            if (animeId.resize) {
                cancelAnimationFrame(animeId.resize)
            }
            animeId.resize = requestAnimationFrame(() => _resize())
        })

        const scrollX = (event, MaxScrollLeft) => {
            if (MaxScrollLeft < 0) {
                event.preventDefault()
                scrollDelta.x = 0
                return true
            }
            const scrollLeft = refEl.scroll_box.scrollLeft
            // scrollWidth - offsetWidth 与 scrollLeft, 莫名奇妙有1px的误差
            // scrollSize 由于历史原因并不可信, 此处的 scrollWidth 是内部 div 的offsetWidth
            const scrollRemaining = Math.abs(MaxScrollLeft - scrollLeft)
            if (scrollLeft > 0 && scrollRemaining > 1) {
                scrollDelta.x = 0
                if (props.loadThreshold > 0 && scrollRemaining < props.loadThreshold) {
                    // 滚动距离小于100, 加载更多
                    emit('loadmore', 'x')
                }
                return true
            }
            overX(event, scrollLeft)
            return false
        }

        const scrollY = (event, MaxScrollTop) => {
            if (MaxScrollTop < 0) {
                event.preventDefault()
                scrollDelta.y = 0
                return true
            }
            const scrollTop = refEl.scroll_box.scrollTop
            // 还没到顶部也还没到底部：正常滚动，直接返回
            const scrollRemaining = Math.abs(MaxScrollTop - scrollTop)
            // console.log(scrollTop, scrollRemaining)

            if (scrollTop > 0 && scrollRemaining > 1) {
                if (props.loadThreshold > 0 && scrollRemaining < props.loadThreshold) {
                    // 滚动距离小于100, 加载更多
                    if (!loading.value) {
                        loading.value = true
                        console.log(3333333333333)
                        emit('loadmore', 'y')
                    }
                    return true
                }
                scrollDelta.y = 0
                return true
            }
            // if (scrollTop > 0) {
            //     if (
            //         scrollRemaining > 1 &&
            //         props.loadThreshold > 0 &&
            //         scrollRemaining < props.loadThreshold
            //     ) {
            //         // 滚动距离小于100, 加载更多
            //         if (!loading.value) {
            //             loading.value = true
            //             console.log(3333333333333)
            //             emit('loadmore', 'y')
            //         }
            //         return true
            //     }
            //     if (scrollRemaining > 1) {
            //         scrollDelta.y = 0
            //         return true
            //     }
            // }
            if (props.loadThreshold > 0 && scrollTop > props.loadThreshold) {
                // emit('loadmore', 'y')
                loadY(event)
            } else {
                overY(event, scrollTop)
            }

            return false
        }

        const mousewheel = (e) => {
            // event.deltaY < 0   // 滚动条上｜左, 内容下｜右
            // event.deltaY > 0   // 滚动条下｜右, 内容上｜左
            const { offsetWidth, offsetHeight } = refEl.scroll_box
            const { offsetWidth: scrollWidth, offsetHeight: scrollHeight } = refEl.scroll_content

            if (props.scroll == 'x') {
                e.preventDefault()
                const delta = e.deltaY || e.deltaX
                refEl.scroll_box.scrollLeft += delta
                if (scrollX(e, scrollWidth - offsetWidth)) return
            } else if (props.scroll == 'y') {
                if (scrollY(e, scrollHeight - offsetHeight)) return
            } else {
                if (e.shiftKey) {
                    if (scrollX(e, scrollWidth - offsetWidth)) return
                } else {
                    if (scrollY(e, scrollHeight - offsetHeight)) return
                }
            }

            refElTransform()
        }

        const mousescroll = (e) => {
            const { scrollLeft, scrollTop } = refEl.scroll_box
            const { offsetWidth: scrollWidth, offsetHeight: scrollHeight } = refEl.scroll_content
            if (props.customScrollBar) {
                emit('scroll_move', { scrollLeft, scrollTop, scrollWidth, scrollHeight })
            } else {
                if (refEl.scrollbar.thumb_x) {
                    const translateX =
                        scrollWidth > 0
                            ? (refEl.scrollbar.track_x.offsetWidth * scrollLeft) / scrollWidth
                            : 0
                    refEl.scrollbar.thumb_x.style.transform = `translate3d(${translateX}px, 0, 0)`
                }
                if (refEl.scrollbar.thumb_y) {
                    const translateY =
                        scrollHeight > 0
                            ? (refEl.scrollbar.track_y.offsetHeight * scrollTop) / scrollHeight
                            : 0
                    refEl.scrollbar.thumb_y.style.transform = `translate3d(0, ${translateY}px, 0)`
                }
            }

            refElTransform()
        }

        // 生命周期
        onMounted(() => {
            sizeObserver.observe(refEl.scroll_box, {
                box: 'border-box', // 确保 CSS 计算尺寸时包括边框和内边距
            })
            sizeObserver.observe(refEl.scroll_content, {
                box: 'border-box', // 确保 CSS 计算尺寸时包括边框和内边距
            })
            refEl.scroll_box.addEventListener('wheel', mousewheel, { signal, passive: false })

            if (props.scroll == 'x') {
                // 水平滚动
                refEl.sticky_anchor.style.width = '0px'
                refEl.sticky_anchor.style.height = '100%'

                const validChildren = Array.from(refEl.scroll_content.childNodes).filter((node) => {
                    if (node.nodeType === Node.COMMENT_NODE) return false
                    if (node.nodeType === Node.TEXT_NODE) return false
                    if (node.nodeType === Node.ELEMENT_NODE && node.dataset.scroll) return false
                    return true
                })
                if (validChildren.length === 1) {
                    validChildren[0].style.display = 'flex'
                } else {
                    refEl.scroll_content.style.display = 'flex'
                }
            } else {
                if (props.scroll == 'y') {
                    refEl.scroll_content.style.width = '100%'
                }
                refEl.sticky_anchor.style.width = '100%'
                refEl.sticky_anchor.style.height = '0px'
            }

            // refEl.scroll_box.style.overflowX = showX.value ? 'auto' : 'hidden'

            // refEl.scroll_box.style.overflowY = showY.value ? 'auto' : 'hidden'
        })
        // onUpdated(() => {
        //     // nextTick(handleSlot)
        // })
        onBeforeUnmount(() => {
            controller.abort()

            if (sizeObserver) {
                sizeObserver.unobserve(refEl.scroll_content)
                sizeObserver.unobserve(refEl.scroll_box)
                sizeObserver.disconnect()
            }
        })

        expose({
            scrollTo: scroll_to,
            scrollEnd: scroll_end,
        })

        return {
            refEl,
            setRef,
            scrollCfg,
            track_down,
            mousewheel,
            mousescroll,
            mouseenter,
            mouseleave,
            overscrollStateX,
            overscrollStateY,
            scrollStateX,
            scrollStateY,
            noMoreX,
            noMoreY,
        }
    },
}
</script>

<template lang="pug" src="./html.pug" />
<style lang="scss" src="./style.scss" />
