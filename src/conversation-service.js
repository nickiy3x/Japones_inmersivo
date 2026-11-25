/**
 * Punto de conexión del backend. Escritura y voz transcrita entregan
 * el mismo objeto { text, channel, scenario, session } a sendTurn.
 * Un adaptador remoto enviará el turno y aplicará la respuesta validada
 * al estado local. La transcripción y la síntesis se conectan aquí.
 */
const conversation = {
  async sendTurn({text, scenario, session}) {
    return scenario === 'restaurant'
      ? processTurn(text, session)
      : freeTurn(text, session, session.write);
  },

  async transcribe({sample}) {
    return {text:plain(sample.m), m:sample.m, sim:true};
  },

  synthesize(utterance) {
    window.speechSynthesis.speak(utterance);
  }
};
