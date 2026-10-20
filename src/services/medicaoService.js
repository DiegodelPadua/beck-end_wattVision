// Importa o Repository responsável
// pelas operações da tabela tbl_medicao.
import medicaoRepository
    from "../database/monitoramento/medicaoRepository.js";


// ==========================================
// SERVICE - MEDIÇÃO
// ==========================================
//
// Aqui ficam as regras de negócio
// relacionadas às medições.

class MedicaoService {

    // ======================================
    // LISTAR TODAS AS MEDIÇÕES
    // ======================================

    async listarTodas() {

        const medicoes =
            await medicaoRepository.listarTodas();

        return medicoes;
    }


    // ======================================
    // CRIAR UMA NOVA MEDIÇÃO
    // ======================================

    async criar(dados) {

        // Extrai os dados recebidos.
        const {
            id_pzem,
            data_hora,
            tensao,
            corrente,
            potencia_ativa,
            energia_acumulada,
            frequencia,
            fator_potencia
        } = dados;


        // ==================================
        // VALIDAÇÕES BÁSICAS
        // ==================================

        // O PZEM precisa estar identificado.
        if (id_pzem === undefined || id_pzem === null) {
            throw new Error(
                "O campo id_pzem é obrigatório."
            );
        }
        // A data e hora da medição precisam ser informadas.
        // Isso preserva o momento real em que o ESP32
        // realizou a leitura, inclusive em medições offline.
        if (!data_hora) {
            throw new Error(
                "O campo data_hora é obrigatório."
            );
        }


        // As grandezas elétricas também
        // precisam estar presentes.
        if (
            tensao === undefined ||
            corrente === undefined ||
            potencia_ativa === undefined ||
            energia_acumulada === undefined ||
            frequencia === undefined ||
            fator_potencia === undefined
        ) {
            throw new Error(
                "Todas as grandezas elétricas são obrigatórias."
            );
        }


        // Fator de potência deve ficar
        // entre 0 e 1.
        if (
            fator_potencia < 0 ||
            fator_potencia > 1
        ) {
            throw new Error(
                "O fator de potência deve estar entre 0 e 1."
            );
        }


        // Monta o objeto que será enviado
        // para o Repository.
        const medicao = {
            id_pzem,
            data_hora,
            tensao,
            corrente,
            potencia_ativa,
            energia_acumulada,
            frequencia,
            fator_potencia
        };

        // ==========================================
        // VALIDAÇÃO DA EXISTÊNCIA DO PZEM
        // ==========================================

        // Consulta o banco para verificar se o
        // PZEM informado está cadastrado.
        const pzem = await medicaoRepository.buscarPzemPorId(
            id_pzem
        );

        // Se o PZEM não existir, interrompe o cadastro.
        if (!pzem) {
            throw new Error(
                `PZEM com ID ${id_pzem} não encontrado.`
            );
        }

        // Solicita ao Repository a gravação.
        const id =
            await medicaoRepository.criar(medicao);


        // Retorna o ID da medição criada.
        return id;


    }



        // ======================================
        // BUSCAR A ÚLTIMA MEDIÇÃO
        // ======================================
        // Centraliza a operação de consulta.
        // Futuramente poderá aplicar regras
        // de acesso por empresa, local ou setor.

        async buscarUltima() {

            // Consulta a medição mais recente
            // utilizando o Repository.
            const medicao =
                await medicaoRepository.buscarUltima();

            return medicao;
        }


        // ======================================
        // PREPARAR RESUMO PARA O DASHBOARD
        // ======================================
        // Utiliza a medição mais recente.
        // Não mistura valores de sensores diferentes.

        async obterResumo() {
            const medicao = await medicaoRepository.buscarUltima();

            if (!medicao) {
                return null;
            }

            return {
                id_medicao: medicao.id,
                id_pzem: medicao.id_pzem,
                data_hora: medicao.data_hora,
                tensao: Number(medicao.tensao),
                corrente: Number(medicao.corrente),
                potencia_ativa: Number(medicao.potencia_ativa),
                energia_acumulada: Number(medicao.energia_acumulada),
                frequencia: Number(medicao.frequencia),
                fator_potencia: Number(medicao.fator_potencia)
            };
        }

        // ==========================================
        // VALIDAR FILTROS DA SÉRIE TEMPORAL
        // ==========================================
        // Define um período limitado para evitar
        // consultas excessivamente grandes.

        async obterSerieTemporal(idPzem, horas = 24) {

            const id = Number(idPzem);
            const periodo = Number(horas);

            // O identificador deve ser um inteiro positivo.
            if (!Number.isSafeInteger(id) || id <= 0) {
                const erro = new Error(
                    "Informe um id_pzem válido."
                );
                erro.status = 400;
                throw erro;
            }

            // Permite consultar de 1 até 168 horas (7 dias).
            if (
                !Number.isInteger(periodo) ||
                periodo < 1 ||
                periodo > 168
            ) {
                const erro = new Error(
                    "O período deve estar entre 1 e 168 horas."
                );
                erro.status = 400;
                throw erro;
            }

            return await medicaoRepository.obterSerieTemporal(
                id,
                periodo
            );
        }


        // ==========================================
        // BUSCAR ÚLTIMAS MEDIÇÕES POR PONTO
        // ==========================================
        // Valida o identificador do ponto de medição
        // e solicita ao Repository as últimas leituras
        // dos PZEMs associados a esse ponto.

        async buscarUltimasPorPonto(idPonto) {

            // Converte o identificador recebido para número.
            const id = Number(idPonto);

            // Verifica se o identificador é um inteiro positivo.
            if (!Number.isSafeInteger(id) || id <= 0) {

                const erro = new Error(
                    "O ID do ponto de medição é inválido."
                );

                erro.status = 400;

                throw erro;
            }

            // Consulta o Repository e retorna as medições.
            const medicoes =
                await medicaoRepository.buscarUltimasPorPonto(id);

            return medicoes;
        }


        // ==========================================
// CALCULAR CONSUMO E CUSTO DE ENERGIA
// ==========================================
// Calcula as diferenças entre leituras
// consecutivas do mesmo PZEM.
//
// Nesta versão, se houver reinicialização
// do contador, o cálculo é interrompido
// para evitar apresentar um valor incorreto.

async calcularConsumo(idPzem, inicio, fim) {

    // Valida o identificador do PZEM.
    const id = Number(idPzem);

    if (!Number.isSafeInteger(id) || id <= 0) {
        const erro = new Error("ID do PZEM inválido.");
        erro.status = 400;
        throw erro;
    }

    // Valida datas no formato YYYY-MM-DD.
    const formatoData = /^\d{4}-\d{2}-\d{2}$/;

    const dataValida = (valor) => {
        if (!formatoData.test(valor ?? "")) return false;

        const data = new Date(`${valor}T00:00:00Z`);

        return !Number.isNaN(data.getTime()) &&
            data.toISOString().slice(0, 10) === valor;
    };

    if (!dataValida(inicio) || !dataValida(fim) || inicio > fim) {
        const erro = new Error(
            "Informe datas válidas no formato YYYY-MM-DD."
        );
        erro.status = 400;
        throw erro;
    }

    // Verifica se o PZEM está cadastrado.
    const pzem = await medicaoRepository.buscarPzemPorId(id);

    if (!pzem) {
        const erro = new Error("PZEM não encontrado.");
        erro.status = 404;
        throw erro;
    }

    // Busca as medições dentro do intervalo.
    const medicoes =
        await medicaoRepository.buscarMedicoesParaConsumo(
            id, inicio, fim
        );

    // Duas leituras são necessárias para
    // calcular uma diferença de energia.
    if (medicoes.length < 2) {
        return {
            id_pzem: id,
            inicio,
            fim,
            quantidade_medicoes: medicoes.length,
            consumo_kwh: null,
            custo_estimado: null,
            mensagem: "Medições insuficientes para calcular o consumo."
        };
    }

    let consumo = 0;

    // Soma as diferenças positivas entre
    // leituras consecutivas.
    for (let i = 1; i < medicoes.length; i++) {

        const anterior = Number(
            medicoes[i - 1].energia_acumulada
        );

        const atual = Number(
            medicoes[i].energia_acumulada
        );

        if (
            !Number.isFinite(anterior) ||
            !Number.isFinite(atual) ||
            anterior < 0 ||
            atual < 0
        ) {
            const erro = new Error(
                "Foram encontradas leituras de energia inválidas."
            );
            erro.status = 422;
            throw erro;
        }

        const diferenca = atual - anterior;

        // Uma queda pode indicar reinicialização,
        // substituição ou alteração do contador.
        if (diferenca < 0) {
            const erro = new Error(
                "Foi detectada uma redução no contador de energia. " +
                "O período precisa ser analisado antes do cálculo."
            );
            erro.status = 422;
            throw erro;
        }

        consumo += diferenca;
    }

    // Busca a tarifa aplicável à empresa.
    const tarifas =
        await medicaoRepository.buscarTarifaParaPeriodo(
            id, inicio, fim
        );

    // Exige exatamente uma tarifa válida.
    // Evita selecionar arbitrariamente uma
    // tarifa quando há vigências sobrepostas.
    if (tarifas.length !== 1) {
        const erro = new Error(
            "É necessário existir exatamente uma tarifa ativa " +
            "que cubra todo o período consultado."
        );
        erro.status = 422;
        throw erro;
    }

    const tarifa = tarifas[0];
    const valorKwh = Number(tarifa.valor_kwh);

    const custo = consumo * valorKwh;

    return {
        id_pzem: id,
        inicio,
        fim,
        quantidade_medicoes: medicoes.length,
        primeira_medicao: medicoes[0].data_hora,
        ultima_medicao: medicoes[medicoes.length - 1].data_hora,
        consumo_kwh: Number(consumo.toFixed(6)),
        tarifa: {
            id: tarifa.id,
            descricao: tarifa.descricao,
            valor_kwh: valorKwh
        },
        custo_estimado: Number(custo.toFixed(2)),
        moeda: "BRL"
    };
}


}


// Exporta uma instância do Service.
export default new MedicaoService();