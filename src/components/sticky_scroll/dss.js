// main.js 注册为 scroll
// div(v-show="isVisible" v-scroll="{ onShow: handleShow, onHide: handleHide }")
import { reactive, watch } from 'vue'

// 辅助函数：检查纯对象（排除数组、null 等）
const isPlainObject = (val) => {
    return val && typeof val === 'object' && val.constructor === Object
}

function activeScrollBar(
    refEl,
    {
        scrollBar, // 滚动条的节点
        scrollPanel, // 滚动区域的节点, 一般是具有 overflow 的元素
        scroll = 'y', // 滚动方向, x 或 y
    } = {},
) {
    // 滑道
    const track = document.createElement('div')
    // 滑块
    const thumb = document.createElement('div')

    track.innerHTML = `<div class='track_view_${scroll}'></div>`

    track.appendChild(thumb)
    scrollBar.appendChild(track)

    track.classList.add('track_' + scroll)
    thumb.classList.add('thumb_' + scroll)

    thumb.innerHTML = `<div class='thumb_view_${scroll}'></div>`

    let math_temp = 0
    let thumbOffset = 0
    let thumb_mouse_offset = 0

    const offsetSize = scroll == 'x' ? 'offsetWidth' : 'offsetHeight'

    const scrollPos = scroll == 'x' ? 'scrollLeft' : 'scrollTop'

    const pointermove = (e) => {
        let offset = (scroll == 'x' ? e.offsetX : e.offsetY) - thumb_mouse_offset
        scrollPanel[scrollPos] = Math.round(offset * math_temp)
    }
    const pointerup = () => {
        track.classList.remove('track_down')
        math_temp = 0
        thumb_mouse_offset = 0
        track.removeEventListener('pointermove', pointermove)
        track.removeEventListener('pointerup', pointerup)
    }

    track.addEventListener(
        'pointerdown',
        (e) => {
            track.classList.add('track_down')
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
                scrollPanel[scrollPos] = Math.round(offset * math_temp)
            }

            track.addEventListener('pointerup', pointerup, false)
            track.addEventListener('pointermove', pointermove, false)
            track.setPointerCapture(e.pointerId)
        },
        false,
    )

    return {
        track,
        thumb,
    }
}

function stickyDom(el, refEl) {
    refEl.sticky_anchor = document.createElement('div')
    refEl.sticky_anchor.classList.add('sticky_anchor')

    refEl.scroll_content =
        el.childElementCount > 1 ? document.createElement('div') : el.firstElementChild
    refEl.scroll_content.classList.add('scroll_content')
    if (el.childElementCount > 1) {
        refEl.scroll_content.append(...el.childNodes)
    }

    refEl.sticky_anchor.appendChild(refEl.scroll_content)
}

function scrollbarDom(el, refEl, scroll) {
    if (scroll.includes('x')) {
        refEl.scrollbar.scroll_x = document.createElement('div')
        refEl.scrollbar.scroll_x.classList.add('sticky_scroll_x')
        el.appendChild(refEl.scrollbar.scroll_x)
        const { track, thumb } = activeScrollBar(refEl, {
            scrollBar: refEl.scrollbar.scroll_x,
            scrollPanel: refEl.scroll_box,
            scroll: 'x',
        })
        refEl.scrollbar.track_x = track
        refEl.scrollbar.thumb_x = thumb
    }
    if (scroll.includes('y')) {
        refEl.scrollbar.scroll_y = document.createElement('div')
        refEl.scrollbar.scroll_y.classList.add('sticky_scroll_y')
        el.appendChild(refEl.scrollbar.scroll_y)
        const { track, thumb } = activeScrollBar(refEl, {
            scrollBar: refEl.scrollbar.scroll_y,
            scrollPanel: refEl.scroll_box,
            scroll: 'y',
        })

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
    beforeMount(el, binding) {
        let styleEl = document.getElementById('stickyScrollStyle')
        if (!styleEl) {
            // 如果不存在，创建新的 style 元素
            styleEl = document.createElement('style')
            styleEl.id = 'stickyScrollStyle'
            // 填充 CSS 内容
            styleEl.innerHTML = `
            .sticky_hide_default_scrollbar::-webkit-scrollbar {
                display: none;
            }
            .scroll_box{
                z-index: 1;
            }
            .sticky_anchor{
                width:100%;
                height:0px;
                position:sticky;
                top:0px;
                left:0px;
            }
            .scroll_content{
                width: fit-content;
                height: fit-content;
                position: absolute;
                top: 0;
                left: 0;
                transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1);
            }
            .sticky_scroll_x{
                position: absolute;
                z-index: 2;
                width:100%;
                height: 16px;
                left: 0px;
                padding: 0 15px;
            }
            .sticky_scroll_y{
                position: absolute;
                z-index: 2;
                top: 0;
                width: 16px;
                height: 100%;
                padding: 15px 0;
            }
            .track_x, .track_y{
                position: relative;
                width:100%;
                height: 100%;
                border-radius: 100vw;
                background: rgba(44, 44, 44, 0);
                transition: background 0.6s ease;
            }
            .track_x:hover .thumb_x, .track_y:hover .thumb_y{
                padding: 3px;
            }
            
            .track_view_x, .track_view_y{
                z-index: 1;
                opacity: 0;
                position: absolute;
                background: rgba(44, 44, 44, 1);
                border-radius: 100vw;
                transition: opacity 0.2s ease;
            }
            .track_view_x{
                top: 50%;
                left: 0px;
                transform: translateY(-50%);
                width: 100%;
                height: 20%;
            }
            .track_view_y{
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 20%;
                height: 100%;
            }
            .track_down .track_view_x, .track_down .track_view_y{
                opacity: 1;
            }
            .track_down .thumb_view_x, .track_down .thumb_view_y{
                background: rgba(44, 44, 44, 1);
            }
            .thumb_x{
                width: 0px;
                height: 100%;
            }
            .thumb_y{
                width: 100%;
                height: 0px;
            }
            .thumb_x, .thumb_y{
                position: relative;
                z-index: 2;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1), padding 0.1s ease;
                padding: 6px;
            }
            .thumb_view_x, .thumb_view_y{
                pointer-events: none;
                width: 100%;
                height: 100%;
                border-radius: 100vw;
                background: #9F9F9F;
                transition: background 0.2s ease;
            }
            .overscroll_before_x,
            .overscroll_after_x {
                transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1);
                position: absolute;
                height: 100%;
                width: 100px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .overscroll_before_x {
                left: 0;
                top: 0;
                transform: translateX(-100%);
            }
            .overscroll_after_x {
                right: 0;
                top: 0;
                transform: translateX(100%);
            }
            .overscroll_before_y,
            .overscroll_after_y {
                transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1);
                position: absolute;
                width: 100%;
                height: 100px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .overscroll_before_y {
                top: 0;
                left: 0;
                transform: translateY(-100%);
            }
            .overscroll_after_y {
                bottom: 0;
                left: 0;
                transform: translateY(100%);
            }
            `
            // 追加到 head
            document.head.appendChild(styleEl)
        }
    },
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
        el._refEl = refEl

        if (CSB) {
            stickyDom(el, refEl)
            refEl.scroll_box = el
            refEl.scroll_box.appendChild(refEl.sticky_anchor)
            spacerDom(refEl, scroll)
        } else {
            stickyDom(el, refEl)
            refEl.scroll_box = document.createElement('div')
            refEl.scroll_box.style.cssText = 'width:100%;height:100%;'
            refEl.scroll_box.appendChild(refEl.sticky_anchor)
            el.appendChild(refEl.scroll_box)
            spacerDom(refEl, scroll)
            scrollbarDom(el, refEl, scroll)

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

            // 水平滚动下, 使滚轮支持水平滚动
            el._handleWheel = (event) => {
                event.preventDefault() // 阻止默认垂直滚动

                const delta = event.deltaY || event.deltaX // 优先垂直滚轮用于水平，deltaX 为自然水平滚轮
                const scrollAmount = delta * 1 // 滚动步长，可调整（像素单位）

                refEl.scroll_box.scrollLeft += scrollAmount
            }
            refEl.scroll_box.addEventListener('wheel', el._handleWheel, { passive: false })
        } else if (scroll == 'y') {
            refEl.scroll_content.style.width = '100%'
        }

        let translateX = 0
        let translateY = 0
        let scrollDeltaX = 0
        let scrollDeltaY = 0
        refEl.scroll_box.addEventListener(
            'wheel',
            (event) => {
                const { scrollLeft, scrollTop, offsetWidth, offsetHeight } = refEl.scroll_box

                const { offsetWidth: scrollWidth, offsetHeight: scrollHeight } =
                    refEl.scroll_content

                if (event.shiftKey) {
                    const MaxScrollLeft = scrollWidth - offsetWidth

                    if (scrollLeft > 0 && scrollLeft < MaxScrollLeft) {
                        scrollDeltaX = 0
                        translateX = 0
                        return
                    }

                    // 先判断边界，再判断滚动方向 —— 这就是你说的“对调”核心
                    if (scrollLeft <= 0) {
                        // 左边界
                        if (event.wheelDeltaY > 0) {
                            // 上滚 → 想往左 → 继续拉伸（负）
                            scrollDeltaX -= event.wheelDeltaY
                            scrollDeltaX = Math.max(
                                scrollDeltaX,
                                -refEl.overscroll.before_x.offsetWidth,
                            )
                            event.preventDefault()
                        } else {
                            // 下滚 → 想往右 → 消耗或吸附
                            if (scrollDeltaX < 0) {
                                // 只有已经拉伸了才处理
                                event.preventDefault()
                                if (scrollDeltaX > event.wheelDeltaY) {
                                    // 吸附条件原样保留
                                    scrollDeltaX = 0
                                } else {
                                    scrollDeltaX -= event.wheelDeltaY // wheelDeltaY 为负
                                    scrollDeltaX = Math.min(scrollDeltaX, 0)
                                }
                            }
                        }
                    } else {
                        // 右边界
                        if (event.wheelDeltaY > 0) {
                            // 上滚 → 想往左 → 消耗或吸附
                            if (scrollDeltaX > 0) {
                                event.preventDefault()
                                if (scrollDeltaX < event.wheelDeltaY) {
                                    scrollDeltaX = 0
                                } else {
                                    scrollDeltaX -= event.wheelDeltaY
                                    scrollDeltaX = Math.max(scrollDeltaX, 0)
                                }
                            }
                        } else {
                            // 下滚 → 想往右 → 继续拉伸（正）
                            scrollDeltaX -= event.wheelDeltaY // wheelDeltaY 为负 → 变正
                            scrollDeltaX = Math.min(
                                scrollDeltaX,
                                refEl.overscroll.after_x.offsetWidth,
                            )
                            event.preventDefault()
                        }
                    }

                    translateX = (scrollLeft + scrollDeltaX) * -1
                } else {
                    // translateX = 0
                    // scrollDeltaX = 0 // 水平清零

                    const MaxScrollTop = scrollHeight - offsetHeight

                    // 还没到顶部也还没到底部：正常滚动，直接返回
                    if (scrollTop > 0 && scrollTop < MaxScrollTop) {
                        scrollDeltaY = 0
                        translateY = 0
                        return
                    }

                    // 已到边界，进入橡胶带逻辑
                    if (scrollTop <= 0) {
                        // 顶部边界
                        if (event.wheelDeltaY > 0) {
                            // 上滚 → 继续往上拉（负）
                            scrollDeltaY -= event.wheelDeltaY
                            scrollDeltaY = Math.max(
                                scrollDeltaY,
                                -refEl.overscroll.before_y.offsetHeight,
                            )
                            event.preventDefault()
                        } else {
                            // 下滚 → 往回滚，带吸附
                            if (scrollDeltaY < 0) {
                                event.preventDefault()
                                if (scrollDeltaY > event.wheelDeltaY) {
                                    // 吸附
                                    scrollDeltaY = 0
                                } else {
                                    scrollDeltaY -= event.wheelDeltaY
                                    scrollDeltaY = Math.min(scrollDeltaY, 0)
                                }
                            }
                        }
                    } else {
                        // 底部边界（必然是这里）
                        if (event.wheelDeltaY > 0) {
                            // 上滚 → 往回滚，带吸附
                            if (scrollDeltaY > 0) {
                                event.preventDefault()
                                if (scrollDeltaY < event.wheelDeltaY) {
                                    scrollDeltaY = 0
                                } else {
                                    scrollDeltaY -= event.wheelDeltaY
                                    scrollDeltaY = Math.max(scrollDeltaY, 0)
                                }
                            }
                        } else {
                            // 下滚 → 继续往下拉（正）
                            scrollDeltaY -= event.wheelDeltaY // wheelDeltaY < 0 → 正值
                            scrollDeltaY = Math.min(
                                scrollDeltaY,
                                refEl.overscroll.after_y.offsetHeight,
                            )
                            event.preventDefault()
                        }
                    }

                    translateY = (scrollTop + scrollDeltaY) * -1
                }

                refEl.scroll_content.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`

                refEl.overscroll.before_x.style.transform = `translate3d(-100%, ${scrollTop + scrollDeltaY}px, 0)`
                refEl.overscroll.after_x.style.transform = `translate3d(100%, ${scrollTop + scrollDeltaY}px, 0)`
                refEl.overscroll.before_y.style.transform = `translate3d(${scrollLeft + scrollDeltaX}px, -100%, 0)`
                refEl.overscroll.after_y.style.transform = `translate3d(${scrollLeft + scrollDeltaX}px, 100%, 0)`
            },
            { passive: false },
        )

        refEl.scroll_box.addEventListener('scroll', () => {
            // console.log('scroll')

            const { scrollLeft, scrollTop } = refEl.scroll_box
            // refEl.scroll_content.style.transform = `translate3d(${-scrollLeft}px, ${-scrollTop}px, 0)`
            translateX = (scrollLeft + scrollDeltaX) * -1
            translateY = (scrollTop + scrollDeltaY) * -1
            refEl.scroll_content.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`
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
            refEl.overscroll.before_x.style.transform = `translate3d(-100%, ${scrollTop + scrollDeltaY}px, 0)`
            refEl.overscroll.after_x.style.transform = `translate3d(100%, ${scrollTop + scrollDeltaY}px, 0)`
            refEl.overscroll.before_y.style.transform = `translate3d(${scrollLeft + scrollDeltaX}px, -100%, 0)`
            refEl.overscroll.after_y.style.transform = `translate3d(${scrollLeft + scrollDeltaX}px, 100%, 0)`
        })

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
            refEl.overscroll.before_x.style.height = refEl.scroll_box.offsetHeight + 'px'
            refEl.overscroll.after_x.style.height = refEl.scroll_box.offsetHeight + 'px'
            refEl.overscroll.before_y.style.width = refEl.scroll_box.offsetWidth + 'px'
            refEl.overscroll.after_y.style.width = refEl.scroll_box.offsetWidth + 'px'
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
        refEl.scroll_box._sizeObserver = observer
    },
    beforeUnmount(el) {
        const refEl = el._refEl
        if (el._handleWheel) {
            refEl.scroll_box.removeEventListener('scroll', el._handleScroll)
            delete el._handleScroll
        }
        if (el._sizeObserver) {
            el._sizeObserver.unobserve(el)
            el._sizeObserver.disconnect()
            delete el._sizeObserver
        }
    },
}
