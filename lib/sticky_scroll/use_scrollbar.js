export default function useScrollbar(
    refEl,
    signal,
    scrollDelta,
    resetTime,
    refElTransform,
    loading,
) {
    let math_temp = 0
    let thumb_mouse_offset = 0

    const scroll_to = (scroll, val) => {
        const { offsetWidth, offsetHeight } = refEl.scroll_box
        const { offsetWidth: scrollWidth, offsetHeight: scrollHeight } = refEl.scroll_content

        const scrollPos = scroll == 'x' ? 'scrollLeft' : 'scrollTop'
        const MaxScroll = scroll == 'x' ? scrollWidth - offsetWidth : scrollHeight - offsetHeight

        if (val < 0) {
            refEl.scroll_box[scrollPos] = 0
        } else if (val > MaxScroll) {
            refEl.scroll_box[scrollPos] = MaxScroll
            val -= MaxScroll
        } else {
            scrollDelta.x = 0
            scrollDelta.y = 0
            refEl.scroll_box[scrollPos] = val
            return
        }

        if (scroll == 'x') {
            if (val < 0) {
                if (refEl.overscroll.before_x) {
                    scrollDelta.x = Math.max(val, -refEl.overscroll.before_x.offsetWidth)
                } else {
                    scrollDelta.x = 0
                }
            } else {
                const offW = loading.y.status
                    ? refEl.overscroll.load_x?.offsetWidth
                    : refEl.overscroll.after_x?.offsetWidth
                if (offW) {
                    scrollDelta.x = Math.min(val, offW)
                }
            }
        } else {
            if (val < 0) {
                if (refEl.overscroll.before_y) {
                    scrollDelta.y = Math.max(val, -refEl.overscroll.before_y.offsetHeight)
                } else {
                    scrollDelta.y = 0
                }
            } else {
                const offH = loading.y.status
                    ? refEl.overscroll.load_y?.offsetHeight
                    : refEl.overscroll.after_y?.offsetHeight
                if (offH) {
                    scrollDelta.y = Math.min(val, offH)
                }
            }
        }

        refElTransform()
    }

    const track_move = (e) => {
        const scroll = e.currentTarget.dataset.scroll
        const offset = (scroll == 'x' ? e.offsetX : e.offsetY) - thumb_mouse_offset
        scroll_to(scroll, Math.round(offset * math_temp))
    }

    const track_up = (e) => {
        const scroll = e.currentTarget.dataset.scroll
        const track = e.currentTarget
        track.classList.remove('ss_track_down')
        math_temp = 0
        thumb_mouse_offset = 0
        track.removeEventListener('pointermove', track_move)
        track.removeEventListener('pointerup', track_up)

        resetTime(scroll)
    }

    const track_down = (e) => {
        const track = e.currentTarget
        track.classList.add('ss_track_down')
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
        } else {
            // 在 track 拖拽: 使用 thumb 的中心
            thumb_mouse_offset = thumb[offsetSize] / 2
            offset -= thumb_mouse_offset
            refEl.scroll_box[scrollPos] = Math.round(offset * math_temp)
        }

        track.addEventListener('pointerup', track_up, { signal })
        track.addEventListener('pointermove', track_move, { signal })
        track.setPointerCapture(e.pointerId)
    }
    return {
        track_down,
        scroll_to,
    }
}
