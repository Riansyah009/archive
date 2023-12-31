const axios = require("axios");
const link = "https://tiktod.eu.org/"
//Download Video / Images 
function download(url) {
  return new Promise((resolve, reject) => {
    if (!url) return reject(new Error("url input is required"));
    axios.get(link + "/download", { params: { url } })
      .then((dl) => resolve(dl.data))
      .catch(reject);
  });
}

//Get User info
function stalk(username) {
  return new Promise((resolve, reject) => {
    if (!url) return reject(new Error("username is required"));
    axios.get(link + "/stalk", { params: { username } })
      .then((stalker) => resolve(stalker.data))
      .catch(reject);
  });
}

//Random Porn Tiktok?
function porn() {
  return new Promise((resolve, reject) => {
    axios.get(link + "/porn")
      .then((porner) => resolve(porner.data))
      .catch(reject);
  });
}

module.exports = { download, stalk, porn };