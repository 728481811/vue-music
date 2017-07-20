<template>
    <div class="player" v-show="playList.length>0">
      <transition name="normal" @enter="enter($event)" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave"> 
        <div class="normal-player"   v-show="fullscreen" ref="normal"> 
          <div class="background">
            <img width="100%" height="100%" :src="currentSong.image" >
          </div>
          <div class="top">
            <div class="back" @click="back">
              <i class="icon-back"></i>
            </div>
            <h1 class="title" v-html="currentSong.name"></h1>
            <h2 class="subtitle" v-html="currentSong.singer"></h2>
            <div class="needle" ref="needle"></div>
          </div>
          <div class="middle" @touchstart.prevent="middleTouchStart" @touchmove.prevent="middleTouchMove" @touchend="middleTouchEnd">
            <div class="middle-l" ref="middleL">
              <div class="cd-wrapper" ref="cdWrapper">
                <div class="cd" :class="cdCls">
                  <img class="image" :src="currentSong.image"></img>
                </div>
              </div>
              <div class="playing-lyric-wrapper">
                <div class="playing-lyric">{{playingLyric}}</div>
              </div>
            </div>
            <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
              <div class="lyric-wrapper">
                <div v-if="currentLyric">
                  <p  ref="lyricLine" class="text" v-for="(line,index) in currentLyric.lines" :class="{'current': currentLineNum === index}">{{line.txt}}</p>
                </div>
              </div>
            </scroll>
          </div>
          <div class="bottom">
            <div class="dot-wrapper">
              <span class="dot" :class="{'active':currentShow === 'cd'}"></span>
              <span class="dot" :class="{'active':currentShow === 'lyric'}"></span>
            </div>
            <div class="progress-wrapper">
              <span class="time time-l">{{format(currentTime)}}</span>
              <div class="progress-bar-wrapper">
                <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
              </div>
              <span class="time time-r">{{format(currentSong.duration)}}</span>
            </div>
            <div class="operators">
              <div class="icon i-left" @click="changeMode">
                <i :class="iconMode"></i>
              </div>
              <div class="icon i-left" :class="disableCls">
                <i class="icon-prev" @click="prev"></i>
              </div>
              <div class="icon i-center" :class="disableCls">
                <transition name="iconTransition">
                  <i :class="playIcon" @click="togglePlaying" ref="playIcon"></i>
                </transition>
              </div>
              <div class="icon i-right" :class="disableCls">
                <i class="icon-next" @click="next"></i>
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
            <img width="40" height="40" :src="currentSong.image" :class="cdCls">
          </div>
          <div class="text">
            <h2 class="name" v-html="currentSong.name"></h2>
            <p class="desc" v-html="currentSong.singer"></p>
          </div>
          <div class="control">
            <i :class="miniIcon" @click.stop.prevent="togglePlaying"></i>
          </div>
          <div class="control">
            <i class="icon-playlist"></i>
          </div>
          <div class="mini-blur"></div>
        </div>
      </transition>
      <audio :src='currentSong.url' ref="audio" @ended="ended" @timeupdate="updateTime" @canplay="ready" @error="error"></audio>
    </div>
</template>
<script type="text/ecmascript-6">
    import {mapMutations,mapGetters} from 'vuex'
    import animations from 'create-keyframe-animation'
    import {prefixStyle} from 'common/js/dom'
    import progressBar from 'base/progress-bar/progress-bar'
    const transform = prefixStyle('transform')
    const transitionDuration = prefixStyle('transitionDuration')
    import {playMode} from 'common/js/config'
    import {shuffle} from 'common/js/util'
    import Lyric from 'lyric-parser'
    import Scroll from 'base/scroll/scroll'
    export default{
        components: {
          progressBar,Scroll
        },
        created() {
          this.touch =　{}
        },
        data() {
          return {
            tStart: 0,
            tMove: 0,
            event: false,
            songReady: false,
            currentTime: 0,
            currentLyric: null,
            currentLineNum: 0,
            currentShow: 'cd',
            playingLyric: ''
          }
        },
        computed: {
          percent() {
            return this.currentTime / this.currentSong.duration         
          },
          cdCls() {
            return this.playing ? 'play' : 'play pause'
          },
          playIcon() {
            return this.playing ? 'icon-pause' : 'icon-play'
          },
          miniIcon() {
            return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
          },
          disableCls() {
            return this.songReady ? '' : 'disable' 
          },
          iconMode() {
            return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
          },
          ...mapGetters([
              'fullscreen',
              'playList',
              'currentSong',
              'animationStatus',
              'playing',
              'currentIndex',
              'mode',
              'sequenceList'
          ])
        },
        methods: {
          middleTouchStart(e) {
            this.touch.initiated = true
            const touch = e.touches[0]
            this.touch.startX = touch.pageX
            this.touch.startY = touch.pageY
          },
          middleTouchMove(e) {
            if(!this.touch.initiated) {
              return
            }
            const touch = e.touches[0]
            const deltaX = touch.pageX - this.touch.startX
            const deltaY = touch.pageY - this.touch.startY
            if(deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX) + 70 && this.animationStatus){
               if (this.currentShow === 'cd') {
                this.setFullScreen(false)
              }
            }
            const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
            const width = Math.min(0,Math.max(-window.innerWidth, left + deltaX))
            this.touch.percent = Math.abs(width/window.innerWidth)
            this.$refs.lyricList.$el.style[transform] = `translate3d(${width}px,0,0)`
            this.$refs.lyricList.$el.style[transitionDuration] = 0
            this.$refs.middleL.style.opacity = 1 - this.touch.percent
            this.$refs.needle.style.opacity = 1 - this.touch.percent
            this.$refs.middleL.style[transitionDuration] = 0
            this.$refs.needle.style[transitionDuration] = 0
          },
          middleTouchEnd() {
            let width 
            let opacity
            if(this.currentShow === 'cd') {
              if(this.touch.percent > 0.1) {
                width = -window.innerWidth
                opacity = 0
                this.currentShow = 'lyric'
              } else {
                width = 0
                opacity = 1
              }
            } else {
              if(this.touch.percent < 0.9) {
                width = 0
                opacity = 1
                this.currentShow = 'cd'
              } else {
                opacity = 0
                width = -window.innerWidth
              }
            }
            const time = 300
            this.$refs.lyricList.$el.style[transform] = `translate3d(${width}px,0,0)`
            this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
            this.$refs.middleL.style.opacity = opacity
            this.$refs.needle.style.opacity = opacity
            this.$refs.middleL.style[transitionDuration] = `${time}ms`
            this.$refs.needle.style[transitionDuration] = `${time}ms`
          },
          ended() {
            if(this.mode === playMode.loop) {
              this.loop()
            }else{
              this.next()
            }
          },
          loop() {
            this.$refs.audio.currentTime = 0
            this.$refs.audio.play()
            if(this.currentLyric) {
              this.currentLyric.seek()
            }
          },
          changeMode() {
            const mode = (this.mode + 1)%3
            this.setPlayMode(mode)
            let list = null
            if(mode === playMode.random) {
              list = shuffle(this.sequenceList)
            }else {
              list = this.sequenceList
            }
            this._resetCurrentIndex(list)
            this.setPlayList(list)
          },
          _resetCurrentIndex(list) {
            let index = list.findIndex((item) => {
              return item.id === this.currentSong.id
            })
            this.setCurrentIndex(index)
          },
          onProgressBarChange(percent) {
            const currentTime = this.currentSong.duration * percent
            this.$refs.audio.currentTime = currentTime
            if(!this.playing) {
              this.togglePlaying()
            }
            if(this.currentLyric) {
              this.currentLyric.seek(currentTime * 1000)
            }
          },
          updateTime(e) {
            this.currentTime = e.target.currentTime
            this.currentSongPercent(this.currentTime / this.currentSong.duration)
          },
          format(interval) {
            interval = interval | 0
            const minute = interval / 60 | 0
            const second = interval % 60
            if(second < 10){
              return `${minute}:0${second}`
            }else{
              return `${minute}:${second}`
            }
            
          },
          enter(el, done) {
            const {x, y, scale} = this._getPosAndScale()
            this.setAnimationStatus(false)
            let animation = {
              0: {
                transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
              },
              60: {
                transform: `translate3d(0,0,0) scale(1.2)`
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
          back() {
            if(this.animationStatus){
              this.setFullScreen(false) 
            }
          },
          open() {
            if(this.animationStatus){
              console.log(1)
              this.setFullScreen(true)
            } 
          },
          _getPosAndScale() {
            const targetWidth = 40
            const paddingLeft = 40
            const paddingBottom = 30
            const paddingTop = 140
            const width =  window.innerWidth * 0.8
            const scale = targetWidth/width
            const x = -(window.innerWidth / 2 - paddingLeft)
            const y = window.innerHeight - paddingTop - width/2 - paddingBottom
            return {
              x,y,scale
            }
          },
          togglePlaying() {
            this.$refs.playIcon.style.textShadow = '0 0 9px #fff'
            this.setPlayingState(!this.playing)
            setTimeout(() => {
              this.$refs.playIcon.style.textShadow = ''
            },100)
            if(this.currentLyric) {
              this.currentLyric.togglePlay()
            }
          },
          prev() {
            if(!this.songReady) {
              return
            }
            let index = this.currentIndex - 1
            if(index === -1) {
              index = this.playList.length - 1
            }
            this.setCurrentIndex(index)
            if(!this.playing) {
              this.togglePlaying()
            }
            this.songReady = false           
          },
          next() {
            if(!this.songReady) {
              return
            }
            let index = this.currentIndex + 1
            if(index === this.playList.length) {
              index = 0
            }
            this.setCurrentIndex(index)
            if(!this.playing) {
              this.togglePlaying()
            }
            this.songReady = false
          },
          ready() {
            this.songReady = true
          },
          error() {
            this.songReady = false
          },
          getLyric() {
              this.currentSong.getLyric().then((lyric) => {
              this.currentLyric = new Lyric(lyric, this.handleLyric)
              if(this.playing) {
                this.currentLyric.play()
              }
            })
          },
          handleLyric({lineNum, txt}) {
            this.currentLineNum = lineNum
            if (this.currentLineNum > 5 ) {
              let lineEl = this.$refs.lyricLine[this.currentLineNum -5]
              this.$refs.lyricList.scrollToElement(lineEl, 1000)
            }else {
              this.$refs.lyricList.scrollTo(0,0,1000)
            }
            this.playingLyric = txt
          },
          ...mapMutations({
            setFullScreen: 'SET_FULL_SCREEN',
            setAnimationStatus: 'SET_ANIMATION_STATUS',
            setPlayingState: 'SET_PLAYING_STATE',
            setCurrentIndex: 'SET_CURRENT_INDEX',
            currentSongPercent: 'SET_CURRENT_SONG_PERCENT',
            setPlayMode: 'SET_PLAY_MODE',
            setPlayList: 'SET_PLAYLIST'
        })
      },
      watch: {
        currentSong(newSong, oldSong) {
          if(newSong === oldSong) {
            return
          }
          if(this.currentLyric) {
            this.currentLyric.stop()
          }
          this.$nextTick(() => {
            this.$refs.audio.play()
            this.getLyric()
          })
        },
        playing(newPlaying) {
          const audio = this.$refs.audio
          this.$nextTick(() => {
            if(newPlaying) {
              audio.play()
              this.$refs.needle.style.transform = 'rotate(0)'
            }else{
              audio.pause()
              this.$refs.needle.style.transform = 'rotate(-30deg)'
            }
          })
        }
      }
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
        .needle
          top: 66px 
          left: 46%
          z-index: 100
          position: absolute
          bg-image('needle-plus')
          background-size: 110px 169px
          width: 110px
          height: 169px
          transition: all 0.3s ease-out
          transform-origin: 16% 10%
      .middle
        position: fixed
        width: 100%
        top: 140px
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
                border: 10px solid rgba(0, 0, 0, 0.3)
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
              color: rgba(153,153,153,0.4)
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
              transition: all 0.1s ease-out
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
      background: rgba(51,51,51,0.8)
      
      .mini-blur
        z-index: -1
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        filter: blur(2px)
        background: rgba(51,51,51,0.8)
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
