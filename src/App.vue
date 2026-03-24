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
        h1 props:
        .table
            .row.head
                .col.props_name 属性
                .col.props_type 类型
                .col.props_def 默认
                .col.props_desc 说明
            .row
                .col.props_name scroll
                .col.props_type String
                .col.props_def xy
                .col.props_desc 
                    p 有效值: x､ y､ xy
            .row
                .col.props_name radius
                .col.props_type String
                .col.props_def 
                .col.props_desc 
                    p 滚动节点圆角
            .row
                .col.props_name theme
                .col.props_type String
                .col.props_def default
                .col.props_desc 
                    p 主题类名, 需要配合css使用
            .row
                .col.props_name minW, minH
                .col.props_type String
                .col.props_def 0px
                .col.props_desc 
                    p 最小宽高
            .row
                .col.props_name maxW, maxH
                .col.props_type String
                .col.props_def 100%
                .col.props_desc 
                    p 最大宽高
            .row
                .col.props_name autoH
                .col.props_type Boolean
                .col.props_def false
                .col.props_desc 
                    p 自适应高度
            .row
                .col.props_name out
                .col.props_type Boolean
                .col.props_def true
                .col.props_desc 
                    p 滚动条偏移到框架外部
            .row
                .col.props_name reverseX, reverseY
                .col.props_type Boolean
                .col.props_def false
                .col.props_desc 
                    p 反转滚动条位置
            .row
                .col.props_name offsetX, offsetY
                .col.props_type String
                .col.props_def 0px
                .col.props_desc 
                    p 调整滚动条的位置
                    p 例如: offsetX: 10px, 水平滚动条向下偏移10px
            .row
                .col.props_name customScrollBar
                .col.props_type Boolean
                .col.props_def false
                .col.props_desc 
                    p 自定义滚动条
            .row
                .col.props_name overscrollX, overscrollY
                .col.props_type Boolean
                .col.props_def false
                .col.props_desc 
                    p 显示过界
            .row
                .col.props_name loadThresholdX, loadThresholdY
                .col.props_type Number
                .col.props_def -1
                .col.props_desc 
                    p 加载阈值, -1代表不使用触底加载
            .row
                .col.props_name teleportX, teleportY
                .col.props_type String
                .col.props_def body
                .col.props_desc 
                    p 变更滚动条的位置
        h1 emit:
        .table
            .row.head
                .col.emit_name 事件
                .col.emit_args 参数
                .col.emit_desc 说明
            .row
                .col.emit_name scroll_resize
                .col.emit_args 
                    pre { 
                        |
                        |    offsetWidth,
                        |    offsetHeight,
                        |    scrollWidth,
                        |    scrollHeight
                        |}
                .col.emit_desc 
                    p 滚动区域尺寸发生变化, 仅在customScrollBar为true时触发
            .row
                .col.emit_name scroll_move
                .col.emit_args 
                    pre { 
                        |
                        |    scrollLeft, 
                        |    scrollTop, 
                        |    scrollWidth, 
                        |    scrollHeight
                        |}
                .col.emit_desc 
                    p scroll事件, 仅在customScrollBar为true时触发
            .row
                .col.emit_name loadmoreX, loadmoreY
                .col.emit_args 
                .col.emit_desc 
                    p 滚动到底部, 仅在 loadThreshold != -1 时触发
        h1 expose:
        .table
            .row.head
                .col.expose_name 方法
                .col.expose_desc 说明
            .row
                .col.expose_name scroll( val_x, val_y )
                .col.expose_desc 
                    p 同时滚动 x 和 y 轴
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
    background: #2f3130;
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
    border-radius: 15px;
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
            font-size: 24px;
            line-height: 1.6;
            &.expose_name {
                flex: 0 0 auto;
                width: 400px;
            }
        }
        .props_name {
            flex: 0 0 auto;
            width: 400px;
        }
        .props_type,
        .props_def {
            flex: 0 0 auto;
            width: 160px;
        }
    }
}
.mb10 {
    margin-bottom: 10px;
}
.mb_big {
    margin-bottom: 60px;
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
    background: #6c2c2d;
    border-radius: 12px;
    padding: 5px 15px;

    .content {
        width: 100vw;
        height: 100%;
        line-height: 30px;

        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}
</style>
