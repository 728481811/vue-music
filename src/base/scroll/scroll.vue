<template>
    <div ref="wrapper">
        <slot></slot>
    </div>
</template>
<script type="text/ecmascript-6">
    import BSscroll from 'better-scroll'
    export default{
        props: {
            probeType: {
                type: Number,
                default: 1
            },
            listenScroll: {
                type: Boolean,
                default: true
            },
            click: {
                type: Boolean,
                default: true
            },
            data: {
                type: Array,
                default: null
            }
        },
        mounted() {
            setTimeout(() => {
                this._initScroll()
            }, 20)
        },
        methods: {
            _initScroll() {
                if(!this.$refs.wrapper) {
                    return 
                }
                this.scroll = new BSscroll(this.$refs.wrapper, {
                    probeType: this.probeType,
                    click: this.click,
                    bounceTime: 600
                })
                if(this.listenScroll) {
                    let me = this
                    this.scroll.on('scroll', (pos) => {
                        me.$emit('scroll', pos)
                    })
                }
            },
            enable() {
                this.scroll && this.scroll.enable()
            },
            disable() {
                this.scroll && this.scroll.disable()
            },
            refresh() {
                this.scroll && this.scroll.refresh()
            },
            scrollTo() {
                this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
            },
            scrollToElement() {
                this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
            }
        },
        watch: {
            data: function(val, oldVal) {
                setTimeout(() => {
                    this.refresh();
                }, 20)
            }
        }
    }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">

</style>