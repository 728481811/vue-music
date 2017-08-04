<template> 
    <div class="recommend" ref="recommend">
        <loading v-show="fresh" title="正在加载"></loading>
        <circle-progress class="refresh" :yPercent="yPercent" v-show="!fresh" :fresh="fresh"></circle-progress>
        <scroll ref="scroll" class="recommend-content" :data="discList" :pulldown="pulldown" @scrollToEnd="refresh" :probeType="probeType" @scrollY="scrollY"> 
            <div>
                <div v-if="recommend.length" class="slider-wrapper">
                    <slider>
                        <div v-for="item in recommend">
                            <a :href="item.linkUrl">
                                <img :src="item.picUrl" @load="loadImage" class="needsclick">
                            </a>
                        </div>
                    </slider>
                </div>
                <div class="recommend-list">
                    <h1 class="list-title">热门歌单推荐</h1>
                    <ul>
                        <li v-for="(item,index) in discList" class="item" ref="list" @click="addStyle(index,item)" @touchend="removeStyle(index)">
                            <div class="icon">
                                <img v-lazy="item.imgurl" width="60" height="60" class="load-image" lazy="loaded">
                            </div>
                            <div class="text">
                                <h2 class="name" v-html="item.creator.name"></h2>
                                <p class="desc" v-html="item.dissname"></p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="loading-container" v-show="!discList.length">
                <loading :title="title"></loading>
            </div>
        </scroll>
        <router-view></router-view>
    </div>
</template>
<script type="text/ecmascript-6">
    import loading from 'base/loading/loading'
    import Scroll from 'base/scroll/scroll'
    import slider from 'base/slider/slider'
    import circleProgress from 'base/circle-progress/circle-progress'
    import {getRecommend,getDiscList} from 'api/recommend'
    import {ERR_OK} from 'api/config'
    import {playlistMixin} from 'common/js/mixin'
    import {mapMutations} from 'vuex'
    export default{
        mixins: [playlistMixin],
        data(){
            return {
                fresh: false,
                recommend: [],
                discList: [],
                title: '正在加载...',
                pulldown: true,
                yPercent: 0              
            }
        },
        components:{
            slider,Scroll,loading,circleProgress
        },
        created() {
            this.probeType = 2
            this._getRecommend()
            this._getDiscList()
        },
        mounted() {
            
        },
        methods: {
            scrollY(y) {
                if(y <= 60) {
                    this.yPercent = y / 60
                }
            },
            refresh() {
                this.fresh = true
                this.discList = []
                getDiscList().then((res) => {
                    if(res.code === ERR_OK){
                        this.discList = res.data.list
                    }
                })
            },
            handlePlaylist(playlist) {
                const bottom = playlist.length > 0 ? '60px' : '' 
                this.$refs.recommend.style.bottom = bottom
                this.$refs.scroll.refresh()
            },
            addStyle(index, item) {
                this.$refs.list[index].style.backgroundColor = '#333'
                setTimeout(() => {
                    this.removeStyle(index)
                },200)
                this.$router.push({
                    path: `/recommend/${item.dissid}`
                })
                this.setDisc(item)
            },
            removeStyle(index) {
                this.$refs.list[index].style.backgroundColor = ''
            },
            _getRecommend(){
                
                getRecommend().then((res) => {
                    if(res.code === ERR_OK){
                        this.recommend = res.data.slider
                    }
                })
            },
            _getDiscList(){
                getDiscList().then((res) => {
                    if(res.code === ERR_OK){
                        this.discList = res.data.list
                    }
                })
            },
            loadImage() {
                if(!this.checkLoaded) {
                    this.checkLoaded = true
                    this.$refs.scroll.refresh()
                }
            },
            ...mapMutations ({
                setDisc : 'SET_DISC'
            })
        },
        watch: {
            discList(newList) {
                if(newList.length > 0) {
                    setTimeout(() => {
                        this.fresh = false
                    },200)
                    
                } 
            }
        }
    }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"
    .recommend 
        position: fixed
        width: 100%
        top: 88px
        bottom: 0
        .refresh
            position: absolute
            left: 50%
            font-size: $font-size-medium
            color: $color-text-d
            width: 26px
            margin-left: -13px
            height: 26px
            text-align: center
            // top: 10px
        .recommend-content
            
            height: 100%
            overflow: hidden
            .slider-wrapper
                position: relative
                width: 100%
                overflow: hidden
            .recommend-list
                background $color-background
                .list-title
                    height: 45px
                    line-height: 45px
                    text-align: center
                    font-size: $font-size-medium
                    color: $color-theme
                .item
                    display: flex
                    box-sizing: border-box
                    align-items: center
                    transition: all 0.07s ease
                    padding: 10px 20px 10px 20px
                    .icon
                        line-height 1px
                        flex: 0 0 60px
                        width: 60px
                        padding-right: 20px
                        img[lazy=loaded]
                            animation fade 2s
                        @keyframes fade {
                            0%{
                                opacity: 0;
                            }
                            100%{
                                opacity: 1;
                            }
                        }
                    .text
                        display: flex
                        flex-direction: column
                        justify-content: center
                        flex: 1
                        line-height: 20px
                        overflow: hidden
                        font-size: $font-size-medium
                        .name
                            margin-bottom: 10px
                            color: $color-text
                        .desc
                            color: $color-text-d
            .loading-container
                position: absolute
                width: 100%
                top: 50%
                transform: translateY(-50%)
</style>