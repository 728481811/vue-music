import {commonParams, options} from './config'
import jsonp from 'common/js/jsonp'
import axios from 'axios'

export function getLyric(mid) {
	const url = '/api/lyric'
	const data = Object.assign({} , commonParams, {
		songmid: mid,
		pcachetime: +new Date(),
		platform: 'yqq',
		hostUin: 0,
		needNewCode: 0,
		g_tk: 67232076,
		format: 'json'
	})
	return axios.get(url, {params:data}).then((res) => {
		return Promise.resolve(res.data)
	})
}

export function getSongInfo(mid) {
	const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_album_info_cp.fcg'
	const data = Object.assign({} , commonParams, {
		albummid: mid,
		platform: 'yqq',
		loginUin: 0,
		hostUin: 0,
		needNewCode: 0,
		g_tk: 534127172,
		
	})
	return jsonp(url, data, options)
}