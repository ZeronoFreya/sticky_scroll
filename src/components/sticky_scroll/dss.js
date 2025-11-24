// main.js 注册为 scroll
// div(v-show="isVisible" v-scroll="{ onShow: handleShow, onHide: handleHide }")
import { reactive, watch } from 'vue'

import './style.css'

// 辅助函数：检查纯对象（排除数组、null 等）
const isPlainObject = (val) => {
    return val && typeof val === 'object' && val.constructor === Object
}

// let animationFrameId = null

function throttle(fn, delay = 300, { leading = true, trailing = true } = {}) {
    let timer = null
    let lastArgs = null

    return function (...args) {
        if (!timer) {
            leading && fn.apply(this, args) // 第一次立即执行
            timer = setTimeout(() => {
                timer = null
                trailing && lastArgs && fn.apply(this, lastArgs)
                lastArgs = null
            }, delay)
        } else {
            lastArgs = args // 持续更新参数，保证最后一次能拿到最新的 args
        }
    }
}

function refElTransform(el, refEl, scrollTop, scrollLeft, scrollDelta) {
    if (el._animationFrameId != null) {
        cancelAnimationFrame(el._animationFrameId)
    }
    el._animationFrameId = requestAnimationFrame(() => {
        const translateX = (scrollLeft + scrollDelta.x) * -1
        const translateY = (scrollTop + scrollDelta.y) * -1
        refEl.scroll_content.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`

        if (refEl.overscroll.before_x) {
            refEl.overscroll.before_x.style.transform = `translate3d(-100%, ${scrollTop + scrollDelta.y}px, 0)`
            refEl.overscroll.after_x.style.transform = `translate3d(100%, ${scrollTop + scrollDelta.y}px, 0)`
        }
        if (refEl.overscroll.before_y) {
            refEl.overscroll.before_y.style.transform = `translate3d(${scrollLeft + scrollDelta.x}px, -100%, 0)`
            refEl.overscroll.after_y.style.transform = `translate3d(${scrollLeft + scrollDelta.x}px, 100%, 0)`
        }
    })
}

// const refElTransform2 = throttle(
//     (refEl, translateX, translateY, scrollTop, scrollLeft, scrollDelta) => {
//         if (animationFrameId != null) {
//             cancelAnimationFrame(animationFrameId)
//         }
//         animationFrameId = requestAnimationFrame(() => {
//             refEl.scroll_content.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`

//             refEl.overscroll.before_x.style.transform = `translate3d(-100%, ${scrollTop + scrollDelta.y}px, 0)`
//             refEl.overscroll.after_x.style.transform = `translate3d(100%, ${scrollTop + scrollDelta.y}px, 0)`
//             refEl.overscroll.before_y.style.transform = `translate3d(${scrollLeft + scrollDelta.x}px, -100%, 0)`
//             refEl.overscroll.after_y.style.transform = `translate3d(${scrollLeft + scrollDelta.x}px, 100%, 0)`
//         })
//     },
//     60,
// )

function activeScrollBar(
    el,
    refEl,
    scrollDelta,
    scroll = 'y', // 滚动方向, x 或 y
) {
    const { signal } = el._controller
    refEl.scrollbar.scroll_x
    // 滑道
    const track = document.createElement('div')
    // 滑块
    const thumb = document.createElement('div')

    track.innerHTML = `<div class='track_view_${scroll}'></div>`

    track.appendChild(thumb)
    refEl.scrollbar['scroll_' + scroll].appendChild(track)

    track.classList.add('track_' + scroll)
    thumb.classList.add('thumb_' + scroll)

    thumb.innerHTML = `<div class='thumb_view_${scroll}'></div>`

    let math_temp = 0
    let thumbOffset = 0
    let thumb_mouse_offset = 0

    const offsetSize = scroll == 'x' ? 'offsetWidth' : 'offsetHeight'
    const scrollPos = scroll == 'x' ? 'scrollLeft' : 'scrollTop'

    // const aaa = throttle((scrollLeft, scrollTop) => {
    //     let translateX = (scrollLeft + scrollDelta.x) * -1
    //     let translateY = (scrollTop + scrollDelta.y) * -1
    //     refEl.scroll_content.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`

    //     refEl.overscroll.before_x.style.transform = `translate3d(-100%, ${scrollTop + scrollDelta.y}px, 0)`
    //     refEl.overscroll.after_x.style.transform = `translate3d(100%, ${scrollTop + scrollDelta.y}px, 0)`
    //     refEl.overscroll.before_y.style.transform = `translate3d(${scrollLeft + scrollDelta.x}px, -100%, 0)`
    //     refEl.overscroll.after_y.style.transform = `translate3d(${scrollLeft + scrollDelta.x}px, 100%, 0)`
    // }, 100)

    const pointermove = (e) => {
        let offset = (scroll == 'x' ? e.offsetX : e.offsetY) - thumb_mouse_offset

        let s = Math.round(offset * math_temp)

        const { scrollLeft, scrollTop, offsetWidth, offsetHeight } = refEl.scroll_box
        const { offsetWidth: scrollWidth, offsetHeight: scrollHeight } = refEl.scroll_content

        const MaxScroll = scroll == 'x' ? scrollWidth - offsetWidth : scrollHeight - offsetHeight

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
        refElTransform(el, refEl, scrollTop, scrollLeft, scrollDelta)
    }
    const pointerup = () => {
        track.classList.remove('track_down')
        math_temp = 0
        thumb_mouse_offset = 0
        track.removeEventListener('pointermove', pointermove)
        track.removeEventListener('pointerup', pointerup)

        const { scrollLeft, scrollTop } = refEl.scroll_box

        if (scrollDelta.x != 0) {
            if (el._timer.x) clearTimeout(el._timer.x)
            el._timer.x = setTimeout(() => {
                scrollDelta.x = 0
                refElTransform(el, refEl, scrollTop, scrollLeft, scrollDelta)
            }, 2000)
        }
        if (scrollDelta.y != 0) {
            if (el._timer.y) clearTimeout(el._timer.y)
            el._timer.y = setTimeout(() => {
                scrollDelta.y = 0
                refElTransform(el, refEl, scrollTop, scrollLeft, scrollDelta)
            }, 2000)
        }
    }

    track.addEventListener(
        'pointerdown',
        (e) => {
            track.classList.add('track_down')
            // scrollDelta[scroll] = 0
            let offset = scroll == 'x' ? e.offsetX : e.offsetY
            math_temp = refEl.scroll_content[offsetSize] / track[offsetSize]

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

            track.addEventListener('pointerup', pointerup, { signal })
            track.addEventListener('pointermove', pointermove, { signal })
            track.setPointerCapture(e.pointerId)
        },
        { signal },
    )

    return {
        track,
        thumb,
    }
}

function stickyDom(el, refEl, scroll) {
    refEl.sticky_anchor = document.createElement('div')
    refEl.sticky_anchor.classList.add('sticky_anchor')

    if (scroll == 'x') {
        refEl.sticky_anchor.style.cssText =
            'position: sticky;width: 0px;height: 100%;top: 0px;left: 0px;'
    } else {
        refEl.sticky_anchor.style.cssText =
            'position: sticky;width: 100%;height: 0px;top: 0px;left: 0px;'
    }

    refEl.scroll_content =
        el.childElementCount > 1 ? document.createElement('div') : el.firstElementChild
    refEl.scroll_content.classList.add('scroll_content')
    if (el.childElementCount > 1) {
        refEl.scroll_content.append(...el.childNodes)
    }

    refEl.sticky_anchor.appendChild(refEl.scroll_content)
}

function scrollbarDom(el, refEl, scrollDelta, scroll) {
    if (scroll.includes('x')) {
        refEl.scrollbar.scroll_x = document.createElement('div')
        refEl.scrollbar.scroll_x.classList.add('sticky_scroll', 'sticky_scroll_x')
        el.appendChild(refEl.scrollbar.scroll_x)
        const { track, thumb } = activeScrollBar(el, refEl, scrollDelta, 'x')
        refEl.scrollbar.track_x = track
        refEl.scrollbar.thumb_x = thumb
    }
    if (scroll.includes('y')) {
        refEl.scrollbar.scroll_y = document.createElement('div')
        refEl.scrollbar.scroll_y.classList.add('sticky_scroll', 'sticky_scroll_y')
        el.appendChild(refEl.scrollbar.scroll_y)
        const { track, thumb } = activeScrollBar(el, refEl, scrollDelta, 'y')

        refEl.scrollbar.track_y = track
        refEl.scrollbar.thumb_y = thumb
    }
}

function spacerDom(refEl, scroll) {
    refEl.scroll_box.style.overflow = 'hidden'
    refEl.scroll_box.classList.add('scroll_box', 'sticky_hide_default_scrollbar')
    const cssText = 'width:0px;height:0px;pointer-events:none;'

    if (scroll.includes('x')) {
        refEl.scroll_box.style.overflowX = 'auto'
        refEl.spacer_x = document.createElement('div')
        refEl.spacer_x.style.cssText = cssText
        refEl.scroll_box.appendChild(refEl.spacer_x)

        // 有 x就一定需要y的占位条, 否则高度会塌陷
        refEl.spacer_y = document.createElement('div')
        refEl.spacer_y.style.cssText = cssText
        refEl.scroll_box.appendChild(refEl.spacer_y)
    }

    if (scroll.includes('y')) {
        refEl.scroll_box.style.overflowY = 'auto'
        if (!refEl.spacer_y) {
            refEl.spacer_y = document.createElement('div')
            refEl.spacer_y.style.cssText = cssText
            refEl.scroll_box.appendChild(refEl.spacer_y)
        }
    }
}

function overscrollDom(refEl, scroll) {
    let div = null
    ;['before_' + scroll, 'after_' + scroll].forEach((key) => {
        refEl.overscroll[key] = document.createElement('div')
        div = refEl.overscroll[key]
        div.classList.add('overscroll_' + key)
        div.innerHTML = `<div class="overscroll_sticky_${key}"></div>`
        refEl.scroll_content.appendChild(div)
    })
}

export default {
    mounted(el, binding) {
        const {
            scroll = 'y',
            reverseX = false,
            reverseY = false,
            offsetX = '0px',
            offsetY = '0px',
            customScrollBar = null,
        } = binding.value || {}

        const computedStyle = window.getComputedStyle(el)
        if (computedStyle.position == 'static') {
            el.style.position = 'relative'
        }

        el._controller = new AbortController()
        const { signal } = el._controller

        const defaultCSB = {
            move: () => {},
            resize: () => {},
        }

        const CSB = isPlainObject(customScrollBar)
            ? { ...defaultCSB, ...customScrollBar }
            : Boolean(customScrollBar)
              ? defaultCSB
              : false

        if (!el.style.width) el.style.width = '100%'
        if (!el.style.height) el.style.height = '100%'

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

        el._timer = {
            x: null,
            y: null,
        }

        const scrollDelta = {
            x: 0,
            y: 0,
        }

        if (CSB) {
            stickyDom(el, refEl, scroll)
            refEl.scroll_box = el
            refEl.scroll_box.appendChild(refEl.sticky_anchor)
            spacerDom(refEl, scroll)
        } else {
            stickyDom(el, refEl, scroll)
            refEl.scroll_box = document.createElement('div')
            refEl.scroll_box.style.cssText = 'width:100%;height:100%;'
            refEl.scroll_box.appendChild(refEl.sticky_anchor)
            el.appendChild(refEl.scroll_box)
            spacerDom(refEl, scroll)
            scrollbarDom(el, refEl, scrollDelta, scroll)

            if (scroll.includes('x')) {
                const key = reverseX ? 'top' : 'bottom'
                refEl.scrollbar.scroll_x.style[key] = offsetY

                overscrollDom(refEl, 'x')
            }
            if (scroll.includes('y')) {
                const key = reverseY ? 'left' : 'right'
                refEl.scrollbar.scroll_y.style[key] = offsetX

                overscrollDom(refEl, 'y')
            }
        }

        if (scroll == 'x') {
            refEl.scroll_content.style.display = 'flex'
        } else if (scroll == 'y') {
            refEl.scroll_content.style.width = '100%'
        }

        const scrollX = (event, scrollTop, scrollLeft, MaxScrollLeft) => {
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
            if (el._timer.x) clearTimeout(el._timer.x)
            el._timer.x = setTimeout(() => {
                scrollDelta.x = 0
                refElTransform(el, refEl, scrollTop, scrollLeft, scrollDelta)
            }, 2000)
            return false
        }
        const scrollY = (event, scrollTop, scrollLeft, MaxScrollTop) => {
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
            if (el._timer.y) clearTimeout(el._timer.y)
            el._timer.y = setTimeout(() => {
                scrollDelta.y = 0
                refElTransform(el, refEl, scrollTop, scrollLeft, scrollDelta)
            }, 2000)
            return false
        }

        // let translateX = 0
        // let translateY = 0
        refEl.scroll_box.addEventListener(
            'wheel',
            (event) => {
                // event.deltaY < 0   // 滚动条上｜左, 内容下｜右
                // event.deltaY > 0   // 滚动条下｜右, 内容上｜左

                const { scrollLeft, scrollTop, offsetWidth, offsetHeight } = refEl.scroll_box

                const { offsetWidth: scrollWidth, offsetHeight: scrollHeight } =
                    refEl.scroll_content

                if (scroll == 'x') {
                    const delta = event.deltaY || event.deltaX
                    refEl.scroll_box.scrollLeft += delta
                    if (scrollX(event, scrollTop, scrollLeft, scrollWidth - offsetWidth)) return
                } else if (scroll == 'y') {
                    if (scrollY(event, scrollTop, scrollLeft, scrollHeight - offsetHeight)) return
                } else {
                    if (event.shiftKey) {
                        if (scrollX(event, scrollTop, scrollLeft, scrollWidth - offsetWidth)) return
                    } else {
                        if (scrollY(event, scrollTop, scrollLeft, scrollHeight - offsetHeight))
                            return
                    }
                }

                refElTransform(el, refEl, scrollTop, scrollLeft, scrollDelta)
            },
            { signal, passive: false },
        )

        refEl.scroll_box.addEventListener(
            'scroll',
            () => {
                // console.log('scroll')

                const { scrollLeft, scrollTop } = refEl.scroll_box
                // refEl.scroll_content.style.transform = `translate3d(${-scrollLeft}px, ${-scrollTop}px, 0)`

                const { offsetWidth: scrollWidth, offsetHeight: scrollHeight } =
                    refEl.scroll_content
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

                refElTransform(el, refEl, scrollTop, scrollLeft, scrollDelta)
                // translateX = (scrollLeft + scrollDelta.x) * -1
                // translateY = (scrollTop + scrollDelta.y) * -1
                // refEl.scroll_content.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`
                // refEl.overscroll.before_x.style.transform = `translate3d(-100%, ${scrollTop + scrollDelta.y}px, 0)`
                // refEl.overscroll.after_x.style.transform = `translate3d(100%, ${scrollTop + scrollDelta.y}px, 0)`
                // refEl.overscroll.before_y.style.transform = `translate3d(${scrollLeft + scrollDelta.x}px, -100%, 0)`
                // refEl.overscroll.after_y.style.transform = `translate3d(${scrollLeft + scrollDelta.x}px, 100%, 0)`
            },
            { signal },
        )

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

            // refEl.scroll_content.style.minWidth = refEl.scroll_box.offsetWidth + 'px'
            // refEl.scroll_content.style.minHeight = refEl.scroll_box.offsetHeight + 'px'

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
        observer.observe(refEl.scroll_box, options)
        el._sizeObserver = observer
    },
    beforeUnmount(el) {
        if (el._sizeObserver) {
            el._sizeObserver.unobserve(el)
            el._sizeObserver.disconnect()
            delete el._sizeObserver
        }
        if (el._controller) {
            el._controller.abort()
            delete el._controller
        }
    },
}
