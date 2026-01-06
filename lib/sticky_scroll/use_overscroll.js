export default function useOverscroll(refEl, refElTransform) {
    const timer = {
        x: null,
        y: null,
    }

    const scrollDelta = {
        x: 0,
        y: 0,
    }

    const updateTime = (scroll) => {
        if (timer[scroll]) clearTimeout(timer[scroll])
        timer[scroll] = setTimeout(() => {
            scrollDelta[scroll] = 0
            refElTransform()
        }, 2000)
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
            // 前过界 → 消耗或吸附
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

    const overX = (event, scrollLeft) => {
        if (scrollLeft <= 0) {
            // 左边界
            overBefore(event, event.deltaY, 'x', refEl.overscroll.before_x.offsetWidth)
        } else {
            // 右边界
            overAfter(event, event.deltaY, 'x', refEl.overscroll.after_x.offsetWidth)
        }

        updateTime('x')
    }
    const overY = (event, scrollTop) => {
        if (scrollTop <= 0) {
            // 上边界
            overBefore(event, event.deltaY, 'y', refEl.overscroll.before_y.offsetHeight)
        } else {
            // 下边界
            overAfter(event, event.deltaY, 'y', refEl.overscroll.after_y.offsetHeight)
        }
        updateTime('y')
    }

    return {
        updateTime,
        mouseenter,
        mouseleave,
        scrollDelta,
        overX,
        overY,
    }
}
