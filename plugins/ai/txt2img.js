const { Prodia } = require("prodia.js")
module.exports = {
	name: ["txt2img"],
	command: ["txt2img", "text2img"],
	tags: ["ai"],
	use: "Example: .text2img 1 girl",
	run: async (m, { conn }) => {
		try {
		const prodia = new Prodia("e301b3ad-2e65-4bef-92ff-28713b6ebb01")
		 const setting = db.settings
    const generate = await prodia.generateImage({
     prompt: m.text,
     model: setting.model,
     negative_prompt: "BadDream, (UnrealisticDream:1.3), poorly dawn, physical disability",
     sampler: "DPM++ SDE Karras",
     cfg_scale: 9,
     steps: 30,
     aspect_ratio: "portrait"
    })
    
    while (generate.status !== "succeeded" && generate.status !== "failed") {
        new Promise((resolve) => setTimeout(resolve, 250));

        const job = await prodia.getJob(generate.job);

        if (job.status === "succeeded") {
             conn.sendMessage(m.sender, { image: { url: job.imageUrl }, caption: `Result Prompt: ${m.text}` }, { quoted: m });
            break;
        }
    }
		} catch (e) {
			console.error(e)
			m.reply(config.msg.error) 
		}
	}
}