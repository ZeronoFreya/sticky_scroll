export default function useOverscroll(refEl, refElTransform, loading) {
    const timer = {
        x: null,
        y: null,
    }

    const scrollDelta = {
        x: 0,
        y: 0,
    }

    const resetTime = (scroll) => {
        if (scrollDelta[scroll] == 0) return
        if (timer[scroll]) clearTimeout(timer[scroll])
        timer[scroll] = setTimeout(() => {
            scrollDelta[scroll] = 0
            refElTransform()
        }, 2000)
    }

    const clearTime = (scroll = '') => {
        if (scroll) {
            if (timer[scroll]) clearTimeout(timer[scroll])
        } else {
            if (timer.x) clearTimeout(timer.x)
            if (timer.y) clearTimeout(timer.y)
        }
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

    const overBefore = (event, delta, scroll, maxOver) => {
        if (delta < 0) {
            // 前过界 → 继续拉伸（负）
            scrollDelta[scroll] += delta
            scrollDelta[scroll] = Math.max(scrollDelta[scroll], -maxOver)
            event.preventDefault()
        } else {
            // 后过界 → 消耗或吸附
            if (scrollDelta[scroll] < 0) {
                // 只有已经拉伸了才处理
                event.preventDefault()
                if (-scrollDelta[scroll] < delta) {
                    // 可滚动空间不足delta
                    scrollDelta[scroll] = 0
                } else {
                    scrollDelta[scroll] += delta // delta 为正
                    scrollDelta[scroll] = Math.min(scrollDelta[scroll], 0)
                }
            }
        }
    }
    const overAfter = (event, delta, scroll, maxOver) => {
        if (delta < 0) {
            // 后过界 → 消耗或吸附
            if (scrollDelta[scroll] > 0) {
                event.preventDefault()
                if (scrollDelta[scroll] < -delta) {
                    scrollDelta[scroll] = 0
                } else {
                    scrollDelta[scroll] += delta
                    scrollDelta[scroll] = Math.max(scrollDelta[scroll], 0)
                }
            }
        } else {
            // 右过界 → 继续拉伸（正）
            scrollDelta[scroll] += delta
            scrollDelta[scroll] = Math.min(scrollDelta[scroll], maxOver)
            event.preventDefault()
        }
    }

    const overX = (event) => {
        const scrollLeft = refEl.scroll_box.scrollLeft
        const isLoading = loading.x.status
        if (scrollLeft <= 0) {
            // 左边界
            if (refEl.overscroll.before_x) {
                overBefore(event, event.deltaY, 'x', refEl.overscroll.before_x.offsetWidth)
                resetTime('x')
            }
        } else if (refEl.overscroll.after_x) {
            // 右边界
            const offW = isLoading
                ? refEl.overscroll.load_x?.offsetWidth
                : refEl.overscroll.after_x?.offsetWidth

            if (offW) {
                overAfter(event, event.deltaY, 'x', offW)
                if (!isLoading) {
                    resetTime('x')
                }
            }
        }
    }
    const overY = (event) => {
        const scrollTop = refEl.scroll_box.scrollTop
        const isLoading = loading.y.status
        if (scrollTop <= 0) {
            // 上边界
            if (refEl.overscroll.before_y) {
                overBefore(event, event.deltaY, 'y', refEl.overscroll.before_y.offsetHeight)
                resetTime('y')
            }
        } else {
            // 下边界
            const offH = isLoading
                ? refEl.overscroll.load_y?.offsetHeight
                : refEl.overscroll.after_y?.offsetHeight

            if (offH) {
                overAfter(event, event.deltaY, 'y', offH)
                if (!isLoading) {
                    resetTime('y')
                }
            }
        }
    }

    return {
        resetTime,
        clearTime,
        mouseenter,
        mouseleave,
        scrollDelta,
        overX,
        overY,
    }
}
