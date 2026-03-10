<script>
import { ref, onMounted } from 'vue'
import StickyScroll from '../lib/sticky_scroll/index.vue'
import Base from './components/base.vue'
import AutoH from './components/auto_height.vue'
import OnlyX from './components/only_x.vue'
import OnlyY from './components/only_y.vue'
import Theme from './components/theme.vue'
import Over from './components/over.vue'
import EndLoad from './components/end_load.vue'
import CustomScroll from './components/custom_scroll.vue'

export default {
    components: { StickyScroll, Base, AutoH, OnlyX, OnlyY, Theme, Over, EndLoad, CustomScroll },
    setup() {
        return {}
    },
}
</script>

<template lang="pug">
.box
    .header.mb_big
        h3 灵感来源于 https://www.imaegoo.com/2020/h5-smooth-scroll/
        br
        h4.mb10 基础原理:
        p.mb10 使用 position: sticky 作为定位锚点, 滚动内容使用 translate3d, 以达到更好的性能和更流畅的滚动体验
        hr
        h1 暴漏的方法:
        .table
            .row.head
                .col.expose_name 方法
                .col.expose_desc 说明
            .row
                .col.expose_name scroll( val_x, val_y )
                .col.expose_desc 
                    p 同时滚动 x 和 y 轴, 暂未实现
            .row
                .col.expose_name scrollX( value )
                .col.expose_desc 
                    p 滚动到指定位置
            .row
                .col.expose_name scrollY( value )
                .col.expose_desc 
                    p 滚动到指定位置
            .row
                .col.expose_name clearLoading( scroll )
                .col.expose_desc
                    p 清除loading状态
                    p scroll: x､ y､ xy(默认)
    Base
    AutoH
    OnlyX
    OnlyY
    Theme
    Over
    EndLoad
    CustomScroll  
    .footer
        p 详细实现请参阅示例代码
</template>

<style lang="scss">
#app {
    --base_bg: #636363;
    background: #2f3130;
    // color: #f0f0f0;
}
.box {
    width: 100%;
    padding: 30px;
}
.header {
    color: #f0f0f0;
}
.footer {
    height: 20vh;
    text-align: center;
    padding: 30px;
    font-size: 24px;
    color: #f0f0f0;
}
.table {
    background: #282c34;
    border-radius: 30px;
    overflow: hidden;
    .row {
        display: flex;
        &:nth-child(odd) {
            background-color: #202020; // 奇数行颜色
        }

        &:nth-child(even) {
            background-color: #282c34; // 偶数行颜色
        }

        &.head {
            background: #666;
        }
        .col {
            flex: 1;
            width: 0;
            padding: 5px 15px;
            font-size: 30px;
            line-height: 1.6;
            &.expose_name {
                flex: 0 0 auto;
                width: 400px;
            }
        }
    }
}
.mb10 {
    margin-bottom: 10px;
}
.mb_big {
    margin-bottom: 60px;
}
.flex {
    display: flex;
    // justify-content: center;
    // align-items: center;
    gap: 30px;
    width: 100%;
}

.left,
.right {
    flex: 1;
    width: 0;
    display: flex;
    flex-direction: column;
}
.center {
    width: 60%;
    height: 100%;
    margin: 0 auto;
}

.h300 {
    height: 300px;
}
pre {
    padding: 30px;
    font-size: 26px;
}
ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 5px;
}
li {
    list-style: none;
    color: #f0f0f0;
    // height: 30px;
    background: #6c2c2d;
    border-radius: 12px;
    padding: 5px 15px;

    // background-color: #fff;
    .content {
        width: 100vw;
        height: 100%;
        line-height: 30px;

        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}
.props_group {
    display: flex;
    .props {
        width: 60px;
        flex: 0 0 auto;
    }
    textarea {
        width: 100%;
    }
}

.scroll_x {
    width: 100%;
    background: var(--base_bg);
    margin-bottom: 15px;
    border-radius: 12px;
    li {
        width: 100px;
        padding: 0 5px;
    }
}
.r12 {
    border-radius: 12px;
}
.pd5 {
    padding: 5px;
}
.x {
    padding-bottom: 15px;
}
.reverse_x {
    padding-top: 15px;
}

// .track_view {
//     background: white;
// }
// .thumb_view {
//     background: white;
// }
.scroll_y {
    width: 100%;
    height: 50vh;
    background: var(--base_bg);
    margin-bottom: 15px;
    border-radius: 12px;
    li {
        padding: 5px 0;
    }
}
.y {
    padding-right: 15px;
}
.reverse_y {
    padding-left: 15px;
}

.scroll_xy {
    height: 50vh;
    background: var(--base_bg);
    margin-bottom: 15px;
    border-radius: 12px;
    // padding: 5px;
    .xyxy {
        width: 100vw;
    }
    li {
        padding: 5px 0;
        .content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }
}
.custom_scroll_bar {
    position: relative;
    display: none;
    gap: 30px;
    // justify-content: center;
    // align-items: center;
    .sticky_scroll_bar {
        // position: absolute;
        // top: 0;
        // left: 30px;
        width: 60px;
        height: 300px;
        background-color: #636363;
        padding: 5px;
        .track_y {
            width: 100%;
            height: 100%;
        }
        .thumb_y {
            width: 100%;
            height: 0px;
            background-color: #202020;
            transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1);
        }
    }
}
</style>
