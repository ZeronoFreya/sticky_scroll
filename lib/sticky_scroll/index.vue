<script>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'

import sProps from './props.js'

import useScrollbar from './use_scrollbar'
import useOverscroll from './use_overscroll'

export default {
    components: {},
    props: sProps,
    setup(props, { emit, expose }) {
        const refEl = {
            root: null,
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

        const loading = reactive({
            x: {
                status: false,
                end: false,
            },
            y: {
                status: false,
                end: false,
            },
        })

        const disTeleport = reactive({
            x: computed(() => props.teleportX === 'body'),
            y: computed(() => props.teleportY === 'body'),
        })

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

        const scrollStateX = ref(false)
        const scrollStateY = ref(false)

        const animeId = {
            resize: null,
            transform: null,
            wheel: null,
            scroll: null,
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
                } else if (loading.x.status) {
                    overscrollStateX.value = scrollDelta.x == 0 ? false : true
                }
                if (refEl.overscroll.before_y) {
                    overscrollStateY.value = scrollDelta.y == 0 ? false : true
                    refEl.overscroll.before_y.style.transform = `translate3d(${translateX}px, -100%, 0)`
                    if (refEl.overscroll.after_y) {
                        refEl.overscroll.after_y.style.transform = `translate3d(${translateX}px, 100%, 0)`
                    }
                } else if (loading.y.status) {
                    overscrollStateY.value = scrollDelta.y == 0 ? false : true
                }
                if (refEl.overscroll.load_y) {
                    refEl.overscroll.load_y.style.transform = `translate3d(${translateX}px, 100%, 0)`
                }
            })
        }

        const { resetTime, clearTime, mouseenter, mouseleave, scrollDelta, overX, overY } =
            useOverscroll(refEl, refElTransform, loading)

        const { track_down, scroll_to } = useScrollbar(
            refEl,
            signal,
            scrollDelta,
            resetTime,
            refElTransform,
            loading,
        )

        const _resize = () => {
            const { offsetWidth: scrollWidth, offsetHeight: scrollHeight } = refEl.scroll_content
            if (refEl.spacer_x) {
                refEl.spacer_x.style.width = scrollWidth + 'px'
            }
            if (refEl.spacer_y) {
                refEl.spacer_y.style.height = scrollHeight + 'px'
            }
            if (props.autoH) {
                refEl.root.style.height = Math.ceil(scrollHeight) + 'px'
            }

            if (props.scroll == 'x') {
                refEl.scroll_content.style.height = Math.ceil(scrollHeight) + 'px'
            }

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

            loading.x.status = false
            loading.y.status = false
        }

        watch(
            () => [props.scroll, props.autoH],
            () => {
                animeId.resize = requestAnimationFrame(() => _resize())
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
            clearTime('x')
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
                return true
            }
            overX(event)
            return false
        }

        const scrollY = (event, MaxScrollTop) => {
            clearTime('y')
            if (MaxScrollTop < 0) {
                event.preventDefault()
                scrollDelta.y = 0
                return true
            }
            const scrollTop = refEl.scroll_box.scrollTop
            // 还没到顶部也还没到底部：正常滚动，直接返回
            const scrollRemaining = Math.abs(MaxScrollTop - scrollTop)

            if (scrollTop > 0 && scrollRemaining > 1) {
                scrollDelta.y = 0
                return true
            }
            overY(event)
            return false
        }

        const _wheel = (e) => {
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

        const mousewheel = (e) => {
            if (props.scroll == 'x') e.preventDefault()
            if (animeId.wheel) {
                cancelAnimationFrame(animeId.wheel)
            }
            animeId.wheel = requestAnimationFrame(() => _wheel(e))
        }

        const _scroll = (e) => {
            const { scrollLeft, scrollTop, offsetWidth, offsetHeight } = refEl.scroll_box
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

                    if (props.loadThresholdX >= 0 && !loading.x.status && !loading.x.end) {
                        // 剩余高度不足 loadThresholdX, 加载更多
                        if (scrollWidth - scrollLeft - offsetWidth < props.loadThresholdX) {
                            loading.x.status = true
                            emit('loadmoreX')
                        }
                    }
                }
                if (refEl.scrollbar.thumb_y) {
                    const translateY =
                        scrollHeight > 0
                            ? (refEl.scrollbar.track_y.offsetHeight * scrollTop) / scrollHeight
                            : 0
                    refEl.scrollbar.thumb_y.style.transform = `translate3d(0, ${translateY}px, 0)`

                    if (props.loadThresholdY >= 0 && !loading.y.status && !loading.y.end) {
                        // 剩余高度不足 loadThresholdY, 加载更多
                        if (scrollHeight - scrollTop - offsetHeight < props.loadThresholdY) {
                            loading.y.status = true
                            emit('loadmoreY')
                        }
                    }
                }
            }

            refElTransform()
        }

        const mousescroll = (e) => {
            if (animeId.scroll) {
                cancelAnimationFrame(animeId.scroll)
            }
            animeId.scroll = requestAnimationFrame(() => _scroll(e))
        }

        // 生命周期
        onMounted(() => {
            const observeOpt = {
                box: 'border-box', // 确保 CSS 计算尺寸时包括边框和内边距
            }
            sizeObserver.observe(refEl.scroll_box, observeOpt)
            sizeObserver.observe(refEl.scroll_content, observeOpt)

            // signal 的核心作用：优雅地取消监听
            // passive: true 主要用来提升滚动性能，告诉浏览器我不打算阻止滚动，你放心大胆地滚
            // 如果你需要阻止滚动，必须显式设置 passive: false 才能调用 preventDefault
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
                // 垂直滚动 或 水平垂直滚动
                if (props.scroll == 'y') {
                    refEl.scroll_content.style.width = '100%'
                }
                // 设置吸顶元素的尺寸
                refEl.sticky_anchor.style.width = '100%'
                refEl.sticky_anchor.style.height = '0px'
            }
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

        const scrollCheck = (scroll) => {
            const scrollLow = scroll.toLowerCase()
            if (scrollLow == 'x' || scrollLow == 'y') {
                return scrollLow
            }
            return null
        }
        let customUpScroll = ''
        const customUp = () => {
            document.removeEventListener('mouseup', customUp, true)
            document.removeEventListener('pointerup', customUp, true)

            for (let char of customUpScroll) {
                const charLow = scrollCheck(char)
                if (charLow) resetTime(charLow)
            }
            customUpScroll = ''
        }

        expose({
            scroll: (val_x, val_y) => {
                if (props.customScrollBar && customUpScroll == '' && props.overscrollX) {
                    customUpScroll = 'xy'
                    document.addEventListener('mouseup', customUp, true)
                    document.addEventListener('pointerup', customUp, true)
                }
                scroll_to('xy', val_x, val_y)
            },
            scrollX: (val) => {
                if (props.customScrollBar && customUpScroll == '' && props.overscrollX) {
                    customUpScroll = 'x'
                    document.addEventListener('mouseup', customUp, true)
                    document.addEventListener('pointerup', customUp, true)
                }
                scroll_to('x', val)
            },
            scrollY: (val) => {
                if (props.customScrollBar && customUpScroll == '' && props.overscrollY) {
                    customUpScroll = 'y'
                    document.addEventListener('mouseup', customUp, true)
                    document.addEventListener('pointerup', customUp, true)
                }
                scroll_to('y', val)
            },
            clearLoading: (scroll = 'xy') => {
                for (let char of scroll) {
                    const charLow = scrollCheck(char)
                    if (charLow) {
                        loading[charLow].status = false
                        loading[charLow].end = true
                    }
                }
            },
        })

        return {
            refEl,
            setRef,
            scrollCfg,
            track_down,
            mousescroll,
            mouseenter,
            mouseleave,
            overscrollStateX,
            overscrollStateY,
            scrollStateX,
            scrollStateY,
            loading,
            disTeleport,
        }
    },
}
</script>

<template lang="pug" src="./html.pug" />
<style lang="scss" src="./style.scss" />
