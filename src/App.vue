<template>
    <div id="app">
        <my-header></my-header>
        <tab></tab>
        <!-- <div class="no-drag">不要扯啦！到顶啦！</div> -->
        <keep-alive>
            <router-view></router-view>
        </keep-alive>
        <player></player> 
    </div>
</template>

<script tyep="text/ecmascript-6">
import myHeader from 'components/my-header/my-header.vue'
import Tab from 'components/tab/tab'
import player from 'components/player/player'
export default {
    name: 'app',        
    methods: {
    },
    components: {
        myHeader,Tab,player
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import './common/stylus/variable'
    .no-drag
        color: $color-text-d
        font-size $font-size-small
        text-align center
        padding-top 30px
</style>
