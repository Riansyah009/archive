const axios = require('axios')
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const FormData = require('form-data')
const { fromBuffer } = require('file-type')
const yts = require('yt-search')
const got = require("got")
const ytdl = require('ytdl-core')
const creator = `Roku Maou`
const request = require('request')
const knights = require("knights-canvas")

module.exports = new (class Scraper {
        /* Job Prodia
	 * @param job
         * @param Xprodiakey
	 */
    jobget = async (job, Xprodiakey) => {
	    return new Promise((resolve, reject) => { 
		    const option = {
  method: 'GET',
  url: 'https://api.prodia.com/v1/job/' + job,
  headers: {
    accept: 'application/json',
    'X-Prodia-Key': Xprodiakey
  }
};

axios
  .request(option)
  .then(function (response) {
    resolve(response.data)
  })
  .catch(function (error) {
    resolve({
               creator: creator,
               status: false,
           })
  });
	    })
    }
    
        /* hentai search
         * @param {String} text
         */
    hentaisc = async (text) => {
    return new Promise((resolve, reject) => {
        axios.get('https://sfmcompile.club/?s='+text)
        .then((data) => {
            const $ = cheerio.load(data.data)
            const hasil = []
            $('#primary > div > div > ul > li > article').each(function (a, b) {
                hasil.push({
                    title: $(b).find('header > h2').text(),
                    link: $(b).find('header > h2 > a').attr('href'),
                    category: $(b).find('header > div.entry-before-title > span > span').text().replace('in ', ''),
                    share_count: $(b).find('header > div.entry-after-title > p > span.entry-shares').text(),
                    views_count: $(b).find('header > div.entry-after-title > p > span.entry-views').text(),
                    type: $(b).find('source').attr('type') || 'image/jpeg',
                    video_1: $(b).find('source').attr('src') || $(b).find('img').attr('data-src'),
                    video_2: $(b).find('video > a').attr('href') || ''
                })
            })
            resolve(hasil)
        })
    })
	}
	/* Ssweb
         * @param {String} url
	 * @param {String} device
         */
   ssweb = async (url, device = 'desktop') => {
     return new Promise((resolve, reject) => {
          const base = 'https://www.screenshotmachine.com'
          const param = {
            url: url,
            device: device,
            cacheLimit: 0
          }
          axios({url: base + '/capture.php',
               method: 'POST',
               data: new URLSearchParams(Object.entries(param)),
               headers: {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
               }
          }).then((data) => {
               const cookies = data.headers['set-cookie']
               if (data.data.status == 'success') {
                    axios.get(base + '/' + data.data.link, {
                         headers: {
                              'cookie': cookies.join('')
                         },
                         responseType: 'arraybuffer'
                    }).then(({ data }) => {
                        let result = {
                            status: 200,
                            result: data
                        }
                         resolve(result)
                    })
               } else {
                    reject({ status: 404, statuses: `Link Error`, message: data.data })
               }
          }).catch(reject)
     })
   }
   /* Gempa
    *
    */
   gempa = async () => {
	return new Promise(async (resolve, reject) => {
		axios.get('https://www.bmkg.go.id/gempabumi/gempabumi-dirasakan.bmkg')
			.then(({
				data
			}) => {
				const $ = cheerio.load(data)
				const drasa = [];
				$('table > tbody > tr:nth-child(1) > td:nth-child(6) > span').get().map((rest) => {
					let dir = $(rest).text();
					drasa.push(dir.replace('\t', ' '))
				})
				let teks = ''
				for (let i = 0; i < drasa.length; i++) {
					teks += drasa[i] + '\n'
				}
				const rasa = teks
				const format = {
					imagemap: $('div.modal-body > div > div:nth-child(1) > img').attr('src'),
					magnitude: $('table > tbody > tr:nth-child(1) > td:nth-child(4)').text(),
					kedalaman: $('table > tbody > tr:nth-child(1) > td:nth-child(5)').text(),
					wilayah: $('table > tbody > tr:nth-child(1) > td:nth-child(6) > a').text(),
					waktu: $('table > tbody > tr:nth-child(1) > td:nth-child(2)').text(),
					lintang_bujur: $('table > tbody > tr:nth-child(1) > td:nth-child(3)').text(),
					dirasakan: rasa
				}
				const result = {
					creator: creator,
					data: format
				}
				resolve(result)
			})
			.catch(reject)
	})
   }
   /* Komik
    * @param {String} url
    */
   KomikDl = async (url) => {
	return new Promise((resolve, reject) => {
		axios.get(url).then(({ data }) => {
			let $ = cheerio.load(data)
			let title = $('title').text().replace('Bahasa Indonesia - MyNimeku', '').trim()
			let result = []
			$('div.reader-area > p > img').each(function () {
				result.push($(this).attr('src'))
			})
			resolve({ title, result })
		}).catch(reject)
	})
    }
   /* Animedl
    * @param {String} url
    */
   AnimeDl = async (url) => {
	return new Promise((resolve, reject) => {
		axios.get(url).then(({ data }) => {
			let $ = cheerio.load(data)
			let title = $('title').text()
			let thumb = $('meta[property="og:image"]').attr('content')
			let url = $('#linklist').find('a').attr('href')
			resolve({ title, thumb, url })
		}).catch(reject)
	})
   }
   /* GetLatestKomik
    */
   getLatestKomik = async () => {
	return new Promise((resolve, reject) => {
		axios.get('https://www.mynimeku.com/').then(({ data }) => {
			let $ = cheerio.load(data)
			let result = []
			$('div.flexbox4-item').each(function(i, e) {
				let title = $(e).find('a').attr('title')
				let link = $(e).find('a').attr('href')
				let thumb = $(e).find('div.flexbox4-thumb > img').attr('data-src')
				let type = $(e).find('div.flexbox4-type').text()
				let status = $(e).find('div.flexbox-status').text()
				let chapter = $(e).find('ul.chapter > li').text().split(' ')[1]
				result.push({ title, status, chapter, type, thumb, link })
			})
			resolve(result)
		}).catch(reject)
	})
   }
	
   /* GetLatestAnime
    */
   getLatestAnime = async () => {
	return new Promise((resolve, reject) => {
		axios.get('https://www.mynimeku.com/').then(({ data }) => {
			let $ = cheerio.load(data)
			let result = []
			$('div.flexbox-item > a').each(function(i, e) {
				let title = $(e).attr('title')
				let link = $(e).attr('href')
				let status = $(e).find('div.flexbox-status').text()
				let thumb = $(e).find('div.flexbox-thumb > img').attr('data-src')
				let episode = $(e).find('div.flexbox-episode > span.eps').text().split(' ')[1]
				let type = $(e).find('div.flexbox-type').text()
				result.push({ title, status, episode, type, thumb, link })
			})
			resolve(result)
		}).catch(reject)
	})
   }
   /* WikiSearch
    * @param {String} query
    */
   wikisearch = async (query) => {
	const res = await axios.get(`https://id.m.wikipedia.org/w/index.php?search=${query}`)
	const $ = cheerio.load(res.data)
	const hasil = []
	let wiki = $('#mf-section-0').find('p').text()
	let thumb = $('#mf-section-0').find('div > div > a > img').attr('src')
	thumb = thumb ? thumb : '//pngimg.com/uploads/wikipedia/wikipedia_PNG35.png'
	thumb = 'https:' + thumb
	let judul = $('h1#section_0').text()
	hasil.push({
		wiki,
		thumb,
		judul
	})
	return hasil
   }
   /* Deviant Art
    * @param {String} query
    */
   devianart = async (query) => {
	return new Promise((resolve, reject) => {
		axios.get('https://www.deviantart.com/search?q=' + query)
			.then(({
				data
			}) => {
				const $$ = cheerio.load(data)
				const no = ''
				$$('#root > div.hs1JI > div > div._3WsM9 > div > div > div:nth-child(3) > div > div > div:nth-child(1) > div > div:nth-child(1) > div > section > a').each(function(c, d) {
					no = $$(d).attr('href')
				})
				axios.get(no)
					.then(({
						data
					}) => {
						const $ = cheerio.load(data)
						const result = [];
						$('#root > main > div > div._2QovI > div._2rKEX._17aAh._1bdC8 > div > div._2HK_1 > div._1lkTS > div > img').each(function(a, b) {
							result.push($(b).attr('src'))
						})
						resolve(result)
					})
			})
			.catch(reject)
	})
    }
	
   /* Quotesanime
    *
    */
   quotesanime = async () => {
    return new Promise((resolve, reject) => {
        const page = Math.floor(Math.random() * 184)
        axios.get('https://otakotaku.com/quote/feed/'+page)
        .then(({ data }) => {
            const $ = cheerio.load(data)
            const hasil = []
            $('div.kotodama-list').each(function(l, h) {
                hasil.push({
                    link: $(h).find('a').attr('href'),
                    gambar: $(h).find('img').attr('data-src'),
                    karakter: $(h).find('div.char-name').text().trim(),
                    anime: $(h).find('div.anime-title').text().trim(),
                    episode: $(h).find('div.meta').text(),
                    up_at: $(h).find('small.meta').text(),
                    quotes: $(h).find('div.quote').text().trim()
                })
            })
            resolve(hasil)
        }).catch(reject)
    })
    }
   /* artinama
    * @param {String} query
    */
  artinama = async (query) => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        "https://www.primbon.com/arti_nama.php?nama1=" +
          query +
          "&proses=+Submit%21+"
      )
      .then(({ data }) => {
        const $ = cheerio.load(data);
        const result = $("#body").text();
        const result2 = result.split("\n      \n        \n        \n")[0];
        const result4 = result2.split("ARTI NAMA")[1];
        const result5 = result4.split(".\n\n");
        const result6 = result5[0] + "\n\n" + result5[1];
        resolve(result6);
      })
      .catch(reject);
  });
}
   /* Snapsave
    * @param {String} url
    */
   snapsave = async (url) =>{
  return new Promise(async (resolve) => {
  try {
  if (!url.match(/(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/) && !url.match(/(https|http):\/\/www.instagram.com\/(p|reel|tv|stories)/gi)) return resolve({ developer: 'Lan', status: false, msg: `Link Url not valid` })
  function decodeSnapApp(args) {
  let [h, u, n, t, e, r] = args
  // @ts-ignore
  function decode (d, e, f) {
  const g = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('')
  let h = g.slice(0, e)
  let i = g.slice(0, f)
  // @ts-ignore
  let j = d.split('').reverse().reduce(function (a, b, c) {
  if (h.indexOf(b) !== -1)
  return a += h.indexOf(b) * (Math.pow(e, c))
  }, 0)
  let k = ''
  while (j > 0) {
  k = i[j % f] + k
  j = (j - (j % f)) / f
  }
  return k || '0'
  }
  r = ''
  for (let i = 0, len = h.length; i < len; i++) {
  let s = ""
  // @ts-ignore
  while (h[i] !== n[e]) {
  s += h[i]; i++
  }
  for (let j = 0; j < n.length; j++)
  s = s.replace(new RegExp(n[j], "g"), j.toString())
  // @ts-ignore
  r += String.fromCharCode(decode(s, e, 10) - t)
  }
  return decodeURIComponent(encodeURIComponent(r))
  }
  function getEncodedSnapApp(data) {
  return data.split('decodeURIComponent(escape(r))}(')[1]
  .split('))')[0]
  .split(',')
  .map(v => v.replace(/"/g, '').trim())
  }
  function getDecodedSnapSave (data) {
  return data.split('getElementById("download-section").innerHTML = "')[1]
  .split('"; document.getElementById("inputData").remove(); ')[0]
  .replace(/\\(\\)?/g, '')
  }
  function decryptSnapSave(data) {
  return getDecodedSnapSave(decodeSnapApp(getEncodedSnapApp(data)))
  }
  const html = await got.post('https://snapsave.app/action.php?lang=id', {
  headers: {
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'content-type': 'application/x-www-form-urlencoded','origin': 'https://snapsave.app',
  'referer': 'https://snapsave.app/id',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
  },
  form: { url }
  }).text()
  const decode = decryptSnapSave(html)
  const $ = cheerio.load(decode)
  const results = []
  if ($('table.table').length || $('article.media > figure').length) {
  const thumbnail = $('article.media > figure').find('img').attr('src')
  $('tbody > tr').each((_, el) => {
  const $el = $(el)
  const $td = $el.find('td')
  const resolution = $td.eq(0).text()
  let _url = $td.eq(2).find('a').attr('href') || $td.eq(2).find('button').attr('onclick')
  const shouldRender = /get_progressApi/ig.test(_url || '')
  if (shouldRender) {
  _url = /get_progressApi\('(.*?)'\)/.exec(_url || '')?.[1] || _url
  }
  results.push({
  resolution,
  thumbnail,
  url: _url,
  shouldRender
  })
  })
  } else {
  $('div.download-items__thumb').each((_, tod) => {
  const thumbnail = $(tod).find('img').attr('src')
  $('div.download-items__btn').each((_, ol) => {
  let _url = $(ol).find('a').attr('href')
  if (!/https?:\/\//.test(_url || '')) _url = `https://snapsave.app${_url}`
  results.push({
  thumbnail,
  url: _url
  })
  })
  })
  }
  if (!results.length) return resolve({ developer: 'Lan', status: false, msg: `Blank data` })
  return resolve({ developer: 'Lan', status: true, data: results })
  } catch (e) {
  return resolve({ developer: 'Lan', status: false, msg: e.message })
  }
  })
}
   /* Tiktokdl
    * @param {String} url
    */
   tiktok = async (url) => {
    try {
        const tokenn = await axios.get("https://downvideo.quora-wiki.com/tiktok-video-downloader#url=" + url);
        let a = cheerio.load(tokenn.data);
        let token = a("#token").attr("value");
        const param = {
            url: url,
            token: token,
        };
        const { data } = await axios.request("https://downvideo.quora-wiki.com/system/action.php", {
                method: "post",
                data: new URLSearchParams(Object.entries(param)),
                headers: {
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
                    "referer": "https://downvideo.quora-wiki.com/tiktok-video-downloader",
                },
            }
        );
        return {
            status: 200,
            title: data.title,
            thumbnail: "https:" + data.thumbnail,
            duration: data.duration,
            media: data.medias,
        };
    } catch (e) {
        return e
    }
   }
   /* XnxxDl
    * @param {String} URL
    */
   xnxxdl = async (URL) => {
	return new Promise((resolve, reject) => {
		fetch(`${URL}`, {method: 'get'})
		.then(res => res.text())
		.then(res => {
			let $ = cheerio.load(res, {
				xmlMode: false
			});
			const title = $('meta[property="og:title"]').attr('content');
			const duration = $('meta[property="og:duration"]').attr('content');
			const image = $('meta[property="og:image"]').attr('content');
			const videoType = $('meta[property="og:video:type"]').attr('content');
			const videoWidth = $('meta[property="og:video:width"]').attr('content');
			const videoHeight = $('meta[property="og:video:height"]').attr('content');
			const info = $('span.metadata').text();
			const videoScript = $('#video-player-bg > script:nth-child(6)').html();
			const files = {
				low: (videoScript.match('html5player.setVideoUrlLow\\(\'(.*?)\'\\);') || [])[1],
				high: videoScript.match('html5player.setVideoUrlHigh\\(\'(.*?)\'\\);' || [])[1],
				HLS: videoScript.match('html5player.setVideoHLS\\(\'(.*?)\'\\);' || [])[1],
				thumb: videoScript.match('html5player.setThumbUrl\\(\'(.*?)\'\\);' || [])[1],
				thumb69: videoScript.match('html5player.setThumbUrl169\\(\'(.*?)\'\\);' || [])[1],
				thumbSlide: videoScript.match('html5player.setThumbSlide\\(\'(.*?)\'\\);' || [])[1],
				thumbSlideBig: videoScript.match('html5player.setThumbSlideBig\\(\'(.*?)\'\\);' || [])[1],
			};
			resolve({
				status: 200,
				result: {
					title,
					URL,
					duration,
					image,
					videoType,
					videoWidth,
					videoHeight,
					info,
					files
				}
			})
		})
		.catch(err => reject({code: 503, status: false, result: err }))
	})
                        }
   /* XnxxSearch
    * @param {String} query
    */
   xnxxsearch = async (query) => {
	return new Promise((resolve, reject) => {
		const baseurl = 'https://www.xnxx.com'
		fetch(`${baseurl}/search/${query}/${Math.floor(Math.random() * 3) + 1}`, {method: 'get'})
		.then(res => res.text())
		.then(res => {
			let $ = cheerio.load(res, {
				xmlMode: false
			});
			let title = [];
			let url = [];
			let desc = [];
			let results = [];

			$('div.mozaique').each(function(a, b) {
				$(b).find('div.thumb').each(function(c, d) {
					url.push(baseurl+$(d).find('a').attr('href').replace("/THUMBNUM/", "/"))
				})
			})
			$('div.mozaique').each(function(a, b) {
				$(b).find('div.thumb-under').each(function(c, d) {
					desc.push($(d).find('p.metadata').text())
					$(d).find('a').each(function(e,f) {
					    title.push($(f).attr('title'))
					})
				})
			})
			for (let i = 0; i < title.length; i++) {
				results.push({
					title: title[i],
					info: desc[i],
					link: url[i]
				})
			}
			resolve({
				code: 200,
				status: true,
				result: results
			})
		})
		.catch(err => reject({code: 503, status: false, result: err }))
	})
   }
   /* YtMP4
    * @param {String} query
    */
   ytmp4 = async (query) => {
    return new Promise((resolve, reject) => {
        try {
            const search = yts(query)
            .then((data) => {
                const url = []
                const pormat = data.all
                for (let i = 0; i < pormat.length; i++) {
                    if (pormat[i].type == 'video') {
                        let dapet = pormat[i]
                        url.push(dapet.url)
                    }
                }
                const id = ytdl.getVideoID(url[0])
                const yutub = ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`)
                .then((data) => {
                    let pormat = data.formats
                    let video = []
                    for (let i = 0; i < pormat.length; i++) {
                    if (pormat[i].container == 'mp4' && pormat[i].hasVideo == true && pormat[i].hasAudio == true) {
                        let vid = pormat[i]
                        video.push(vid.url)
                    }
                   }
                    const title = data.player_response.microformat.playerMicroformatRenderer.title.simpleText
                    const thumb = data.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url
                    const channel = data.player_response.microformat.playerMicroformatRenderer.ownerChannelName
                    const views = data.player_response.microformat.playerMicroformatRenderer.viewCount
                    const published = data.player_response.microformat.playerMicroformatRenderer.publishDate
                    const result = {
                    title: title,
                    thumb: thumb,
                    channel: channel,
                    published: published,
                    views: views,
                    url: video[0]
                    }
                    return(result)
                })
                return(yutub)
            })
            resolve(search)
        } catch (error) {
            reject(error)
        }
        console.log(error)
    })
   }
   /* YtMP3
    * @param {String} query
    */
   ytmp3 = async (query) => {
    return new Promise((resolve, reject) => {
        try {
            const search = yts(query)
            .then((data) => {
                const url = []
                const pormat = data.all
                for (let i = 0; i < pormat.length; i++) {
                    if (pormat[i].type == 'video') {
                        let dapet = pormat[i]
                        url.push(dapet.url)
                    }
                }
                const id = ytdl.getVideoID(url[0])
                const yutub = ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`)
                .then((data) => {
                    let pormat = data.formats
                    let audio = []
                    let video = []
                    for (let i = 0; i < pormat.length; i++) {
                    if (pormat[i].mimeType == 'audio/webm; codecs=\"opus\"') {
                        let aud = pormat[i]
                        audio.push(aud.url)
                    }
                    }
                    const title = data.player_response.microformat.playerMicroformatRenderer.title.simpleText
                    const thumb = data.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url
                    const channel = data.player_response.microformat.playerMicroformatRenderer.ownerChannelName
                    const views = data.player_response.microformat.playerMicroformatRenderer.viewCount
                    const published = data.player_response.microformat.playerMicroformatRenderer.publishDate
                    const result = {
                    status: true,
                    code: 200,
                    creator: creator,
                    title: title,
                    thumb: thumb,
                    channel: channel,
                    published: published,
                    views: views,
                    url: audio[0]
                    }
                    return(result)
                })
                return(yutub)
            })
            resolve(search)
        } catch (error) {
            reject(error)
        }
        console.log(error)
    })
 }
   /* IG Stalk
    * @param {String} Username
    */
   igstalk = async (Username) => {
  return new Promise((resolve, reject) => {
    axios.get('https://dumpor.com/v/'+Username, {
      headers: {
        "cookie": "_inst_key=SFMyNTY.g3QAAAABbQAAAAtfY3NyZl90b2tlbm0AAAAYWGhnNS1uWVNLUU81V1lzQ01MTVY2R0h1.fI2xB2dYYxmWqn7kyCKIn1baWw3b-f7QvGDfDK2WXr8",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
      }
    }).then(res => {
      const $ = cheerio.load(res.data)
      const result = {
        profile: $('#user-page > div.user > div.row > div > div.user__img').attr('style').replace(/(background-image: url\(\'|\'\);)/gi, ''),
        fullname: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > div > a > h1').text(),
        username: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > div > h4').text(),
        post: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(1)').text().replace(' Posts',''),
        followers: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(2)').text().replace(' Followers',''),
        following: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(3)').text().replace(' Following',''),
        bio: $('#user-page > div.user > div > div.col-md-5.my-3 > div').text()
      }
      resolve(result)
    })
  })
   }
   /* Hentai Video
    * @param {}
    */
   hentaivid = async () => {
    return new Promise((resolve, reject) => {
        const page = Math.floor(Math.random() * 1153)
        axios.get('https://sfmcompile.club/page/'+page)
        .then((data) => {
            const $ = cheerio.load(data.data)
            const hasil = []
            $('#primary > div > div > ul > li > article').each(function (a, b) {
                hasil.push({
                    title: $(b).find('header > h2').text(),
                    link: $(b).find('header > h2 > a').attr('href'),
                    category: $(b).find('header > div.entry-before-title > span > span').text().replace('in ', ''),
                    share_count: $(b).find('header > div.entry-after-title > p > span.entry-shares').text(),
                    views_count: $(b).find('header > div.entry-after-title > p > span.entry-views').text(),
                    type: $(b).find('source').attr('type') || 'image/jpeg',
                    video_1: $(b).find('source').attr('src') || $(b).find('img').attr('data-src'),
                    video_2: $(b).find('video > a').attr('href') || ''
                })
            })
            resolve(hasil)
        })
    })
}
   /* ML Stalk
    * @param {String}
    * @param {String}
    */
   mlstalk = async (id, zoneId) => {
    return new Promise(async (resolve, reject) => {
      axios
        .post(
          'https://api.duniagames.co.id/api/transaction/v1/top-up/inquiry/store',
          new URLSearchParams(
            Object.entries({
              productId: '1',
              itemId: '2',
              catalogId: '57',
              paymentId: '352',
              gameId: id,
              zoneId: zoneId,
              product_ref: 'REG',
              product_ref_denom: 'AE',
            })
          ),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Referer: 'https://www.duniagames.co.id/',
              Accept: 'application/json',
            },
          }
        )
        .then((response) => {
          resolve(response.data.data.gameDetail)
        })
        .catch((err) => {
          reject(err)
        })
    })
}
   /* Control net
    * @param {String} text
    * @param {String} nprompt
    * @param {String} url
    * @param {String} model
    * @param {String} module
    * @param {String} sampler
    * @param {String} height
    * @param {String} width
    * @param {String} XprodiaKey
    */
     controlnet = async (text, nprompt, url, model, module, sampler, height, width, XprodiaKey) => {
      return new Promise(async (resolve) => {
	 try {
	    const options = {
  method: 'POST',
  url: 'https://api.prodia.com/v1/controlnet',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json',
    'X-Prodia-Key': XprodiaKey
  },
  data: {
    resize_mode: 0,
    controlnet_model: model,
    threshold_a: 100,
    threshold_b: 200,
    controlnet_module: module,
    prompt: text,
    negative_prompt: nprompt,
    steps: 25,
    cfg_scale: 7,
    seed: -1,
    sampler: sampler,
    height: 512,
    width: 512,
    imageUrl: url
  }
};

axios
  .request(options)
  .then(function (response) {
    resolve({
               creator: creator,
               status: true,
               model: model,
               msg: `https://images.prodia.xyz/${response.data.job}.png`
            })
  })
  .catch(function (error) {
    console.error(error);
	  resolve({
               creator: creator,
               status: false
            })
  });
      } catch (e) {
            console.log(e)
            return resolve({
               creator: creator,
               status: false
            })
         }
      })
     }
   /* To Text2Img
    * @param {String} text
    * @param {String} eff
    * @param {String} upscale
    * @param {String} sampler
    * @param {String} ratio
    * @param {String} XprodiaKey
    */
     text2img = async (text, eff, upscale, sampler, ratio, XprodiaKey) => {
      return new Promise(async (resolve) => {
         try {
            const options = {
  method: 'POST',
  url: 'https://api.prodia.com/v1/job',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json',
    'X-Prodia-Key': XprodiaKey
  },
  data: {
    model: eff,
    prompt: text,
    negative_prompt: 'canvas frame, cartoon, 3d, ((disfigured)), ((bad art)), ((deformed)),((extra limbs)),((close up)),((b&w)), weird colors, blurry, (((duplicate))), ((morbid)), ((mutilated)), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), out of frame, ugly, extra limbs, (bad anatomy), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), mutated hands, (fused fingers), (too many fingers), (((long neck))), Photoshop, video game, ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, mutation, mutated, extra limbs, extra legs, extra arms, disfigured, deformed, cross-eye, body out of frame, blurry, bad art, bad anatomy, 3d render',
    steps: 25,
    cfg_scale: 7,
    seed: -1,
    upscale: upscale,
    sampler: sampler,
    aspect_ratio: ratio
  }
}
axios
  .request(options)
  .then(function (response) {
    console.log(response.data);
    resolve({
               creator: creator,
               status: true,
               model: eff,
               msg: response.data.job
            })
  })
  .catch(function (error) {
    console.error(error);
    resolve({
               creator: creator,
               status: false
            })
  });
            
         } catch (e) {
            console.log(e)
            return resolve({
               creator: creator,
               status: false
            })
         }
      })
   }
   /* Chat AI
    * @param {String} bid
    * @param {String} key
    * @param {String} text
    */
   chatAI = (bid, key, text) => {
      return new Promise(async (resolve) => {
         try {
            let json = await (await axios.get('http://api.brainshop.ai/get?bid=' + bid + '&key=' + key + '&uid=neoxr&msg=' + encodeURI(text))).data
            if (typeof json.cnt == 'undefined') return resolve({
               creator: creator,
               status: false
            })
            resolve({
               cretor: creator,
               status: true,
               msg: json.cnt
            })
         } catch (e) {
            console.log(e)
            return resolve({
               creator: creator,
               status: false
            })
         }
      })
   }

   /* Simsimi Chat
    * @param {String} text
    */
   simsimi = (text, lang = 'id') => {
      return new Promise(async (resolve) => {
         try {
            let json = await (await axios.post('https://simsimi.vn/web/simtalk', `text=${encodeURI(text)}&lc=${lang}`, {
               headers: {
                  'Accept': '*/*',
                  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                  'Referer': 'https://simsimi.net/',
                  'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36'
               }
            })).data
            if (json.success.match(new RegExp('Aku tidak mengerti', 'g'))) return resolve({
               creator: creator,
               status: false
            })
            resolve({
               cretor: creator,
               status: true,
               msg: json.success
            })
         } catch (e) {
            console.log(e)
            return resolve({
               creator: creator,
               status: false
            })
         }
      })
   }

   /* Simsimi Chat V2
    * @param {String} text
    */
   simsimiV2 = (text, lang = 'id') => {
   return new Promise(async resolve => {
      try {
         let form = new URLSearchParams
         form.append('text', text)
         form.append('lc', lang)
         const json = await (await axios.post('https://api.simsimi.vn/v1/simtalk', form, {
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
            }
         })).data
         resolve({
            creator: global.creator,
            status: true,
            msg: json.message
         })
      } catch (e) {
         resolve({
            creator: global.creator,
            status: false,
            msg: e.message
         })
      }
   })
}

   /* URL Shortener
    * @param {String} url
    */
   shorten = (url) => {
      return new Promise(async (resolve) => {
         try {
            let params = new URLSearchParams()
            params.append('url', url)
            let json = await (await fetch('https://s.nxr.my.id/api', {
               method: 'POST',
               body: params
            })).json()
            if (json.error) return resolve({
               creator: creator,
               status: false
            })
            resolve({
               creator: creator,
               status: true,
               data: {
                  url: 'https://s.nxr.my.id/r/' + json.data.code
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: creator,
               status: false
            })
         }
      })
   }

   /* Image Uploader (freeimage.host) [Permanent]
    * @param {Buffer} buffer
    */
   uploadImage = async input => {
      return new Promise(async resolve => {
         try {
            const image = Buffer.isBuffer(input) ? input : input.startsWith('http') ? await (await axios.get(input, {
               responseType: 'arraybuffer'
            })).data : input
            let form = new FormData
            form.append('source', Buffer.from(image), 'image.jpg')
            form.append('type', 'file')
            form.append('action', 'upload')
            form.append('timestamp', (new Date() * 1))
            form.append('auth_token', '3b0ead89f86c3bd199478b2e14afd7123d97507f')
            form.append('nsfw', 0)
            const json = await (await axios.post('https://freeimage.host/json', form, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": "https://freeimage.host",
                  "Referer": "https://freeimage.host/",
                  "Referrer-Policy": "strict-origin-when-cross-origin",
                  "sec-ch-ua": '"Chromium";v="107", "Not=A?Brand";v="24"',
                  "sec-ch-ua-platform": "Android",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "x-requested-with": "XMLHttpRequest",
                  ...form.getHeaders()
               }
            })).data
            if (json.status_code != 200) return resolve({
               creator: creator,
               status: false,
               msg: `Failed to Upload!`
            })
            resolve({
               creator: creator,
               status: true,
               original: json,
               data: {
                  url: json.image.url
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: creator,
               status: false,
               msg: e.message
            })
         }
      })
   }

   /* Image Uploader V2 (707a8191-3fe9-4568-a03e-763edd45f0bb.id.repl.co) [Temp]
    * @param {Buffer} buffer
    */
   uploadImageV2 = (buffer) => {
      return new Promise(async (resolve, reject) => {
         try {
            const server = await (await axios.get('https://neoxr.my.id/srv')).data
            const {
               ext
            } = await fromBuffer(buffer)
            let form = new FormData
            form.append('someFiles', buffer, 'tmp.' + ext)
            let json = await (await fetch(server.api_path, {
               method: 'POST',
               body: form
            })).json()
            resolve(json)
         } catch (e) {
            console.log(e)
            return resolve({
               creator: creator,
               status: false,
               msg: e.message
            })
         }
      })
   }

   /* Image Uploader (telegra.ph)
    * @param {Buffer} buffer
    */
   uploadImageV3 = async (str) => {
      return new Promise(async resolve => {
         try {
            const image = Buffer.isBuffer(str) ? str : str.startsWith('http') ? await (await axios.get(str, {
               responseType: 'arraybuffer'
            })).data : str
            const {
               ext
            } = await fromBuffer(image)
            let form = new FormData
            form.append('file', Buffer.from(image), 'image.' + ext)
            const json = await (await axios.post('https://telegra.ph/upload', form, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": "https://telegra.ph",
                  "Referer": "https://telegra.ph",
                  "Referrer-Policy": "strict-origin-when-cross-origin",
                  "sec-ch-ua": '"Chromium";v="107", "Not=A?Brand";v="24"',
                  "sec-ch-ua-platform": "Android",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "x-requested-with": "XMLHttpRequest",
                  ...form.getHeaders()
               }
            })).data
            if (!json || json.length < 1) return resolve({
               creator: creator,
               status: false,
               msg: 'Failed to upload!'
            })
            resolve({
               creator: creator,
               status: true,
               data: {
                  url: 'https://telegra.ph' + json[0].src
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: creator,
               status: false,
               msg: e.message
            })
         }
      })
   }

   /* File Uploader (707a8191-3fe9-4568-a03e-763edd45f0bb.id.repl.co) [Permanent]
    * @param {Buffer} buffer
    */
   uploadFile = (buffer) => {
      return new Promise(async (resolve, reject) => {
         try {
            const server = await (await axios.get('https://neoxr.my.id/srv')).data
            const {
               ext
            } = await fromBuffer(buffer)
            let form = new FormData
            form.append('someFiles', buffer, 'file.' + ext)
            let json = await (await fetch(server.api_path, {
               method: 'POST',
               body: form
            })).json()
            resolve(json)
         } catch (e) {
            console.log(e)
            return resolve({
               creator: creator,
               status: false,
               msg: e.message
            })
         }
      })
   }

   /* Temp File Upload (file.io)
    * @param {Buffer} buffer
    * @param {String} name
    */
   uploadFileV2 = (buffer, name) => {
      return new Promise(async (resolve) => {
         try {
            if (!Buffer.isBuffer(buffer)) return resolve({
               status: false
            })
            let {
               ext
            } = await fromBuffer(buffer) || {}
            let extention = (typeof ext == 'undefined') ? 'txt' : ext
            let form = new FormData
            form.append('file', buffer, name + '.' + extention)
            const json = await (await fetch('https://file.io/', {
               method: 'POST',
               headers: {
                  Accept: '*/*',
                  'Accept-Language': 'en-US,enq=0.9',
                  'User-Agent': 'GoogleBot'
               },
               body: form
            })).json()
            if (!json.success) return resolve({
               creator: creator,
               status: false
            })
            delete json.success
            delete json.status
            resolve({
               creator: creator,
               status: true,
               data: json
            })
         } catch (e) {
            resolve({
               creator: creator,
               status: false
            })
         }
      })
   }

   /* To Video (EzGif)
    * @param {String|Buffer} str
    */
   toVideo = async (str) => {
      return new Promise(async resolve => {
         try {
            const image = Buffer.isBuffer(str) ? str : str.startsWith('http') ? await (await axios.get(str, {
               responseType: 'arraybuffer'
            })).data : str
            let form = new FormData
            form.append('new-image', Buffer.from(image), 'image.webp')
            form.append('new-image-url', '')
            const html = await (await axios.post('https://s7.ezgif.com/webp-to-mp4', form, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": "https://ezgif.com",
                  "Referer": "https://ezgif.com/webp-to-mp4",
                  "Referrer-Policy": "strict-origin-when-cross-origin",
                  "sec-ch-ua": '"Chromium";v="107", "Not=A?Brand";v="24"',
                  "sec-ch-ua-platform": "Android",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "x-requested-with": "XMLHttpRequest",
                  ...form.getHeaders()
               }
            })).data
            const $ = cheerio.load(html)
            let File = $('#main > form').find('input[type=hidden]:nth-child(1)').attr('value')
            let token = $('#main > form').find('input[type=hidden]:nth-child(2)').attr('value')
            let Submit = $('#tool-submit-button').find('input').attr('value')
            const Format = {
               file: File,
               token: token,
               convert: Submit
            }
            const proc = await (await axios({
               url: "https://ezgif.com/webp-to-mp4/" + File,
               method: "POST",
               data: new URLSearchParams(Object.entries(Format)),
               headers: {
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": "https://ezgif.com",
                  "Referer": "https://ezgif.com/webp-to-mp4",
                  "Referrer-Policy": "strict-origin-when-cross-origin",
                  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                  "accept-language": "en-US,en;q=0.9,id;q=0.8",
                  "content-type": "application/x-www-form-urlencoded",
                  "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\""
               }
            })).data
            const link = cheerio.load(proc)('#output > p.outfile').find('video > source').attr('src')
            if (!link) return resolve({
               creator: creator,
               status: false,
               msg: 'Failed to convert!'
            })
            resolve({
               creator: creator,
               status: true,
               data: {
                  url: 'https:' + link
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: creator,
               status: false,
               msg: e.message
            })
         }
      })
   }
   
   /* To JPEG / JPG
    * @param {String|Buffer} str
    */
   toJpg = async (str) => {
      return new Promise(async resolve => {
         try {
            const parse = await (await axios.get('https://tiny-img.com/webp/'))
            const cookie = parse.headers['set-cookie'].join('; ')
            const image = Buffer.isBuffer(str) ? str : str.startsWith('http') ? await (await axios.get(str, {
               responseType: 'arraybuffer'
            })).data : str
            let form = new FormData
            form.append('file', Buffer.from(image), (Math.random() + 1).toString(36).substring(7) + '.webp')
            const json = await (await axios.post('https://tiny-img.com/app/webp-files/', form, {
               headers: {
                  "Accept": "*/*",
                  "User-Agent": "Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36",
                  "Origin": "https://tiny-img.com/",
                  "Referer": "https://tiny-img.com",
                  "Referrer-Policy": "strict-origin-when-cross-origin",
                  "sec-ch-ua": '"Chromium";v="107", "Not=A?Brand";v="24"',
                  "sec-ch-ua-platform": "Android",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  cookie,
                  ...form.getHeaders(),
                  "x-requested-with": "XMLHttpRequest"
               }
            })).data
            if (!json.success) return resolve({
               creator: creator,
               status: false,
               msg: 'Failed to convert!'
            })
            resolve({
               creator: creator,
               status: true,
               data: {
                  url: json.optimized_image_url
               }
            })
         } catch (e) {
            console.log(e)
            resolve({
               creator: creator,
               status: false,
               msg: e.message
            })
         }
      })
   }
   
    model = async () => {
    return new Promise(async resolve => {
const options = {
  method: 'GET',
  url: 'https://api.prodia.com/v1/models/list',
  headers: {
    accept: 'application/json',
    'X-Prodia-Key': "e301b3ad-2e65-4bef-92ff-28713b6ebb01"
  }
};

axios
  .request(options)
  .then(function (response) {
    console.log(response.data);
    resolve({
        creator: creator,
        status: true,
         model: response.data
  })
})
  .catch(function (error) {
    console.error(error);
        resolve({
            creator: creator,
            status: false
        })
  });
    })
}

Gpt = async (text, content, stream = false) => {
  return new Promise(async (resolve, reject) => {
    axios("https://www.chatgptdownload.org/wp-json/mwai-ui/v1/chats/submit", {
      "headers": {
        "content-type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36"
      },
      data: {
        "id": null,
        "botId": "default",
        "session": "y2cog0j45q",
        "clientId": "7tzjniqtrgx",
        "contextId": 443,
        "messages": [{
          "id": "fkzhaikd7vh",
          "role": "assistant",
          "content": content,
          "who": "AI: ",
          "timestamp": 1695725910365
        }],
        "newMessage": text,
        "stream": stream
      },
      "method": "POST"
    }).then(response => {
      resolve(response.data);
    });
  });
};

Gptv2 = async (text, content = "You will provide an answer for a student's homework question.", prompt = "Please take this question and provide an answer that matches the length as defined by the 'length' parameter. Please make sure it is exactly the right size: no more and no less. You must write the appropriate amount of words/sentences. Please also indicate true/false if the topic is sensitive/inappropriate. It is critical that your answer length is defined by the 'length' parameter. Do not write any more or less than the requested length, even if you think additional context might be required.") => {
return new Promise(async (resolve, reject) => {
const url = 'https://gptfree.top/api/experiments/model';
const headers = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Infinix X6812B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.98 Mobile Safari/537.36',
  'Referer': 'https://gptfree.top/homework',
};
const data = {
  overview: content,
  prompt: prompt,
  inputParameters: ["question", "length"],
  outputKeys: ["response", "sensitiveTopic"],
  input: {
    question: "hello",
    length: "Regular Sentence"
  }
};

axios.post(url, data, { headers })
  .then(response => {
    console.log(response.data);
    resolve(response.data);
  })
  .catch(error => {
    console.error(error);
    resolve(error.response.data)
  });
 });
}

Leveling = async (thumb) => {
return new Promise(async (resolve, reject) => {
const rank = await new knights.Up()
    .setAvatar(thumb) 
    .toAttachment();
const data = rank.toBuffer();
resolve({ 
       creator: "Ryan Erwin",
       result: data
     })
   })
 }

tiktokVoice = async (text, voice) => {
 return new Promise(async resolve => {
const options = {
  method: 'POST',
  baseURL: "https://tiktok-tts.weilnet.workers.dev",
  url: '/api/generation',
  headers: {
    accept: 'application/json',
    responseType: "arraybuffer"
  },
  data: {
  	text: text,
      voice: voice
  }
};

axios
  .request(options)
  .then(function (response) {
    console.log(response);
    resolve(response.data.data) 
})
  .catch(function (error) {
    console.error(error);
        resolve({
            creator: "Ryan Erwin",
            status: false,
            data: error.response.data.data
        })
  });
    })
}

tiktokvoiceV2 = async (text, voice = 'en_us_001') => {
    return new Promise(async resolve => {
const options = {
  method: 'POST',
  url: 'https://gesserit.co/api/tiktok-tts',
  headers: {
    "User-Agent": 'Mozilla/5.0 (Linux; Android 11; Infinix X6812B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.98 Mobile Safari/537.36',
    "responseType": "arraybuffer",
     Referer: "https://gesserit.co/tiktok"
  },
  data: {
      text: text,
      voice: voice
  }
};

axios
  .request(options)
  .then(function (response) {
    console.log(response.data);
    resolve(response.data.audioUrl)
})
  .catch(function (error) {
    console.error(error);
        resolve({
            creator: "Roku Dev", 
            status: false
        })
  });
    })
}

Luna = async (text, example = '') => {
  return new Promise(async (resolve, reject) => {
    axios("https://luna-ibfx.onrender.com/", {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 11; Infinix X6812B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.98 Mobile Safari/537.36",
        "Referer": "https://chatluna.vercel.app/"
      },
      data: {
        userInput: text,
        context: "You are Luna, a friendly and knowledgeable conversational AI created by the expert mind of Roku Dev. You can assist in various tasks such as cracking jokes, coding, content summarization, poem writing, general knowledge, and helping with assignments. If someone asks for my name, You will respond with LUNA, which stands for Learning Users Need and Adapting. Roku Dev is the sole developer who worked on and created you.",
        example: example
      },
      "method": "POST"
    }).then(response => {
      resolve(response.data);
    });
  });
};

Kuki = async (text) => {
  return new Promise(async (resolve, reject) => {
    axios("https://kuli.kuki.ai/cptalk", {
      "headers": {
        "Content-type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Linux; Android 11; Infinix X6812B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.98 Mobile Safari/537.36",
        "Referer": "https://chat.kuki.ai/chat"
      },
      data: {
        uid: "04fa55b0b5bf5d44",
        input: encodeURIComponent(text),
        sessionid: 484806323
      },
      "method": "POST"
    }).then(response => {
      resolve(response.data);
    });
  });
};

ChatAi = async (text, system = "Your name is Rokumo, AI assistant based on a robot cat is smart and all-knowing made by Riansyah (handsome ceo bos), and the assistant is slang like a South Jakarta teenager.") => {
return new Promise(async (resolve, reject) => {
  try {
    const response = await axios("https://zerogptai.org/wp-json/mwai-ui/v1/chats/submit", {
      headers: {
        "Content-Type": "application/json",
        "X-WP-Nonce": "6c51903459",
        "Accept": "text/event-stream",
        "User-Agent": "Mozilla/5.0 (Linux; Android 11; Infinix X6812B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.98 Mobile Safari/537.36",
        "Referer": "https://zerogptai.org"
      },
      data: {
        botId: "default",
        customId: null,
        session: "N/A",
        chatId: "bbjz8s06e6",
        contextId: 39,
        messages: [{ id:"061jrhq6b327", role :"assistant", content: system, who: "AI: ", timestamp :1702528927254 }],
        newMessage: text, 
        stream: false
      },
      method: "POST"
    });
    if (response.status === 200) {
      resolve(response.data);
    } else {
      reject(new Error(`Chat submission failed: ${response}`));
    }
  } catch (error) {
    console.error(error);
    reject(error);
  }
 })
};

});