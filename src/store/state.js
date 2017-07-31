import {playMode} from 'common/js/config.js'
import {loadSearch} from 'common/js/cache'
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
    topList: {},
    searchHistory: loadSearch()
}

export default state