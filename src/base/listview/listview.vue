<template>
    <scroll class="listview" :data="data" @scroll="scroll" :probe-type="probeType" :listen-scroll="listenScroll" ref="listview">
        <ul>
            <li v-for="group in data" class="list-group" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <li v-for="(item,index) in group.items" class="list-group-item" ref="list" @click="addStyle($event,item)" @touchend="removeDom">
                        <img v-lazy="item.avatar" class="avatar" lazy="loaded">
                        <span class="name">{{item.name}}</span>
                        <span class="fother" v-show="item.fother">{{item.fother}}</span>
                    </li>
                </ul>
            </li>
        </ul>
        <div class="list-shortcut" @touchstart.stop.prevent="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove" @touchend.stop.prevent="removeDom">
            <ul>
                <li v-for="(item,index) in shortcutList" class="item" :data-index="index" :class="{'current': currentIndex === index}">
                    {{item}}
                </li>
            </ul>
        </div>
        <div class="list-fixed" ref="fixed" v-show="fixedTitle">
            <div class="fixed-title">{{fixedTitle}}</div>
        </div>
        <div class="loading-container" v-show="data.length<12">
            <loading :title="title"></loading>
        </div>
    </scroll>
</template>
<script type="text/ecmascript-6">
    import Scroll from 'base/scroll/scroll'
    import Loading from 'base/loading/loading'
    import {getData} from 'common/js/dom'
    const ANCHOR_HEIGHT = 18
    const TITLE_HEIGHT = 23
    export default{
        created() {
            this.touch = {}
            this.probeType = 3
            this.listenScroll = true
            this.listHeight = []
        },
        data() {
            return {
                diff: -1,
                title: '正在加载...', 
                scrollY: -1,
                currentIndex: 0           
            }
        },
        computed: {
            shortcutList() {
                return this.data.map((group) => {
                    return group.title.substr(0, 1)
                })
            },
            fixedTitle() {
                if(this.scrollY > 0){
                    return ''
                }
                return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
            }
        },
        methods: {
            onShortcutTouchMove(e) {
                let firstTouch = e.touches[0]
                this.touch.y2 = firstTouch.pageY
                let delta = (this.touch.y2 - this.touch.y1)/ANCHOR_HEIGHT | 0
                let anchorIndex = parseInt(this.touch.anchorIndex +  delta)
                this.addDom(e, anchorIndex)
                this._scrollTo(anchorIndex)
                
            },           
            onShortcutTouchStart(e,item) {
                let firstTouch = e.touches[0]
                let anchorIndex = parseInt(getData(e.target, 'index'))
                this.touch.y1 = firstTouch.pageY
                this.touch.anchorIndex = parseInt(anchorIndex)
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)'
                this.addDom(e, anchorIndex)
                this._scrollTo(anchorIndex)
            },
            addDom(e, index) {
                if(index >= 0 && index <23) {
                    let list = e.currentTarget.getElementsByTagName('li')
                    let el = list[index]
                    let listArray = Array.prototype.slice.call(list)
                    listArray.forEach((item, index) => {
                        if(item.children.length !== 0){
                            item.removeChild(dom)
                        }
                    })
                    if(el.children.length === 0) {
                        let text = e.currentTarget.getElementsByTagName('li')[index].innerText
                        let dom = document.createElement('div')
                        dom.setAttribute('id','dom')
                        dom.innerHTML = text
                        dom.style.color = '#fff'
                        dom.style.width = 40 + 'px'
                        dom.style.height = 40 + 'px'
                        dom.style.fontSize = 16 + 'px'
                        dom.style.borderRadius = '50%'
                        dom.style.lineHeight = 40 + 'px'
                        dom.style.backgroundColor = 'rgba(182,46,44,.4)'
                        dom.style.position = 'absolute'
                        dom.style.left = -100 + 'px'
                        dom.style.top = 0 + 'px'
                        el.appendChild(dom)
                    } 
                }
            },
            refresh() {
                this.$refs.listview.refresh()
            },
            _scrollTo(index) {
                if(index < 0){
                    index = 0
                }else if(index > this.listHeight.length - 2){
                    index = this.listHeight.length - 2
                }
                this.scrollY = -this.listHeight[index]
                this.$refs.listview.scrollToElement(this.$refs.listGroup[index],0)
            },
            scroll(pos) {
                this.scrollY = pos.y
            },
            addStyle(e, item) {
                e.currentTarget.style.backgroundColor = '#333'
                setTimeout(() => {
                    this.removeStyle(e)
                },200)
                this.$emit('select', item)
                console.log(item)
            },
            removeDom(e) {
                let list = e.currentTarget.getElementsByTagName('li')
                let listArray = Array.prototype.slice.call(list)
                listArray.forEach((item) => {
                    if(item.children.length !== 0){
                        item.removeChild(dom)
                    }
                })                
            },
            removeStyle(e){
                for(let i = 0; i < this.$refs.list.length; i++){
                    this.$refs.list[i].style.transition = 'all 0.15s ease-out'
                    this.$refs.list[i].style.background = ''
                }
            },
            _calculatHeigh() {
                this.listHeight = []
                const list = this.$refs.listGroup
                let height = 0
                this.listHeight.push(height)
                for(let i = 0; i < list.length; i++){
                    let item = list[i]
                    height += item.clientHeight
                    this.listHeight.push(height)
                }
            }
        },
        watch: {
            data() {
                setTimeout(() => {
                    this._calculatHeigh()
                },20)
            },
            scrollY(newY,old) {
                
                const listHeight = this.listHeight
                if(newY > 0){
                    this.currentIndex = 0
                    return
                }
                for(let i= 0; i < listHeight.length; i++){
                    let height1 = listHeight[i]
                    let height2 = listHeight[i + 1]
                    if(-newY >= height1 && -newY < height2){
                        this.currentIndex = i
                        this.diff = height2 + newY
                        return 
                    }
                }
                this.currentIndex = listHeight.length - 2
            },
            diff(newVal) {
                
                let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT ) ? newVal - TITLE_HEIGHT : 0
                if(this.fixedTop === fixedTop){
                    return
                }
                this.fixedTop = fixedTop 
                this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
            }
        },
        props: {
            data: {
                type: Array,
                default: []
            }
        },
        components: {
            Scroll,Loading
        }
    }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
 @import "~common/stylus/variable"

.listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
        .list-group-title
            height: 24px
            line-height: 24px
            padding-left: 20px
            font-size: $font-size-small
            color: $color-text-l
            background: $color-highlight-background
        .list-group-item
            display: flex
            align-items: center
            padding: 10px 20px 10px 20px
            .avatar          
                width: 50px
                height: 50px
                border-radius: 50%
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
            .name
                margin-left: 20px
                color: $color-text-l
                font-size: $font-size-medium
            .fother
                padding-left 10px
                color $color-text-d
                font-size $font-size-small
    .list-shortcut
        position: absolute
        z-index: 30
        right: 0
        top: 50%
        transform: translateY(-50%)
        width: 20px
        padding: 5px 0
        border-radius: 10px
        text-align: center
        transition: all 0.07s ease-out
        background: $color-background-d
        font-family: Helvetica
        .item
            position: relative
            padding: 3px
            line-height: 1
            color: $color-text-l
            font-size: $font-size-small
            &.current
                color: $color-theme                
    .list-fixed
        position: absolute
        top: 0
        left: 0
        width: 100%
        .fixed-title
            margin-top: -1px 
            height: 24px
            line-height: 24px
            padding-left: 20px
            font-size: $font-size-small
            color: $color-text-l
            background: $color-highlight-background
    .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>