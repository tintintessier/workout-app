document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.tab');
  const btnSeances = document.getElementById('btn-seances');
  const btnGraph = document.getElementById('btn-graph');
  const btnForce = document.getElementById('btn-force');

  // Navigation
  btnSeances.addEventListener('click', () => showTab('seances'));
  btnGraph.addEventListener('click', () => showTab('graph'));
  btnForce.addEventListener('click', () => showTab('force'));

  function showTab(id) {
    sections.forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  let seances = [], completed = [];
  let forceSessions = [];

  // Charger séances course/marche/gym
  fetch('data/seances.json')
    .then(res => res.json())
    .then(data => {
      seances = data;
      completed = new Array(seances.length).fill(false);
      renderSeances();
      renderChart();
    })
    .catch(err => console.error('Erreur séances:', err));

  // Charger séances FORCE ciblées
  fetch('data/force.json')
    .then(res => res.json())
    .then(data => {
      forceSessions = data;
      renderForce();
    })
    .catch(err => console.error('Erreur FORCE:', err));

  function renderSeances() {
    const list = document.getElementById('seance-list');
    list.innerHTML = '';
    seances.forEach((s, i) => {
      const li = document.createElement('li');
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.checked = completed[i];
      cb.addEventListener('change', () => { completed[i] = cb.checked; updateChartData(); });
      li.append(cb, document.createTextNode(` Jour ${i+1} [${s.type}] – ${s.description}`));
      list.appendChild(li);
    });
  }

  function renderForce() {
    const list = document.getElementById('force-list');
    list.innerHTML = '';
    forceSessions.forEach((f, i) => {
      const li = document.createElement('li');
      li.textContent = `Ex ${i+1}: ${f.exercice} – ${f.details}`;
      list.appendChild(li);
    });
  }

  // Chart.js pour progression
  let chart;
  function renderChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'bar', data: {
        labels: ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6'],
        datasets: [{ label: 'Séances complétées (%)', data: calculateWeeklyCompletion() }]
      }, options: { scales: { y: { beginAtZero: true, max: 100 } } }
    });
  }

  function calculateWeeklyCompletion() {
    const perWeek = Math.ceil(seances.length / 6);
    const counts = new Array(6).fill(0);
    seances.forEach((_, i) => { const week = Math.floor(i / perWeek); if (completed[i]) counts[week]++; });
    return counts.map(cnt => Math.round(cnt / perWeek * 100));
  }

  function updateChartData() { if (chart) { chart.data.datasets[0].data = calculateWeeklyCompletion(); chart.update(); }}
});
