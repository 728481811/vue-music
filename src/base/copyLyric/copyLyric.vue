<template>
  <div class="copyLyric">
    <span class="close-btn" @click.prevent.stop="close"></span>
  </div>
</template>
<script type="text/ecmascript-6">
  import {prefixStyle} from 'common/js/dom'
  const progressBtnWidth = 12
  const transform = prefixStyle('transform')
  export default {
    methods: {
      close() {
        console.log(2)
        this.$emit('close')
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  .copyLyric
    position: fixed
    z-index: 200
    color: #fff
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .close-btn
      position: absolute
      top: 10px
      right: 10px
      display: inline-block
      width: 24px
      height: 24px
      background-size: 24px
      bg-image('close-ly')
</style>