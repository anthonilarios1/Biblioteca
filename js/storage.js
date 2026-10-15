// Capa de almacenamiento: todo el acceso a localStorage vive aquí.
const Store = {
  KEY: 'biblioteca_v1',
  THEME: 'biblioteca_theme',
  mem: null,
  empty() { return { books: [], members: [], loans: [] }; },
  load() {
    try {
      const d = JSON.parse(localStorage.getItem(this.KEY));
      if (d && Array.isArray(d.books) && Array.isArray(d.members) && Array.isArray(d.loans)) return d;
    } catch (e) {}
    return this.mem || this.empty();
  },
  save(d) {
    this.mem = d;
    try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch (e) {}
  },
  getTheme() { try { return localStorage.getItem(this.THEME); } catch (e) { return null; } },
  setTheme(t) { try { localStorage.setItem(this.THEME, t); } catch (e) {} }
};
