module.exports = {
  name: "npm",
  command: ["npm"],
  tags: ["tools"],
  run: async (m, { conn }) => {
  if (!m.text) return m.reply('Input Query')
	let res = Func.jsonFormat(await Func.fetchJson(`http://registry.npmjs.com/-/v1/search?text=${m.text}`))
	let objects = res.objects
	if (!objects.length) return m.reply(`Query "${m.text}" not found :/`)
	let txt = objects.map(({ package: pkg }) => {
		return `*${Func.Styles(pkg.name)}* (v${pkg.version})\n_${pkg.links.npm}_\n_${Func.Styles(pkg.description)}_`
	}).join`\n\n`
   conn.sendMessage(m.chat, {
      text: txt,
      contextInfo: {
        externalAdReply: {
          title: "NPM - JS",
          body: '',
          thumbnailUrl: "https://telegra.ph/file/c416638747ec63d97d20b.jpg",
          sourceUrl: "",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })
  },
}