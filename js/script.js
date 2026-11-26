const geral = "artesanatos";


function Registros() {
    try {
        const registro = localStorage.getItem(geral);
        const dados = registro ? JSON.parse(registro) : [];
        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        console.error('Erro ao ler o localStorage:', erro);
        return [];
    }
}

function salvarRegistros(registros) {
    localStorage.setItem(geral, JSON.stringify(registros));
}


function gerarCodigo() {
    const itens = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 4; i++) {
        codigo += itens.charAt(Math.floor(Math.random() * itens.length));
    }
    return codigo;
}

function codigoAle() {
    const existentes = new Set(Registros().map(r => r.codigo));
    let codigo;
    do {
        codigo = gerarCodigo();
    } while (existentes.has(codigo));
    return codigo;
}


function configImagem(nomeImg, tagImg) {
    const textoImg = document.getElementById(nomeImg);
    const urlImg = document.getElementById(tagImg);

    if (!textoImg || !urlImg) return;

    urlImg.onload = function () {
        urlImg.style.display = 'block';
    };
    urlImg.onerror = function () {
        urlImg.style.display = 'none';
    };

    textoImg.addEventListener('input', function () {
        const arquivo = textoImg.value.trim().toLowerCase();
        if (arquivo.length > 0) {
            urlImg.src = `imagens/${arquivo}.png`;
        } else {
            urlImg.removeAttribute('src');
            urlImg.style.display = 'none';
        }
    });
}


function campos(codigo, produto, descricao, preco, foto) {
    if (!codigo || !produto || !descricao || !preco || !foto) {
        alert('Nenhum dos campos pode ficar vazio!');
        return false;
    }
    if (produto.length < 5) {
        alert('O nome do produto deve ter no mínimo 5 caracteres.');
        return false;
    }

    const precoNu = String(preco).replace(',', '.');
    if (isNaN(precoNu) || Number(precoNu) <= 0) {
        alert('O preço deve conter apenas números válidos.');
        return false;
    }
    if (foto.length > 10) {
        alert('O nome da foto deve ter no máximo 10 caracteres.');
        return false;
    }
    if (foto.includes('.')) {
        alert('Digite o nome da foto SEM a extensão (ex: vaso, molduras).');
        return false;
    }
    return true;
}


function criarCelula(texto) {
    const td = document.createElement('td');
    td.textContent = texto;
    return td;
}

function criarBotao(rotulo, aoClicar) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = rotulo;
    botao.addEventListener('click', aoClicar);
    return botao;
}

function Tabela() {
    const tbody = document.querySelector('#tabelaArtesanatos tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const registros = Registros();

    if (registros.length === 0) {
        const tr = document.createElement('tr');
        const td = criarCelula('Nenhum produto cadastrado.');
        td.colSpan = 4;
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    registros.forEach(reg => {
        const tr = document.createElement('tr');
        tr.appendChild(criarCelula(reg.codigo));
        tr.appendChild(criarCelula(reg.produto));
        tr.appendChild(criarCelula(reg.descricao));

        const tdAcoes = document.createElement('td');
        tdAcoes.appendChild(criarBotao('Editar', () => Editar(reg.codigo)));
        tdAcoes.appendChild(criarBotao('Excluir', () => Excluir(reg.codigo)));
        tr.appendChild(tdAcoes);

        tbody.appendChild(tr);
    });
}

function Editar(codigo) {
    window.location.href = `editar.html?codigo=${encodeURIComponent(codigo)}`;
}

function Excluir(codigo) {
    window.location.href = `excluir.html?codigo=${encodeURIComponent(codigo)}`;
}


const Cadastro = document.getElementById('lojaFormulario');
if (Cadastro) {
    const Codigos = document.getElementById('codigo');
    const imgCadastro = document.getElementById('fotoProduto');

    Codigos.value = codigoAle();
    configImagem('foto', 'fotoProduto');
    Tabela();

    Cadastro.addEventListener('submit', function (e) {
        e.preventDefault();

        const codigo = Codigos.value.trim();
        const produto = document.getElementById('produto').value.trim();
        const descricao = document.getElementById('descricao').value.trim();
        const preco = document.getElementById('preco').value.trim();
        const foto = document.getElementById('foto').value.trim().toLowerCase();

        if (!campos(codigo, produto, descricao, preco, foto)) return;

        const registros = Registros();

        const codigoFinal = registros.some(r => r.codigo === codigo) ? codigoAle() : codigo;

        registros.push({
            codigo: codigoFinal,
            produto,
            descricao,
            preco: parseFloat(preco.replace(',', '.')).toFixed(2),
            foto
        });

        salvarRegistros(registros);
        Tabela();
        alert('Produto cadastrado com sucesso!');

        Cadastro.reset();
        imgCadastro.removeAttribute('src');
        imgCadastro.style.display = 'none';
        Codigos.value = codigoAle();
        Tabela();
    });

    const Reset = document.getElementById('Cancelar');
    if (Reset) {
        Reset.addEventListener('click', function () {
            setTimeout(() => {
                Codigos.value = codigoAle();
                imgCadastro.removeAttribute('src');
                imgCadastro.style.display = 'none';
            }, 10);
        });
    }
}


const lojaEdicao = document.getElementById('lojaEdicao');
if (lojaEdicao) {
    const procura = new URLSearchParams(window.location.search);
    const codProcura = procura.get('codigo');
    const registros = Registros();
    const index = registros.findIndex(r => r.codigo === codProcura);

    if (index === -1) {
        alert('Produto não encontrado!');
        window.location.href = 'cadastro.html';
    } else {
        const reg = registros[index];

        document.getElementById('altCodigo').value = reg.codigo;
        document.getElementById('altProduto').value = reg.produto;
        document.getElementById('altDescricao').value = reg.descricao;
        document.getElementById('altPreco').value = String(reg.preco).replace('.', ',');
        document.getElementById('altFoto').value = reg.foto;

        const imgEdicao = document.getElementById('altFotoProduto');
        configImagem('altFoto', 'altFotoProduto');
        imgEdicao.src = `imagens/${reg.foto}.png`;

        lojaEdicao.addEventListener('submit', function (e) {
            e.preventDefault();

            const codigo = document.getElementById('altCodigo').value.trim();
            const produto = document.getElementById('altProduto').value.trim();
            const descricao = document.getElementById('altDescricao').value.trim();
            const preco = document.getElementById('altPreco').value.trim();
            const foto = document.getElementById('altFoto').value.trim().toLowerCase();

            if (!campos(codigo, produto, descricao, preco, foto)) return;

            registros[index] = {
                codigo,
                produto,
                descricao,
                preco: parseFloat(preco.replace(',', '.')).toFixed(2),
                foto
            };

            salvarRegistros(registros);
            alert('Produto alterado com sucesso!');
            window.location.href = 'cadastro.html';
        });

        const btnResetAlt = document.getElementById('reset');
        if (btnResetAlt) {
            btnResetAlt.addEventListener('click', function (e) {
                e.preventDefault();
                alert('Alteração cancelada!');
                window.location.href = 'cadastro.html';
            });
        }
    }
}


const Exclusao = document.getElementById('exclusao');
if (Exclusao) {
    const procura = new URLSearchParams(window.location.search);
    const codProcura = procura.get('codigo');
    const registros = Registros();
    const index = registros.findIndex(r => r.codigo === codProcura);

    if (index === -1) {
        alert('Produto não encontrado!');
        window.location.href = 'cadastro.html';
    } else {
        const reg = registros[index];

        const excFoto = document.getElementById('excFoto');
        excFoto.onerror = function () {
            excFoto.style.display = 'none';
        };
        excFoto.src = `imagens/${reg.foto}.png`;

        document.getElementById('excCodigo').textContent = reg.codigo;
        document.getElementById('excProduto').textContent = reg.produto;
        document.getElementById('excDescricao').textContent = reg.descricao;
        document.getElementById('excPreco').textContent = String(reg.preco).replace('.', ',');

        setTimeout(() => {
            const confirmar = confirm('Deseja excluir o produto?');

            if (confirmar) {
                registros.splice(index, 1);
                salvarRegistros(registros);
            }
            window.location.href = 'cadastro.html';
        }, 150);
    }
}