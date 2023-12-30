const Bard  = require("ai-bard");
const { BardAPI } = require('bard-api-node');

async function testAssistant(query) {
  try {
    const assistant = new BardAPI();
    await assistant.setSession('__Secure-1PSID', 'eQhj839a2aUb8dgL5tXkQb6S_R1DVoNZTrF0uZaM3S-gfMgFX7YYCjG2CdzTPK9KHirRRQ.'); 
    const response = await assistant.getBardResponse(query);
    return response.content;
  } catch (error) {
    return error;
  }
}

module.exports = {
  name: "bard",
  command: ["bard"],
  tags: ["ai"],
  run: async (m, { conn }) => {
    try {
    if (!m.text) return m.reply("Yes, can I help you ?");
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (/image\/(jpe?g|png)/.test(mime)) {
      try {
        let img = await q.download()
        const bard = new Bard("eQhj839a2aUb8dgL5tXkQb6S_R1DVoNZTrF0uZaM3S-gfMgFX7YYCjG2CdzTPK9KHirRRQ.")
        let respon = await bard.ask(m.text, { image: img })
        m.reply(respon)
      } catch (i) {
        return conn.reply(m.chat, Func.jsonFormat(i), m)
      }
    } else if (m.text) {
      const json = await testAssistant(m.text)
      m.reply(Func.jsonFormat(json))
    }
  } catch (e) {
    console.log(e)
    m.reply(Func.jsonFormat(e))
  }
 },
 };