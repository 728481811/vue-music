<template>
    <div class="music-list">
    <div class="back" @click="backSinger">
        <i class="icon-back"></i>
    </div>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
        <h1 class="title" v-html="title" ref="title"></h1>
        <div class="play-wrapper">
            <div class="play" v-show="songs.length" ref="playButton">
                <i class="icon-play"></i>
                <span class="text">随机播放全部</span>
            </div>
        </div>
        <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer">
    </div>
    <scroll :data="songs" class="list" ref="list" :probe-type="probeType" :listen-scroll="listenScroll" @scroll="scroll">
        <div class="song-list-wrapper">
            <song-list :songs="songs" @select="selectItem"></song-list>
        </div>
        <div class="loading-container" v-show="!songs.length">
            <loading></loading>
        </div>
    </scroll>
    </div>
</template>

<script type="text/ecmascript-6">
    import Scroll from 'base/scroll/scroll'
    import Loading from 'base/loading/loading'
    import songList from 'base/song-list/song-list'
    import {prefixStyle} from 'common/js/dom'
    import {playlistMixin} from 'common/js/mixin'
    import {mapActions} from 'vuex'
    const RESERVED_HEIGHT = 40
    const transform = prefixStyle('transform')
    const backdrop = prefixStyle('backdrop-filter')

    export default {
        created() {
            this.probeType = 3
            this.listenScroll = true
        },
        data() {
            return {
                scrollY: 0
            }
        },
        components: {
            songList,Scroll,Loading
        },
        props: {
            bgImage: {
                type: String,
                default: ''
            },
            songs: {
                type: Array,
                default: []
            },
            title: {
                type: String,
                default: ''
            }
        },
        computed: {
            bgStyle() {
                return `background-image:url(${this.bgImage})`
            }
        },
        methods: {
            selectItem(item,index) {
                this.selectPlay({list: this.songs,index}) 
            },
            backSinger() {
                this.$router.back()
            },
            scroll(pos) {
                this.scrollY = pos.y
            },
            ...mapActions([
                'selectPlay'
                ])
        },
        mounted() {
            // this.imageHeight = this.$refs.bgImage.clientHeiht
            // this.minTranslateY  = -this.imageHeight + RESERVED_HEIGHT
            this.imageHeight = this.$refs.bgImage.clientHeight
            this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
            this.$refs.list.$el.style.top = `${this.$refs.bgImage.clientHeight}px`
            window.addEventListener('resize', () => {
                this.$refs.list.$el.style.top = `${this.$refs.bgImage.clientHeight}px`
            })
        },
        watch: {
            scrollY(newY) {
                let scale = 1
                let zIndex = 0
                let blur = 0
                let translatey = Math.max(this.minTranslateY, newY)
                this.$refs.layer.style['transform'] = `translate3d(0,${translatey}px,0)`
                this.$refs.layer.style['webkitTransform'] = `translate3d(0,${translatey}px,0)`
                const precent = Math.abs(newY/this.imageHeight)
                if(newY > 0) {
                    scale = 1 +  precent
                    zIndex = 10
                }else {
                    blur = Math.min(20, precent*20)
                }
                this.$refs.filter.style['backdrop-filter'] = `blur(${blur}px)`
                this.$refs.filter.style['webkitBackdrop-filter'] = `blur(${blur}px)`
                if(newY < this.minTranslateY/5){
                    this.$refs.title.style.fontSize = 14 + 'px'
                    this.$refs.title.style.bottom = ''
                    this.$refs.title.style.top = 0 + 'px'
                }else {
                    this.$refs.title.style.fontSize = 18 + 'px'
                    this.$refs.title.style.top = ''
                    this.$refs.title.style.bottom = 0 + 'px'
                }
                if(newY < this.minTranslateY) {
                    zIndex = 10
                    this.$refs.bgImage.style.paddingTop = 0
                    this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
                    this.$refs.playButton.style.display = 'none'
                }else{
                    this.$refs.bgImage.style.paddingTop = '70%'
                    this.$refs.bgImage.style.height = 0
                    this.$refs.playButton.style.display = 'block'
                }
                this.$refs.bgImage.style.zIndex = zIndex
                this.$refs.bgImage.style['transform'] = `scale(${scale})`
                this.$refs.bgImage.style['webkitTransform'] = `scale(${scale})`
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"

    .music-list
        position: fixed
        z-index: 100
        top: 0
        left: 0
        bottom: 0
        right: 0
        background: $color-background
        .back
            position absolute
            top: 0
            left: 6px
            z-index: 50
            .icon-back
                display: block
                padding: 10px
                font-size: $font-size-large-x
                color: $color-theme
        .bg-image
            position: relative
            width: 100%
            height: 0
            padding-top: 70%
            transform-origin: top
            background-size: cover
            .play-wrapper
                position: absolute
                bottom: 40px
                z-index: 50
                width: 100%
                .play
                    box-sizing: border-box
                    width: 135px
                    padding: 7px 0
                    margin: 0 auto
                    text-align: center
                    border: 1px solid $color-theme
                    color: $color-theme
                    border-radius: 100px
                    font-size: 0
                    .icon-play
                        display: inline-block
                        vertical-align: middle
                        margin-right: 6px
                        font-size: $font-size-medium-x
                    .text
                        display: inline-block
                        vertical-align: middle
                        font-size: $font-size-small
            .filter
                position: absolute
                top: 0
                left: 0
                width: 100%
                height: 100%
                background: rgba(7, 17, 27, 0.4)
            .title
                position: absolute
                bottom: 0
                left: 10%
                z-index: 40
                width: 80%
                no-wrap()
                text-align: center
                line-height: 40px
                font-size: $font-size-large
                color: $color-text
                transition: all 0.2s ease
        .bg-layer
            position: relative
            height: 100%
            background: $color-background
        .list
            position: fixed
            top: 0
            bottom: 0
            width: 100%
            background: $color-background
            .song-list-wrapper
                padding-top: 20px
            .loading-container
                position: absolute
                width: 100%
                top: 50%
                transform: translateY(-50%)
</style>