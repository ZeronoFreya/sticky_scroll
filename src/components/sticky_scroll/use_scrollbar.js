export default function useScrollbar(refEl, signal, scrollDelta, updateTime, refElTransform) {
    let math_temp = 0
    let thumb_mouse_offset = 0

    const track_move = (e) => {
        const scroll = e.currentTarget.dataset.scroll
        const scrollPos = scroll == 'x' ? 'scrollLeft' : 'scrollTop'
        let offset = (scroll == 'x' ? e.offsetX : e.offsetY) - thumb_mouse_offset

        let s = Math.round(offset * math_temp)

        const { offsetWidth, offsetHeight } = refEl.scroll_box
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
            updateTime('x')
        }
        if (scrollDelta.y != 0) {
            updateTime('y')
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
    }
}
