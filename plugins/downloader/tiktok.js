const tiktok = require("../../system/lib/tiktok")
module.exports = {
  name: "tiktok",
  command: ["tiktok", "tt"],
  tags: ["download"],
  run: async (m, { conn }) => {
 try {
  if (!m.text) return m.reply(config.msg.noUrl);
    if (!(m.text.includes("http://") || m.text.includes("https://")))
      return m.reply(
        `url invalid, please input a valid url. Try with add http:// or https://`,
      );
   if (!m.text.includes("tiktok.com")) return m.reply(`Invalid Tiktok URL.`);
 const old = new Date();
 const data = await tiktok.download(m.text)
 if (!data.result.is_image) {
    try {
     let caption = `[ Tiktok Downloader ]\n• Type: Image\n• Author: ${data.result.author.nickname} (${data.result.author.username})\n• Like: ${data.result.stats.digg_count}\n• Share: ${data.result.stats.share_count}\n• Play: ${data.result.stats.play_count}\n• Caption: ${data.result.caption}`
     m.reply(caption)
     for (let x = 0; x < data.result.media.length; x++) {
     await conn.sendMessage(m.sender, { image: { url: data.result.media[x] }, caption: `Fetching: ${((new Date - old) * 1)} ms` }, { quoted: m });
      }
   } catch (i) {
        return m.reply(Func.jsonFormat(i))
   }
 } else if (!data.result.is_video) {
 let cap = `[ Tiktok Downloader ]\n• Type: Video\n• Author: ${data.result.author.nickname} (${data.result.author.username})\n• Like: ${data.result.stats.digg_count}\n• Share: ${data.result.stats.share_count}\n• Play: ${data.result.stats.play_count}\n• Caption: ${data.result.caption}`
 m.reply(cap)
  conn.sendMessage(m.sender, { video: { url: data.result.media }, caption: `Fetching: ${((new Date - old) * 1)} ms` }, { quoted: m });
   }
 } catch (e) {
    console.log(e)
    m.reply(Func.jsonFormat(e))
  }
 },
};