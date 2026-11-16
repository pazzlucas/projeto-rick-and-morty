// Seleção dos elementos do DOM
const cardsContainer = document.getElementById('cards-container');
const statusCarregamento = document.getElementById('status-carregamento');
const campoBusca = document.getElementById('campo-busca');
const filtroStatus = document.getElementById('filtro-status');
const btnFavoritos = document.getElementById('btn-favoritos');
const contadorFavoritos = document.getElementById('contador-favoritos');
const btnAnterior = document.getElementById('btn-anterior');
const btnProxima = document.getElementById('btn-proxima');
const infoPagina = document.getElementById('info-pagina');

let paginaAtual = 1;
let totalPaginas = 1;
let personagensAtuais = [];
let favoritos = JSON.parse(localStorage.getItem('rm_favoritos')) || [];
let mostrarApenasFavoritos = false;

function atualizarContadorFavoritos() {
    contadorFavoritos.textContent = favoritos.length;
}

function alternarFavorito(personagem, botaoCoracao) {
    const index = favoritos.findIndex(fav => fav.id === personagem.id);
    if (index === -1) {
        favoritos.push(personagem);
        botaoCoracao.textContent = '♥';
    } else {
        favoritos.splice(index, 1);
        botaoCoracao.textContent = '♡';
    }
    localStorage.setItem('rm_favoritos', JSON.stringify(favoritos));
    atualizarContadorFavoritos();

    if (mostrarApenasFavoritos) {
        renderizarCards(favoritos);
    }
}

// Função obrigatória que cria os cards dinamicamente com createElement e appendChild
function criarCardPersonagem(personagem) {
    const card = document.createElement('article');
    card.classList.add('card');

    // Topo do Card: Nome + Coração de Favorito
    const cardTopo = document.createElement('div');
    cardTopo.classList.add('card-topo');

    const titulo = document.createElement('h2');
    titulo.classList.add('card-titulo');
    titulo.textContent = personagem.name;

    const btnFav = document.createElement('button');
    btnFav.classList.add('btn-favorito');
    btnFav.type = 'button';
    const isFavorito = favoritos.some(fav => fav.id === personagem.id);
    btnFav.textContent = isFavorito ? '♥' : '♡';
    btnFav.title = 'Favoritar personagem';
    btnFav.addEventListener('click', () => alternarFavorito(personagem, btnFav));

    cardTopo.appendChild(titulo);
    cardTopo.appendChild(btnFav);

    // Imagem do Personagem
    const imagemBox = document.createElement('div');
    imagemBox.classList.add('card-imagem-box');

    const img = document.createElement('img');
    img.src = personagem.image;
    img.alt = `Imagem de ${personagem.name}`;
    img.loading = 'lazy';

    imagemBox.appendChild(img);

    // 5 linhas de informações conforme estrutura do wireframe
    const listaInfo = document.createElement('ul');
    listaInfo.classList.add('card-info');

    const dadosLinhas = [
        { label: 'Status:', valor: personagem.status, isStatus: true },
        { label: 'Espécie:', valor: personagem.species },
        { label: 'Gênero:', valor: personagem.gender },
        { label: 'Origem:', valor: personagem.origin.name },
        { label: 'Localização:', valor: personagem.location.name }
    ];

    dadosLinhas.forEach(item => {
        const li = document.createElement('li');

        const spanLabel = document.createElement('span');
        spanLabel.classList.add('info-label');
        spanLabel.textContent = item.label;

        const spanValor = document.createElement('span');
        spanValor.classList.add('info-valor');
        if (item.isStatus) {
            spanValor.classList.add('status-badge', `status-${item.valor}`);
        }
        spanValor.textContent = item.valor;

        li.appendChild(spanLabel);
        li.appendChild(spanValor);
        listaInfo.appendChild(li);
    });

    card.appendChild(cardTopo);
    card.appendChild(imagemBox);
    card.appendChild(listaInfo);

    cardsContainer.appendChild(card);
}

function renderizarCards(lista) {
    cardsContainer.innerHTML = '';

    if (!lista || lista.length === 0) {
        statusCarregamento.textContent = 'Nenhum personagem encontrado.';
        statusCarregamento.style.display = 'block';
        return;
    }

    statusCarregamento.style.display = 'none';
    lista.forEach(personagem => criarCardPersonagem(personagem));
}

// Consome a Rick and Morty API via fetch()
function carregarPersonagens(pagina = 1) {
    const nome = campoBusca.value.trim();
    const status = filtroStatus.value;

    let url = `https://rickandmortyapi.com/api/character/?page=${pagina}`;
    if (nome) url += `&name=${encodeURIComponent(nome)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;

    cardsContainer.innerHTML = '';
    statusCarregamento.textContent = 'Buscando personagens na Rick and Morty API...';
    statusCarregamento.style.display = 'block';

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Nenhum personagem encontrado para essa busca.');
            }
            return response.json();
        })
        .then(data => {
            personagensAtuais = data.results;
            paginaAtual = pagina;
            totalPaginas = data.info.pages;

            infoPagina.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
            btnAnterior.disabled = !data.info.prev;
            btnProxima.disabled = !data.info.next;

            renderizarCards(personagensAtuais);
        })
        .catch(erro => {
            console.error('Erro na requisição:', erro);
            statusCarregamento.textContent = erro.message;
            btnAnterior.disabled = true;
            btnProxima.disabled = true;
            infoPagina.textContent = 'Página 0 de 0';
        });
}

// Eventos de filtro e paginação
campoBusca.addEventListener('input', () => {
    mostrarApenasFavoritos = false;
    btnFavoritos.classList.remove('ativo');
    carregarPersonagens(1);
});

filtroStatus.addEventListener('change', () => {
    mostrarApenasFavoritos = false;
    btnFavoritos.classList.remove('ativo');
    carregarPersonagens(1);
});

btnFavoritos.addEventListener('click', () => {
    mostrarApenasFavoritos = !mostrarApenasFavoritos;
    btnFavoritos.classList.toggle('ativo', mostrarApenasFavoritos);

    if (mostrarApenasFavoritos) {
        renderizarCards(favoritos);
    } else {
        renderizarCards(personagensAtuais);
    }
});

btnAnterior.addEventListener('click', () => {
    if (paginaAtual > 1) carregarPersonagens(paginaAtual - 1);
});

btnProxima.addEventListener('click', () => {
    if (paginaAtual < totalPaginas) carregarPersonagens(paginaAtual + 1);
});

// Inicialização
atualizarContadorFavoritos();
carregarPersonagens(1);
