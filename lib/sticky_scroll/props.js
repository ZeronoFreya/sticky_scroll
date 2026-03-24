export default {
    scroll: {
        // 滚动方式
        type: String,
        default: 'xy', // x, y, xy
    },
    radius: {
        // 滚动节点圆角,
        type: String,
        default: '',
    },
    minW: {
        // 最小宽度,
        type: String,
        default: '0px',
    },
    minH: {
        // 最小高度,
        type: String,
        default: '0px',
    },
    maxW: {
        // 最大宽度,
        type: String,
        default: '100%',
    },
    maxH: {
        // 最大高度,
        type: String,
        default: '100%',
    },
    theme: {
        // 主题类名, 需要配合css使用
        type: String,
        default: '',
    },
    autoH: {
        // 自适应高度
        type: Boolean,
        default: false,
    },
    out: {
        // 滚动条偏移到框架外部
        type: Boolean,
        default: true,
    },
    reverseX: {
        // 水平滚动条的位置设置在顶部
        type: Boolean,
        default: false,
    },
    reverseY: {
        // 垂直滚动条的位置设置在左侧
        type: Boolean,
        default: false,
    },
    offsetX: {
        // 上下调整水平滚动条的位置
        type: String,
        default: '0px',
    },
    offsetY: {
        // 左右调整垂直滚动条的位置
        type: String,
        default: '0px',
    },
    customScrollBar: {
        // 自定义滚动条
        type: Boolean,
        default: false,
    },
    overscrollX: {
        // 显示水平过界
        type: Boolean,
        default: false,
    },
    overscrollY: {
        // 显示垂直过界
        type: Boolean,
        default: false,
    },
    loadThresholdX: {
        // 加载阈值, -1代表不使用触底加载
        type: Number,
        default: -1,
    },
    loadThresholdY: {
        // 加载阈值, -1代表不使用触底加载
        type: Number,
        default: -1,
    },
    teleportX: {
        // 变更水平滚动条的位置
        type: String,
        default: 'body',
    },
    teleportY: {
        // 变更垂直滚动条的位置
        type: String,
        default: 'body',
    },
}
