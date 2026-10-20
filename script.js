let estoque = [
    { id: 101, nome: "Kit Embreagem / Rolamento", qtd: 12, min: 5, preco: 320.00 },
    { id: 102, nome: "Fonte ATX 500W Real", qtd: 8, min: 6, preco: 210.00 },
    { id: 103, nome: "Placa Controladora Universal", qtd: 4, min: 5, preco: 185.00 },
    { id: 104, nome: "SSD NVMe 512GB", qtd: 15, min: 4, preco: 260.00 },
    { id: 105, nome: "Compressor Térmico 12V", qtd: 3, min: 3, preco: 490.00 }
];

let ordensServico = [
    {
        osId: 202601,
        cliente: "Carlos Eduardo Mendes",
        equipamento: "Notebook Dell Latitude 5420",
        servico: "Substituição de Peça",
        pecaId: 104,
        pecaNome: "SSD NVMe 512GB",
        qtdPeca: 1,
        maoDeObra: 140.00,
        total: 400.00,
        status: "Concluído",
        data: "15/10/2026 10:30"
    },
    {
        osId: 202602,
        cliente: "Oficina Mecânica Rocha",
        equipamento: "Gerador Estacionário 15kVA",
        servico: "Reparo Elétrico",
        pecaId: 103,
        pecaNome: "Placa Controladora Universal",
        qtdPeca: 1,
        maoDeObra: 250.00,
        total: 435.00,
        status: "Em Andamento",
        data: "17/10/2026 14:15"
    },
    {
        osId: 202603,
        cliente: "Mariana Costa",
        equipamento: "Ar-Condicionado Inverter 18000 BTUs",
        servico: "Manutenção Preventiva",
        pecaId: 105,
        pecaNome: "Compressor Térmico 12V",
        qtdPeca: 1,
        maoDeObra: 210.00,
        total: 700.00,
        status: "Aguardando Peça",
        data: "18/10/2026 09:20"
    },
    {
        osId: 202604,
        cliente: "Transportadora ViaSul",
        equipamento: "Fiorino Furgao - Placa HJK-4821",
        servico: "Diagnóstico Geral",
        pecaId: 101,
        pecaNome: "Kit Embreagem / Rolamento",
        qtdPeca: 1,
        maoDeObra: 380.00,
        total: 700.00,
        status: "Concluído",
        data: "19/10/2026 11:05"
    }
];

let faturamentoBaseMensal = [4200, 5150, 4890, 6300, 5780];
let graficoFaturamento = null;
let graficoServicos = null;
let ultimaOSSelecionada = ordensServico[0];

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function carregarSelectPecas() {
    const selectPeca = document.getElementById('pecaId');
    const selectRepor = document.getElementById('reporId');
    selectPeca.innerHTML = '<option value="0">Nenhuma peça (apenas serviço)</option>';
    selectRepor.innerHTML = '';

    estoque.forEach(item => {
        const option = `<option value="${item.id}">${item.id} - ${item.nome} (${formatarMoeda(item.preco)} | Est: ${item.qtd})</option>`;
        selectPeca.innerHTML += option;
        selectRepor.innerHTML += `<option value="${item.id}">${item.id} - ${item.nome}</option>`;
    });
}

function atualizarTabelaEstoque() {
    const tbody = document.getElementById('stockBody');
    tbody.innerHTML = '';

    estoque.forEach(item => {
        const classeAlerta = item.qtd <= item.min ? 'low-stock' : '';
        const row = `<tr>
            <td>${item.id}</td>
            <td>${item.nome}</td>
            <td class="${classeAlerta}">${item.qtd}</td>
            <td>${item.min}</td>
            <td>${formatarMoeda(item.preco)}</td>
        </tr>`;
        tbody.innerHTML += row;
    });

    carregarSelectPecas();
}

function classeStatus(status) {
    if (status === 'Orçamento') return 'st-orcamento';
    if (status === 'Em Andamento') return 'st-andamento';
    if (status === 'Aguardando Peça') return 'st-peca';
    return 'st-concluido';
}

function atualizarTabelaOS() {
    const tbody = document.getElementById('osBody');
    const filtroStatus = document.getElementById('filtroStatus').value;
    const buscaTexto = document.getElementById('buscaOS').value.toLowerCase();
    const perfil = document.getElementById('roleSelect').value;

    tbody.innerHTML = '';

    const listaFiltrada = ordensServico.filter(os => {
        const bateStatus = filtroStatus === 'Todos' || os.status === filtroStatus;
        const bateBusca = os.cliente.toLowerCase().includes(buscaTexto) ||
                          os.equipamento.toLowerCase().includes(buscaTexto) ||
                          String(os.osId).includes(buscaTexto);
        return bateStatus && bateBusca;
    });

    listaFiltrada.forEach(os => {
        const btnExcluir = perfil === 'Administrador'
            ? `<button class="btn-small btn-danger" onclick="excluirOS(${os.osId})">Excluir</button>`
            : '';

        const row = `<tr>
            <td>#${os.osId}</td>
            <td><strong>${os.cliente}</strong><br><small>${os.equipamento}</small></td>
            <td>${os.servico}<br><small>${os.pecaNome} (${os.qtdPeca}x)</small></td>
            <td>${formatarMoeda(os.total)}</td>
            <td><span class="badge ${classeStatus(os.status)}">${os.status}</span></td>
            <td>
                <button class="btn-small" onclick="avancarStatus(${os.osId})">Mudar Status</button>
                <button class="btn-small btn-secondary" onclick="verComprovante(${os.osId})">Recibo</button>
                ${btnExcluir}
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });

    atualizarIndicadores();
}

function atualizarIndicadores() {
    const concluidas = ordensServico.filter(o => o.status === 'Concluído');
    const faturamentoOS = concluidas.reduce((acc, item) => acc + item.total, 0);
    const ticketMedio = concluidas.length > 0 ? faturamentoOS / concluidas.length : 0;
    const criticos = estoque.filter(i => i.qtd <= i.min).length;

    document.getElementById('kpiFaturamento').innerText = formatarMoeda(faturamentoOS);
    document.getElementById('kpiTicket').innerText = formatarMoeda(ticketMedio);
    document.getElementById('kpiConcluidas').innerText = `${concluidas.length} / ${ordensServico.length}`;
    document.getElementById('kpiCriticos').innerText = criticos;

    atualizarGraficos(faturamentoOS);
}

function atualizarGraficos(faturamentoAtual) {
    if (typeof Chart === 'undefined') return;

    const dadosMensais = [...faturamentoBaseMensal, faturamentoAtual];
    const labelsMeses = ['Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro'];

    const contagemServicos = {};
    ordensServico.forEach(os => {
        contagemServicos[os.servico] = (contagemServicos[os.servico] || 0) + 1;
    });

    const labelsServicos = Object.keys(contagemServicos);
    const valoresServicos = Object.values(contagemServicos);

    const ctxFat = document.getElementById('revenueChart').getContext('2d');
    if (graficoFaturamento) graficoFaturamento.destroy();
    graficoFaturamento = new Chart(ctxFat, {
        type: 'bar',
        data: {
            labels: labelsMeses,
            datasets: [{
                label: 'Faturamento Mensal (R$)',
                data: dadosMensais,
                backgroundColor: ['#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#38bdf8'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#cbd5e1' } }
            },
            scales: {
                x: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: '#1e293b' } }
            }
        }
    });

    const ctxServ = document.getElementById('servicesChart').getContext('2d');
    if (graficoServicos) graficoServicos.destroy();
    graficoServicos = new Chart(ctxServ, {
        type: 'doughnut',
        data: {
            labels: labelsServicos,
            datasets: [{
                data: valoresServicos,
                backgroundColor: ['#2563eb', '#38bdf8', '#1d4ed8', '#0284c7', '#1e3a8a'],
                borderColor: '#0f172a',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { color: '#cbd5e1' } }
            }
        }
    });
}

function processarRequisicao() {
    const perfil = document.getElementById('roleSelect').value;
    const cliente = document.getElementById('clienteNome').value.trim();
    const equipamento = document.getElementById('equipamento').value.trim();
    const servico = document.getElementById('tipoServico').value;
    const idSolicitado = parseInt(document.getElementById('pecaId').value);
    const qtdSolicitada = parseInt(document.getElementById('qtdPeca').value) || 0;
    const maoDeObra = parseFloat(document.getElementById('valorMaoObra').value) || 0;
    const statusInicial = document.getElementById('statusOS').value;

    const msgArea = document.getElementById('messageArea');
    const receiptArea = document.getElementById('receipt');
    const alertArea = document.getElementById('purchasingAlert');

    msgArea.style.display = 'none';
    msgArea.className = '';
    alertArea.style.display = 'none';

    if (perfil === 'Técnico') {
        mostrarMensagem("❌ O perfil Técnico apenas atualiza OS existentes. Altere para Atendente ou Administrador para abrir nova OS.", "error");
        return;
    }

    if (!cliente || !equipamento) {
        mostrarMensagem("❌ Preencha o nome do cliente e o equipamento/veículo.", "error");
        return;
    }

    if (maoDeObra < 0) {
        mostrarMensagem("❌ Valor de mão de obra inválido.", "error");
        return;
    }

    let valorPecaTotal = 0;
    let nomePecaUsada = "Nenhuma";
    let itemEncontrado = null;

    if (idSolicitado !== 0) {
        itemEncontrado = estoque.find(produto => produto.id === idSolicitado);

        if (!itemEncontrado) {
            mostrarMensagem("❌ Item não cadastrado no sistema.", "error");
            receiptArea.innerText = "Operação cancelada: Item inexistente.";
            return;
        }

        if (qtdSolicitada <= 0) {
            mostrarMensagem("❌ Insira uma quantidade válida para a peça.", "error");
            return;
        }

        if (qtdSolicitada > itemEncontrado.qtd) {
            mostrarMensagem(`❌ Estoque insuficiente! Disponível: ${itemEncontrado.qtd}`, "error");
            receiptArea.innerText = "Operação cancelada: Saldo insuficiente no almoxarifado.";
            return;
        }

        itemEncontrado.qtd = itemEncontrado.qtd - qtdSolicitada;
        valorPecaTotal = itemEncontrado.preco * qtdSolicitada;
        nomePecaUsada = itemEncontrado.nome;
    }

    const novoId = ordensServico.length > 0 ? ordensServico[ordensServico.length - 1].osId + 1 : 202601;
    const dataHora = new Date().toLocaleString('pt-BR');
    const valorTotalOS = maoDeObra + valorPecaTotal;

    const novaOS = {
        osId: novoId,
        cliente: cliente,
        equipamento: equipamento,
        servico: servico,
        pecaId: idSolicitado,
        pecaNome: nomePecaUsada,
        qtdPeca: idSolicitado !== 0 ? qtdSolicitada : 0,
        maoDeObra: maoDeObra,
        total: valorTotalOS,
        status: statusInicial,
        data: dataHora
    };

    ordensServico.push(novaOS);
    ultimaOSSelecionada = novaOS;

    atualizarTabelaEstoque();
    atualizarTabelaOS();
    verComprovante(novoId);
    mostrarMensagem(`✅ Ordem de Serviço #${novoId} registrada com sucesso!`, "success");

    document.getElementById('clienteNome').value = '';
    document.getElementById('equipamento').value = '';
    document.getElementById('valorMaoObra').value = '';
    document.getElementById('qtdPeca').value = '1';

    if (itemEncontrado && itemEncontrado.qtd <= itemEncontrado.min) {
        alertArea.innerHTML = `⚠️ <strong>ALERTA AO SETOR DE COMPRAS:</strong> O item "${itemEncontrado.nome}" atingiu o nível crítico (${itemEncontrado.qtd} un.). Reposição necessária!`;
        alertArea.style.display = 'block';
    }
}

function avancarStatus(osId) {
    const ordem = ordensServico.find(o => o.osId === osId);
    if (!ordem) return;

    const fluxo = ['Orçamento', 'Em Andamento', 'Aguardando Peça', 'Concluído'];
    const indiceAtual = fluxo.indexOf(ordem.status);
    ordem.status = fluxo[(indiceAtual + 1) % fluxo.length];

    ultimaOSSelecionada = ordem;
    atualizarTabelaOS();
    verComprovante(osId);
    mostrarMensagem(`✅ Status da OS #${osId} atualizado para "${ordem.status}".`, "success");
}

function excluirOS(osId) {
    const perfil = document.getElementById('roleSelect').value;
    if (perfil !== 'Administrador') {
        mostrarMensagem("❌ Apenas o Administrador pode excluir uma Ordem de Serviço.", "error");
        return;
    }

    ordensServico = ordensServico.filter(o => o.osId !== osId);
    atualizarTabelaOS();
    mostrarMensagem(`✅ Ordem de Serviço #${osId} removida.`, "success");
}

function reporEstoque() {
    const perfil = document.getElementById('roleSelect').value;
    if (perfil !== 'Administrador') {
        mostrarMensagem("❌ Apenas o Administrador pode dar entrada manual no estoque.", "error");
        return;
    }

    const idRepor = parseInt(document.getElementById('reporId').value);
    const qtdRepor = parseInt(document.getElementById('reporQtd').value);
    const item = estoque.find(p => p.id === idRepor);

    if (!item || isNaN(qtdRepor) || qtdRepor <= 0) {
        mostrarMensagem("❌ Informe uma quantidade válida para reposição.", "error");
        return;
    }

    item.qtd += qtdRepor;
    atualizarTabelaEstoque();
    atualizarIndicadores();
    mostrarMensagem(`✅ Entrada de +${qtdRepor} un. registrada para "${item.nome}".`, "success");
}

function verComprovante(osId) {
    const ordem = ordensServico.find(o => o.osId === osId);
    if (!ordem) return;

    ultimaOSSelecionada = ordem;
    const receiptArea = document.getElementById('receipt');
    receiptArea.innerHTML = `
        <strong>COMPROVANTE DE ORDEM DE SERVIÇO #${ordem.osId}</strong><br>
        Data de Emissão: ${ordem.data} | Status: <strong>${ordem.status}</strong><br>
        Cliente: ${ordem.cliente}<br>
        Equipamento / Veículo: ${ordem.equipamento}<br>
        Serviço Executado: ${ordem.servico}<br>
        Peça Vinculada: ${ordem.pecaNome} (${ordem.qtdPeca} un.)<br>
        Mão de Obra: ${formatarMoeda(ordem.maoDeObra)} | <strong>Valor Total: ${formatarMoeda(ordem.total)}</strong><br><br>
        <em>Assinatura do Responsável / Cliente: ____________________________________</em>
    `;
}

function aplicarPermissoesPerfil() {
    const perfil = document.getElementById('roleSelect').value;
    const infoPerfil = document.getElementById('roleDescription');
    const secaoFinanceira = document.getElementById('financialSection');
    const secaoKPI = document.getElementById('kpiSection');
    const barraReposicao = document.getElementById('restockBar');
    const btnNovaOS = document.getElementById('btnCriarOS');

    if (perfil === 'Administrador') {
        infoPerfil.innerText = "Perfil Ativo: Administrador — Acesso total ao painel financeiro, abertura/exclusão de OS e reposição de estoque.";
        secaoFinanceira.style.display = 'grid';
        secaoKPI.style.display = 'grid';
        barraReposicao.style.display = 'flex';
        btnNovaOS.disabled = false;
        btnNovaOS.style.opacity = '1';
    } else if (perfil === 'Atendente') {
        infoPerfil.innerText = "Perfil Ativo: Atendente — Permissão para abertura de OS, consulta de estoque, alteração de status e emissão de PDF.";
        secaoFinanceira.style.display = 'grid';
        secaoKPI.style.display = 'grid';
        barraReposicao.style.display = 'none';
        btnNovaOS.disabled = false;
        btnNovaOS.style.opacity = '1';
    } else {
        infoPerfil.innerText = "Perfil Ativo: Técnico — Acesso restrito à fila operacional de OS e controle de peças (Dashboard financeiro oculto).";
        secaoFinanceira.style.display = 'none';
        secaoKPI.style.display = 'none';
        barraReposicao.style.display = 'none';
        btnNovaOS.disabled = true;
        btnNovaOS.style.opacity = '0.5';
    }

    atualizarTabelaOS();
}

function exportarRelatorioPDF() {
    if (window.jspdf && window.jspdf.jsPDF) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 32, 'F');
        doc.setTextColor(96, 165, 250);
        doc.setFontSize(16);
        doc.text("RELATORIO GERENCIAL ERP / ORDENS DE SERVICO", 14, 15);
        doc.setTextColor(203, 213, 225);
        doc.setFontSize(10);
        doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')} | Perfil: ${document.getElementById('roleSelect').value}`, 14, 24);

        doc.setTextColor(20, 20, 20);
        doc.setFontSize(12);
        doc.text("Resumo de Ordens de Servico:", 14, 44);

        let y = 54;
        doc.setFontSize(9);
        ordensServico.forEach(os => {
            const linha = `#${os.osId} | ${os.cliente} | ${os.equipamento} | ${os.status} | ${formatarMoeda(os.total)}`;
            doc.text(linha, 14, y);
            y += 8;
        });

        y += 6;
        doc.setFontSize(12);
        doc.text("Posicao do Estoque:", 14, y);
        y += 8;
        doc.setFontSize(9);
        estoque.forEach(item => {
            const statusEst = item.qtd <= item.min ? "[CRITICO]" : "[NORMAL]";
            doc.text(`ID ${item.id} - ${item.nome}: ${item.qtd} un. (Min: ${item.min}) ${statusEst}`, 14, y);
            y += 7;
        });

        if (ultimaOSSelecionada) {
            y += 8;
            doc.setFontSize(11);
            doc.text(`Detalhe da OS Selecionada (#${ultimaOSSelecionada.osId}):`, 14, y);
            y += 7;
            doc.setFontSize(9);
            doc.text(`Cliente: ${ultimaOSSelecionada.cliente} | Equipamento: ${ultimaOSSelecionada.equipamento}`, 14, y);
            y += 6;
            doc.text(`Servico: ${ultimaOSSelecionada.servico} | Peca: ${ultimaOSSelecionada.pecaNome} (${ultimaOSSelecionada.qtdPeca}x)`, 14, y);
            y += 6;
            doc.text(`Valor Total: ${formatarMoeda(ultimaOSSelecionada.total)} | Status: ${ultimaOSSelecionada.status}`, 14, y);
        }

        doc.save(`relatorio-erp-os-${Date.now()}.pdf`);
        mostrarMensagem("✅ Relatório PDF gerado e baixado com sucesso!", "success");
    } else {
        window.print();
    }
}

function mostrarMensagem(texto, tipo) {
    const msgArea = document.getElementById('messageArea');
    msgArea.innerText = texto;
    msgArea.className = tipo;
    msgArea.style.display = 'block';
}

window.onload = function() {
    atualizarTabelaEstoque();
    aplicarPermissoesPerfil();
    verComprovante(ordensServico[0].osId);
};
