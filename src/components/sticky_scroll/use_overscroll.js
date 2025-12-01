export default function useOverscroll(refEl, signal, scrollDelta, timer, refElTransform) {
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

    return {
        mouseenter,
        mouseleave,
    }
}
