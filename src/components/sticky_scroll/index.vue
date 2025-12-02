<script>
import {
    ref,
    reactive,
    provide,
    computed,
    watch,
    nextTick,
    onMounted,
    onUpdated,
    onBeforeUnmount,
} from 'vue'

import useScrollbar from './use_scrollbar'
import useOverscroll from './use_overscroll'

// 辅助函数：检查纯对象（排除数组、null 等）
const isPlainObject = (val) => {
    return val && typeof val === 'object' && val.constructor === Object
}

export default {
    components: {},
    props: {
        scroll: {
            // 滚动方式
            type: String,
            default: 'xy', // x, y, xy
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
        // customScrollBar: {
        //     // 自定义滚动条
        //     type: Object,
        //     default: null,
        // },
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
    },
    setup(props) {
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

        const controller = new AbortController()
        const { signal } = controller

        const showX = computed(() => props.scroll.includes('x'))
        const showY = computed(() => props.scroll.includes('y'))

        const overscrollStateX = ref(false)
        const overscrollStateY = ref(false)

        const scrollStateX = ref(false)
        const scrollStateY = ref(false)

        const animeId = {
            resize: null,
            transform: null,
        }

        const defaultCSB = {
            move: () => {},
            resize: () => {},
        }

        // const CSB = isPlainObject(props.customScrollBar)
        //     ? { ...defaultCSB, ...props.customScrollBar }
        //     : Boolean(props.customScrollBar)
        //       ? defaultCSB
        //       : false
        const CSB = false

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
                    refEl.overscroll.after_y.style.transform = `translate3d(${translateX}px, 100%, 0)`
                }
            })
        }

        const { updateTime, mouseenter, mouseleave, scrollDelta, overX, overY } = useOverscroll(
            refEl,
            refElTransform,
        )
        const { track_down } = useScrollbar(refEl, signal, scrollDelta, updateTime, refElTransform)

        const _resize = () => {
            const { offsetWidth, offsetHeight } = refEl.scroll_content
            if (refEl.spacer_x) {
                refEl.spacer_x.style.width = offsetWidth + 'px'
            }
            if (refEl.spacer_y) {
                refEl.spacer_y.style.height = offsetHeight + 'px'
            }
            const scrollWidth = offsetWidth
            const scrollHeight = offsetHeight

            scrollStateX.value =
                refEl.scrollbar.scroll_x && scrollWidth <= refEl.scroll_box.offsetWidth
                    ? true
                    : false

            scrollStateY.value =
                refEl.scrollbar.scroll_y && scrollHeight <= refEl.scroll_box.offsetHeight
                    ? true
                    : false

            if (CSB) {
                CSB.resize(
                    refEl.scroll_box.offsetWidth,
                    refEl.scroll_box.offsetHeight,
                    scrollWidth,
                    scrollHeight,
                )
            } else {
                if (refEl.scrollbar.thumb_x) {
                    const x =
                        scrollWidth > 0
                            ? (refEl.scrollbar.track_x.offsetWidth * refEl.scroll_box.offsetWidth) /
                              scrollWidth
                            : 0
                    refEl.scrollbar.thumb_x.style.width = x + 'px'
                }
                if (refEl.scrollbar.thumb_y) {
                    const y =
                        scrollHeight > 0
                            ? (refEl.scrollbar.track_y.offsetHeight *
                                  refEl.scroll_box.offsetHeight) /
                              scrollHeight
                            : 0
                    refEl.scrollbar.thumb_y.style.height = y + 'px'
                }
            }

            if (refEl.overscroll.before_x) {
                refEl.overscroll.before_x.style.height = refEl.scroll_box.offsetHeight + 'px'
                refEl.overscroll.after_x.style.height = refEl.scroll_box.offsetHeight + 'px'
            }
            if (refEl.overscroll.before_y) {
                refEl.overscroll.before_y.style.width = refEl.scroll_box.offsetWidth + 'px'
                refEl.overscroll.after_y.style.width = refEl.scroll_box.offsetWidth + 'px'
            }
        }

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
            if (scrollLeft > 0 && scrollLeft < MaxScrollLeft) {
                scrollDelta.x = 0
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
            if (scrollTop > 0 && scrollTop < MaxScrollTop) {
                scrollDelta.y = 0
                return true
            }
            overY(event, scrollTop)
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
            if (CSB) {
                CSB.move(scrollLeft, scrollTop, scrollWidth, scrollHeight)
            } else {
                if (refEl.scrollbar.thumb_x) {
                    const x =
                        scrollWidth > 0
                            ? (refEl.scrollbar.track_x.offsetWidth * scrollLeft) / scrollWidth
                            : 0
                    refEl.scrollbar.thumb_x.style.transform = `translate3d(${x}px, 0, 0)`
                }
                if (refEl.scrollbar.thumb_y) {
                    const y =
                        scrollHeight > 0
                            ? (refEl.scrollbar.track_y.offsetHeight * scrollTop) / scrollHeight
                            : 0
                    refEl.scrollbar.thumb_y.style.transform = `translate3d(0, ${y}px, 0)`
                }
            }

            refElTransform()
        }

        // 生命周期
        onMounted(() => {
            sizeObserver.observe(refEl.scroll_box, {
                box: 'border-box', // 确保 CSS 计算尺寸时包括边框和内边距
            })
            refEl.scroll_box.addEventListener('wheel', mousewheel, { signal, passive: false })

            if (CSB) {
                // stickyDom(el, refEl, scroll)
                // refEl.scroll_box = el
                // refEl.scroll_box.appendChild(refEl.sticky_anchor)
                // spacerDom(refEl, scroll)
            } else {
                if (props.scroll == 'x') {
                    // 水平滚动
                    refEl.sticky_anchor.style.width = '0px'
                    refEl.sticky_anchor.style.height = '100%'

                    const validChildren = Array.from(refEl.scroll_content.childNodes).filter(
                        (node) => {
                            if (node.nodeType === Node.COMMENT_NODE) return false
                            if (node.nodeType === Node.TEXT_NODE) return false
                            if (node.nodeType === Node.ELEMENT_NODE && node.dataset.scroll)
                                return false
                            return true
                        },
                    )
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

                refEl.scroll_box.style.overflow = 'hidden'
                if (showX.value) {
                    refEl.scroll_box.style.overflowX = 'auto'
                    if (refEl.scrollbar.scroll_x) {
                        const key = props.reverseX ? 'top' : 'bottom'
                        refEl.scrollbar.scroll_x.style[key] = props.offsetX
                    }
                }
                if (showY.value) {
                    refEl.scroll_box.style.overflowY = 'auto'
                    if (refEl.scrollbar.scroll_y) {
                        const key = props.reverseY ? 'left' : 'right'
                        refEl.scrollbar.scroll_y.style[key] = props.offsetY
                    }
                }
            }
        })
        onUpdated(() => {
            // nextTick(handleSlot)
        })
        onBeforeUnmount(() => {
            controller.abort()

            if (sizeObserver) {
                sizeObserver.unobserve(refEl.scroll_box)
                sizeObserver.disconnect()
            }
        })

        return {
            refEl,
            setRef,
            showX,
            showY,
            track_down,
            mousewheel,
            mousescroll,
            mouseenter,
            mouseleave,
            overscrollStateX,
            overscrollStateY,
            scrollStateX,
            scrollStateY,
        }
    },
}
</script>

<template lang="pug" src="./html.pug" />
<style lang="scss" src="./style.scss" />
