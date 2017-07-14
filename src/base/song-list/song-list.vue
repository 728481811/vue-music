<template>
    <div class="song-list">
        <ul>
            <li @click="selectItem(song,index)" v-for="(song,index) in songs" class="item" ref="list">
                <div class="content">
                    <div class="index">{{index+1}}</div>
                    <h2 class="name">{{song.name}}</h2>
                    <p class="desc">{{getDesc(song)}}</p>
                    <current-percent v-show="currentSongId === index" :currentSongPercent="currentSongPercent"></current-percent>
                </div>
            </li>
        </ul>
    </div>
</template>

<script type="text/ecmascript-6">
import {mapMutations,mapGetters} from 'vuex'
import currentPercent from 'base/currentPercent/currentPercent'
export default {
    components: {
        currentPercent
    },
    data() {
        return {
            currentSongId: -1
        }
    },
    computed: {
        ...mapGetters([
            'animationStatus',
            'currentSong',
            'currentSongPercent'
        ])
    },
    props: {
        songs: {
            type: Array,
            default: []
        }
    },
    beforeUpdate() {
        this._currentIndex()
    },
    methods: {
        _currentIndex() {
            this.songs.forEach((item,index) => {
                if(this.currentSong.id === item.id) {
                    this.currentSongId = index
                }
            })
        },              
        selectItem(item,index) {
            if(this.animationStatus){
                this.$emit('select',item,index)
                this.$refs.list[index].style.backgroundColor = '#333'
                setTimeout(() => {
                    this.removeStyle(index)
                },200)
            }  
        },
        removeStyle(index) {
            this.$refs.list[index].style.backgroundColor = ''
        },
        getDesc(song) {
            return `${song.singer}-${song.album}`
        },
    },
    watch: {
        currentSong(newCS) {
            this.songs.forEach((item, index) => {
                if(item.id === newCS.id) {
                    this.currentSongId = index
                }
            })
        }
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "~common/stylus/variable"
@import "~common/stylus/mixin"

    .song-list
        .item
            position: relative
            display: flex
            align-items: center
            box-sizing: border-box
            height: 64px
            font-size: $font-size-medium
            .rank
                flex: 0 0 25px
                width: 25px
                margin-right: 30px
                text-align: center
                .icon
                    display: inline-block
                    width: 25px
                    height: 24px
                    background-size: 25px 24px
                    &.icon0
                        bg-image('first')
                    &.icon1
                        bg-image('second')
                    &.icon2
                        bg-image('third')
                .text
                    color: $color-theme
                    font-size: $font-size-large
            .content
                flex: 1
                line-height: 20px
                overflow: hidden
                padding-left: 20px
                .index
                    float: left
                    line-height: 42px
                    padding-right: 20px;
                    color: $color-text-d
                .name
                    no-wrap()
                    color: $color-text
                .desc
                    no-wrap()
                    margin-top: 4px
                    color: $color-text-d
</style>