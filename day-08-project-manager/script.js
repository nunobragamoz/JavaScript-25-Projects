class Tarefa {

    constructor(titulo, prioridade) {

        this.titulo = titulo;
        this.prioridade = prioridade;
        this.status = 'pendente';

    }

    concluir() {

        this.status = 'concluída';

    }

    reabrir() {

        this.status = 'pendente';

    }
}

class Projeto {

    constructor(nome, descricao) {

        this.nome = nome;
        this.descricao = descricao;
        this.tarefas = [];

    }

    adicionarTarefa(tarefa) {

        this.tarefas.push(tarefa);

    }

    removerTarefa(titulo) {

        for(let i = 0; i < this.tarefas.length; i++) {

            if(this.tarefas[i].titulo === titulo) {
                this.tarefas.splice(i, 1);
                return;
            }

        }
    }

    listarTarefas() {

        for(const tarefa of this.tarefas) {

            console.log(`Titulo: ${tarefa.titulo}, Prioridade: ${tarefa.prioridade}, Status: ${tarefa.status}.`);
        }
    }

    atualizarStatus() {

        if(this.tarefas.length === 0) {
            this.status = 'Em andamento';
            return;
        }

        for(const tarefa of this.tarefas) {

            if(tarefa.status !== 'concluída') {
                this.status = 'Em andamento';
                return;
            }
        }

        this.status = 'Concluído';
    }
}

const nomeProjeto = document.getElementById('nomeProjeto');
const descricaoProjeto = document.getElementById('descricaoProjeto');
const adicionarProjetoBtn = document.getElementById('adicionarProjetoBtn');
const listarProjetos = document.getElementById('listarProjetos');
const projetoAlvo = document.getElementById('projetoAlvo');
const tituloTarefa = document.getElementById('tituloTarefa');
const prioridadeTarefa = document.getElementById('prioridadeTarefa');
const adicionarTarefaBtn = document.getElementById('adicionarTarefaBtn');

const projetos = [];




function adicionarProjeto() {

    const nome = nomeProjeto.value.trim();
    const descricao = descricaoProjeto.value.trim();

    if(nome === '' || descricao === '') {
        return;
    }

    const projeto = new Projeto(nome, descricao);
    projetos.push(projeto);

    nomeProjeto.value = '';
    descricaoProjeto.value = '';

    render();
}

function adicionarTarefa() {

    const titulo = tituloTarefa.value.trim();
    const prioridade = prioridadeTarefa.value;

    if(titulo === '' || prioridade === '' || projetoAlvo.value === '') {
        return;
    }

    const indice = Number(projetoAlvo.value);

    const tarefa = new Tarefa(titulo, prioridade);
    projetos[indice].adicionarTarefa(tarefa);

    tituloTarefa.value = '';
    prioridadeTarefa.value = '';

    render();
}

function render() {

    listarProjetos.innerHTML = '';

    if(projetos.length === 0) {

        listarProjetos.innerHTML = '<li class="list-group-item empty-state">Ainda não há projectos. Adiciona um primeiro.</li>';

    } else {

        for(let i = 0; i < projetos.length; i++) {

            const p = projetos[i];

            p.atualizarStatus();

            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = `${p.nome} — ${p.descricao} (${p.status})`;

            const ulTarefas = document.createElement('ul');
            ulTarefas.className = 'list-group list-group-flush mt-2';

            for(let j = 0; j < p.tarefas.length; j++) {

                const tarefa = p.tarefas[j];

                const liTarefa = document.createElement('li');
                liTarefa.className = 'list-group-item';
                liTarefa.innerHTML = `
                    <span>${tarefa.titulo} — ${tarefa.prioridade} (${tarefa.status})</span>
                    <button type="button" class="btn btn-sm btn-success" data-action="concluir" data-projeto="${i}" data-tarefa="${j}">Concluir</button>
                    <button type="button" class="btn btn-sm btn-secondary" data-action="reabrir" data-projeto="${i}" data-tarefa="${j}">Reabrir</button>
                `;

                ulTarefas.appendChild(liTarefa);
            }

            li.appendChild(ulTarefas);
            listarProjetos.appendChild(li);
        }
    }

    projetoAlvo.innerHTML = '';

    for(let i = 0; i < projetos.length; i++) {

        const option = document.createElement('option');
        option.value = i;
        option.textContent = projetos[i].nome;
        projetoAlvo.appendChild(option);
    }
}



adicionarProjetoBtn.addEventListener('click', adicionarProjeto);
adicionarTarefaBtn.addEventListener('click', adicionarTarefa);

listarProjetos.addEventListener('click', function(evento) {

    if(!evento.target.matches('button[data-action]')) {
        return;
    }

    const p = Number(evento.target.dataset.projeto);
    const t = Number(evento.target.dataset.tarefa);
    const acao = evento.target.dataset.action;

    if(acao === 'concluir') {
        projetos[p].tarefas[t].concluir();
    } else if(acao === 'reabrir') {
        projetos[p].tarefas[t].reabrir();
    }

    render();
});

