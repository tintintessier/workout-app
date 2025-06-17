
function showTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Charger les séances
fetch('data/seances.json')
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('seance-list');
    list.innerHTML = '';
    data.forEach((s, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>Jour ${i + 1}</strong>: ${s.type} – ${s.description}`;
      list.appendChild(li);
    });
  });

// Charger les recettes
fetch('data/recettes.json')
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('recette-list');
    list.innerHTML = '';
    data.forEach(r => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${r.nom}</strong><br>${r.ingredients.join(', ')}`;
      list.appendChild(li);
    });
  });
