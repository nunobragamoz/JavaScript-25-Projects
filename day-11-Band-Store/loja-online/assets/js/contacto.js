
/* =======================================================

   Linkin Park Store - Página de Contacto
   Caso Prático de Final de Módulo | JavaScript Avançado
   feito por Nuno Luis Braga

   Índice:

   0. DOM e Estado

   1. Utilitários

   2. Validação dos campos

   3. Contador de caracteres

   4. Envio da mensagem

   5. Mapa (tiles do OpenStreetMap)

   6. Eventos e arranque

   ======================================================= */


// O "use strict" obriga o JavaScript a ser mais rigoroso, evitando
// erros silenciosos e práticas inseguras.

"use strict";


/* ============ 0. DOM e Estado ============ */

// Formulário e os seus campos

const contactForm = document.getElementById("contact-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const subjectSelect = document.getElementById("subject");
const messageInput = document.getElementById("message");
const consentCheck = document.getElementById("consent");
const clearContactBtn = document.getElementById("clear-contact");

// Mensagens e contador

const contactError = document.getElementById("contact-error");
const contactSuccess = document.getElementById("contact-success");
const charCount = document.getElementById("char-count");
const minCount = document.getElementById("min-count");
const maxCount = document.getElementById("max-count");

// Mapa

const mapCanvas = document.getElementById("map-canvas");
const mapFallback = document.getElementById("map-fallback");
const mapZoomIn = document.getElementById("map-zoom-in");
const mapZoomOut = document.getElementById("map-zoom-out");

// Todos os campos numa lista só, para limpar os erros de uma vez

const campos = [nameInput, emailInput, phoneInput, subjectSelect, messageInput, consentCheck];

// Regras de tamanho da mensagem. Ficam aqui em cima como constantes para não
// andarem espalhadas pelo código nem ficarem fora de sincronia com o HTML.

const MIN_MENSAGEM = 20;
const MAX_MENSAGEM = 500;


/* ============ 1. Utilitários ============ */

// Registos na consola (F12 -> Consola), para acompanhar o que a página está a
// fazer em cada passo. Basta pôr DEBUG a false para os silenciar todos de uma vez.
// Repete-se aqui porque esta página não carrega o scripts.js, que trata do
// catálogo, do lightbox e da calculadora — nada disso existe no contacto.

const DEBUG = true;

function log(mensagem, ...extras) {

    if (!DEBUG) return;

    console.log(
        `%c[Contacto]%c ${mensagem}`,
        "color:#ff6b1a; font-weight:700",   // estilo do prefixo
        "color:inherit",                    // estilo do resto da mensagem
        ...extras
    );
}

// Validação simples de email: alguma coisa, arroba, domínio e uma extensão
// com pelo menos duas letras. Não tenta apanhar todos os casos possíveis
// (isso daria uma expressão gigante), apanha é os enganos do dia a dia.

function emailValido(texto) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto);

}

// Telefone é opcional, mas se for preenchido tem de parecer um telefone:
// dígitos, espaços, traços, parêntesis e um + no início.

function telefoneValido(texto) {

    return /^\+?[\d\s()-]{9,20}$/.test(texto);

}


/* ============ 2. Validação dos campos ============ */

// Percorre as regras por ordem e pára na primeira que falhar.
// Devolve os dados do formulário se estiver tudo bem, ou null se houver erro.

function validarFormulario() {

    limparErro();

    const nome = nameInput.value.trim();
    const email = emailInput.value.trim();
    const telefone = phoneInput.value.trim();
    const assunto = subjectSelect.value;
    const mensagem = messageInput.value.trim();

    // Validação 1: nome preenchido e com um tamanho credível

    if (nome.length < 3) {
        mostrarErro("Escreve o teu nome (pelo menos 3 letras).", nameInput);
        return null;
    }

    // Validação 2: email preenchido

    if (email === "") {
        mostrarErro("Precisamos do teu email para te podermos responder.", emailInput);
        return null;
    }

    // Validação 3: email com um formato aceitável

    if (!emailValido(email)) {
        mostrarErro("Esse email não parece bem escrito. Confirma, por favor (exemplo: nome@exemplo.pt).", emailInput);
        return null;
    }

    // Validação 4: telefone só é verificado se o utilizador o tiver preenchido

    if (telefone !== "" && !telefoneValido(telefone)) {
        mostrarErro("O telefone só pode ter dígitos, espaços, traços e o indicativo com +.", phoneInput);
        return null;
    }

    // Validação 5: tem de haver um assunto escolhido

    if (assunto === "") {
        mostrarErro("Escolhe o assunto da tua mensagem.", subjectSelect);
        return null;
    }

    // Validação 6: mensagem com conteúdo suficiente para se perceber o pedido

    if (mensagem.length < MIN_MENSAGEM) {
        mostrarErro(`A mensagem está demasiado curta: escreve pelo menos ${MIN_MENSAGEM} caracteres.`, messageInput);
        return null;
    }

    // Validação 7: consentimento dado (obrigatório por causa do RGPD)

    if (!consentCheck.checked) {
        mostrarErro("Para te respondermos precisamos da tua autorização para tratar os dados.", consentCheck);
        return null;
    }

    return {
        nome: nome,
        email: email,
        telefone: telefone || "(não indicado)",
        assunto: subjectSelect.options[subjectSelect.selectedIndex].textContent,
        mensagem: mensagem
    };
}

function mostrarErro(mensagem, campo) {

    contactError.textContent = mensagem;
    contactSuccess.hidden = true;

    // console.warn aparece a amarelo na consola, para se distinguir dos registos normais
    if (DEBUG) {
        console.warn(`[Contacto] Validação falhou no campo #${campo.id}: ${mensagem}`);
    }

    campo.setAttribute("aria-invalid", "true");
    campo.classList.add("is-invalid");
    campo.focus();
}

function limparErro() {

    contactError.textContent = "";

    campos.forEach(campo => {
        campo.removeAttribute("aria-invalid");
        campo.classList.remove("is-invalid");
    });
}


/* ============ 3. Contador de caracteres ============ */

// Vai contando o que já foi escrito na mensagem e avisa (a laranja) quando
// ainda falta texto para chegar ao mínimo.

function atualizarContador() {

    const escritos = messageInput.value.trim().length;

    charCount.textContent = escritos;
    charCount.classList.toggle("is-short", escritos > 0 && escritos < MIN_MENSAGEM);
}


/* ============ 4. Envio da mensagem ============ */

// Não há servidor por trás deste projeto, por isso o "envio" acaba na consola.
// O que interessa aqui é o percurso: validar, confirmar ao utilizador e
// deixar o formulário pronto para uma mensagem nova.

function enviarMensagem(evento) {

    evento.preventDefault();

    const dados = validarFormulario();

    if (!dados) {
        return;
    }

    // console.group agrupa as linhas seguintes, deixando a consola arrumada

    if (DEBUG) {

        console.group("%c[Contacto] Mensagem validada e pronta a enviar", "color:#ff6b1a; font-weight:700");
        console.table(dados);
        console.log("Nota: projeto académico — nada é enviado para nenhum servidor.");
        console.groupEnd();
    }

    contactSuccess.textContent =
        `Obrigado, ${dados.nome.split(" ")[0]}! A tua mensagem foi registada. ` +
        `Respondemos para ${dados.email} dentro de 24 a 48 horas úteis.`;

    contactSuccess.hidden = false;

    contactForm.reset();
    atualizarContador();

    // O foco vai para a confirmação e não para o topo do formulário, para
    // quem usa leitor de ecrã perceber logo que a mensagem passou.

    contactSuccess.setAttribute("tabindex", "-1");
    contactSuccess.focus();
}


// Limpa o formulário todo e volta ao estado inicial

function limparFormulario() {

    contactForm.reset();

    limparErro();
    atualizarContador();

    contactSuccess.hidden = true;

    log("Formulário limpo.");

    nameInput.focus();
}


/* ============ 5. Mapa (tiles do OpenStreetMap) ============ */

// Começou por ser o <iframe> do próprio OpenStreetMap, mas o embed deles agora
// desenha o mapa com WebGL e num browser sem WebGL (ou com a aceleração gráfica
// desligada) aparece só o aviso "your browser does not support WebGL".
//
// Aqui montamos o mapa à mão: os tiles são imagens PNG de 256×256 já desenhadas
// no servidor, pedidas com <img> normais. Sem WebGL, sem iframe e sem
// biblioteca nenhuma pelo meio.

const MAPA_LAT = 38.7223;    // Rua da Prata, Lisboa
const MAPA_LON = -9.1393;
const TILE = 256;            // tamanho de cada tile, em píxeis
const ZOOM_MIN = 13;
const ZOOM_MAX = 18;

let mapaZoom = 16;
let temporizadorMapa = null;

// Converte latitude/longitude em coordenadas de tile, pela projeção de
// Web Mercator — a mesma conta que o OpenStreetMap e o Google Maps usam.
// A parte inteira diz qual é o tile; a parte decimal diz em que ponto
// dentro dele fica a morada.

function coordenadasTile(latitude, longitude, zoom) {

    const totalTiles = 2 ** zoom;

    const x = (longitude + 180) / 360 * totalTiles;

    const radianos = latitude * Math.PI / 180;
    const y = (1 - Math.log(Math.tan(radianos) + 1 / Math.cos(radianos)) / Math.PI) / 2 * totalTiles;

    return { x: x, y: y };
}

// Enche a moldura de tiles, com a morada sempre no centro (é lá que está o pin).

function desenharMapa() {

    const largura = mapCanvas.clientWidth;
    const altura = mapCanvas.clientHeight;

    const centro = coordenadasTile(MAPA_LAT, MAPA_LON, mapaZoom);

    // Canto superior esquerdo do pedaço de mundo que se vê, em píxeis

    const inicioX = centro.x * TILE - largura / 2;
    const inicioY = centro.y * TILE - altura / 2;

    // Primeiro e último tile a tocar nesse pedaço

    const deX = Math.floor(inicioX / TILE);
    const ateX = Math.floor((inicioX + largura) / TILE);
    const deY = Math.floor(inicioY / TILE);
    const ateY = Math.floor((inicioY + altura) / TILE);

    mapCanvas.innerHTML = "";

    let pedidos = 0;
    let falhas = 0;

    for (let tx = deX; tx <= ateX; tx++) {

        for (let ty = deY; ty <= ateY; ty++) {

            const tile = document.createElement("img");

            tile.className = "map-tile";
            tile.src = `https://tile.openstreetmap.org/${mapaZoom}/${tx}/${ty}.png`;
            tile.alt = "";                 // decorativo: o mapa já tem aria-label
            tile.width = TILE;
            tile.height = TILE;

            // Cada tile é colocado no sítio que lhe compete dentro da moldura

            tile.style.left = `${tx * TILE - inicioX}px`;
            tile.style.top = `${ty * TILE - inicioY}px`;

            pedidos++;

            // Só se falharem todos é que vale a pena avisar; um ou outro tile
            // em falta é só um quadrado escuro na ponta do mapa.

            tile.addEventListener("error", () => {

                falhas++;

                if (falhas === pedidos) {
                    mostrarFallbackMapa();
                }

            }, { once: true });

            mapCanvas.appendChild(tile);
        }
    }

    mapFallback.hidden = true;

    atualizarBotoesMapa();

    log(`Mapa desenhado: zoom ${mapaZoom}, ${pedidos} tiles para ${largura}×${altura} px.`);
}

// Sem internet (ou com o servidor de tiles em baixo) fica a morada escrita,
// que é a informação que interessa mesmo.

function mostrarFallbackMapa() {

    mapCanvas.innerHTML = "";
    mapFallback.hidden = false;

    console.warn("[Contacto] Nenhum tile do mapa carregou. A mostrar a morada em texto.");
}

// Aproxima ou afasta um nível, sem sair dos limites definidos

function mudarZoom(passo) {

    const novoZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, mapaZoom + passo));

    if (novoZoom === mapaZoom) {
        return;
    }

    mapaZoom = novoZoom;

    desenharMapa();
}

// Desliga o botão que já não dá para usar, em vez de o deixar a fingir

function atualizarBotoesMapa() {

    mapZoomIn.disabled = mapaZoom >= ZOOM_MAX;
    mapZoomOut.disabled = mapaZoom <= ZOOM_MIN;
}


/* ============ 6. Eventos e Boot up ============ */

console.log(
    "%cLinkin Park Store%c\nPágina de contacto · Nuno Luís Braga",
    "color:#ff6b1a; font-size:20px; font-weight:700; font-family:sans-serif",
    "color:#9b9ba3; font-size:12px"
);

contactForm.addEventListener("submit", enviarMensagem);
clearContactBtn.addEventListener("click", limparFormulario);

messageInput.addEventListener("input", atualizarContador);


// Limpa a mensagem de erro assim que o utilizador corrige os campos.
// A checkbox não dispara "input" da mesma maneira, por isso ouve o "change".

campos.forEach(campo => {

    campo.addEventListener(campo === consentCheck ? "change" : "input", limparErro);

});


mapZoomIn.addEventListener("click", () => mudarZoom(1));
mapZoomOut.addEventListener("click", () => mudarZoom(-1));


// Ao mudar o tamanho da janela a moldura muda de largura e podem faltar tiles
// nas pontas. Esperamos 200 ms depois do último ajuste para não redesenhar o
// mapa dezenas de vezes enquanto se arrasta o canto da janela.

window.addEventListener("resize", () => {

    clearTimeout(temporizadorMapa);
    temporizadorMapa = setTimeout(desenharMapa, 200);

});


log("Eventos registados: submissão, limpeza do formulário, contador de caracteres e zoom do mapa.");


// Boot up: limites escritos na ajuda do campo, contador a zero (caso o browser
// tenha reposto texto antigo) e mapa desenhado

minCount.textContent = MIN_MENSAGEM;
maxCount.textContent = MAX_MENSAGEM;
messageInput.maxLength = MAX_MENSAGEM;

atualizarContador();
desenharMapa();

log("Página de contacto pronta.");
