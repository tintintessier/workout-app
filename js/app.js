// séance day-by-day + PWA + voice + chart + FORCE
let dataSeances = [], dataForce = [];
let semaineCourante = Number(localStorage.getItem('train7k_week'))||0;
let jourCourant   = Number(localStorage.getItem('train7k_day'))||0;
const joursParSemaine = 7, semMax = 6;
let chart;

document.addEventListener('DOMContentLoaded', ()=>{
  // nav onglets
  document.querySelectorAll('.bottom-nav button').forEach(b=>{
    b.addEventListener('click', ()=>selectTab(b.dataset.tab));
  });
  selectTab('seances');

  // butons jour
  document.getElementById('prev-day').addEventListener('click', ()=>changeDay(-1));
  document.getElementById('next-day').addEventListener('click', ()=>changeDay(1));

  initChart();
  fetch('data/seances.json')
    .then(r=>r.ok?r.json():Promise.reject())
    .then(d=>{ dataSeances=d; renderDay(); updateChart(); })
    .catch(()=>{ document.getElementById('session-container').innerHTML=
      '<p style="color:red;padding:1em">Impossible de charger séances.</p>'; });

  fetch('data/force.json')
    .then(r=>r.ok?r.json():Promise.reject())
    .then(d=>populateForce(d))
    .catch(()=>{/* erreur FORCE */});
});

// change d’onglet
function selectTab(n){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('tab-'+n).classList.add('active');
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.remove('active'));
  document.querySelector(`[data-tab="${n}"]`).classList.add('active');
  if(n==='progression'){ chart.resize(); chart.update(); }
}

// jour précédent / suivant
function changeDay(delta){
  const maxDay = dataSeances[semaineCourante].length-1;
  jourCourant = Math.min(maxDay, Math.max(0, jourCourant+delta));
  localStorage.setItem('train7k_day', jourCourant);
  renderDay();
}

// affiche la carte du jour
function renderDay(){
  const s = dataSeances[semaineCourante][jourCourant];
  document.getElementById('day-label').textContent =
    `Sem ${semaineCourante+1} • Jour ${jourCourant+1}`;
  const cont = document.getElementById('session-container');
  cont.innerHTML = `
    <div class="session-card">
      <h3>${capitalize(s.type)}</h3>
      <p>${s.description.replace(/\n/g,'<br>')}</p>
      <button id="start-btn">Démarrer séance</button>
    </div>`;
  document.getElementById('start-btn').addEventListener('click', startSession(s));
}

// Start séance → voice + vibration
function startSession(s){
  return ()=> {
    const utter = new SpeechSynthesisUtterance(
      `Démarrage de la séance. ${s.description.replace(/\n/g,'. ')}`
    );
    utter.lang = 'fr-FR';
    speechSynthesis.speak(utter);
    navigator.vibrate?.(200);
  };
}

// Init Chart.js
function initChart(){
  const ctx = document.getElementById('progressChart').getContext('2d');
  chart = new Chart(ctx,{
    type:'bar',
    data:{
      labels:Array.from({length:semMax},(_,i)=>`S${i+1}`),
      datasets:[{label:'% complété',data:Array(semMax).fill(0),backgroundColor:'rgba(13,71,161,0.6)'}]
    },
    options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true,max:100}}}
  });
}

// Met à jour Chart
function updateChart(){
  if(!dataSeances.length) return;
  const d = dataSeances.map((sem,si)=>{
    const done = sem.reduce((acc,s,i)=>acc+(JSON.parse(localStorage.getItem(`train7k_${si}_${i}`))?1:0),0);
    return Math.round(done/sem.length*100);
  });
  chart.data.datasets[0].data = d; chart.update();
}

// Remplir FORCE
function populateForce(d){
  const tbody = document.querySelector('#force-table tbody');
  tbody.innerHTML='';
  d.forEach(f=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td>${f.epreuve}</td>
      <td>${f.niveaux.Bronze}</td>
      <td>${f.niveaux.Argent}</td>
      <td>${f.niveaux.Or}</td>
      <td>${f.niveaux.Platine}</td>`;
    tbody.appendChild(tr);
  });
}

// utils
function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
