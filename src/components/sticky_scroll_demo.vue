<script>
import { ref, onMounted } from 'vue'
import StickyScroll from './sticky_scroll/index.vue'

export default {
    components: { StickyScroll },
    // props: {
    //     data: {
    //         type: Object,
    //         required: true,
    //     },
    // },
    setup() {
        const liData = ref([...Array(30).keys()])

        onMounted(() => {})

        return { liData }
    },
}
</script>

<template lang="pug">
.box
    .scroll_x
        div.x(v-scroll="{scroll:'x'}")
            li(v-for="i in liData", :key="i")
                .content {{i}}
    .scroll_y
        div.y(v-scroll="{scroll:'y'}")
            li(v-for="i in liData", :key="i")
                .content {{i}}
    .scroll_xy
        div.xy(v-scroll="{scroll:'xy'}")
            li(v-for="i in liData", :key="i")
                .content {{i}}
</template>

<style lang="scss">
.box {
    width: 100vw;
    height: 100vh;
    padding: 30px;
    display: grid;
    grid-template-areas:
        'a a'
        'b c';
    gap: 30px;
    padding: 50px;
    background: #f0f0f0;
    color: black;
    overflow: hidden;
    .content {
        background: yellowgreen;
    }
    .scroll_x {
        flex: 1;
        width: 90vw;
        grid-area: a;
        background: gold;
        li {
            width: 100px;
            padding: 5px;
        }
    }
    .scroll_y {
        width: 100%;
        height: 50vh;
        grid-area: b;
        background: gold;
        li {
            width: 100%;
            padding: 5px;
        }
    }
    .scroll_xy {
        width: 100%;
        height: 50vh;
        grid-area: c;
        background: gold;
        li {
            width: 100%;
            padding: 5px;
        }
    }
}
</style>
