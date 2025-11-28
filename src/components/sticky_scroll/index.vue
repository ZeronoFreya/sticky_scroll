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
// import useScrollContent from './use_scroll_content'

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
            default: 'y', // x, y, xy
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
            type: Object,
            default: null,
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

        const timer = {
            x: null,
            y: null,
        }

        const scrollDelta = {
            x: 0,
            y: 0,
        }

        // const { handleSlot } = useScrollContent(refEl)

        const defaultCSB = {
            move: () => {},
            resize: () => {},
        }

        const CSB = isPlainObject(props.customScrollBar)
            ? { ...defaultCSB, ...props.customScrollBar }
            : Boolean(props.customScrollBar)
              ? defaultCSB
              : false

        let animationFrameIdTransform = null
        const refElTransform = () => {
            if (animationFrameIdTransform != null) {
                cancelAnimationFrame(animationFrameIdTransform)
            }
            animationFrameIdTransform = requestAnimationFrame(() => {
                const { scrollLeft, scrollTop } = refEl.scroll_box
                const translateX = (scrollLeft + scrollDelta.x) * -1
                const translateY = (scrollTop + scrollDelta.y) * -1
                refEl.scroll_content.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`

                if (refEl.overscroll.before_x) {
                    if (scrollDelta.x == 0) {
                        refEl.overscroll.before_x.classList.remove('overscroll_show')
                        refEl.overscroll.after_x.classList.remove('overscroll_show')
                    } else {
                        refEl.overscroll.before_x.classList.add('overscroll_show')
                        refEl.overscroll.after_x.classList.add('overscroll_show')
                    }

                    refEl.overscroll.before_x.style.transform = `translate3d(-100%, ${scrollTop + scrollDelta.y}px, 0)`
                    refEl.overscroll.after_x.style.transform = `translate3d(100%, ${scrollTop + scrollDelta.y}px, 0)`
                }
                if (refEl.overscroll.before_y) {
                    if (scrollDelta.y == 0) {
                        refEl.overscroll.before_y.classList.remove('overscroll_show')
                        refEl.overscroll.after_y.classList.remove('overscroll_show')
                    } else {
                        refEl.overscroll.before_y.classList.add('overscroll_show')
                        refEl.overscroll.after_y.classList.add('overscroll_show')
                    }

                    refEl.overscroll.before_y.style.transform = `translate3d(${scrollLeft + scrollDelta.x}px, -100%, 0)`
                    refEl.overscroll.after_y.style.transform = `translate3d(${scrollLeft + scrollDelta.x}px, 100%, 0)`
                }
            })
        }
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

            if (refEl.scrollbar.scroll_x) {
                if (refEl.scroll_box.offsetWidth == scrollWidth) {
                    refEl.scrollbar.scroll_x.classList.add('sticky_scroll_hide')
                } else {
                    refEl.scrollbar.scroll_x.classList.remove('sticky_scroll_hide')
                }
            }
            if (refEl.scrollbar.scroll_y) {
                if (refEl.scroll_box.offsetHeight == scrollHeight) {
                    refEl.scrollbar.scroll_y.classList.add('sticky_scroll_hide')
                } else {
                    refEl.scrollbar.scroll_y.classList.remove('sticky_scroll_hide')
                }
            }

            if (CSB) {
                CSB.resize(
                    refEl.scroll_box.offsetWidth,
                    refEl.scroll_box.offsetHeight,
                    scrollWidth,
                    scrollHeight,
                )
            } else {
                // console.log(refEl.scrollbar)

                if (refEl.scrollbar.thumb_x) {
                    refEl.scrollbar.thumb_x.style.width =
                        (refEl.scrollbar.track_x.offsetWidth * refEl.scroll_box.offsetWidth) /
                            scrollWidth +
                        'px'
                }
                if (refEl.scrollbar.thumb_y) {
                    refEl.scrollbar.thumb_y.style.height =
                        (refEl.scrollbar.track_y.offsetHeight * refEl.scroll_box.offsetHeight) /
                            scrollHeight +
                        'px'
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

        const options = {
            box: 'border-box', // 确保 CSS 计算尺寸时包括边框和内边距
        }
        let animationFrameId = null
        const observer = new ResizeObserver((entries) => {
            cancelAnimationFrame(animationFrameId)
            animationFrameId = requestAnimationFrame(() => _resize())
        })

        let math_temp = 0
        let thumbOffset = 0
        let thumb_mouse_offset = 0

        const track_move = (e) => {
            const scroll = e.currentTarget.dataset.scroll
            const scrollPos = scroll == 'x' ? 'scrollLeft' : 'scrollTop'
            let offset = (scroll == 'x' ? e.offsetX : e.offsetY) - thumb_mouse_offset

            let s = Math.round(offset * math_temp)

            const { offsetWidth, offsetHeight } = refEl.scroll_box
            const { offsetWidth: scrollWidth, offsetHeight: scrollHeight } = refEl.scroll_content

            const MaxScroll =
                scroll == 'x' ? scrollWidth - offsetWidth : scrollHeight - offsetHeight

            if (s > 0 && s < MaxScroll) {
                refEl.scroll_box[scrollPos] = s
                return
            }

            if (scroll == 'x') {
                if (s < 0) {
                    scrollDelta.x = Math.max(s, -refEl.overscroll.before_x.offsetWidth)
                } else {
                    scrollDelta.x = Math.min(s, refEl.overscroll.after_x.offsetWidth)
                }
            } else {
                if (s < 0) {
                    scrollDelta.y = Math.max(s, -refEl.overscroll.before_y.offsetHeight)
                } else {
                    scrollDelta.y = Math.min(s, refEl.overscroll.after_y.offsetHeight)
                }
            }

            // aaa(scrollLeft, scrollTop)
            refElTransform()
        }

        const track_up = (e) => {
            const track = e.currentTarget
            track.classList.remove('track_down')
            math_temp = 0
            thumb_mouse_offset = 0
            track.removeEventListener('pointermove', track_move)
            track.removeEventListener('pointerup', track_up)

            if (scrollDelta.x != 0) {
                if (timer.x) clearTimeout(timer.x)
                timer.x = setTimeout(() => {
                    scrollDelta.x = 0
                    refElTransform()
                }, 2000)
            }
            if (scrollDelta.y != 0) {
                if (timer.y) clearTimeout(timer.y)
                timer.y = setTimeout(() => {
                    scrollDelta.y = 0
                    refElTransform()
                }, 2000)
            }
        }

        const track_down = (e) => {
            const track = e.currentTarget
            track.classList.add('track_down')
            // scrollDelta[scroll] = 0
            const scroll = track.dataset.scroll
            const offsetSize = scroll == 'x' ? 'offsetWidth' : 'offsetHeight'
            const scrollPos = scroll == 'x' ? 'scrollLeft' : 'scrollTop'
            let offset = scroll == 'x' ? e.offsetX : e.offsetY
            math_temp = refEl.scroll_content[offsetSize] / track[offsetSize]

            const thumb = refEl.scrollbar['thumb_' + scroll]

            if (e.target === thumb) {
                // 拖拽 thumb: 使用点击的位置
                thumb_mouse_offset = offset
                offset = thumbOffset
            } else {
                // 在 track 拖拽: 使用 thumb 的中心
                thumb_mouse_offset = thumb[offsetSize] / 2
                offset -= thumb_mouse_offset
                refEl.scroll_box[scrollPos] = Math.round(offset * math_temp)
            }

            track.addEventListener('pointerup', track_up)
            track.addEventListener('pointermove', track_move)
            track.setPointerCapture(e.pointerId)
        }

        const scrollX = (event, MaxScrollLeft) => {
            const scrollLeft = refEl.scroll_box.scrollLeft
            if (scrollLeft > 0 && scrollLeft < MaxScrollLeft) {
                scrollDelta.x = 0
                // translateX = 0
                return true
            }
            if (scrollLeft <= 0) {
                // 左边界
                if (event.deltaY < 0) {
                    // 左滚 → 继续拉伸（负）
                    scrollDelta.x += event.deltaY
                    scrollDelta.x = Math.max(scrollDelta.x, -refEl.overscroll.before_x.offsetWidth)
                    event.preventDefault()
                } else {
                    // 右滚 → 消耗或吸附
                    if (scrollDelta.x < 0) {
                        // 只有已经拉伸了才处理
                        event.preventDefault()
                        if (-scrollDelta.x < event.deltaY) {
                            // 可滚动空间不足deltaY
                            scrollDelta.x = 0
                        } else {
                            scrollDelta.x += event.deltaY // deltaY 为正
                            scrollDelta.x = Math.min(scrollDelta.x, 0)
                        }
                    }
                }
            } else {
                // 右边界
                if (event.deltaY < 0) {
                    // 左滚 → 消耗或吸附
                    if (scrollDelta.x > 0) {
                        event.preventDefault()
                        if (scrollDelta.x < -event.deltaY) {
                            scrollDelta.x = 0
                        } else {
                            scrollDelta.x += event.deltaY
                            scrollDelta.x = Math.max(scrollDelta.x, 0)
                        }
                    }
                } else {
                    // 右滚 → 继续拉伸（正）
                    scrollDelta.x += event.deltaY
                    scrollDelta.x = Math.min(scrollDelta.x, refEl.overscroll.after_x.offsetWidth)
                    event.preventDefault()
                }
            }
            if (timer.x) clearTimeout(timer.x)
            timer.x = setTimeout(() => {
                scrollDelta.x = 0
                refElTransform()
            }, 2000)
            return false
        }

        const scrollY = (event, MaxScrollTop) => {
            const scrollTop = refEl.scroll_box.scrollTop
            // 还没到顶部也还没到底部：正常滚动，直接返回
            if (scrollTop > 0 && scrollTop < MaxScrollTop) {
                scrollDelta.y = 0
                // translateY = 0
                return true
            }
            if (scrollTop <= 0) {
                // 上边界
                if (event.deltaY < 0) {
                    // 上滚 → 继续拉伸（负）
                    scrollDelta.y += event.deltaY
                    scrollDelta.y = Math.max(scrollDelta.y, -refEl.overscroll.before_y.offsetHeight)
                    event.preventDefault()
                } else {
                    // 下滚 → 消耗或吸附
                    if (scrollDelta.y < 0) {
                        // 只有已经拉伸了才处理
                        event.preventDefault()
                        if (-scrollDelta.y < event.deltaY) {
                            // 可滚动空间不足deltaY
                            scrollDelta.y = 0
                        } else {
                            scrollDelta.y += event.deltaY // deltaY 为正
                            scrollDelta.y = Math.min(scrollDelta.y, 0)
                        }
                    }
                }
            } else {
                // 下边界
                if (event.deltaY < 0) {
                    // 上滚 → 消耗或吸附
                    if (scrollDelta.y > 0) {
                        event.preventDefault()
                        if (scrollDelta.y < -event.deltaY) {
                            scrollDelta.y = 0
                        } else {
                            scrollDelta.y += event.deltaY
                            scrollDelta.y = Math.max(scrollDelta.y, 0)
                        }
                    }
                } else {
                    // 下滚 → 继续拉伸（正）
                    scrollDelta.y += event.deltaY
                    scrollDelta.y = Math.min(scrollDelta.y, refEl.overscroll.after_y.offsetHeight)
                    event.preventDefault()
                }
            }
            if (timer.y) clearTimeout(timer.y)
            timer.y = setTimeout(() => {
                scrollDelta.y = 0
                refElTransform()
            }, 2000)
            return false
        }

        const mousewheel = (e) => {
            // event.deltaY < 0   // 滚动条上｜左, 内容下｜右
            // event.deltaY > 0   // 滚动条下｜右, 内容上｜左

            const { offsetWidth, offsetHeight } = refEl.scroll_box

            const { offsetWidth: scrollWidth, offsetHeight: scrollHeight } = refEl.scroll_content

            if (props.scroll == 'x') {
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

        const mousescroll = () => {
            // refEl.scroll_content.style.transform = `translate3d(${-scrollLeft}px, ${-scrollTop}px, 0)`
            const { scrollLeft, scrollTop } = refEl.scroll_box
            const { offsetWidth: scrollWidth, offsetHeight: scrollHeight } = refEl.scroll_content
            if (CSB) {
                CSB.move(scrollLeft, scrollTop, scrollWidth, scrollHeight)
            } else {
                if (refEl.scrollbar.thumb_x) {
                    refEl.scrollbar.thumb_x.style.transform = `translate3d(${(refEl.scrollbar.track_x.offsetWidth * scrollLeft) / scrollWidth}px, 0, 0)`
                }
                if (refEl.scrollbar.thumb_y) {
                    refEl.scrollbar.thumb_y.style.transform = `translate3d(0, ${(refEl.scrollbar.track_y.offsetHeight * scrollTop) / scrollHeight}px, 0)`
                }
            }

            refElTransform()
        }

        const mouseenter = ({ currentTarget }) => {
            const scroll = currentTarget.dataset.scroll
            if (timer[scroll]) clearTimeout(timer[scroll])
        }
        const mouseleave = ({ currentTarget }) => {
            const scroll = currentTarget.dataset.scroll
            timer[scroll] = setTimeout(() => {
                scrollDelta[scroll] = 0
                refElTransform()
            }, 2000)
        }

        // 生命周期
        onMounted(() => {
            observer.observe(refEl.scroll_box, options)
            // handleSlot()
            refEl.scroll_box.addEventListener('wheel', mousewheel, { passive: false })

            if (CSB) {
                // stickyDom(el, refEl, scroll)
                // refEl.scroll_box = el
                // refEl.scroll_box.appendChild(refEl.sticky_anchor)
                // spacerDom(refEl, scroll)
            } else {
                if (props.scroll == 'x') {
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
                } else if (props.scroll == 'y') {
                    refEl.scroll_content.style.width = '100%'
                    refEl.sticky_anchor.style.width = '100%'
                    refEl.sticky_anchor.style.height = '0px'
                } else {
                    refEl.sticky_anchor.style.width = '100%'
                    refEl.sticky_anchor.style.height = '0px'
                }
                refEl.scroll_box.style.overflow = 'hidden'
                if (showX.value) {
                    refEl.scroll_box.style.overflowX = 'auto'
                    const key = props.reverseX ? 'top' : 'bottom'
                    refEl.scrollbar.scroll_x.style[key] = props.offsetX
                }
                if (showY.value) {
                    refEl.scroll_box.style.overflowY = 'auto'
                    const key = props.reverseY ? 'left' : 'right'
                    refEl.scrollbar.scroll_y.style[key] = props.offsetY
                }
            }
        })
        onUpdated(() => {
            nextTick(handleSlot)
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
        }
    },
}
</script>

<template lang="pug" src="./html.pug" />
<style lang="scss" src="./style.scss" />
