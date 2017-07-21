export const singer = state => state.singer
export const playing = state => state.playing
export const fullscreen = state => state.fullscreen
export const playList = state => state.playList
export const sequenceList = state => state.sequenceList
export const mode = state => state.mode
export const currentIndex = state => state.currentIndex
export const animationStatus = state => state.animationStatus
export const currentSongPercent = state => state.currentSongPercent
export const voice = state => state.voice

export const currentSong = (state) => {
    return state.playList[state.currentIndex] || {}
}