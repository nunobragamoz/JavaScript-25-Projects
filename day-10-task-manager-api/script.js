

const ul = document.getElementById("listaTarefas");
const novaTarefa = document.getElementById("novaTarefa");
const adicionarBtn = document.getElementById("adicionarBtn");

async function carregarTarefas() {

  try {
    const response = await fetch("http://localhost:3000/tarefas");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const tarefas = await response.json();
    renderTarefas(tarefas);

  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
  }
}

async function adicionarTarefa() {

  const titulo = novaTarefa.value.trim();
  if (!titulo) return;

  try {
    await fetch("http://localhost:3000/tarefas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: titulo })
    });

    novaTarefa.value = "";
    carregarTarefas();

  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error);
  }
}

function renderTarefas(tarefas) {

  ul.innerHTML = ""; 
  tarefas.forEach((tarefa) => {
    const li = document.createElement("li");
    li.textContent = tarefa.titulo;

    const alterarButton = document.createElement("button");
    alterarButton.textContent = "Alterar";
    alterarButton.setAttribute("data-action", "alterar");
    alterarButton.setAttribute("data-id", tarefa.id);

    const eliminarButton = document.createElement("button");
    eliminarButton.textContent = "Eliminar";
    eliminarButton.setAttribute("data-action", "eliminar");
    eliminarButton.setAttribute("data-id", tarefa.id);

    li.appendChild(alterarButton);
    li.appendChild(eliminarButton);
    ul.appendChild(li);

  });

}



ul.addEventListener("click", async function (evento) {

  if (!evento.target.matches("button[data-action]")) return;

  const id = evento.target.dataset.id;
  const acao = evento.target.dataset.action;
  const url = `http://localhost:3000/tarefas/${id}`;

  try {
    if (acao === "eliminar") {
      await fetch(url, { method: "DELETE" });
      carregarTarefas();

    } else if (acao === "alterar") {
      const novoTitulo = prompt("Novo título:");
      if (!novoTitulo || !novoTitulo.trim()) return;   // guard: cancelled or empty

      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: novoTitulo.trim() })
      });
      carregarTarefas();
    }
  } catch (error) {
    console.error("Erro na operação:", error);
  }
});

adicionarBtn.addEventListener("click", adicionarTarefa);

document.addEventListener("DOMContentLoaded", carregarTarefas);
