'use strict';

const CONFIG = {
  bins: [
    { id: 'zluta', name: 'Žlutá', image: 'assets/popelnice-zluta.png', color: '#f3c846' },
    { id: 'cerna', name: 'Černá', image: 'assets/popelnice-cerna.png', color: '#33383b' },
    { id: 'modra', name: 'Modrá', image: 'assets/popelnice-modra.png', color: '#438bc9' },
    { id: 'hneda', name: 'Hnědá', image: 'assets/popelnice-hneda.png', color: '#9b6948' }
  ],
  defaults: { even: ['zluta', 'cerna'], odd: ['modra', 'hneda'] }
};
const STORAGE_KEY = 'moje-popelnice-v1';
let state = loadState();
let viewedMonday = mondayOf(new Date());
let editingOverrideDate = dateKey(viewedMonday);

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.schedule && saved.overrides) return saved;
  } catch (error) { console.warn('Nastavení se nepodařilo načíst.', error); }
  return { schedule: structuredCloneSafe(CONFIG.defaults), overrides: {} };
}
function structuredCloneSafe(value) { return JSON.parse(JSON.stringify(value)); }
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
  catch (error) { console.error('Nastavení se nepodařilo uložit.', error); return false; }
}
function mondayOf(date) { const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()); const shift = (d.getDay() + 6) % 7; d.setDate(d.getDate() - shift); d.setHours(0,0,0,0); return d; }
function dateKey(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function parseDate(key) { const [y,m,d] = key.split('-').map(Number); return new Date(y,m-1,d); }
function addDays(date, amount) { const d = new Date(date); d.setDate(d.getDate()+amount); return d; }
function isoWeekNumber(date) { const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())); d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7)); const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1)); return Math.ceil((((d-yearStart)/86400000)+1)/7); }
function formatDate(date, options={ day:'numeric', month:'long', year:'numeric' }) { return new Intl.DateTimeFormat('cs-CZ', options).format(date); }
function scheduleFor(date) { const key = dateKey(mondayOf(date)); const override = state.overrides[key]; return override ? { ids: override, overridden: true } : { ids: state.schedule[isoWeekNumber(date)%2===0?'even':'odd'] || [], overridden: false }; }
function checkboxMarkup(bin, checked, groupName) { return `<label class="check-row"><input type="checkbox" name="${groupName}" value="${bin.id}" ${checked?'checked':''}><span class="color-dot" style="background:${bin.color}"></span><span>${bin.name} popelnice</span></label>`; }
function renderSettings() {
  document.querySelector('#even-settings').innerHTML = CONFIG.bins.map(b=>checkboxMarkup(b,state.schedule.even.includes(b.id),'even')).join('');
  document.querySelector('#odd-settings').innerHTML = CONFIG.bins.map(b=>checkboxMarkup(b,state.schedule.odd.includes(b.id),'odd')).join('');
  renderOverrideChecks();
}
function renderOverrideChecks() {
  const ids = state.overrides[editingOverrideDate] || scheduleFor(parseDate(editingOverrideDate)).ids;
  document.querySelector('#override-settings').innerHTML = CONFIG.bins.map(b=>checkboxMarkup(b,ids.includes(b.id),'override')).join('');
  document.querySelector('#override-date').value = editingOverrideDate;
}
function renderWeek() {
  const sunday = addDays(viewedMonday,6); const week = isoWeekNumber(viewedMonday); const result = scheduleFor(viewedMonday);
  document.querySelector('#week-heading').textContent = dateKey(viewedMonday)===dateKey(mondayOf(new Date())) ? 'Tento týden' : 'Vybraný týden';
  document.querySelector('#week-range').textContent = `${formatDate(viewedMonday,{day:'numeric',month:'short'})} – ${formatDate(sunday,{day:'numeric',month:'short',year:'numeric'})}`;
  document.querySelector('#week-type').textContent = result.overridden ? 'Vlastní výjimka' : `${week}. týden · ${week%2===0?'sudý':'lichý'}`;
  document.querySelector('#bin-list').innerHTML = CONFIG.bins.map(bin=>{
    const active = result.ids.includes(bin.id);
    return `<article class="bin-card"><img src="${bin.image}" alt="${bin.name} popelnice"><strong>${bin.name}</strong><span class="bin-state">${active?'Připravit ke svozu':'Bez svozu'}</span></article>`;
  }).join('');
}
function renderOverrides() {
  const list = document.querySelector('#override-list'); const entries = Object.entries(state.overrides).sort(([a],[b])=>a.localeCompare(b));
  if (!entries.length) { list.innerHTML='<li>Zatím nejsou žádné výjimky.</li>'; return; }
  list.innerHTML = entries.map(([key,ids])=>`<li><span><strong>${formatDate(parseDate(key))}</strong><br>${ids.length?ids.map(id=>CONFIG.bins.find(b=>b.id===id)?.name).filter(Boolean).join(', '):'Žádná popelnice'}</span><button type="button" class="secondary" data-edit="${key}">Upravit</button></li>`).join('');
}
function renderAll() { renderWeek(); renderSettings(); renderOverrides(); }
function selectedValues(containerSelector) { return [...document.querySelectorAll(`${containerSelector} input:checked`)].map(el=>el.value); }
document.querySelector('#prev-week').addEventListener('click',()=>{viewedMonday=addDays(viewedMonday,-7);renderWeek();});
document.querySelector('#next-week').addEventListener('click',()=>{viewedMonday=addDays(viewedMonday,7);renderWeek();});
document.querySelector('#today-week').addEventListener('click',()=>{viewedMonday=mondayOf(new Date());renderWeek();});
document.querySelector('#save-settings').addEventListener('click',()=>{
  state.schedule.even=selectedValues('#even-settings'); state.schedule.odd=selectedValues('#odd-settings');
  const ok=persist(); renderWeek(); document.querySelector('#settings-status').textContent=ok?'Nastavení bylo uloženo.':'Uložení se nepodařilo. Zkontroluj nastavení prohlížeče.';
});
document.querySelector('#reset-settings').addEventListener('click',()=>{
  state.schedule=structuredCloneSafe(CONFIG.defaults); persist(); renderAll(); document.querySelector('#settings-status').textContent='Výchozí nastavení bylo obnoveno.';
});
document.querySelector('#override-date').addEventListener('change',event=>{
  if(!event.target.value)return; editingOverrideDate=dateKey(mondayOf(parseDate(event.target.value))); renderOverrideChecks();
});
document.querySelector('#override-form').addEventListener('submit',event=>{
  event.preventDefault(); const chosen=selectedValues('#override-settings'); state.overrides[editingOverrideDate]=chosen; const ok=persist(); renderAll(); renderOverrideChecks(); document.querySelector('#override-status').textContent=ok?'Výjimka byla uložena.':'Výjimku se nepodařilo uložit.';
});
document.querySelector('#clear-override').addEventListener('click',()=>{
  delete state.overrides[editingOverrideDate]; persist(); renderAll(); document.querySelector('#override-status').textContent='Výjimka byla odstraněna.';
});
document.querySelector('#override-list').addEventListener('click',event=>{
  const button=event.target.closest('[data-edit]'); if(!button)return; editingOverrideDate=button.dataset.edit; renderOverrideChecks(); document.querySelector('#override-date').scrollIntoView({behavior:'smooth',block:'center'});
});
renderAll();
