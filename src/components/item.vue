<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
    components: {},
    props: {
        title: {
            type: String,
            default: '',
        },
    },
    setup() {
        return {}
    },
})
</script>

<template lang="pug">
.item
    .title {{ title }}
    .content
        .preview
            slot
        .code    
            slot(name="code")
</template>

<style lang="scss" scoped>
.item {
    width: 100%;
    height: fit-content;
    color: #f0f0f0;
    // background: #282828;
    margin-bottom: 30px;
    padding: 30px;
    padding-top: 0;
    border-radius: 30px;
    .title {
        padding: 15px;
        font-size: 30px;
        text-align: center;
    }
    .content {
        display: flex;
        // justify-content: center;
        // align-items: center;
        gap: 60px;
        width: 100%;
        height: fit-content;
    }
    .preview,
    .code {
        flex: 1;
        width: 0;
        display: flex;
        flex-direction: column;
        gap: 30px;
    }
}
</style>
<style>
.sticky_scroll {
    padding: 30px;
    height: 300px;
    outline: 1px #008000 solid;
    background: #3b3e3d;
    border-radius: 30px;
}
.code pre {
    background: #282c34;
    border-radius: 30px;
    padding: 15px;
    box-shadow: 7px 7px 15px 0 #202020;
}
.btn {
    padding: 10px 15px;
    background: #008000;
    color: #fff;
    border: none;
    border-radius: 12px;
}
</style>
