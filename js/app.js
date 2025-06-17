function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

let seances = [];
let completed = [];

// Charger les séances
fetch('data/seances.json')
  .then(res => res.json())
  .then(data => {
    seances = data;
    completed = new Array(seances.length).fill(false);
    renderSeances();
    renderChart();
  })
  .catch(err => console.error(err));

// Affiche liste de séances avec checkbox
function renderSeances() {
  const list = document.getElementById('seance-list');
  list.innerHTML = '';
  seances.forEach((s, i) => {
    const li = document.createElement('li');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = completed[i];
    cb.onchange = () => {
      completed[i] = cb.checked;
      updateChartData();
    };
    li.append(cb, ` Jour ${i+1} [${s.type}] – ${s.description}`);
    list.appendChild(li);
  });
}

// Initialiser et rendre le graphique
let chart;
function renderChart() {
  const ctx = document.getElementById('progressChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6'],
      datasets: [{
        label: 'Séances complétées (%)',
        data: calculateWeeklyCompletion(),
      }]
    },
    options: {
      scales: { y: { beginAtZero: true, max: 100 } }
    }
  });
}

// Calcule % complétion par semaine
function calculateWeeklyCompletion() {
  const perWeek = 3;
  return seances.reduce((acc, _, i) => {
    const week = Math.floor(i/perWeek);
    acc[week] = (acc[week]||0) + (completed[i]?1:0);
    return acc;
  }, new Array(6).fill(0)).map(cnt => Math.round(cnt/perWeek*100));
}

// Met à jour les données du graphique
function updateChartData() {
  chart.data.datasets[0].data = calculateWeeklyCompletion();
  chart.update();
}
