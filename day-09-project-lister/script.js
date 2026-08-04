const carregarBtn = document.getElementById('carregarBtn');
const listaProjetos = document.getElementById('listaProjetos');

function carregarProjetos() {

  fetch('projetos.json')
    .then(response => response.json())
    .then(projetos => {
      renderProjetos(projetos);
    });
}

function renderProjetos(projetos) {

  listaProjetos.innerHTML = '';

  for (const projeto of projetos) {

    const statusClass = projeto.status === 'Ativo' ? 'projeto-ativo' : 'projeto-concluido';

    const card = document.createElement('div');
    card.className = `projeto-card ${statusClass}`;
    card.innerHTML = `
      <strong>${projeto.nome}</strong>
      <p>${projeto.descricao}</p>
      <span class="projeto-status">Status: ${projeto.status}</span>
    `;

    listaProjetos.appendChild(card);

  }
  
}

carregarBtn.addEventListener('click', carregarProjetos);