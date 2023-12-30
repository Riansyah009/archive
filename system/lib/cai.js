require('dotenv/config')
const CharacterAI = require("node_characterai")

class CharacterAiHandler {
  constructor() {
    this.characterAI = new CharacterAI();
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.characterAI.authenticateWithToken(config.cai);
      this.initialized = true;
    }
  }

  async createOrContinueChat(characterId) {
    await this.initialize();
    return this.characterAI.createOrContinueChat(characterId);
  }

  async sendMessage(characterId, message) {
    await this.initialize();
    const chat = await this.createOrContinueChat(characterId);
    const response = await chat.sendAndAwaitResponse(message, true);
    return response;
  }
}

const charAi = new CharacterAiHandler();
module.exports = charAi;