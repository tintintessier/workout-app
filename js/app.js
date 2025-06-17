// js/app.js

// données embarquées pour test — remplace par fetch('data/seances.json') plus tard
const seancesParSemaine = [
  [ { type: 'course', description: '1 min course / 2 min marche × 6' } ],
  [ { type: 'course', description: '3 min course / 2 min marche × 4' } ],
  [ { type: 'course', description: '5 min course / 3 min marche × 3' } ],
  [ { type: 'course', description: '12 min course / 2 min marche × 2' } ],
  [ { type: 'course', description: '15 min course / 1 min marche' } ],
  [ { type: 'course', description: '20 min course continue' } ]
];
const forceData = [
  {
    epreuve: 'Soulevé de charge',
    niveaux: { Bronze:'30 levées en ≤3 min 30 s', Argent:'≤3 min', Or:'≤2 min 30 s', Platine:'≤2 min' }
  }
];

// état
let semaineCourante = 0, jourCourant = 0, chart;

// au DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // gestion onglets
  document.querySelectorAll('.bottom-nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelector(`#tab-${btn.dataset.tab}`).classList.add('active');
      document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      if (btn.dataset.tab === 'progression') chart.update();
    });
  });

  // bouttons jour
  document.getElementById('prev-day').addEventListener('click', ()=>changeDay(-1));
  document.getElementById('next-day').addEventListener('click', ()=>changeDay(1));

  // init chart
  const ctx = document.getElementById('progressChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: seancesParSemaine.map((_,i)=>`S${i+1}`),
      datasets: [{ label: '% complété', data: Array(seancesParSemaine.length).fill(0),
        backgroundColor: 'rgba(13,71,161,0.6)' }]
    },
    options: { responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true, max:100 } } }
  });

  // remplir FORCE
  const tbody = document.querySelector('#force-table tbody');
  forceData.forEach(f => {
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

  // afficher la 1ʳᵉ séance
  renderDay();
});

// changer de jour
function changeDay(delta) {
  jourCourant = Math.max(0, Math.min(seancesParSemaine[semaineCourante].length-1, jourCourant+delta));
  renderDay();
}

// afficher séance du jour
function renderDay() {
  const s = seancesParSemaine[semaineCourante][jourCourant];
  document.getElementById('day-label').textContent =
    `Semaine ${semaineCourante+1} • Jour ${jourCourant+1}`;
  document.getElementById('daily-card-container').innerHTML = `
    <div class="session-card">
      <h3>${capitalize(s.type)}</h3>
      <p>${s.description}</p>
      <button id="start-btn">Démarrer</button>
    </div>`;
  document.getElementById('start-btn').addEventListener('click', ()=>{
    const utt = new SpeechSynthesisUtterance(s.description);
    utt.lang = 'fr-FR';
    speechSynthesis.speak(utt);
  });
}

// utilitaire
function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
