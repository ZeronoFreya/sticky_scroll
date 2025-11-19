<script>
import { ref, reactive, provide, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

export default {
    components: {},
    //   props: {
    //     data: {
    //       type: Object,
    //       required: true,
    //     },
    //   },
    setup() {
        const slotEl = ref(null)
        const contentEl = ref(null)

        const scrollData = reactive({
            scrollLeft: 0,
            scrollTop: 0,
            offsetWidth: 0,
            offsetHeight: 0,
            scrollWidth: 0,
            scrollHeight: 0,
        })
        provide('scroll-data', scrollData)

        let animationFrameIdScroll = null

        const onScroll = ({ currentTarget }) => {
            cancelAnimationFrame(animationFrameIdScroll)
            animationFrameIdScroll = requestAnimationFrame(() => {
                scrollData.scrollLeft = currentTarget.scrollLeft
                scrollData.scrollTop = currentTarget.scrollTop
                contentEl.value.style.transform = `translate3d(${-scrollData.scrollLeft}px, ${-scrollData.scrollTop}px, 0)`
            })
        }

        // onMounted(() => {
        //   slotEl
        // })

        return {
            slotEl,
            contentEl,
            onScroll,
        }
    },
}
</script>

<template lang="pug">
.sticky-containter
    .sticky-scroll-group(@scroll.passive="onScroll")
        .sticky-scroll-sticky
            .sticky-scroll-content(ref="contentEl") 
                slot
        .sticky-scroll-slot(ref="slotEl")
            slot

</template>

<style lang="scss">
.sticky-containter {
    position: relative;

    .sticky-scroll-group {
        width: 100%;
        height: 100%;
        overflow: scroll;
        // position: absolute;
        // top: 0;
        // left: 0;
    }
    .sticky-scroll-slot {
        opacity: 0;
        pointer-events: none;
        // position: absolute;
        // top: 0;
        // left: 100px;
    }
    .sticky-scroll-sticky {
        position: sticky;
        top: 0;
        left: 0;
        width: 0px;
        height: 0px;
        // background-color: gold;
        z-index: 1;
    }
    .sticky-scroll-content {
        width: 100%;
        position: absolute;
        transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1);
    }
}
</style>
