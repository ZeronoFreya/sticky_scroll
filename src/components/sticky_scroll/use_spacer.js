import { nextTick } from 'vue'

export default function useSpacer(refEl, scroll) {
    function spacerDom() {
        refEl.scroll_box.style.overflow = 'hidden'
        // refEl.scroll_box.classList.add('scroll_box', 'sticky_hide_default_scrollbar')
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
    return { spacerDom }
}
