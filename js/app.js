let seancesParSemaine = [];
let semaineCourante = Number(localStorage.getItem('train7k_sem')) || 0;
const totalSemaines = 6;

// Au chargement
document.addEventListener('DOMContentLoaded', () => {
  // Nav onglets
  document.querySelectorAll('.bottom-nav button').forEach(btn => {
    btn.addEventListener('click', () => selectTab(btn.dataset.tab));
  });
  selectTab('seances');

  // Btn semaine
  document.getElementById('prev-week').addEventListener('click', () => changeWeek(-1));
  document.getElementById('next-week').addEventListener('click', () => changeWeek(1));

  // Charger données
  fetch('data/seances.json')
    .then(r => r.json())
    .then(data => {
      seancesParSemaine = data;
      renderSemaine();
    });

  initChart();
  loadForce();
});

// Sélecteur d’onglet
function selectTab(name) {
  document.querySelectorAll('.tab').forEach(s => s.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-tab="${name}"]`).classList.add('active');
}

// Changer de semaine
function changeWeek(delta) {
  semaineCourante = Math.min(totalSemaines-1, Math.max(0, semaineCourante + delta));
  localStorage.setItem('train7k_sem', semaineCourante);
  renderSemaine();
}

// Afficher semaine actuelle
function renderSemaine() {
  document.getElementById('week-label').textContent = `Semaine ${semaineCourante+1}`;
  const ul = document.getElementById('seance-list');
  ul.innerHTML = '';
  seancesParSemaine[semaineCourante].forEach((s,i) => {
    const done = JSON.parse(localStorage.getItem(`train7k_${semaineCourante}_${i}`)) || false;
    const li = document.createElement('li');
    li.innerHTML = `
      <input type="checkbox" id="c${semaineCourante}_${i}" ${done?'checked':''}>
      <label for="c${semaineCourante}_${i}">${s.type.toUpperCase()} – ${s.description}</label>
    `;
    ul.appendChild(li);
    li.querySelector('input').addEventListener('change', e => {
      localStorage.setItem(`train7k_${semaineCourante}_${i}`, e.target.checked);
      updateChart();
    });
  });
  updateChart();
}

// INITIALISER CHART.JS
let chart;
function initChart(){
  const ctx = document.getElementById('progressChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array.from({length: totalSemaines}, (_,i)=>`Semaine ${i+1}`),
      datasets: [{
        label: '% complété',
        data: [],
        backgroundColor: 'rgba(13,71,161,0.6)'
      }]
    },
    options: {
      scales: { y: { beginAtZero:true, max:100 } }
    }
  });
  updateChart();
}

// METTRE À JOUR LE GRAPHIQUE
function updateChart(){
  if(!seancesParSemaine.length) return;
  chart.data.datasets[0].data = seancesParSemaine.map((sem,si) => {
    const total = sem.length;
    const done = sem.reduce((acc,s,i) => acc + (JSON.parse(localStorage.getItem(`train7k_${si}_${i}`))?1:0), 0);
    return Math.round(done/total*100);
  });
  chart.update();
}

// CHARGER FORCE.JSON
function loadForce(){
  fetch('data/force.json')
    .then(r => r.json())
    .then(data => {
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
    });
}
