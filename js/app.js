document.addEventListener('DOMContentLoaded', () => {
  const tabs = { seances: document.getElementById('seances'), graph: document.getElementById('graph'), force: document.getElementById('force') };
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.id.replace('btn-',''))));
  function switchTab(name) {
    Object.values(tabs).forEach(t => t.classList.remove('active'));
    tabs[name].classList.add('active');
    navBtns.forEach(b => b.classList.toggle('active', b.id === 'btn-' + name));
  }

  // Weekly navigation
  let currentWeek = 1; const weeksCount = 6, perWeek = 3;
  document.getElementById('prev-week').addEventListener('click', () => changeWeek(-1));
  document.getElementById('next-week').addEventListener('click', () => changeWeek(1));
  function changeWeek(delta) {
    currentWeek = Math.max(1, Math.min(weeksCount, currentWeek + delta));
    document.getElementById('current-week').textContent = currentWeek;
    renderSeances();
  }

  let seances = [], completed = []; let forceSessions = [];
  fetch('data/seances.json').then(res => res.json()).then(data => { seances = data; completed = Array(seances.length).fill(false); renderSeances(); initChart(); });
  fetch('data/force.json').then(res => res.json()).then(data => { forceSessions = data; renderForce(); });

  function renderSeances() {
    const container = document.getElementById('seance-cards'); container.innerHTML = '';
    const start = (currentWeek - 1) * perWeek;
    seances.slice(start, start + perWeek).forEach((s, i) => {
      const card = document.createElement('div'); card.className = 'card';
      const title = document.createElement('h3'); title.textContent = `Jour ${start + i + 1} — ${capitalize(s.type)}`;
      const desc = document.createElement('p'); desc.textContent = s.description;
      card.append(title, desc);
      if (s.type === 'gym') {
        const list = document.createElement('ul'); list.className = 'exercise-list';
        s.exercices.forEach(e => { const li = document.createElement('li'); li.textContent = e; list.append(li); });
        card.append(list);
      }
      if (s.type === 'marche-poids') {
        const wt = document.createElement('p'); wt.innerHTML = `<strong>Poids recommandé :</strong> ${s.poids}`;
        card.append(wt);
      }
      container.appendChild(card);
    });
  }

  function renderForce() {
    const container = document.getElementById('force-cards'); container.innerHTML = '';
    forceSessions.forEach((f, i) => {
      const card = document.createElement('div'); card.className = 'card';
      card.innerHTML = `<h3>${i + 1}. ${f.exercice}</h3><p>${f.details}</p>`;
      container.appendChild(card);
    });
  }

  // Chart
  let chart;
  function initChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    chart = new Chart(ctx, { type: 'bar', data: { labels: Array.from({ length: weeksCount }, (_, i) => `Sem ${i + 1}`), datasets: [{ label: '% complété', backgroundColor: 'var(--accent)', data: completionData() }] }, options: { scales: { y: { beginAtZero: true, max: 100 } } } });
  }
  function completionData() {
    return Array.from({ length: weeksCount }, (_, w) => {
      const done = seances.slice(w * perWeek, w * perWeek + perWeek).filter((_, i) => completed[w * perWeek + i]).length;
      return Math.round(done / perWeek * 100);
    });
  }

  function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
});
