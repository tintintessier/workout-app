// vider éventuel ancien index/jour
localStorage.removeItem('train7k_week');
localStorage.removeItem('train7k_day');

let dataSeances = [], dataForce = [];
let semaineCourante = 0, jourCourant = 0;
let chart;

window.addEventListener('load', () => {
  // Nav onglets
  document.querySelectorAll('.bottom-nav button').forEach(btn => {
    btn.addEventListener('click', () => selectTab(btn.dataset.tab));
  });
  selectTab('seances');

  // Nav jour
  document.getElementById('prev-day').addEventListener('click', () => changeDay(-1));
  document.getElementById('next-day').addEventListener('click', () => changeDay(1));

  // Init Chart
  initChart();

  // Charger données
  fetch('data/seances.json')
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(d => {
      dataSeances = d;
      renderDay();
      updateChart();
    })
    .catch(() => {
      document.getElementById('daily-card-container').innerHTML =
        '<p style="color:red">Impossible de charger séances.</p>';
    });

  fetch('data/force.json')
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(populateForce)
    .catch(() => {
      document.querySelector('#force-table tbody').innerHTML =
        '<tr><td colspan="5" style="color:red">Impossible de charger FORCE.</td></tr>';
    });
});

function selectTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-tab="${name}"]`).classList.add('active');
  if (name === 'progression' && chart) {
    chart.resize(); chart.update();
  }
}

function changeDay(delta) {
  const max = dataSeances.length
    ? dataSeances[0].length - 1
    : 0;
  jourCourant = Math.min(max, Math.max(0, jourCourant + delta));
  renderDay();
}

function renderDay() {
  document.getElementById('day-label').textContent =
    `Semaine ${semaineCourante+1} • Jour ${jourCourant+1}`;
  const s = dataSeances[semaineCourante][jourCourant];
  const c = document.getElementById('daily-card-container');
  c.innerHTML = `
    <div class="session-card">
      <h3>${capitalize(s.type)}</h3>
      <p>${s.description.replace(/\n/g,'<br>')}</p>
      <button id="start-btn">Démarrer</button>
    </div>`;
  document.getElementById('start-btn').addEventListener('click', ()=>{
    const u = new SpeechSynthesisUtterance(s.description.replace(/\n/g,'. '));
    u.lang = 'fr-FR';
    speechSynthesis.speak(u);
    navigator.vibrate?.(200);
  });
}

function initChart() {
  const ctx = document.getElementById('progressChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array.from({length:6},(_,i)=>`S${i+1}`),
      datasets: [{
        label: '% complété',
        data: Array(6).fill(0),
        backgroundColor: 'rgba(13,71,161,0.6)'
      }]
    },
    options: { responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true, max:100 } } }
  });
}

function updateChart() {
  if (!dataSeances.length) return;
  const arr = dataSeances.map((sem,si)=>
    Math.round(
      sem.reduce((a,_,i)=> a + (JSON.parse(localStorage.getItem(`train7k_${si}_${i}`))?1:0),0)
      / sem.length * 100
    )
  );
  chart.data.datasets[0].data = arr;
  chart.update();
}

function populateForce(d) {
  const tb = document.querySelector('#force-table tbody');
  tb.innerHTML = '';
  d.forEach(f=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${f.epreuve}</td>
      <td>${f.niveaux.Bronze}</td>
      <td>${f.niveaux.Argent}</td>
      <td>${f.niveaux.Or}</td>
      <td>${f.niveaux.Platine}</td>`;
    tb.appendChild(tr);
  });
}

function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
