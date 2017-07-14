<template>
    <div class="current-percent" ref="currentPercent">
    </div>
</template>
<script type="text/ecmascript-6">
    export default{
        props: {
            currentSongPercent: {
                type: Number,
                default: 0
            }
        },
        watch: {
            currentSongPercent(newPercent) {

                this.$refs.currentPercent.style.width = `${newPercent * document.body.clientWidth}px`
                
            }
        }
    }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
@import "~common/stylus/variable"
.current-percent
    transition: all 0.1s linear
    position: absolute
    bottom: 0
    left: 0
    height: 1px
    width: 0
    box-shadow: 0 4px 3px #1f1f1f
    background: linear-gradient(to right,#b62e2c, #ce403e)

</style>