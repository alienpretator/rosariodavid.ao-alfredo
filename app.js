/* =========================================================
   ASSOCIAÇÃO TERRA VERMELHA
   GESTÃO FINANCEIRA
   ========================================================= */


/* =========================
   DADOS
   ========================= */

let membros = JSON.parse(
    localStorage.getItem("membros") || "[]"
);

let contribuicoes = JSON.parse(
    localStorage.getItem("contribuicoes") || "[]"
);


/* =========================================================
   SISTEMA DE REGISTRO
   Formato: 2026-001
   ========================================================= */

let proximoRegistro = Number(
    localStorage.getItem("proximoRegistro") || "1"
);


/* =========================================================
   MIGRAÇÃO DE DADOS ANTIGOS
   Caso já existam membros cadastrados no protótipo anterior,
   atribuímos números sem apagar os dados existentes.
   ========================================================= */

function prepararRegistros() {

    let maiorNumero = 0;

    membros.forEach(membro => {

        if (membro.registro) {

            const partes = String(membro.registro).split("-");

            if (partes.length === 2) {

                const numero = parseInt(partes[1], 10);

                if (!isNaN(numero) && numero > maiorNumero) {
                    maiorNumero = numero;
                }
            }
        }
    });


    proximoRegistro = Math.max(
        proximoRegistro,
        maiorNumero + 1,
        1
    );


    let alterou = false;


    membros.forEach(membro => {

        if (!membro.registro) {

            membro.registro =
                "2026-" +
                String(proximoRegistro).padStart(3, "0");

            proximoRegistro++;

            alterou = true;
        }

    });


    localStorage.setItem(
        "proximoRegistro",
        String(proximoRegistro)
    );


    if (alterou) {
        salvarDados();
    }
}


/* =========================
   SALVAR
   ========================= */

function salvarDados() {

    localStorage.setItem(
        "membros",
        JSON.stringify(membros)
    );

    localStorage.setItem(
        "contribuicoes",
        JSON.stringify(contribuicoes)
    );

    localStorage.setItem(
        "proximoRegistro",
        String(proximoRegistro)
    );
}


/* =========================
   NAVEGAÇÃO
   ========================= */

function mostrarTela(nomeTela) {

    document.querySelectorAll(".screen").forEach(tela => {
        tela.classList.remove("active");
    });

    const tela = document.getElementById(nomeTela);

    if (tela) {
        tela.classList.add("active");
    }


    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");

        if (item.dataset.screen === nomeTela) {
            item.classList.add("active");
        }
    });


    if (nomeTela === "membros") {
        mostrarMembros();
    }

    if (nomeTela === "novaContribuicao") {
        atualizarSelectMembros();
    }

    if (nomeTela === "historico") {
        mostrarHistorico();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   CADASTRAR INTEGRANTE
   ========================================================= */

function cadastrarMembro(event) {

    event.preventDefault();


    const nome = document
        .getElementById("nomeMembro")
        .value
        .trim();


    const telefone = document
        .getElementById("telefoneMembro")
        .value
        .trim();


    if (!nome || !telefone) {
        alert("Preencha todos os campos.");
        return;
    }


    /* Cria o número permanente */

    const registro =
        "2026-" +
        String(proximoRegistro).padStart(3, "0");


    proximoRegistro++;


    const membro = {

        id: Date.now(),

        registro: registro,

        nome: nome,

        telefone: telefone,

        dataCadastro: new Date().toISOString()

    };


    membros.push(membro);


    salvarDados();


    document
        .getElementById("nomeMembro")
        .value = "";

    document
        .getElementById("telefoneMembro")
        .value = "";


    alert(
        "Integrante cadastrado com sucesso!\n\n" +
        "Nº de Registro: " +
        registro
    );


    mostrarTela("membros");
}


/* =========================================================
   MOSTRAR INTEGRANTES
   ========================================================= */

function mostrarMembros() {

    const lista =
        document.getElementById("listaMembros");


    const pesquisa =
        (
            document.getElementById("pesquisaMembros")?.value
            || ""
        )
        .toLowerCase()
        .trim();


    const filtrados = membros.filter(membro =>
        membro.nome
            .toLowerCase()
            .includes(pesquisa)
    );


    document.getElementById("totalMembrosLista").textContent =
        membros.length;


    if (filtrados.length === 0) {

        lista.innerHTML = `
            <div class="empty-state">
                <strong>Nenhum integrante encontrado</strong>
                <span>
                    ${membros.length === 0
                        ? "Cadastre o primeiro integrante."
                        : "Tente pesquisar por outro nome."
                    }
                </span>
            </div>
        `;

        return;
    }


    lista.innerHTML = filtrados.map(membro => {

        const data = formatarData(
            membro.dataCadastro
        );


        return `
            <div class="member-item">

                <div class="member-top">

                    <div>

                        <span class="member-registro">
                            ${membro.registro || "Sem registro"}
                        </span>

                        <div class="member-name">
                            ${escaparHTML(membro.nome)}
                        </div>

                        <div class="member-meta">
                            <span>
                                ☎ ${escaparHTML(membro.telefone)}
                            </span>
                        </div>

                        <div class="member-date">
                            Cadastro: ${data}
                        </div>

                    </div>

                    <button
                        class="delete-btn"
                        onclick="eliminarMembro(${membro.id})"
                    >
                        Eliminar
                    </button>

                </div>

            </div>
        `;

    }).join("");
}


/* =========================================================
   ELIMINAR INTEGRANTE
   IMPORTANTE:
   O número de registro NÃO volta para o contador.
   ========================================================= */

function eliminarMembro(id) {

    const membro =
        membros.find(m => m.id === id);


    if (!membro) {
        return;
    }


    const confirmar = confirm(
        "Tem certeza que deseja eliminar o integrante?\n\n" +
        membro.registro +
        " — " +
        membro.nome
    );


    if (!confirmar) {
        return;
    }


    membros = membros.filter(
        m => m.id !== id
    );


    salvarDados();


    mostrarMembros();

    atualizarDashboard();
    atualizarSelectMembros();
}


/* =========================================================
   CONTRIBUIÇÃO
   ========================================================= */

function cadastrarContribuicao(event) {

    event.preventDefault();


    const membroId =
        Number(
            document.getElementById(
                "membroContribuicao"
            ).value
        );


    const valor =
        Number(
            document.getElementById(
                "valorContribuicao"
            ).value
        );


    const data =
        document.getElementById(
            "dataContribuicao"
        ).value;


    if (!membroId || !valor || !data) {

        alert(
            "Preencha todos os campos."
        );

        return;
    }


    const membro =
        membros.find(
            m => m.id === membroId
        );


    if (!membro) {

        alert(
            "Integrante não encontrado."
        );

        return;
    }


    const contribuicao = {

        id: Date.now(),

        membroId: membro.id,

        registro: membro.registro,

        nome: membro.nome,

        valor: valor,

        data: data

    };


    contribuicoes.push(
        contribuicao
    );


    salvarDados();


    document.getElementById(
        "valorContribuicao"
    ).value = "";


    alert(
        "Contribuição registada com sucesso."
    );


    atualizarDashboard();

    mostrarTela("historico");
}


/* =========================================================
   SELECT DE INTEGRANTES
   ========================================================= */

function atualizarSelectMembros() {

    const select =
        document.getElementById(
            "membroContribuicao"
        );


    if (!select) {
        return;
    }


    select.innerHTML =
        `<option value="">
            Selecione um integrante
        </option>`;


    membros.forEach(membro => {

        const option =
            document.createElement("option");


        option.value =
            membro.id;


        option.textContent =
            `${membro.registro} — ${membro.nome}`;


        select.appendChild(option);

    });
}


/* =========================================================
   HISTÓRICO
   ========================================================= */

function mostrarHistorico() {

    const lista =
        document.getElementById(
            "listaHistorico"
        );


    if (contribuicoes.length === 0) {

        lista.innerHTML = `
            <div class="empty-state">
                <strong>Nenhuma contribuição registada</strong>
                <span>
                    As contribuições aparecerão aqui.
                </span>
            </div>
        `;

        return;
    }


    const ordenadas =
        [...contribuicoes]
        .sort(
            (a, b) =>
                new Date(b.data) -
                new Date(a.data)
        );


    lista.innerHTML =
        ordenadas.map(item => {

            return `
                <div class="contribution-item">

                    <div class="member-top">

                        <div>

                            <span class="member-registro">
                                ${item.registro || ""}
                            </span>

                            <div class="member-name">
                                ${escaparHTML(item.nome)}
                            </div>

                            <div class="member-meta">
                                <span>
                                    ${formatarData(item.data)}
                                </span>
                            </div>

                        </div>

                        <strong>
                            ${formatarMoeda(item.valor)}
                        </strong>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function atualizarDashboard() {

    const total =
        contribuicoes.reduce(
            (soma, item) =>
                soma + Number(item.valor),
            0
        );


    document.getElementById(
        "totalArrecadado"
    ).textContent =
        formatarMoeda(total);


    document.getElementById(
        "totalMembros"
    ).textContent =
        membros.length;


    document.getElementById(
        "totalContribuicoes"
    ).textContent =
        contribuicoes.length;


    mostrarContribuicoesRecentes();
}


/* =========================================================
   CONTRIBUIÇÕES RECENTES
   ========================================================= */

function mostrarContribuicoesRecentes() {

    const container =
        document.getElementById(
            "contribuicoesRecentes"
        );


    if (contribuicoes.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <strong>Nenhuma contribuição</strong>
                <span>
                    Os novos registos aparecerão aqui.
                </span>
            </div>
        `;

        return;
    }


    const recentes =
        [...contribuicoes]
        .sort(
            (a, b) =>
                new Date(b.data) -
                new Date(a.data)
        )
        .slice(0, 5);


    container.innerHTML =
        recentes.map(item => {

            return `
                <div class="contribution-item">

                    <div class="member-top">

                        <div>

                            <span class="member-registro">
                                ${item.registro || ""}
                            </span>

                            <div class="member-name">
                                ${escaparHTML(item.nome)}
                            </div>

                            <div class="member-meta">
                                ${formatarData(item.data)}
                            </div>

                        </div>

                        <strong>
                            ${formatarMoeda(item.valor)}
                        </strong>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   PDF
   ========================================================= */

function gerarPDF() {

    if (membros.length === 0) {
        alert("Não existem integrantes para gerar o PDF.");
        return;
    }

    const dataEmissao = new Date().toLocaleDateString("pt-AO");

    const linhas = membros.map(membro => {

        return `
            <tr>
                <td>${escaparHTML(membro.registro || "-")}</td>
                <td>${escaparHTML(membro.nome)}</td>
                <td>${escaparHTML(membro.telefone)}</td>
                <td>${formatarData(membro.dataCadastro)}</td>
            </tr>
        `;

    }).join("");

    const janela = window.open("", "_blank");

    if (!janela) {
        alert(
            "O navegador bloqueou a abertura do relatório. " +
            "Permita pop-ups para este aplicativo e tente novamente."
        );
        return;
    }

    janela.document.write(`
        <!DOCTYPE html>
        <html lang="pt">
        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>
                Lista de Integrantes - Associação Terra Vermelha
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, Helvetica, sans-serif;
                    margin: 35px;
                    color: #18221F;
                    background: white;
                }

                .cabecalho {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #123C32;
                    padding-bottom: 18px;
                }

                .cabecalho h1 {
                    margin: 0;
                    color: #123C32;
                    font-size: 24px;
                }

                .cabecalho h2 {
                    margin: 6px 0;
                    font-size: 17px;
                    font-weight: normal;
                }

                .cabecalho p {
                    margin: 5px 0;
                    color: #666;
                    font-size: 12px;
                }

                .resumo {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 18px;
                    padding: 12px;
                    border: 1px solid #ddd;
                    background: #f7f7f5;
                }

                .resumo strong {
                    color: #123C32;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                }

                th {
                    background: #123C32;
                    color: white;
                    padding: 10px 8px;
                    text-align: left;
                }

                td {
                    padding: 9px 8px;
                    border: 1px solid #ddd;
                }

                tr:nth-child(even) {
                    background: #f7f7f5;
                }

                .rodape {
                    margin-top: 30px;
                    padding-top: 12px;
                    border-top: 1px solid #ccc;
                    font-size: 10px;
                    color: #777;
                    display: flex;
                    justify-content: space-between;
                }

                @media print {

                    body {
                        margin: 15mm;
                    }

                    .nao-imprimir {
                        display: none;
                    }

                }

            </style>

        </head>

        <body>

            <div class="cabecalho">

                <h1>Associação Terra Vermelha</h1>

                <h2>Gestão Financeira</h2>

                <p>Lista de Integrantes</p>

            </div>


            <div class="resumo">

                <span>
                    Total de integrantes:
                    <strong>${membros.length}</strong>
                </span>

                <span>
                    Data de emissão:
                    <strong>${dataEmissao}</strong>
                </span>

            </div>


            <table>

                <thead>

                    <tr>
                        <th>Nº de Registro</th>
                        <th>Nome completo</th>
                        <th>Telemóvel</th>
                        <th>Data de Cadastro</th>
                    </tr>

                </thead>

                <tbody>

                    ${linhas}

                </tbody>

            </table>


            <div class="rodape">

                <span>
                    Associação Terra Vermelha
                </span>

                <span>
                    Gestão Financeira
                </span>

            </div>


            <script>

                window.onload = function() {

                    setTimeout(function() {
                        window.print();
                    }, 500);

                };

            <\/script>

        </body>
        </html>
    `);

    janela.document.close();
}
/* =========================================================
   FORMATAÇÃO
   ========================================================= */

function formatarMoeda(valor) {

    return Number(valor).toLocaleString(
        "pt-AO",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ) + " Kz";
}


function formatarData(data) {

    if (!data) {
        return "-";
    }


    const dataObj =
        new Date(data);


    if (isNaN(dataObj.getTime())) {
        return data;
    }


    return dataObj.toLocaleDateString(
        "pt-AO",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}


/* =========================================================
   SEGURANÇA BÁSICA PARA TEXTO HTML
   ========================================================= */

function escaparHTML(texto) {

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   DATA PADRÃO DA CONTRIBUIÇÃO
   ========================================================= */

function colocarDataAtual() {

    const campo =
        document.getElementById(
            "dataContribuicao"
        );


    if (!campo) {
        return;
    }


    if (!campo.value) {

        const hoje =
            new Date();


        const ano =
            hoje.getFullYear();


        const mes =
            String(
                hoje.getMonth() + 1
            ).padStart(2, "0");


        const dia =
            String(
                hoje.getDate()
            ).padStart(2, "0");


        campo.value =
            `${ano}-${mes}-${dia}`;
    }
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        prepararRegistros();

        carregarTema();

        atualizarDashboard();

        atualizarSelectMembros();

        colocarDataAtual();

        mostrarMembros();

    }
);