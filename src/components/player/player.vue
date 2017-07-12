<template>
    <div class="player" v-show="playList.length>0">
      <transition name="normal" @enter="enter($event)" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave"> 
        <div class="normal-player" @touchstart="touchStart($event)" @touchmove.stop.prevent="touchMove($event)" v-show="fullscreen" ref="normal"> 
          <div class="background">
            <img width="100%" height="100%" :src="currentSong.image">
          </div>
          <div class="top">
            <div class="back" @click="back">
              <i class="icon-back"></i>
            </div>
            <h1 class="title" v-html="currentSong.name"></h1>
            <h2 class="subtitle" v-html="currentSong.singer"></h2>
          </div>
          <div class="middle">
            <div class="middle-l">
              <div class="cd-wrapper" ref="cdWrapper">
                <div class="cd">
                  <img class="image" :src="currentSong.image"></img>
                </div>
              </div>
            </div>
          </div>
          <div class="bottom">
            <div class="operators">
              <div class="icon i-left">
                <i class="icon-sequence"></i>
              </div>
              <div class="icon i-left">
                <i class="icon-prev"></i>
              </div>
              <div class="icon i-center">
                <i class="icon-play"></i>
              </div>
              <div class="icon i-right">
                <i class="icon-next"></i>
              </div>
              <div class="icon i-right">
                <i class="icon icon-not-favorite"></i>
              </div>
            </div>
          </div>
        </div>
      </transition>
      <transition name="mini">
        <div class="mini-player" v-show="!fullscreen"  @click="open">
          <div class="icon">
            <img width="40" height="40" :src="currentSong.image">
          </div>
          <div class="text">
            <h2 class="name" v-html="currentSong.name"></h2>
            <p class="desc" v-html="currentSong.singer"></p>
          </div>
          <div class="control"></div>
          <div class="control">
            <i class="icon-playlist"></i>
          </div>
        </div>
      </transition>
    </div>
</template>
<script type="text/ecmascript-6">
    import {mapMutations,mapGetters} from 'vuex'
    import animations from 'create-keyframe-animation'
    import {prefixStyle} from 'common/js/dom'
    const transform = prefixStyle('transform')
    export default{
        data() {
          return {
            tStart: 0,
            tMove: 0,
            event: false
          }
        },
        computed: {
            ...mapGetters([
                'fullscreen',
                'playList',
                'currentSong',
                'animationStatus'
            ])
        },
        methods: {
          enter(el, done) {
            const {x, y, scale} = this._getPosAndScale()
            this.setAnimationStatus(false)
            let animation = {
              0: {
                transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
              },
              60: {
                transform: `translate3d(0,0,0) scale(1.3)`
              },
              100: {
                transform: `translate3d(0,0,0) scale(1)`
              }
            }

            animations.registerAnimation({
              name: 'move',
              animation,
              presets: {
                duration: 400,
                easing: 'linear'
              }
            })

            animations.runAnimation(this.$refs.cdWrapper, 'move',done)
          },
          afterEnter() {
            animations.unregisterAnimation('move')
            this.$refs.cdWrapper.style.animation = ''
            this.setAnimationStatus(true)
          },
          leave(el, done) {
            this.setAnimationStatus(false)
            this.$refs.cdWrapper.style.transition = 'all 0.4s'
            const {x, y, scale} = this._getPosAndScale()
            this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
            this.$refs.cdWrapper.addEventListener('transitionend', done)
          },
          afterLeave() {
            this.$refs.cdWrapper.style.transition = ''
            this.$refs.cdWrapper.style[transform] = ''
            this.setAnimationStatus(true)
          },
          touchStart(e) {
            this.tStart = e.touches[0].pageY
          },
          touchMove(e) {
            this.tMove =  e.touches[0].pageY - this.tStart
            if(this.tMove > 70 && this.animationStatus){
              this.setFullScreen(false)
            }             
          },
          back() {
            if(this.animationStatus){
              this.setFullScreen(false) 
              console.log(1)
            }
          },
          open() {
            if(this.animationStatus){
              this.setFullScreen(true)
            }
          },
          _getPosAndScale() {
            const targetWidth = 40
            const paddingLeft = 40
            const paddingBottom = 30
            const paddingTop = 80
            const width =  window.innerWidth * 0.8
            const scale = targetWidth/width
            const x = -(window.innerWidth / 2 - paddingLeft)
            const y = window.innerHeight - paddingTop - width/2 - paddingBottom
            return {
              x,y,scale
            }
          },
          ...mapMutations({
          setFullScreen: 'SET_FULL_SCREEN',
          setAnimationStatus: 'SET_ANIMATION_STATUS'
        })
      },
    }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back  
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                box-sizing: border-box
                border: 10px solid rgba(0, 0, 0, 0.4)
                width: 100%
                height: 100%
                border-radius: 50%
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active
        transition: all 0.3s
      &.normal-leave-active
        transition: all 0.4s
      &.normal-enter, &.normal-leave-to
        opacity: 0
        transform: translate3d(0, 800px, 0)
    .mini-player
      box-shadow: 0 0 20px #171616
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180    
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        transform: translate3d(0, 80px, 0)
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 25px
          color: #b62e2c
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
