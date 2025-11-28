import { nextTick } from 'vue'

export default function useScrollContent(refEl) {
    // 追加 overscroll 结构
    const appendOverscroll = (targetEl) => {
        if (!targetEl) return

        const keys = ['before', 'after']
        keys.forEach((key) => {
            if (!targetEl.querySelector(`.overscroll_${key}_x`)) {
                const div = document.createElement('div')
                div.className = `overscroll_${key}_x`
                div.dataset.scroll = 'x'
                div.innerHTML = `<div class="overscroll_sticky_${key}_x"></div>`
                targetEl.appendChild(div)

                refEl.overscroll[key + '_x'] = div
            }
        })
    }

    // 清理上次残留
    const clearPrevious = () => {
        const anchor = refEl.sticky_anchor
        if (!anchor) return

        // 移除所有 scroll_content 类
        anchor.querySelectorAll('.scroll_content').forEach((el) => {
            el.classList.remove('scroll_content')
        })

        // 清理旧 ref
        delete refEl.scroll_content
        delete refEl.overscroll['before_x']
        delete refEl.overscroll['after_x']
    }
    async function handleSlot() {
        // await nextTick()
        // // 获取所有有效的子节点（过滤注释和空白文本）
        // const validChildren = Array.from(anchor.childNodes).filter((node) => {
        //     if (node.nodeType === Node.COMMENT_NODE) return false
        //     if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') return false
        //     return true
        // })
        // if (validChildren.length === 1) {
        // }
    }
    async function handleSlot2() {
        await nextTick() // 确保 slot 已渲染到 DOM

        const anchor = refEl.sticky_anchor
        if (!anchor) return

        clearPrevious()

        // 获取所有有效的子节点（过滤注释和空白文本）
        const validChildren = Array.from(anchor.childNodes).filter((node) => {
            if (node.nodeType === Node.COMMENT_NODE) return false
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') return false
            return true
        })

        if (validChildren.length === 1) {
            // 单节点：直接在原节点上加类 + 追加 overscroll
            const node = validChildren[0]
            if (node.nodeType === Node.ELEMENT_NODE) {
                node.classList.add('scroll_content')
                refEl.scroll_content = node
                appendOverscroll(node)
            }
        } else if (validChildren.length > 1) {
            // 多节点：创建 wrapper 包裹所有内容
            const wrapper = document.createElement('div')
            wrapper.className = 'scroll_content'
            refEl.scroll_content = wrapper

            validChildren.forEach((child) => wrapper.appendChild(child))
            appendOverscroll(wrapper)
            anchor.appendChild(wrapper)
        }
    }
    return {
        handleSlot,
    }
}
