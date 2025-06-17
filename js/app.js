document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.tab');
  const btnSeances = document.getElementById('btn-seances');
  const btnGraph = document.getElementById('btn-graph');

  btnSeances.addEventListener('click', () => {
    sections.forEach(s => s.classList.remove('active'));
    document.getElementById('seances').classList.add('active');
  });
  btnGraph.addEventListener('click', () => {
    sections.forEach(s => s.classList.remove('active'));
    document.getElementById('graph').classList.add('active');
  });

  let seances = [];
  let completed = [];

  fetch('data/seances.json')
    .then(res => res.json())
    .then(data => {
      seances = data;
      completed = new Array(seances.length).fill(false);
      renderSeances();
      renderChart();
    })
    .catch(err => {
      console.error('Erreur chargement séances:', err);
      seances = [];
      completed = [];
      renderSeances();
      renderChart();
    });

  function renderSeances() {
    const list = document.getElementById('seance-list');
    list.innerHTML = '';
    seances.forEach((s, i) => {
      const li = document.createElement('li');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = completed[i];
      cb.addEventListener('change', () => {
        completed[i] = cb.checked;
        updateChartData();
      });
      li.append(cb, document.createTextNode(` Jour ${i+1} [${s.type}] – ${s.description}`));
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

  function calculateWeeklyCompletion() {
    const perWeek = Math.ceil(seances.length / 6);
    const counts = new Array(6).fill(0);
    seances.forEach((_, i) => {
      const week = Math.floor(i / perWeek);
      if (completed[i]) counts[week]++;
    });
    return counts.map(cnt => Math.round(cnt / perWeek * 100));
  }

  function updateChartData() {
    if (chart) {
      chart.data.datasets[0].data = calculateWeeklyCompletion();
      chart.update();
    }
  }
});
