require("dotenv").config();
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Jakarta").locale("id")
const sekarang = moment.tz('Asia/Jakarta').format('dddd, DD MMMM YYYY')

module.exports = {
	options: {
      public: false,
      antiCall: true, // reject call
      database: "database.json", // End .json when using JSON database or use Mongo URI
      owner: ["6282253969170"], // set owner number on here
      pairing: "6288213503541",
      sessionName: "session", // for name session
      prefix: /^[°•π÷×¶∆£¢€¥®™+✓_|/~!?@#%^&.©^]/i,
      pairingNumber: "", // Example Input : 62xxx
      pathPlugins: "plugins",
      wm: ""
   },
   
   // Function Maybee
   reloadFile: (path) => reloadFile(path),
   // Cai Token
    cai: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkVqYmxXUlVCWERJX0dDOTJCa2N1YyJ9.eyJpc3MiOiJodHRwczovL2NoYXJhY3Rlci1haS51cy5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDQwNzc5OTA0ODAxOTQ5MjQwMDIiLCJhdWQiOlsiaHR0cHM6Ly9hdXRoMC5jaGFyYWN0ZXIuYWkvIiwiaHR0cHM6Ly9jaGFyYWN0ZXItYWkudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTcwMzE4MDY3MywiZXhwIjoxNzA1NzcyNjczLCJhenAiOiJkeUQzZ0UyODFNcWdJU0c3RnVJWFloTDJXRWtucVp6diIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwifQ.iNuW1_4drumJ6iRfJxfMcxHtDqtAMEIyOuGTirBVFo2VxRTE9y5HDRqxQwXf3jun-DVJGllQljw-XQXVA-xxeik-4_Bnjm7EB0yudfrxy0vUCiEHvwEcMNmoLm8OgeyXAxNTG_LEnV7yaJnELtaNTthT5tEPwSjbOov1I6vyRsWP1jzYkVd_QVE23oRonDFYFaENhzX7gbvU4e41ZfUV9VasLu3oIuJgtnL9ww-tEb-rVrKvPzT5Oh-p7qn_TQRT-cAr77RmytgSq5042wHGxpMuPKLnZxBit9PAa-6KyZfPaFBM0xVncWVQ6Pk_uAn6jP3S3WH-Rn5ZlFP6ciJ2yA",
   // Rest APIs Cuy
   APIs: {
   	alya: "https://api.alyachan.pro"
   },
   
   APIKeys: {
   	"https://api.alyachan.pro": "rokumo"
   },
   Scraper: require("./system/lib/Scraper"),
   // Set pack name sticker on here
   Exif: {
      packId: "Ryn",
      packName: null,
      packPublish: '         Ryn. - Assistant\n      ——————————————\n\nCreated on date:\n' + sekarang,
      packEmail: "roku-team@valnitio.com",
      packWebsite: "",
      androidApp: "",
      iOSApp: "",
      emojis: [],
      isAvatar: 1,
   },
 
   // message  response awikwok there
   msg: {
      owner: "Features can only be accessed owner!",
      group: "Features only accessible in group!",
      private: "Features only accessible private chat!",
      admin: "Features can only be accessed by group admin!",
      botAdmin: "Bot is not admin, can't use the features!",
      bot: "Features only accessible by me",
      media: "Reply media...",
      query: "Enter Query!",
      noUrl: "please input a url.",
      error: "An error occurred while retrieving data.",
      quoted: "Reply message...",
      wait: "Wait a minute...",
      urlInvalid: "Url Invalid",
      notFound: "Result Not Found!",
      premium: "Premium Only Features!"
   }
}

function reloadFile(file) {
  fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.green(`[ UPDATE ] file => "${file}"`));
    delete require.cache[require.resolve(file)];
    require(file);
  });
} 

reloadFile(require.resolve(__filename))