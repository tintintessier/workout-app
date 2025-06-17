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

