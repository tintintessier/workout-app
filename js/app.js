document.addEventListener('DOMContentLoaded', () => {
  const tabs = { seances: document.getElementById('seances'), graph: document.getElementById('graph'), force: document.getElementById('force') };
  document.getElementById('btn-seances').onclick = () => showTab('seances');
  document.getElementById('btn-graph').onclick = () => showTab('graph');
  document.getElementById('btn-force').onclick = () => showTab('force');
  function showTab(id) { Object.values(tabs).forEach(t => t.classList.remove('active')); tabs[id].classList.add('active'); }

  let seances = [], forceSessions = [], completed = [];
  let currentWeek = 1, weeksCount = 6;
  const perWeek = 3;

  document.getElementById('prev-week').onclick = () => changeWeek(-1);
  document.getElementById('next-week').onclick = () => changeWeek(1);

  function changeWeek(delta) {
    currentWeek = Math.min(weeksCount, Math.max(1, currentWeek + delta));
    document.getElementById('current-week-label').textContent = `Semaine ${currentWeek}`;
    renderSeances();
  }

  fetch('data/seances.json').then(r=>r.json()).then(data=>{
    seances = data; completed = Array(seances.length).fill(false);
    renderSeances(); renderChart();
  });

  fetch('data/force.json').then(r=>r.json()).then(data=>{ forceSessions = data; renderForce(); });

  function renderSeances() {
    const container = document.getElementById('seance-cards'); container.innerHTML = '';
    const start = (currentWeek-1)*perWeek, end = start+perWeek;
    seances.slice(start,end).forEach((s,i)=>{
      const card = document.createElement('div'); card.className='card';
      const title = document.createElement('h3'); title.textContent = `Jour ${start+i+1}: ${s.type}`;
      const desc = document.createElement('p'); desc.textContent = s.description;
      if(s.type==='gym'){
        const exo = document.createElement('p'); exo.innerHTML=`<strong>Exercices :</strong> ${s.exercices.join(', ')}`;
        card.append(title, desc, exo);
      } else if(s.type==='marche-poids'){
        const w = document.createElement('p'); w.innerHTML=`<strong>Poids recommandé :</strong> ${s.poids}`;
        card.append(title, desc, w);
      } else {
        card.append(title, desc);
      }
      container.appendChild(card);
    });
  }

  function renderForce() {
    const container = document.getElementById('force-cards'); container.innerHTML = '';
    forceSessions.forEach((f,i)=>{
      const card = document.createElement('div'); card.className='card';
      card.innerHTML=`<h3>Ex ${i+1}: ${f.exercice}</h3><p>${f.details}</p>`;
      container.appendChild(card);
    });
  }

  let chart;
  function renderChart(){
    const ctx=document.getElementById('progressChart').getContext('2d');
    chart=new Chart(ctx,{type:'bar',data:{labels:Array.from({length:weeksCount},(_,i)=>`Sem ${i+1}`),datasets:[{label:'Complétion (%)',data:calcCompletion()}]},options:{scales:{y:{beginAtZero:true,max:100}}}});
  }

  function calcCompletion(){
    return Array.from({length:weeksCount},(_,w)=>{
      const weekData=seances.slice(w*perWeek,(w+1)*perWeek);
      const done=weekData.filter((_,i)=>completed[w*perWeek+i]).length;
      return Math.round(done/perWeek*100);
    });
  }

});

/* data/seances.json */
[
  {"type":"marche","description":"Marche rapide 4 km","exercices":[],"poids":"—"},
  {"type":"marche-poids","description":"Marche 5 km","poids":"10 kg","exercices":[]},
  {"type":"gym","description":"Renfo bas du corps","poids":"—","exercices":["Squats 3×12","Fentes marchées 3×10","Pompes 2×15"]},

  {"type":"course","description":"1 min course / 2 min marche ×6","exercices":[]},
  {"type":"marche-poids","description":"Marche 6 km","poids":"12 kg","exercices":[]},
  {"type":"gym","description":"Renfo haut du corps","poids":"—","exercices":["Pompes 3×20","Rowing haltères 3×10","Planche 3×45s"]},

  {"type":"course","description":"3 min course / 1 min marche ×5","exercices":[]},
  {"type":"marche-poids","description":"Marche 8 km","poids":"15 kg","exercices":[]},
  {"type":"gym","description":"Core & Gainage","poids":"—","exercices":["Planche 3×1min","Crunchs 3×20","Dips 3×10"]},

  {"type":"course","description":"5 min course / 1 min marche ×4","exercices":[]},
  {"type":"marche-poids","description":"Marche 10 km","poids":"15 kg","exercices":[]},
  {"type":"gym","description":"Test deadlift","poids":"—","exercices":["Soulevé de terre 3×8","Farmer's walk 3×40m","Pompes 3×20"]},

  {"type":"course","description":"10 min course continue","exercices":[]},
  {"type":"marche-poids","description":"Marche 5 km","poids":"—","exercices":[]},
  {"type":"gym","description":"Test force bras","poids":"—","exercices":["Traction horizontale 3×10","Pompes 4×15","Planche latérale 3×30s"]},

  {"type":"course","description":"Marche rapide 5 km","exercices":[]},
  {"type":"course","description":"Course finale 7 km","exercices":[]},
  {"type":"repos","description":"Repos complet","exercices":[]}
]

/* data/force.json */
[
  {"exercice":"Soulevé de charge (sandbag) 20 kg","details":"30 répétitions en <3m"},
  {"exercice":"Traînée de traîneau 40 kg","details":"40m en <51s"},
  {"exercice":"Saut horizontal","details":"Atteindre ≥1,29 m"},
  {"exercice":"Course-navette 20m chargé","details":"5m21s max"}
]
