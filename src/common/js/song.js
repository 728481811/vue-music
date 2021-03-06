import {getLyric, getSongInfo} from 'api/song'
import {ERR_OK} from 'api/config'
import {Base64} from 'js-base64'
export default class Song {
    constructor({id,mid,singer,name,album,duration,image,url,albummid}) {
        this.id = id
        this.mid = mid
        this.singer = singer
        this.name = name
        this.album = album
        this.duration = duration
        this.image = image
        this.url = url
        this.albummid = albummid
    }
    getLyric() {
        if(this.lyric) {
            return Promise.resolve(this.lyric)
        }
        return new Promise((resovle, reject) => {
            getLyric(this.mid).then((res) => {
                if(res.retcode === ERR_OK) {
                    this.lyric = Base64.decode(res.lyric)
                    resovle(this.lyric)
                }else {
                    reject('no lyric')
                }
            })
        })   
    }
    getSongInfo() {
        if(this.info) {
            return Promise.resolve(this.info)
        }
        return new Promise((resolve, reject) => {
            getSongInfo(this.albummid).then((res) => {
                if(res.code === ERR_OK) {
                    this.info = res.data
                    resolve(this.info)
                } else {
                    reject('no songInfo')
                }
            })
        })
    }
}
export function createSong(musicData) {
    return new Song({
        id: musicData.songid,
        albummid: musicData.albummid,
        mid: musicData.songmid,
        singer: filterSinger(musicData.singer),
        name: musicData.songname,
        album: musicData.albumname,
        duration: musicData.interval,
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
        url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`
    })
}

function filterSinger(singer) {
    let ret = []
    if (!singer) {
        return ''
    }
    singer.forEach((s) => {
        ret.push(s.name)
    })
    return ret.join('/')
}