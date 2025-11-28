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
        //- div.x(v-scroll="{scroll:'x'}")
        //-     li(v-for="i in liData", :key="i")
        //-         .content {{i}}
        StickyScroll.x(scroll="x")
            .xxxx
                li(v-for="i in liData", :key="i")
                    .content {{i}}
    .scroll_y
        //- div.y(v-scroll="{scroll:'y'}")
        //-     li(v-for="i in liData", :key="i")
        //-         .content {{i}}
        StickyScroll.y(scroll="y")
            .yyyy
                li(v-for="i in liData", :key="i")
                    .content {{i}}
    .scroll_xy
        //- div.xy(v-scroll="{scroll:'xy'}")
        //-     li(v-for="i in liData", :key="i")
        //-         .content {{i}}
        StickyScroll.xy(scroll="xy")
            .xyxy
                li(v-for="i in liData", :key="i")
                    .content {{i}}
            template(v-slot:before_y)
                .before_y before_y
            template(v-slot:after_y)
                .after_y after_y
</template>

<style lang="scss">
.xy {
    padding: 15px;
}
.xxxx {
    display: flex;
}
.xyxy {
    // padding: 5px;
    // background: white;
    li {
        width: 100vw;
    }
}
.scroll_box {
    border-radius: 12px;
}
.before_y,
.after_y {
    width: 60%;
    height: 100px;
    background: red;
    border-radius: 12px;
}
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
        height: fit-content;
        grid-area: a;
        background: gold;
        border-radius: 10px;
        li {
            width: 100px;
            padding: 0 5px;
        }
        .x {
            padding: 15px;
        }
    }
    .scroll_y {
        min-width: 0;
        width: 40vw;
        height: 50vh;
        grid-area: b;
        background: gold;
        border-radius: 10px;
        .y {
            padding: 15px;
        }
    }
    .scroll_xy {
        min-width: 0;
        width: 40vw;
        height: 50vh;
        grid-area: c;
        background: gold;
        border-radius: 10px;
    }
    li {
        // width: 100%;
        padding: 5px 0px;
        white-space: nowrap;
        list-style: none;

        .content {
            padding: 5px;
            border-radius: 5px;
        }
    }
}
</style>
