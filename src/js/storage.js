// Abstração de armazenamento de sessão.
// Tudo é salvo no sessionStorage e desaparece ao fechar a aba/navegador.

const PREFIX = 'studyhub';

export const storage = {
  get(key) {
    return sessionStorage.getItem(`${PREFIX}:${key}`);
  },

  set(key, value) {
    sessionStorage.setItem(`${PREFIX}:${key}`, value);
  },

  remove(key) {
    sessionStorage.removeItem(`${PREFIX}:${key}`);
  },

  getJSON(key) {
    const raw = this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setJSON(key, value) {
    this.set(key, JSON.stringify(value));
  }
};