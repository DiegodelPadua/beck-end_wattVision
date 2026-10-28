
import medicaoRepository from "../database/monitoramento/medicaoRepository.js";

// ==========================================
// WATT VISION - SERVICE DE MEDIÇÕES
// ==========================================
// Centraliza as regras de negócio das
// medições elétricas recebidas pela API.
//
// Preserva os métodos utilizados pelo
// Controller e pelo dashboard.
//
// Não executa SQL diretamente.
// O acesso ao MySQL fica no Repository.

// ==========================================
// CRIAR ERRO COM STATUS HTTP
// ==========================================

function criarErro(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

// ==========================================
// VALIDAR IDENTIFICADOR
// ==========================================
// Aceita apenas inteiros positivos.

function validarId(valor, campo = "ID") {
    if (
        valor === null ||
        valor === undefined ||
        typeof valor === "boolean" ||
        (typeof valor === "string" && !valor.trim())
    ) {
        throw criarErro(`${campo} inválido.`);
    }

    const id = Number(valor);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw criarErro(`${campo} inválido.`);
    }

    return id;
}

// ==========================================
// VALIDAR GRANDEZA ELÉTRICA
// ==========================================
// Evita NaN, Infinity, números negativos,
// valores vazios e dados incompatíveis.
//
// Os valores numéricos são normalizados
// antes de serem enviados ao Repository.

function validarGrandeza(valor, campo, minimo, maximo) {
    if (
        valor === null ||
        valor === undefined ||
        typeof valor === "boolean" ||
        (typeof valor === "string" && !valor.trim())
    ) {
        throw criarErro(`${campo} é obrigatório.`);
    }

    const numero = Number(valor);

    if (
        !Number.isFinite(numero) ||
        numero < minimo ||
        numero > maximo
    ) {
        throw criarErro(
            `${campo} deve estar entre ${minimo} e ${maximo}.`
        );
    }

    return numero;
}

// ==========================================
// VALIDAR DATA CALENDÁRIO
// ==========================================
// Verifica datas no formato YYYY-MM-DD,
// inclusive meses e anos bissextos.

function validarData(valor) {
    if (
        typeof valor !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(valor)
    ) {
        return false;
    }

    const [ano, mes, dia] = valor.split("-").map(Number);

    const data = new Date(
        Date.UTC(ano, mes - 1, dia)
    );

    return (
        data.getUTCFullYear() === ano &&
        data.getUTCMonth() === mes - 1 &&
        data.getUTCDate() === dia
    );
}

// ==========================================
// VALIDAR DATA E HORA DA MEDIÇÃO
// ==========================================
// Formato aceito:
// YYYY-MM-DD HH:mm:ss
//
// Preserva a data informada, sem aplicar
// conversões automáticas de fuso horário.

function validarDataHora(valor) {
    if (typeof valor !== "string") {
        throw criarErro(
            "data_hora deve utilizar YYYY-MM-DD HH:mm:ss."
        );
    }

    const formato =
        /^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2}):(\d{2})$/;

    const partes = valor.match(formato);

    if (!partes) {
        throw criarErro(
            "data_hora deve utilizar YYYY-MM-DD HH:mm:ss."
        );
    }

    const [, data, hora, minuto, segundo] = partes;

    if (
        !validarData(data) ||
        Number(hora) > 23 ||
        Number(minuto) > 59 ||
        Number(segundo) > 59
    ) {
        throw criarErro("Data e hora da medição inválidas.");
    }

    return valor;
}

// ==========================================
// SERVICE - MEDIÇÕES
// ==========================================

class MedicaoService {

    // ======================================
    // LISTAR TODAS AS MEDIÇÕES
    // ======================================

    async listarTodas() {
        return await medicaoRepository.listarTodas();
    }

    // ======================================
    // CADASTRAR NOVA MEDIÇÃO
    // ======================================
    // Recebe os dados elétricos e identifica
    // automaticamente o ponto de medição
    // associado ao sensor PZEM.
    //
    // Não permite que o cliente escolha
    // arbitrariamente id_ponto_medicao.

    async criar(dados) {
        if (
            !dados ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            throw criarErro("Dados da medição inválidos.");
        }

        // ==================================
        // VALIDAR IDENTIFICAÇÃO E DATA
        // ==================================

        const idPzem = validarId(
            dados.id_pzem,
            "ID do PZEM"
        );

        const dataHora = validarDataHora(
            dados.data_hora
        );

        // ==================================
        // VALIDAR GRANDEZAS ELÉTRICAS
        // ==================================
        // Os limites abaixo são regras de
        // aplicação, não uma confirmação dos
        // limites físicos do sensor instalado.
        //
        // Devem ser compatibilizados com
        // o modelo e a instalação reais.

        const tensao = validarGrandeza(
            dados.tensao,
            "Tensão",
            0,
            1000
        );

        const corrente = validarGrandeza(
            dados.corrente,
            "Corrente",
            0,
            1000
        );

        const potenciaAtiva = validarGrandeza(
            dados.potencia_ativa,
            "Potência ativa",
            0,
            1000000
        );

        const energiaAcumulada = validarGrandeza(
            dados.energia_acumulada,
            "Energia acumulada",
            0,
            1000000000
        );

        const frequencia = validarGrandeza(
            dados.frequencia,
            "Frequência",
            0,
            1000
        );

        const fatorPotencia = validarGrandeza(
            dados.fator_potencia,
            "Fator de potência",
            0,
            1
        );

        // ==================================
        // CONSULTAR SENSOR E RELACIONAMENTOS
        // ==================================
        // O Repository retorna o sensor,
        // seu ponto e o dispositivo IoT.

        const pzem =
            await medicaoRepository.buscarPzemPorId(
                idPzem
            );

        if (!pzem) {
            throw criarErro(
                "PZEM não encontrado ou com relacionamento inválido.",
                404
            );
        }

        // ==================================
        // VALIDAR STATUS DO SENSOR
        // ==================================
        // Não aceita novas leituras quando
        // o sensor está administrativamente
        // inativo.

        if (pzem.status !== "Ativo") {
            throw criarErro(
                "Não é permitido registrar medições de um PZEM inativo.",
                409
            );
        }

        // ==================================
        // VALIDAR STATUS DO PONTO
        // ==================================

        if (pzem.status_ponto_medicao !== "Ativo") {
            throw criarErro(
                "Não é permitido registrar medições em um ponto inativo.",
                409
            );
        }

        // ==================================
        // RESOLVER O PONTO DE MEDIÇÃO
        // ==================================
        // O vínculo é obtido do MySQL.
        //
        // Não é necessário realizar outra
        // consulta porque buscarPzemPorId()
        // já retorna id_ponto_medicao.

        const idPontoMedicao = validarId(
            pzem.id_ponto_medicao,
            "ID do ponto de medição"
        );


        // ==================================
        // MONTAR OBJETO PARA O REPOSITORY
        // ==================================
        // Converte os nomes das variáveis
        // JavaScript para os nomes das colunas
        // utilizadas no banco de dados MySQL.
        //
        // fatorPotencia é a variável validada.
        // fator_potencia é a coluna do MySQL.

        const medicao = {
            id_pzem: idPzem,
            id_ponto_medicao: idPontoMedicao,
            data_hora: dataHora,
            tensao,
            corrente,
            potencia_ativa: potenciaAtiva,
            energia_acumulada: energiaAcumulada,
            frequencia,
            fator_potencia: fatorPotencia
        };

        // ==================================
        // GRAVAR MEDIÇÃO NO MYSQL
        // ==================================
        // Envia os dados validados para
        // o Repository realizar o INSERT.

        return await medicaoRepository.criar(medicao);

    }

    // ======================================
    // BUSCAR ÚLTIMA MEDIÇÃO
    // ======================================

    async buscarUltima() {
        return await medicaoRepository.buscarUltima();
    }

    // ======================================
    // PREPARAR RESUMO PARA O DASHBOARD
    // ======================================
    // Mantém o formato de retorno utilizado
    // pelo dashboard existente.

    async obterResumo() {
        const medicao =
            await medicaoRepository.buscarUltima();

        if (!medicao) {
            return null;
        }

        return {
            id_medicao: medicao.id,
            id_pzem: medicao.id_pzem,
            id_ponto_medicao: medicao.id_ponto_medicao,
            data_hora: medicao.data_hora,
            tensao: Number(medicao.tensao),
            corrente: Number(medicao.corrente),
            potencia_ativa: Number(medicao.potencia_ativa),
            energia_acumulada: Number(medicao.energia_acumulada),
            frequencia: Number(medicao.frequencia),
            fator_potencia: Number(medicao.fator_potencia)
        };
    }

    // ======================================
    // CONSULTAR SÉRIE TEMPORAL
    // ======================================
    // Mantém o limite de 1 a 168 horas
    // utilizado pelo sistema.

    async obterSerieTemporal(idPzem, horas = 24) {
        const id = validarId(
            idPzem,
            "ID do PZEM"
        );

        const periodo = Number(horas);

        if (
            horas === null ||
            typeof horas === "boolean" ||
            (typeof horas === "string" && !horas.trim()) ||
            !Number.isInteger(periodo) ||
            periodo < 1 ||
            periodo > 168
        ) {
            throw criarErro(
                "O período deve estar entre 1 e 168 horas."
            );
        }

        return await medicaoRepository.obterSerieTemporal(
            id,
            periodo
        );
    }

    // ======================================
    // BUSCAR ÚLTIMAS MEDIÇÕES POR PONTO
    // ======================================
    // Retorna a última leitura de cada PZEM
    // registrada no ponto solicitado.

    async buscarUltimasPorPonto(idPonto) {
        const id = validarId(
            idPonto,
            "ID do ponto de medição"
        );

        return await medicaoRepository.buscarUltimasPorPonto(
            id
        );
    }

    // ======================================
    // CALCULAR CONSUMO E CUSTO
    // ======================================
    // Calcula o consumo a partir da diferença
    // entre leituras de energia acumulada.
    //
    // Não soma os valores acumulados.
    // Soma apenas os incrementos entre
    // leituras consecutivas.
    //
    // Preserva o comportamento original
    // diante de redução do contador.

    async calcularConsumo(idPzem, inicio, fim) {
        const id = validarId(
            idPzem,
            "ID do PZEM"
        );

        // ==================================
        // VALIDAR PERÍODO
        // ==================================

        if (
            !validarData(inicio) ||
            !validarData(fim) ||
            inicio > fim
        ) {
            throw criarErro(
                "Informe datas válidas no formato YYYY-MM-DD."
            );
        }

        // ==================================
        // VERIFICAR EXISTÊNCIA DO SENSOR
        // ==================================

        const pzem =
            await medicaoRepository.buscarPzemPorId(id);

        if (!pzem) {
            throw criarErro(
                "PZEM não encontrado.",
                404
            );
        }

        // ==================================
        // CONSULTAR LEITURAS DO PERÍODO
        // ==================================

        const medicoes =
            await medicaoRepository.buscarMedicoesParaConsumo(
                id,
                inicio,
                fim
            );

        // Mantém o retorno original quando
        // existem menos de duas leituras.

        if (medicoes.length < 2) {
            return {
                id_pzem: id,
                inicio,
                fim,
                quantidade_medicoes: medicoes.length,
                consumo_kwh: null,
                custo_estimado: null,
                mensagem:
                    "Medições insuficientes para calcular o consumo."
            };
        }

        // ==================================
        // CALCULAR CONSUMO ACUMULADO
        // ==================================

        let consumo = 0;

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
                throw criarErro(
                    "Foram encontradas leituras de energia inválidas.",
                    422
                );
            }

            const diferenca = atual - anterior;

            // Redução pode indicar reinicialização,
            // troca de sensor ou inconsistência.
            // Não calculamos consumo automaticamente
            // nesse cenário.

            if (diferenca < 0) {
                throw criarErro(
                    "Foi detectada uma redução no contador de energia. " +
                    "O período precisa ser analisado antes do cálculo.",
                    422
                );
            }

            // Impede somar diferenças de sensores
            // vinculados a pontos distintos no
            // mesmo período.
            if (
                medicoes[i].id_ponto_medicao !==
                medicoes[i - 1].id_ponto_medicao
            ) {
                throw criarErro(
                    "O PZEM possui medições em pontos diferentes no período. " +
                    "Consulte o consumo separadamente por ponto.",
                    422
                );
            }

            consumo += diferenca;
        }

        // ==================================
        // CONSULTAR TARIFA
        // ==================================

        const tarifas =
            await medicaoRepository.buscarTarifaParaPeriodo(
                id,
                inicio,
                fim
            );

        // Mantém a regra de uma única tarifa
        // para todo o período solicitado.

        if (tarifas.length !== 1) {
            throw criarErro(
                "É necessário existir exatamente uma tarifa ativa " +
                "que cubra todo o período consultado.",
                422
            );
        }

        const tarifa = tarifas[0];

        // ==================================
        // VALIDAR COBERTURA DA TARIFA
        // ==================================
        // mysql2 pode retornar DATE como objeto
        // Date. Normalizamos somente para
        // comparar as datas de calendário.

        const formatarDataBanco = (valor) => {
            if (valor instanceof Date) {
                const ano = valor.getFullYear();
                const mes = String(
                    valor.getMonth() + 1
                ).padStart(2, "0");
                const dia = String(
                    valor.getDate()
                ).padStart(2, "0");

                return `${ano}-${mes}-${dia}`;
            }

            return String(valor).slice(0, 10);
        };

        const inicioTarifa = formatarDataBanco(
            tarifa.data_inicial
        );

        const fimTarifa =
            tarifa.data_final === null
                ? null
                : formatarDataBanco(
                    tarifa.data_final
                );

        if (
            inicioTarifa > inicio ||
            (fimTarifa !== null && fimTarifa < fim)
        ) {
            throw criarErro(
                "A tarifa encontrada não cobre todo o período solicitado.",
                422
            );
        }

        // ==================================
        // VALIDAR VALOR DA TARIFA
        // ==================================

        const valorKwh = Number(
            tarifa.valor_kwh
        );

        if (
            !Number.isFinite(valorKwh) ||
            valorKwh < 0
        ) {
            throw criarErro(
                "A tarifa possui valor inválido.",
                422
            );
        }

        // ==================================
        // CALCULAR CUSTO ESTIMADO
        // ==================================

        const custo = consumo * valorKwh;

        return {
            id_pzem: id,
            inicio,
            fim,
            quantidade_medicoes: medicoes.length,
            primeira_medicao: medicoes[0].data_hora,
            ultima_medicao:
                medicoes[medicoes.length - 1].data_hora,
            consumo_kwh: Number(
                consumo.toFixed(6)
            ),
            tarifa: {
                id: tarifa.id,
                descricao: tarifa.descricao,
                valor_kwh: valorKwh
            },
            custo_estimado: Number(
                custo.toFixed(2)
            ),
            moeda: "BRL"
        };
    }
}

// ==========================================
// EXPORTAÇÃO DO SERVICE
// ==========================================

export default new MedicaoService();
