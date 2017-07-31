import {playMode} from 'common/js/config.js'
const state = {
    singer: {},
    playing: false,
    animationStatus: true,
    fullscreen: false,
    playList: [],
    sequenceList: [],
    mode: playMode.sequence,
    currentIndex: -1,
    currentSongPercent: 0,
    voice: 1,
    disc: {},
    topList: {}
}

export default state