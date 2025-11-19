// main.js 注册为 scroll
// div(v-show="isVisible" v-scroll="{ onShow: handleShow, onHide: handleHide }")
import { reactive, watch } from 'vue'

function activeScrollBar({
    scrollBar, // 滚动条的节点
    scrollPanel, // 滚动区域的节点, 一般是具有 overflow 的元素
    scroll = 'y', // 滚动方向, x 或 y
} = {}) {
    // 滑道
    const track = document.createElement('div')
    // 滑块
    const thumb = document.createElement('div')

    track.appendChild(thumb)
    scrollBar.appendChild(track)

    track.classList.add('track_' + scroll)
    thumb.classList.add('thumb_' + scroll)

    thumb.innerHTML = `<div class='thumb_view_${scroll}'></div>`

    let math_temp = 0
    let thumbOffset = 0
    let thumb_mouse_offset = 0

    const offsetSize = scroll == 'x' ? 'offsetWidth' : 'offsetHeight'
    const scrollSize = scroll == 'x' ? 'scrollWidth' : 'scrollHeight'

    const scrollPos = scroll == 'x' ? 'scrollLeft' : 'scrollTop'

    const pointermove = (e) => {
        let offset = (scroll == 'x' ? e.offsetX : e.offsetY) - thumb_mouse_offset
        scrollPanel[scrollPos] = Math.round(offset * math_temp)
    }
    const pointerup = () => {
        math_temp = 0
        thumb_mouse_offset = 0
        track.removeEventListener('pointermove', pointermove)
        track.removeEventListener('pointerup', pointerup)
    }

    track.addEventListener(
        'pointerdown',
        (e) => {
            let offset = scroll == 'x' ? e.offsetX : e.offsetY
            math_temp = scrollPanel[scrollSize] / track[offsetSize]

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

function buildBaseDom(scroll, el) {
    // const smoothScroll = document.createElement('div')
    // smoothScroll.classList.add('smooth_scroll')
    const containerBody = document.createElement('div')
    containerBody.classList.add('container_body')
    if (scroll == 'x') {
        containerBody.classList.add('x_mode')
    }
    containerBody.style.width = `fit-content`
    containerBody.style.height = `fit-content`
    containerBody.append(...el.childNodes)
    // smoothScroll.appendChild(containerBody)

    const stickyBox = document.createElement('div')
    stickyBox.classList.add('sticky_box')
    stickyBox.appendChild(containerBody)
    el.appendChild(stickyBox)
    // el.appendChild(smoothScroll)

    return {
        // smoothScroll,
        containerBody,
        stickyBox,
    }
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
            
            .container_body{
                position: sticky;
                top: 0px;
                left: 0px;
                z-index: 1;
                min-width: 100%;
                transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1)
            }
            .container_body.x_mode{
                display: flex;
                width: fit-content;
                height: 100%;
            }
            .sticky_box{
                width:100%;
                height:0px;
                position:sticky;
                top:0px;
                left:0px;
                z-index: 9;
            }
            .scrollbar_x, .scrollbar_y{
                display: none;
                position: absolute;
                z-index: 2;
            }
            .scrollbar_x{
                width: 100%;
                bottom: 0px;
                left: 0px;
                padding: 0 15px;
            }
            .scrollbar_y{
                height: 100%;
                top: 0px;
                right: 0px;
                padding: 15px 0;
            }
            .track_x, .track_y{
                position: relative;
                height: 16px;
                width: 16px;
                transition: background 0.2s ease;
            }
            .track_x{
                bottom: 0px;
                left: 0px;
                width: 100%;
                border-radius: 8px 8px 0 0;
            }
            .track_y{
                top: 0px;
                right: 0px;
                height: 100%;
                border-radius: 8px 0 0 8px;
            }
            .track_x:hover, .track_y:hover{
                background: rgba(0,0,0, 0.6);
            }
            .track_x:hover .thumb_view_x{
                height: 100%;
            }
            .track_y:hover .thumb_view_y{
                width: 100%;
            }
            .thumb_x, .thumb_y{
                display: flex;
                padding: 4px;
                position: absolute;
                top: 0px;
                left: 0px;
                transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1);
            }
            .thumb_x{
                height: 100%;
                align-items: flex-end;
            }
            .thumb_y{
                width: 100%;
                justify-content: flex-end;
            }
            .placeholder_x, .placeholder_y{
                width:0px;
                height:0px;
                pointer-events:none;
            }
            .thumb_view_x, .thumb_view_y{
                pointer-events: none;
                border-radius: 8px;
                background: #9f9f9f;
                transition: all 0.2s ease;
            }
            .thumb_view_x {
                height: 50%;
                width: 100%;
            }
            .thumb_view_y {
                width: 50%;
                height: 100%;
            }
            `
            // 追加到 head
            document.head.appendChild(styleEl)
        }
        el.classList.add('sticky_hide_default_scrollbar')
    },
    mounted(el, binding) {
        // const callbacks = binding.value || {} // { onShow: fn, onHide: fn }
        const { scroll = 'y' } = binding.value || {}

        const SW = 16 // 滚动条的宽度

        const computedStyle = window.getComputedStyle(el)
        if (computedStyle.position == 'static') {
            el.style.position = 'relative'
        }
        const PL = parseInt(computedStyle.paddingLeft)
        const PT = parseInt(computedStyle.paddingTop)
        // console.log(paddingLeft, paddingTop)

        const { stickyBox, containerBody } = buildBaseDom(scroll, el)

        const scrollBar = reactive({
            x: false,
            y: false,
            xw: 0,
            yh: 0,
            elx: null,
            ely: null,
            trackx: null,
            tracky: null,
            thumbx: null,
            thumby: null,
        })

        const placeholderLine = {
            elx: null,
            ely: null,
        }

        el.style.overflow = 'hidden'
        if (scroll.includes('x')) {
            el.style.overflowX = 'auto'
            scrollBar.elx = document.createElement('div')
            scrollBar.elx.classList.add('scrollbar_x')
            // scrollBar.elx.style.bottom = -el.offsetHeight + 'px'
            // scrollBar.elx.style.bottom = `${PT * -1}px`
            scrollBar.elx.style.height = `${SW}px`
            scrollBar.elx.style.top = `${el.offsetHeight - PT - SW}px`
            scrollBar.elx.style.left = `${PL * -1}px`
            stickyBox.appendChild(scrollBar.elx)
            placeholderLine.elx = document.createElement('div')
            placeholderLine.elx.classList.add('placeholder_x')
            el.appendChild(placeholderLine.elx)
        }
        if (scroll.includes('y')) {
            el.style.overflowY = 'auto'
            scrollBar.ely = document.createElement('div')
            scrollBar.ely.classList.add('scrollbar_y')
            // scrollBar.ely.style.right = -el.offsetWidth + 'px'
            scrollBar.ely.style.width = `${SW}px`
            scrollBar.ely.style.top = `${PT * -1}px`
            scrollBar.ely.style.right = `${PL * -1}px`
            stickyBox.appendChild(scrollBar.ely)
            placeholderLine.ely = document.createElement('div')
            placeholderLine.ely.classList.add('placeholder_y')
            el.appendChild(placeholderLine.ely)
        }

        // 滚轮水平滚动
        if (scroll == 'x') {
            const handleWheel = (event) => {
                event.preventDefault() // 阻止默认垂直滚动

                const delta = event.deltaY || event.deltaX // 优先垂直滚轮用于水平，deltaX 为自然水平滚轮
                const scrollAmount = delta * 1 // 滚动步长，可调整（像素单位）

                el.scrollLeft += scrollAmount
            }
            el.addEventListener('wheel', handleWheel, { passive: false })
        }

        // let ticking = false
        el.addEventListener(
            'scroll',
            ({ currentTarget }) => {
                // console.log(currentTarget)
                // if (!ticking) {
                //     window.requestAnimationFrame(() => {
                //         smoothScroll.style.transform = `translate3d(${-currentTarget.scrollLeft}px, ${-currentTarget.scrollTop}px, 0)`
                //         ticking = false
                //     })
                //     ticking = true
                // }

                const { scrollLeft, scrollTop, scrollHeight, scrollWidth } = currentTarget
                containerBody.style.transform = `translate3d(${-scrollLeft}px, ${-scrollTop}px, 0)`

                if (scrollBar.thumbx && scroll.includes('x')) {
                    scrollBar.thumbx.style.transform = `translateX(${(scrollBar.trackx.offsetWidth * scrollLeft) / scrollWidth}px)`
                }
                if (scrollBar.thumby && scroll.includes('y')) {
                    scrollBar.thumby.style.transform = `translateY(${(scrollBar.tracky.offsetHeight * scrollTop) / scrollHeight}px)`
                }
            },
            false,
        )

        const resize = () => {
            const { offsetWidth, offsetHeight } = containerBody

            if (scroll.includes('x')) {
                placeholderLine.elx.style.width = offsetWidth + 'px'
                scrollBar.x = offsetWidth > el.offsetWidth ? true : false
                scrollBar.elx.style.top = `${el.offsetHeight - PT - SW}px`
                // scrollBar.elx.style.bottom = -el.offsetHeight + 'px'
                scrollBar.elx.style.width = el.offsetWidth + 'px'
                if (scrollBar.thumbx) {
                    scrollBar.thumbx.style.width =
                        (scrollBar.trackx.offsetWidth * el.offsetWidth) / el.scrollWidth + 'px'
                }
            }
            if (scroll.includes('y')) {
                placeholderLine.ely.style.height = offsetHeight + 'px'
                scrollBar.y = offsetHeight > el.offsetHeight ? true : false
                // scrollBar.ely.style.right = '-15px'
                scrollBar.ely.style.top = `${PT * -1}px`
                scrollBar.ely.style.right = `${PL * -1}px`
                // scrollBar.ely.style.right = -el.offsetWidth + 'px'
                scrollBar.ely.style.height = el.offsetHeight + 'px'
                if (scrollBar.thumby) {
                    scrollBar.thumby.style.height =
                        (scrollBar.tracky.offsetHeight * el.offsetHeight) / el.scrollHeight + 'px'
                }
            }
        }

        watch(scrollBar, () => {
            if (scrollBar.elx) {
                if (scrollBar.x) {
                    if (!scrollBar.trackx || !scrollBar.thumbx) {
                        const { track, thumb } = activeScrollBar({
                            scrollBar: scrollBar.elx,
                            scrollPanel: el,
                            scroll: 'x',
                        })
                        scrollBar.trackx = track
                        scrollBar.thumbx = thumb
                    }
                    const track = scrollBar.trackx
                    const thumb = scrollBar.thumbx

                    scrollBar.elx.style.width = el.offsetWidth + 'px'

                    thumb.style.width = (track.offsetWidth * el.offsetWidth) / el.scrollWidth + 'px'

                    scrollBar.elx.style.display = 'block'
                } else {
                    scrollBar.elx.style.display = 'none'
                }
            }
            if (scrollBar.ely) {
                if (scrollBar.y) {
                    if (!scrollBar.tracky || !scrollBar.thumby) {
                        const { track, thumb } = activeScrollBar({
                            scrollBar: scrollBar.ely,
                            scrollPanel: el,
                            scroll: 'y',
                        })
                        scrollBar.tracky = track
                        scrollBar.thumby = thumb
                    }
                    const track = scrollBar.tracky
                    const thumb = scrollBar.thumby

                    scrollBar.ely.style.height = el.offsetHeight + 'px'

                    thumb.style.height =
                        (track.offsetHeight * el.offsetHeight) / el.scrollHeight + 'px'
                    // track.style.height = offsetSize + 'px'

                    scrollBar.ely.style.display = 'block'
                } else {
                    scrollBar.ely.style.display = 'none'
                }
            }
        })

        const options = {
            box: 'border-box', // 确保 CSS 计算尺寸时包括边框和内边距
        }
        let animationFrameId = null
        const observer = new ResizeObserver((entries) => {
            cancelAnimationFrame(animationFrameId)
            animationFrameId = requestAnimationFrame(() => resize())
        })
        observer.observe(el, options)
        observer.observe(containerBody, options)
        el._containerBody = containerBody
        el._sizeObserver = observer
    },
    beforeUnmount(el) {
        if (el._sizeObserver) {
            el._sizeObserver.unobserve(el)
            el._sizeObserver.unobserve(el._containerBody)
            el._sizeObserver.disconnect()
            delete el._sizeObserver
        }
    },
}
