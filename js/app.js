const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const today = () => iso(new Date());
const addDays = (s, n) => { const d = new Date(s + 'T00:00'); d.setDate(d.getDate() + n); return iso(d); };
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 864e5);
const fdate = s => new Date(s + 'T00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

let db = Store.load(), editBook = null, editMember = null;

// ---------- helpers de dominio ----------
const activeOf = b => db.loans.filter(l => l.bookId === b.id && !l.returned).length;
const availOf = b => b.copies - activeOf(b);
const isLate = l => !l.returned && l.due < today();
const bookOf = id => db.books.find(b => b.id === id);
const memberOf = id => db.members.find(m => m.id === id);
const persist = () => { Store.save(db); render(); };

// ---------- tema y pestañas ----------
const t0 = Store.getTheme(); if (t0) document.documentElement.dataset.theme = t0;
$('theme').onclick = () => {
  const d = document.documentElement, dark = getComputedStyle(d).colorScheme === 'dark';
  d.dataset.theme = dark ? 'light' : 'dark'; Store.setTheme(d.dataset.theme);
};
$('tabs').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  document.querySelectorAll('#tabs button').forEach(x => x.classList.toggle('on', x === b));
  ['books', 'members', 'loans'].forEach(t => $('tab-' + t).hidden = t !== b.dataset.tab);
};

// ---------- libros ----------
function resetBook() { editBook = null; ['bName', 'bAuthor'].forEach(i => $(i).value = ''); $('bCopies').value = 1; $('bSave').textContent = 'Agregar libro'; $('bTitle').textContent = 'Nuevo libro'; $('bCancel').hidden = true; }
$('bCancel').onclick = resetBook;
$('bSave').onclick = () => {
  const title = $('bName').value.trim(), author = $('bAuthor').value.trim(), copies = parseInt($('bCopies').value, 10);
  if (!title || !author || !(copies >= 1)) return alert('Completa título, autor y al menos 1 ejemplar.');
  if (editBook) {
    const b = bookOf(editBook);
    if (copies < activeOf(b)) return alert('Hay ' + activeOf(b) + ' ejemplares prestados; no puedes bajar de esa cantidad.');
    Object.assign(b, { title, author, genre: $('bGenre').value, copies });
  } else db.books.push({ id: uid(), title, author, genre: $('bGenre').value, copies });
  resetBook(); persist();
};

// ---------- socios ----------
function resetMember() { editMember = null; ['mName', 'mDoc', 'mPhone'].forEach(i => $(i).value = ''); $('mSave').textContent = 'Agregar socio'; $('mTitle').textContent = 'Nuevo socio'; $('mCancel').hidden = true; }
$('mCancel').onclick = resetMember;
$('mSave').onclick = () => {
  const name = $('mName').value.trim(), doc = $('mDoc').value.trim(), phone = $('mPhone').value.trim();
  if (!name || !doc) return alert('Completa nombre y documento.');
  if (db.members.some(m => m.doc === doc && m.id !== editMember)) return alert('Ya existe un socio con ese documento.');
  if (editMember) Object.assign(memberOf(editMember), { name, doc, phone });
  else db.members.push({ id: uid(), name, doc, phone });
  resetMember(); persist();
};

// ---------- préstamos ----------
$('lSave').onclick = () => {
  const bookId = $('lBook').value, memberId = $('lMember').value, days = parseInt($('lDays').value, 10);
  if (!bookId || !memberId) return alert('Necesitas un libro disponible y un socio.');
  if (!(days >= 1)) return alert('Indica los días de préstamo.');
  const date = today();
  db.loans.push({ id: uid(), bookId, memberId, date, due: addDays(date, days), returned: null });
  persist();
};

// ---------- acciones en listas ----------
document.addEventListener('click', e => {
  const b = e.target.closest('button[data-a]'); if (!b) return;
  const { a, id } = b.dataset;
  if (a === 'editB') { const x = bookOf(id); editBook = id; $('bName').value = x.title; $('bAuthor').value = x.author; $('bGenre').value = x.genre; $('bCopies').value = x.copies; $('bSave').textContent = 'Guardar cambios'; $('bTitle').textContent = 'Editar libro'; $('bCancel').hidden = false; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  if (a === 'delB') { const x = bookOf(id); if (activeOf(x)) return alert('Este libro tiene préstamos activos.'); if (confirm('¿Eliminar "' + x.title + '" y su historial de préstamos?')) { db.books = db.books.filter(k => k.id !== id); db.loans = db.loans.filter(l => l.bookId !== id); persist(); } }
  if (a === 'editM') { const x = memberOf(id); editMember = id; $('mName').value = x.name; $('mDoc').value = x.doc; $('mPhone').value = x.phone || ''; $('mSave').textContent = 'Guardar cambios'; $('mTitle').textContent = 'Editar socio'; $('mCancel').hidden = false; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  if (a === 'delM') { const x = memberOf(id); if (db.loans.some(l => l.memberId === id && !l.returned)) return alert('Este socio tiene libros sin devolver.'); if (confirm('¿Eliminar a ' + x.name + ' y su historial?')) { db.members = db.members.filter(k => k.id !== id); db.loans = db.loans.filter(l => l.memberId !== id); persist(); } }
  if (a === 'ret') { db.loans.find(l => l.id === id).returned = today(); persist(); }
  if (a === 'delL') { if (confirm('¿Eliminar este registro de préstamo?')) { db.loans = db.loans.filter(l => l.id !== id); persist(); } }
});
$('clear').onclick = () => { if ((db.books.length || db.members.length) && confirm('Esto borra TODOS los datos. ¿Continuar?')) { db = Store.empty(); resetBook(); resetMember(); persist(); } };
['bQ', 'mQ', 'lFilter'].forEach(i => $(i).oninput = render);

// ---------- render ----------
function render() {
  const act = db.loans.filter(l => !l.returned);
  $('sTit').textContent = db.books.length;
  $('sDis').textContent = db.books.reduce((s, b) => s + availOf(b), 0);
  $('sAct').textContent = act.length;
  $('sVen').textContent = act.filter(isLate).length;

  const bq = $('bQ').value.toLowerCase();
  const books = db.books.filter(b => !bq || (b.title + b.author + b.genre).toLowerCase().includes(bq)).sort((a, b) => a.title.localeCompare(b.title));
  $('bList').innerHTML = books.length ? books.map(b => { const av = availOf(b); return `<div class="row"><div class="inf"><b>${esc(b.title)}</b><small>${esc(b.author)} · ${esc(b.genre)}</small></div><span class="badge ${av ? 'ok' : 'bad'}">${av}/${b.copies} disp.</span><button class="ic" data-a="editB" data-id="${b.id}">✏️</button><button class="ic" data-a="delB" data-id="${b.id}">🗑️</button></div>`; }).join('') : '<div class="empty">No hay libros. Agrega el primero 👈</div>';

  const mq = $('mQ').value.toLowerCase();
  const mem = db.members.filter(m => !mq || (m.name + m.doc).toLowerCase().includes(mq)).sort((a, b) => a.name.localeCompare(b.name));
  $('mList').innerHTML = mem.length ? mem.map(m => { const n = db.loans.filter(l => l.memberId === m.id && !l.returned).length; return `<div class="row"><div class="inf"><b>${esc(m.name)}</b><small>CC ${esc(m.doc)}${m.phone ? ' · ' + esc(m.phone) : ''}</small></div><span class="badge">${n} prestados</span><button class="ic" data-a="editM" data-id="${m.id}">✏️</button><button class="ic" data-a="delM" data-id="${m.id}">🗑️</button></div>`; }).join('') : '<div class="empty">No hay socios registrados.</div>';

  const lb = $('lBook').value, lm = $('lMember').value;
  const free = db.books.filter(b => availOf(b) > 0);
  $('lBook').innerHTML = free.length ? free.map(b => `<option value="${b.id}">${esc(b.title)} (${availOf(b)})</option>`).join('') : '<option value="">— Sin libros disponibles —</option>';
  $('lMember').innerHTML = db.members.length ? db.members.map(m => `<option value="${m.id}">${esc(m.name)}</option>`).join('') : '<option value="">— Sin socios —</option>';
  if (free.some(b => b.id === lb)) $('lBook').value = lb;
  if (db.members.some(m => m.id === lm)) $('lMember').value = lm;

  const f = $('lFilter').value;
  const loans = db.loans.filter(l => f === 'all' || (f === 'active' && !l.returned) || (f === 'late' && isLate(l)) || (f === 'done' && l.returned))
    .sort((a, b) => (!!a.returned - !!b.returned) || a.due.localeCompare(b.due));
  $('lList').innerHTML = loans.length ? loans.map(l => {
    const b = bookOf(l.bookId), m = memberOf(l.memberId);
    const st = l.returned ? '<span class="badge ok">Devuelto</span>' : isLate(l) ? `<span class="badge bad">Vencido ${daysBetween(l.due, today())} d</span>` : '<span class="badge">Activo</span>';
    return `<div class="row"><div class="inf"><b>${esc(b ? b.title : 'Libro eliminado')}</b><small>${esc(m ? m.name : 'Socio eliminado')} · ${l.returned ? 'devuelto ' + fdate(l.returned) : 'vence ' + fdate(l.due)}</small></div>${st}${l.returned ? '' : `<button class="ic" data-a="ret" data-id="${l.id}" title="Registrar devolución">↩️</button>`}<button class="ic" data-a="delL" data-id="${l.id}">🗑️</button></div>`;
  }).join('') : '<div class="empty">No hay préstamos para mostrar.</div>';
}
render();
