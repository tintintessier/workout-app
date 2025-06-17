document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.tab');
  const btnSeances = document.getElementById('btn-seances');
  const btnGraph = document.getElementById('btn-graph');
  const btnForce = document.getElementById('btn-force');

  btnSeances.addEventListener('click', () => showTab('seances'));
  btnGraph.addEventListener('click', () => showTab('graph'));
  btnForce.addEventListener('click', () => showTab('force'));

  function showTab(id) {
    sections.forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  let seances = [], completed = [], forceSessions = [];

  // Charger séances progressives avec marches, courses et gym
  fetch('data/seances.json')
    .then(res => res.json())
    .then(data => {
      seances = data;
      completed = new Array(seances.length).fill(false);
      renderSeances();
      renderChart();
    })
    .catch(err => console.error('Erreur séances:', err));

  // Charger séances FORCE
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

  let chart;
  function renderChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
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

/* data/seances.json */
[
  {"type":"marche","description":"Marche rapide 4 km"},
  {"type":"marche-poids","description":"Marche 5 km avec sac 10 kg"},
  {"type":"repos","description":"Repos actif ou étirements"},

  {"type":"course","description":"1 min course / 2 min marche x6"},
  {"type":"marche-poids","description":"Marche 6 km avec sac 12 kg"},
  {"type":"repos","description":"Repos actif"},

  {"type":"gym","description":"Séance gym: squats 3x10, fentes 3x12"},
  {"type":"course","description":"3 min course / 1 min marche x5"},
  {"type":"repos","description":"Repos"},

  {"type":"course","description":"5 min course / 1 min marche x4"},
  {"type":"marche-poids","description":"Marche 8 km avec sac 15 kg"},
  {"type":"repos","description":"Repos"},

  {"type":"gym","description":"Séance gym: soulevé de terre 3x8, planche 3x45s"},
  {"type":"course","description":"10 min course continue"},
  {"type":"repos","description":"Repos actif"},

  {"type":"marche","description":"Marche rapide 5 km"},
  {"type":"course","description":"7 km course finale"},
  {"type":"repos","description":"Repos complet"}
]

/* data/force.json */
[
  {"exercice":"Soulevé de sac","details":"20 kg, 30 répétitions"},
  {"exercice":"Traînée de sac","details":"40 kg, 40 m en moins de 51s"},
  {"exercice":"Saut horizontal","details":"Atteindre 1,29 m minimum"},
  {"exercice":"Navette chargée","details":"5 min 21 s ou moins avec 20 kg"}
]
