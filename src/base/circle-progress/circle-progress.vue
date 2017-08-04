<template>
<canvas ref="canvas" width="26" height="26"></canvas>
</template>

<script type="text/ecmascript-6">

export default {
  props: {
    yPercent: {
      type: Number,
      default: 0
    },
    fresh: {
      bype: Boolean,
      default: false
    }
  },
  mounted() {
    
    
  },
  watch: {
    yPercent(newY) {
      let canvas = this.$refs.canvas
      let ctx = canvas.getContext('2d')
      ctx.clearRect(0,0,26,26)
      ctx.beginPath();
      ctx.lineWidth = 2
      ctx.strokeStyle = '#b62e2c'
      ctx.arc(13,13,10,-0.5*Math.PI,this.yPercent*2*Math.PI - 0.5*Math.PI) 
      ctx.stroke();
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "~common/stylus/variable"
</style>