import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import {saveSearch,deleteSearch,clearSearch} from 'common/js/cache'
function findIndex(list, song) {
	return list.findIndex((item) => {
		return item.id === song.id
	})
}
export const selectPlay = function({commit,state},{list, index}) {
    commit(types.SET_SEQUENCE_LIST, list)
    if (state.mode === playMode.random) {
    	let randomList = shuffle(list)
    	commit(types.SET_PLAYLIST, randomList)
    	index = findIndex(randomList, list[index])
    }else{
    	commit(types.SET_PLAYLIST, list)
    }
    commit(types.SET_CURRENT_INDEX, index)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}
export const randomPlay =  function ({commit},{list}) {
	commit(types.SET_PLAY_MODE, playMode.random)
	commit(types.SET_SEQUENCE_LIST, list)
	let randomList =  shuffle(list)
	commit(types.SET_PLAYLIST, randomList)
	commit(types.SET_CURRENT_INDEX, 0)
	commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

export const insertSong = function ({commit,state}, song) {
    let playList = state.playList.slice()
    let sequenceList =  state.sequenceList.slice()
    let currentIndex = state.currentIndex

    let currentSong = playList[currentIndex]

    let fpIndex = findIndex(playList, song)
    console.log(playList)
    console.log(song)
    currentIndex++
    playList.splice(currentIndex, 0 , song)
    if (fpIndex > -1) {
    // 如果当前插入的序号大于列表中的序号
        if (currentIndex > fpIndex) {
            playList.splice(fpIndex, 1)
            currentIndex--
        } else {
            playList.splice(fpIndex + 1, 1)
        }
    }

    let currentSIndex = findIndex(sequenceList, currentSong) + 1

    let fsIndex = findIndex(sequenceList, song)

    sequenceList.splice(currentSIndex, 0, song)

    if (fsIndex > -1) {
        if (currentSIndex > fsIndex) {
            sequenceList.splice(fsIndex, 1)
        } else {
        sequenceList.splice(fsIndex + 1, 1)
        }
   }
    commit(types.SET_PLAYLIST, playList)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

export const saveSearchHistory = function ({commit}, query) {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}
export const deleteSearchHistory = function({commit}, query) {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = function({commit}) {
    commit(types.SET_SEARCH_HISTORY, clearSearch())
}