// js/app.js

let seancesParSemaine = [];
let semaineCourante = Number(localStorage.getItem('train7k_sem')) || 0;
const totalSemaines = 6;
let chart;

// Au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  // Navigation en bas
  document.querySelectorAll('.bottom-nav button').forEach(btn => {
    btn.addEventListener('click', () => selectTab(btn.dataset.tab));
  });
  selectTab('seances');

  // Boutons "Précédent" / "Suivant" semaine
  document.getElementById('prev-week').addEventListener('click', () => changeWeek(-1));
  document.getElementById('next-week').addEventListener('click', () => changeWeek(1));

  // Initialiser le graphique
  initChart();

  // Charger les séances
  fetch('data/seances.json')
    .then(resp => {
      console.log('Fetch seances status:', resp.status);
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      return resp.json();
    })
    .then(data => {
      console.log('Séances chargées :', data);
      seancesParSemaine = data;
      renderSemaine();
    })
    .catch(err => {
      console.error('Erreur chargement seances.json', err);
      document.getElementById('seance-list').innerHTML =
        '<li style="color:red">Impossible de charger les séances.</li>';
    });

  // Charger les données FORCE
  fetch('data/force.json')
    .then(resp => {
      console.log('Fetch force status:', resp.status);
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      return resp.json();
    })
    .then(data => {
      console.log('FORCE chargées :', data);
      populateForceTable(data);
    })
    .catch(err => {
      console.error('Erreur chargement force.json', err);
      document.querySelector('#force-table tbody').innerHTML =
        '<tr><td colspan="5" style="color:red">Impossible de charger les données FORCE.</td></tr>';
    });
});

// Sélection d'un onglet (séances, progression, force)
function selectTab(name) {
  document.querySelectorAll('.tab').forEach(s => s.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-tab="${name}"]`).classList.add('active');
}

// Changement de semaine
function changeWeek(delta) {
  semaineCourante = Math.min(totalSemaines - 1, Math.max(0, semaineCourante + delta));
  localStorage.setItem('train7k_sem', semaineCourante);
  renderSemaine();
}

// Affichage des séances de la semaine courante
function renderSemaine() {
  document.getElementById('week-label').textContent = `Semaine ${semaineCourante + 1}`;
  const ul = document.getElementById('seance-list');
  ul.innerHTML = '';
  seancesParSemaine[semaineCourante].forEach((s, i) => {
    const done = JSON.parse(localStorage.getItem(`train7k_${semaineCourante}_${i}`)) || false;
    const li = document.createElement('li');
    li.innerHTML = `
      <input type="checkbox" id="c${semaineCourante}_${i}" ${done ? 'checked' : ''}>
      <label for="c${semaineCourante}_${i}">${capitalize(s.type)} – ${s.description}</label>
    `;
    ul.appendChild(li);
    li.querySelector('input').addEventListener('change', e => {
      localStorage.setItem(`train7k_${semaineCourante}_${i}`, e.target.checked);
      updateChart();
    });
  });
  updateChart();
}

// Mettre la première lettre en majuscule
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialisation du graphique Chart.js
function initChart() {
  const ctx = document.getElementById('progressChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array.from({ length: totalSemaines }, (_, i) => `Semaine ${i + 1}`),
      datasets: [{
        label: '% complété',
        data: [],
        backgroundColor: 'rgba(13,71,161,0.6)'
      }]
    },
    options: {
      scales: { y: { beginAtZero: true, max: 100 } }
    }
  });
  updateChart();
}

// Mise à jour des données du graphique
function updateChart() {
  if (!seancesParSemaine.length) return;
  chart.data.datasets[0].data = seancesParSemaine.map((sem, si) => {
    const total = sem.length;
    const doneCount = sem.reduce((acc, _, i) =>
      acc + (JSON.parse(localStorage.getItem(`train7k_${si}_${i}`)) ? 1 : 0), 0);
    return Math.round(doneCount / total * 100);
  });
  chart.update();
}

// Remplir le tableau FORCE
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
