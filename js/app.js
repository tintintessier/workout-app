// js/app.js
localStorage.removeItem('train7k_week');
localStorage.removeItem('train7k_day');
let dataSeances = [];
let dataForce = [];
let semaineCourante = Number(localStorage.getItem('train7k_week')) || 0;
let jourCourant   = Number(localStorage.getItem('train7k_day'))  || 0;
let chart;

// Au chargement
document.addEventListener('DOMContentLoaded', () => {
  // Navigation onglets
  document.querySelectorAll('.bottom-nav button').forEach(btn => {
    btn.addEventListener('click', () => selectTab(btn.dataset.tab));
  });
  selectTab('seances');

  // Navigation jour
  document.getElementById('prev-day').addEventListener('click', () => changeDay(-1));
  document.getElementById('next-day').addEventListener('click', () => changeDay(1));

  // Initialiser Chart.js
  initChart();

  // Charger les séances
  fetch('data/seances.json')
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(d => {
      dataSeances = d;
      if (jourCourant >= dataSeances[semaineCourante].length) {
        jourCourant = 0;
        localStorage.setItem('train7k_day', 0);
      }
      renderDay();
      updateChart();
    })
    .catch(err => {
      console.error('Erreur seances.json', err);
      document.getElementById('daily-card-container').innerHTML =
        '<p style="color:red">Impossible de charger les séances.</p>';
    });

  // Charger FORCE
  fetch('data/force.json')
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(d => populateForceTable(d))
    .catch(err => {
      console.error('Erreur force.json', err);
      document.querySelector('#force-table tbody').innerHTML =
        '<tr><td colspan="5" style="color:red">Impossible de charger FORCE.</td></tr>';
    });
});

// Sélectionner un onglet
function selectTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-tab="${name}"]`).classList.add('active');
  if (name === 'progression' && chart) {
    chart.resize();
    chart.update();
  }
}

// Changer de jour
function changeDay(delta) {
  const maxDay = dataSeances[semaineCourante].length - 1;
  jourCourant = Math.min(maxDay, Math.max(0, jourCourant + delta));
  localStorage.setItem('train7k_day', jourCourant);
  renderDay();
}

// Afficher la séance du jour
function renderDay() {
  const s = dataSeances[semaineCourante][jourCourant];
  document.getElementById('day-label').textContent =
    `Semaine ${semaineCourante + 1} • Jour ${jourCourant + 1}`;
  const cont = document.getElementById('daily-card-container');
  cont.innerHTML = `
    <div class="session-card">
      <h3>${capitalize(s.type)}</h3>
      <p>${s.description.replace(/\n/g, '<br>')}</p>
      <button id="start-btn">Démarrer</button>
    </div>`;
  document.getElementById('start-btn').addEventListener('click', () => {
    const utter = new SpeechSynthesisUtterance(
      s.description.replace(/\n/g, '. ')
    );
    utter.lang = 'fr-FR';
    speechSynthesis.speak(utter);
    navigator.vibrate?.(200);
  });
}

// INITIALISER Chart.js
function initChart() {
  const ctx = document.getElementById('progressChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array.from({ length: dataSeances.length || 6 }, (_, i) => `S${i+1}`),
      datasets: [{
        label: '% complété',
        data: Array(dataSeances.length || 6).fill(0),
        backgroundColor: 'rgba(13,71,161,0.6)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

// METTRE À JOUR le graphique
function updateChart() {
  if (!dataSeances.length) return;
  const d = dataSeances.map((sem, si) => {
    const total = sem.length;
    const done = sem.reduce((acc, _, i) =>
      acc + (JSON.parse(localStorage.getItem(`train7k_${si}_${i}`)) ? 1 : 0), 0);
    return Math.round(done / total * 100);
  });
  chart.data.labels = d.map((_, i) => `S${i+1}`);
  chart.data.datasets[0].data = d;
  chart.update();
}

// REMPLIR le tableau FORCE
function populateForceTable(data) {
  const tbody = document.querySelector('#force-table tbody');
  tbody.innerHTML = '';
  data.forEach(f => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${f.epreuve}</td>
      <td>${f.niveaux.Bronze}</td>
      <td>${f.niveaux.Argent}</td>
      <td>${f.niveaux.Or}</td>
      <td>${f.niveaux.Platine}</td>
    `;
    tbody.appendChild(tr);
  });
}

// UTILE
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
