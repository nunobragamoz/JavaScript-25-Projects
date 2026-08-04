
/* =======================================================

   Linkin Park Store - Lógica da Aplicação
   Caso Prático de Final de Módulo | JavaScript Avançado
   feito pot Nuno Luis Braga

   Índice:

   0. DOM e Estado

   1. Utilitários

   2. Carregamento do catálogo (AJAX / JSON)

   3. Filtro por categoria

   4. Listagem dinâmica dos produtos

   5. Lightbox

   6. Calculadora do total e validação

   7. SEO dinâmico (dados estruturados)

   8. Registo de eventos e arranque

   ======================================================= */


// O "use strict" obriga o JavaScript a ser mais rigoroso, evitando 
// erros silenciosos e práticas inseguras.

"use strict";


/* ============ 0. DOM e Estado ============ */

// Menu colado ao topo

const mainNav = document.getElementById("main-nav");
const navbarCollapse = document.getElementById("navbarNav");

// Banner: botão do catálogo e a seta que o aponta

const heroCtaBtn = document.getElementById("hero-cta-btn");
const heroCue = document.getElementById("hero-cue");

// Filtro das categorias e contador de produtos em exibição

const categoryFilter = document.getElementById("category-filter");
const filterCount = document.getElementById("filter-count");
const goToFilterBtn = document.getElementById("go-to-filter");

// Listagem dinâmica de produtos

const productGrid = document.getElementById("product-grid");

// Calculadora 

const productSelect = document.getElementById("product");
const quantityInput = document.getElementById("quantity");
const addProductBtn = document.getElementById("add-product");
const calculateBtn = document.getElementById("calculate");
const placeOrderBtn = document.getElementById("place-order");
const clearOrderBtn = document.getElementById("clear-order");
const totalValue = document.getElementById("total-value");
const formError = document.getElementById("form-error");
const orderSuccess = document.getElementById("order-success");

// Linhas do pedido (tabela com os produtos já adicionados)

const orderLines = document.getElementById("order-lines");
const orderLinesBody = document.getElementById("order-lines-body");
const orderEmpty = document.getElementById("order-empty");

// Lightbox

const lightbox = document.getElementById("lightbox");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCategory = document.getElementById("lightbox-category");
const lightboxDescription = document.getElementById("lightbox-description");
const lightboxPrice = document.getElementById("lightbox-price");
const lightboxClose = document.getElementById("lightbox-close");

// Estado da aplicação

let categorias = [];      // array "categories" do catalog.json
let produtos = [];        // array "products" do catalog.json
let ultimoFocado = null;  // elemento que abriu o lightbox, para lhe devolver o foco

// Produtos já adicionados ao pedido. Cada posição é um objeto
// { id, nome, preco, quantidade } e o total é a soma de todos eles.

let linhasPedido = [];


/* ============ 1. Utilitários ============ */

// Registos na consola (F12 -> Consola), para acompanhar o que a página está a
// fazer em cada passo. Basta pôr DEBUG a false para os silenciar todos de uma vez.

const DEBUG = true;

function log(mensagem, ...extras) {

    if (!DEBUG) return;

    console.log(
        `%c[Loja]%c ${mensagem}`,
        "color:#ff6b1a; font-weight:700",   // estilo do prefixo
        "color:inherit",                    // estilo do resto da mensagem
        ...extras
    );
}

// No catalog.json os preços são texto ("15.99").
// Esta função converte-os para número antes de qualquer cálculo.

function precoNumerico(produto) {

    return parseFloat(produto.price);

}

// Formata um número em euros: 24.99 -> "24,99 €"

function formatarPreco(valor) {

    return valor.toLocaleString("pt-PT", {
        style: "currency",
        currency: "EUR"
    });
}

// Return do nome legível de uma categoria a partir do seu id ("musica" -> "Música")

function nomeCategoria(idCategoria) {

    const categoria = categorias.find(item => item.id === idCategoria);
    return categoria ? categoria.name : idCategoria;

}

// Escapa texto vindo do JSON antes de injetar como HTML.
// Evita que aspas ou sinais de menor/maior partam a marcação.

function escaparHtml(texto) {

    return String(texto).replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

    }[caracter]));

}

// Imagem de reserva em SVG, usada quando o ficheiro ainda não existe
// na pasta assets/images. Assim o catálogo nunca aparece com imagens partidas.
// E o codigo e assim mais re-utilizável, porque não é preciso criar uma 
// imagem de reserva para cada produto.

function imagemPlaceholder(nome) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img">
            <rect width="400" height="300" fill="#1b1b1f"/>
            <rect width="400" height="6" fill="#ff6b1a"/>
            <text x="200" y="140" fill="#ff6b1a" font-family="Oswald, sans-serif"
                  font-size="54" font-weight="700" text-anchor="middle">LP</text>
            <text x="200" y="180" fill="#9b9ba3" font-family="Inter, sans-serif"
                  font-size="15" letter-spacing="2" text-anchor="middle">${nome.toUpperCase()}</text>
        </svg>`;

    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.trim());
}

// Aplica o placeholder a uma <img> caso o ficheiro real não exista. 
// O evento "error" dispara apenas uma vez, mesmo que a imagem falhe
// várias vezes. 

function tratarImagemEmFalta(imagem, nome) {

    imagem.addEventListener("error", () => {
        imagem.src = imagemPlaceholder(nome);
    }, { once: true });

}

// Mede o menu e guarda a altura na variável --nav-height do CSS, que é a
// margem com que os saltos das âncoras param. Se essa margem for maior do que
// o menu, fica uma frincha onde se vê o fim da secção anterior; se for menor,
// o menu tapa o início da secção. Como a altura muda com o tamanho do ecrã,
// é mais seguro medi-la do que escrever um número fixo no CSS.

function medirAlturaMenu() {

    // Com o menu aberto no telemóvel a barra fica muito mais alta e a medida
    // não serviria de nada — nesse caso deixa-se a anterior.

    if (navbarCollapse.classList.contains("show")) {
        return;
    }

    document.documentElement.style.setProperty("--nav-height", `${mainNav.offsetHeight}px`);
}

// A seta do banner serve para chamar a atenção para o botão do catálogo.
// Assim que a pessoa carrega no botão ou começa a descer a página já percebeu
// a ideia, e daí para a frente a seta era só ruído — sai de cena.

function esconderSetaDoBanner() {

    heroCue.classList.add("is-done");

    log("Seta do banner escondida: o utilizador já reagiu ao banner.");
}


/* ============ 2. Carregamento do catálogo (AJAX / JSON) ============ */

async function carregarCatalogo() {

    log("A pedir o catalog.json ao servidor…");
    console.time("[Loja] catálogo pronto em");

    try {
        const resposta = await fetch("assets/data/catalog.json");

        log(`Resposta recebida: HTTP ${resposta.status} (${resposta.ok ? "OK" : "erro"})`);

        if (!resposta.ok) {
            throw new Error(`Resposta do servidor: ${resposta.status}`);
        }

        const dados = await resposta.json();

        categorias = dados.categories;
        produtos = dados.products;

        log(`JSON lido: ${categorias.length} categorias e ${produtos.length} produtos.`);

        // console.table mostra os dados numa tabela, muito mais legível que um array
        if (DEBUG) {
            console.table(produtos.map(produto => ({
                id: produto.id,
                nome: produto.name,
                categoria: produto.category,
                preço: formatarPreco(precoNumerico(produto))
            })));
        }

        preencherFiltroCategorias();
        preencherSelectProdutos();
        mostrarProdutos(produtos);
        gerarDadosEstruturados();

    } catch (erro) {

        console.error("Não foi possível carregar o catálogo:", erro);

        productGrid.innerHTML = `
            <p class="empty-msg">
                Não foi possível carregar o catálogo.<br>
                Abre a página através de um servidor local (por exemplo, a extensão
                <strong>Live Server</strong>) &mdash; o <code>fetch</code> não funciona
                com ficheiros abertos diretamente do disco.
            </p>`;

    } finally {

        productGrid.setAttribute("aria-busy", "false");
        console.timeEnd("[Loja] catálogo pronto em");

    }
}


/* ============ 3. Filtro por categoria ============ */

// Preenche o dropdown a partir do array "categories" do catalog.json

function preencherFiltroCategorias() {

    categorias.forEach(categoria => {

        const opcao = document.createElement("option");
        opcao.value = categoria.id;
        opcao.textContent = categoria.name;

        categoryFilter.appendChild(opcao);
    });

    log(`Dropdown do filtro preenchido com ${categorias.length} categorias:`,
        categorias.map(categoria => categoria.name).join(", "));
}

function filtrarProdutos() {

    const categoriaEscolhida = categoryFilter.value;


    // Valor vazio corresponde a "Todas as categorias"

    const filtrados = categoriaEscolhida === ""
        ? produtos
        : produtos.filter(produto => produto.category === categoriaEscolhida);

    log(`Filtro alterado para "${categoriaEscolhida || "todas"}" -> ${filtrados.length} de ${produtos.length} produtos.`);

    mostrarProdutos(filtrados);
}


/* ============ 4. Listagem dinâmica de produtos ============ */

function mostrarProdutos(lista) {

    productGrid.innerHTML = "";

    if (lista.length === 0) {
        productGrid.innerHTML = `<p class="empty-msg">Não há produtos nesta categoria.</p>`;
        atualizarContador(0);
        log("Nenhum produto corresponde ao filtro. Grelha vazia.");
        return;
    }

    lista.forEach(produto => {

        const coluna = document.createElement("div");
        coluna.className = "col-12 col-sm-6 col-lg-4 col-xl-3";

        const cartao = document.createElement("article");
        cartao.className = "product-card";

        cartao.innerHTML = `
            <div class="product-media">

                <img src="${escaparHtml(produto.image)}"
                     alt="${escaparHtml(produto.name)}" loading="lazy" width="400" height="300">
                <span class="product-badge">${escaparHtml(nomeCategoria(produto.category))}</span>
            
            </div>

            <div class="product-body">

                <h3 class="product-name">${escaparHtml(produto.name)}</h3>
                <p class="product-excerpt">${escaparHtml(produto.description)}</p>

                <div class="product-footer">
                    <span class="product-price">${formatarPreco(precoNumerico(produto))}</span>
                    <button type="button" class="btn-ghost details-btn">Ver Detalhes</button>
                </div>

            </div>`;

        // Imagem em falta -> placeholder gerado em SVG

        tratarImagemEmFalta(cartao.querySelector("img"), produto.name);

        // O botão "Ver Detalhes" abre o lightbox com este produto

        const botaoDetalhes = cartao.querySelector(".details-btn");
        botaoDetalhes.setAttribute("aria-label", `Ver detalhes de ${produto.name}`);
        botaoDetalhes.addEventListener("click", () => abrirLightbox(produto, botaoDetalhes));

        coluna.appendChild(cartao);
        productGrid.appendChild(coluna);
    });

    atualizarContador(lista.length);

    log(`${lista.length} cartões desenhados na grelha (#product-grid).`);
}

/* ============ Contador de  produtos em exibi;ão ============ */

function atualizarContador(total) {
    const palavra = total === 1 ? "produto" : "produtos";
    filterCount.innerHTML = `<strong>${total}</strong> ${palavra} em exibição`;
}


/* ============ 5. Lightbox de ver detalhes ============ */

function abrirLightbox(produto, origem) {

    ultimoFocado = origem;

    lightboxCategory.textContent = nomeCategoria(produto.category);
    lightboxTitle.textContent = produto.name;
    lightboxDescription.textContent = produto.description;
    lightboxPrice.textContent = formatarPreco(precoNumerico(produto));

    lightboxImage.alt = produto.name;
    tratarImagemEmFalta(lightboxImage, produto.name);
    lightboxImage.src = produto.image;

    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");

    lightboxClose.focus();

    log(`Lightbox aberto -> "${produto.name}" (${formatarPreco(precoNumerico(produto))})`);
}

function fecharLightbox() {

    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");

    log("Lightbox fechado. Foco devolvido ao botão de origem.");


    // Devolve o foco ao botão que abriu o detalhe

    if (ultimoFocado) {
        ultimoFocado.focus();
        ultimoFocado = null;
    }
}

// Mantém o foco dentro do lightbox enquanto estiver aberto.    
// Sem isto, o Tab sairia para a página por baixo, que está tapada. 

function prenderFoco(evento) {

    if (evento.key !== "Tab" || lightbox.hidden) {
        return;
    }

    const focaveis = lightbox.querySelectorAll("button, [href], input, select, textarea");

    if (focaveis.length === 0) {
        return;
    }

    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];

    if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();

    } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
    }
}


/* ============ 6. Calculadora do total e validação ============ */

function preencherSelectProdutos() {

    produtos.forEach(produto => {

        const opcao = document.createElement("option");
        opcao.value = produto.id;
        opcao.textContent = `${produto.name} — ${formatarPreco(precoNumerico(produto))}`;

        productSelect.appendChild(opcao);
    });

    log(`Select da calculadora preenchido com ${produtos.length} produtos.`);
}

// Lê e valida o que está escolhido no formulário.
// Devolve { produto, quantidade } se estiver tudo bem, ou null se houver erro.
// Fica numa função à parte porque tanto o "Adicionar ao pedido" como o
// "Calcular valor total" precisam exatamente das mesmas validações.

function lerSelecao() {

    limparErro();

    const idProduto = productSelect.value;
    const textoQuantidade = quantityInput.value.trim();
    const quantidade = Number(textoQuantidade);

    // Validação 1: tem de haver um produto selecionado

    if (idProduto === "") {
        // "continuar" e não "calcular": esta validação serve os três botões,
        // o de adicionar, o de calcular e o de fazer o pedido
        mostrarErro("Escolhe um produto da lista antes de continuar.", productSelect);
        return null;
    }

    // Validação 2: a quantidade tem de estar preenchida e ser um número

    if (textoQuantidade === "" || Number.isNaN(quantidade)) {
        mostrarErro("Indica a quantidade que pretendes.", quantityInput);
        return null;
    }

    // Validação 3: a quantidade tem de ser um inteiro positivo

    if (!Number.isInteger(quantidade) || quantidade < 1) {
        mostrarErro("A quantidade tem de ser um número inteiro positivo (1 ou mais).", quantityInput);
        return null;
    }

    return {
        produto: produtos.find(item => item.id === idProduto),
        quantidade: quantidade
    };
}


// Junta o produto escolhido às linhas do pedido.
// Se esse produto já lá estiver, apenas soma a quantidade
// em vez de repetir a linha.

function adicionarAoPedido() {

    const selecao = lerSelecao();

    if (!selecao) {
        return;
    }

    const jaExiste = linhasPedido.find(linha => linha.id === selecao.produto.id);

    if (jaExiste) {

        jaExiste.quantidade += selecao.quantidade;
        log(`Quantidade atualizada: "${jaExiste.nome}" passa a ${jaExiste.quantidade} unidades.`);

    } else {

        linhasPedido.push({
            id: selecao.produto.id,
            nome: selecao.produto.name,
            preco: precoNumerico(selecao.produto),
            quantidade: selecao.quantidade
        });

        log(`Adicionado ao pedido: "${selecao.produto.name}" × ${selecao.quantidade}.`);
    }

    mostrarLinhasPedido();


    // Devolve o foco ao select para se poder escolher já o produto seguinte

    productSelect.value = "";
    quantityInput.value = "1";
    productSelect.focus();
}


// Retira uma linha do pedido a partir do id do produto

function removerDoPedido(idProduto) {

    const linha = linhasPedido.find(item => item.id === idProduto);

    linhasPedido = linhasPedido.filter(item => item.id !== idProduto);

    log(`Removido do pedido: "${linha.nome}". Restam ${linhasPedido.length} linhas.`);

    mostrarLinhasPedido();
}


// Esvazia o pedido todo de uma vez

function limparPedido() {

    linhasPedido = [];

    log("Pedido limpo.");

    mostrarLinhasPedido();
    productSelect.focus();
}


// Desenha a tabela com as linhas do pedido.
// É chamada sempre que o pedido muda (adicionar, remover ou limpar).

function mostrarLinhasPedido() {

    orderLinesBody.innerHTML = "";


    // Mexer no pedido invalida a confirmação do pedido anterior

    orderSuccess.hidden = true;


    // Sem linhas: esconde a tabela e mostra a mensagem de pedido vazio

    const vazio = linhasPedido.length === 0;

    orderLines.hidden = vazio;
    orderEmpty.hidden = !vazio;
    clearOrderBtn.hidden = vazio;

    linhasPedido.forEach(linha => {

        const subtotal = linha.preco * linha.quantidade;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escaparHtml(linha.nome)}</td>
            <td class="cell-num">${formatarPreco(linha.preco)}</td>
            <td class="cell-num">${linha.quantidade}</td>
            <td class="cell-num cell-subtotal">${formatarPreco(subtotal)}</td>
            <td class="cell-num">
                <button type="button" class="remove-btn" aria-label="Remover ${escaparHtml(linha.nome)} do pedido">&times;</button>
            </td>`;

        tr.querySelector(".remove-btn").addEventListener("click", () => removerDoPedido(linha.id));

        orderLinesBody.appendChild(tr);
    });


    // O total deixa de corresponder ao pedido, por isso volta a zero
    // até o utilizador carregar outra vez em "Calcular valor total".

    totalValue.textContent = formatarPreco(0);
}


// Mostra um valor no lugar do total e dispara a animação de destaque

function mostrarTotal(valor) {

    totalValue.textContent = formatarPreco(valor);


    // Reinicia a animação de destaque a cada novo cálculo

    totalValue.classList.remove("is-updated");
    void totalValue.offsetWidth;
    totalValue.classList.add("is-updated");
}


// Soma tudo o que está no pedido.
// Se ainda não houver linhas nenhumas, calcula apenas o produto que está
// selecionado no formulário, para a calculadora funcionar mesmo sem lista.

function calcularTotal() {

    if (linhasPedido.length === 0) {

        const selecao = lerSelecao();

        if (!selecao) {
            return;
        }

        const total = precoNumerico(selecao.produto) * selecao.quantidade;

        mostrarTotal(total);

        if (DEBUG) {
            console.group("%c[Loja] Cálculo do total (produto único)", "color:#ff6b1a; font-weight:700");
            console.log("Produto:", selecao.produto.name);
            console.log(`Conta: ${precoNumerico(selecao.produto)} × ${selecao.quantidade} = ${total}`);
            console.log("Total apresentado:", formatarPreco(total));
            console.groupEnd();
        }

        return;
    }

    limparErro();


    // reduce percorre o array e vai acumulando a soma dos subtotais

    const total = linhasPedido.reduce((soma, linha) => soma + linha.preco * linha.quantidade, 0);

    mostrarTotal(total);


    // console.group agrupa as linhas seguintes, deixando a consola arrumada

    if (DEBUG) {

        console.group(`%c[Loja] Cálculo do total (${linhasPedido.length} produtos)`, "color:#ff6b1a; font-weight:700");

        console.table(linhasPedido.map(linha => ({
            produto: linha.nome,
            preço: formatarPreco(linha.preco),
            quantidade: linha.quantidade,
            subtotal: formatarPreco(linha.preco * linha.quantidade)
        })));

        console.log("Total apresentado:", formatarPreco(total));
        console.groupEnd();
    }
}

// Número de encomenda no formato LP-2026-4821: o ano mais quatro dígitos
// tirados à sorte. Num projeto a sério viria do servidor, aqui serve para o
// cliente ficar com uma referência.

function gerarNumeroPedido() {

    const ano = new Date().getFullYear();
    const sequencia = Math.floor(1000 + Math.random() * 9000);

    return `LP-${ano}-${sequencia}`;
}


// Fecha o pedido. Como não há servidor nenhum do outro lado, o "envio" acaba
// na consola — o que interessa aqui é o percurso: confirmar o que foi pedido,
// dar uma referência ao cliente e deixar o formulário pronto para o próximo.

function fazerPedido() {

    // Com o pedido vazio, fecha com o que estiver escolhido no formulário —
    // o mesmo à-vontade que a calculadora já dá a quem só quer um artigo.

    if (linhasPedido.length === 0) {

        adicionarAoPedido();

        // Se continua vazio é porque a validação falhou e o erro já está à vista

        if (linhasPedido.length === 0) {
            return;
        }
    }

    limparErro();

    const total = linhasPedido.reduce((soma, linha) => soma + linha.preco * linha.quantidade, 0);
    const artigos = linhasPedido.reduce((soma, linha) => soma + linha.quantidade, 0);
    const numero = gerarNumeroPedido();

    if (DEBUG) {

        console.group(`%c[Loja] Pedido ${numero} fechado`, "color:#ff6b1a; font-weight:700");

        console.table(linhasPedido.map(linha => ({
            produto: linha.nome,
            preço: formatarPreco(linha.preco),
            quantidade: linha.quantidade,
            subtotal: formatarPreco(linha.preco * linha.quantidade)
        })));

        console.log("Total do pedido:", formatarPreco(total));
        console.log("Projeto académico: não há servidor, o pedido não sai daqui.");
        console.groupEnd();
    }

    // Pedido fechado: a lista é esvaziada para se poder começar outro.
    // Tem de ser antes da mensagem, senão o mostrarLinhasPedido escondia-a.

    linhasPedido = [];
    mostrarLinhasPedido();

    orderSuccess.textContent =
        `Pedido ${numero} registado! ${artigos} ${artigos === 1 ? "artigo" : "artigos"}, ` +
        `no total de ${formatarPreco(total)}. Recebes a confirmação por email dentro de minutos.`;

    orderSuccess.hidden = false;


    // O foco vai para a confirmação, para quem usa leitor de ecrã perceber
    // logo que o pedido passou

    orderSuccess.setAttribute("tabindex", "-1");
    orderSuccess.focus();
}


function mostrarErro(mensagem, campo) {

    formError.textContent = mensagem;
    totalValue.textContent = formatarPreco(0);
    orderSuccess.hidden = true;

    // console.warn aparece a amarelo na consola, para se distinguir dos registos normais
    if (DEBUG) {
        console.warn(`[Loja] Validação falhou no campo #${campo.id}: ${mensagem}`);
    }

    campo.setAttribute("aria-invalid", "true");
    campo.classList.add("is-invalid");
    campo.focus();
}

function limparErro() {

    formError.textContent = "";

    [productSelect, quantityInput].forEach(campo => {
        campo.removeAttribute("aria-invalid");
        campo.classList.remove("is-invalid");
    });
}


/* ============ 7. SEO dinâmico (dados estruturados) ============ */

// Acrescenta ao <head> um bloco JSON-LD com a lista de produtos do catálogo.
// Os motores de busca passam a conhecer nome, descrição e preço de cada artigo.
// Bom para SEO, para que os produtos apareçam nos resultados de pesquisa com rich snippets.

function gerarDadosEstruturados() {

    const dados = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Catálogo Linkin Park Store",
        "numberOfItems": produtos.length,
        "itemListElement": produtos.map((produto, indice) => ({
            "@type": "ListItem",
            "position": indice + 1,
            "item": {
                "@type": "Product",
                "name": produto.name,
                "description": produto.description,
                "image": produto.image,
                "category": nomeCategoria(produto.category),
                "offers": {
                    "@type": "Offer",
                    "price": produto.price,
                    "priceCurrency": "EUR",
                    "availability": "https://schema.org/InStock"
                }
            }
        }))
    };

    const bloco = document.createElement("script");
    bloco.type = "application/ld+json";
    bloco.textContent = JSON.stringify(dados);

    document.head.appendChild(bloco);

    log(`JSON-LD com ${produtos.length} produtos acrescentado ao <head> (SEO).`);
}


/* ============ 8. Eventos e Boot up ============ */

console.log(
    "%cLinkin Park Store%c\nCaso Prático de Final de Módulo · Nuno Luís Braga",
    "color:#ff6b1a; font-size:20px; font-weight:700; font-family:sans-serif",
    "color:#9b9ba3; font-size:12px"
);

categoryFilter.addEventListener("change", filtrarProdutos);


// O botão "Filtrar" ao lado do título do catálogo já sobe até à secção do
// filtro por ser uma âncora (href="#filter-section"). Aqui só se acrescenta o
// foco no dropdown, para não ser preciso um segundo clique para o abrir.
// O preventScroll evita que o foco dê outro salto por cima do deslize do CSS.

goToFilterBtn.addEventListener("click", () => {

    categoryFilter.focus({ preventScroll: true });

    log("Atalho \"Filtrar\" usado: subiu ao filtro e o dropdown ficou focado.");

});

addProductBtn.addEventListener("click", adicionarAoPedido);
calculateBtn.addEventListener("click", calcularTotal);
placeOrderBtn.addEventListener("click", fazerPedido);
clearOrderBtn.addEventListener("click", limparPedido);


// Limpa a mensagem de erro assim que o utilizador corrige os campos

[productSelect, quantityInput].forEach(campo => {
    campo.addEventListener("input", limparErro);
});

lightboxClose.addEventListener("click", fecharLightbox);


// Fechar ao clicar no fundo escurecido ou fora do lightbox

lightbox.addEventListener("click", evento => {
    if (evento.target.dataset.close === "true") {
        fecharLightbox();
    }
});


// Fechar com a tecla Escape e prender o foco com o Tab

document.addEventListener("keydown", evento => {

    if (evento.key === "Escape" && !lightbox.hidden) {
        fecharLightbox();
    }

    prenderFoco(evento);
});


// A altura do menu muda quando a janela muda de tamanho (o menu passa a
// hamburger, o texto reparte-se), por isso volta a ser medida.

window.addEventListener("resize", medirAlturaMenu);


// A seta do banner desaparece à primeira reação, seja o clique no botão ou o
// primeiro deslize da página. { once: true } trata de remover o próprio
// listener a seguir; o passive avisa o browser de que não travamos o scroll.

heroCtaBtn.addEventListener("click", esconderSetaDoBanner, { once: true });
window.addEventListener("scroll", esconderSetaDoBanner, { once: true, passive: true });


log("Eventos registados: filtro, pedido (adicionar/remover/limpar/fechar), calculadora e lightbox.");


// Boot up: altura do menu medida, valor total a zero e catálogo via AJAX

medirAlturaMenu();

totalValue.textContent = formatarPreco(0);

log("Aplicação iniciada. A carregar o catálogo…");

carregarCatalogo();
