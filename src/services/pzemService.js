
import pzemRepository from "../database/monitoramento/pzemRepository.js";

// ==========================================
// WATT VISION - SERVICE PZEM
// ==========================================
// Responsável pelas regras de negócio
// dos sensores de medição PZEM-004T.
//
// O Service valida os dados recebidos,
// verifica relacionamentos e impede
// operações que comprometam o histórico.
//
// As consultas SQL são realizadas
// exclusivamente pelo Repository.

// ==========================================
// FUNÇÃO AUXILIAR - ERROS HTTP
// ==========================================
// Cria erros com status HTTP para que
// o Controller possa tratá-los corretamente.

function criarErro(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

// ==========================================
// FUNÇÃO AUXILIAR - VALIDAR ID
// ==========================================
// Aceita somente números inteiros positivos.

function validarId(valor, campo = "ID") {
    if (
        valor === null ||
        valor === undefined ||
        typeof valor === "boolean" ||
        (typeof valor === "string" && !valor.trim())
    ) {
        throw criarErro(`${campo} inválido.`);
    }

    const numero = Number(valor);

    if (!Number.isSafeInteger(numero) || numero <= 0) {
        throw criarErro(`${campo} inválido.`);
    }

    return numero;
}

// ==========================================
// FUNÇÃO AUXILIAR - TEXTO OBRIGATÓRIO
// ==========================================
// Impede valores vazios e textos maiores
// que o tamanho permitido pela tabela.

function textoObrigatorio(valor, campo, limite) {
    if (typeof valor !== "string" || !valor.trim()) {
        throw criarErro(`${campo} é obrigatório.`);
    }

    const texto = valor.trim();

    if (texto.length > limite) {
        throw criarErro(
            `${campo} deve ter no máximo ${limite} caracteres.`
        );
    }

    return texto;
}

// ==========================================
// FUNÇÃO AUXILIAR - TEXTO OPCIONAL
// ==========================================
// Permite campos nulos, mas valida seu
// tamanho quando um valor é informado.

function textoOpcional(valor, campo, limite) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return null;
    }

    if (typeof valor !== "string") {
        throw criarErro(`${campo} deve ser um texto.`);
    }

    const texto = valor.trim();

    if (!texto) {
        return null;
    }

    if (texto.length > limite) {
        throw criarErro(
            `${campo} deve ter no máximo ${limite} caracteres.`
        );
    }

    return texto;
}

// ==========================================
// FUNÇÃO AUXILIAR - VALIDAR DATA
// ==========================================
// O campo data_instalacao utiliza DATE.
// Mantém o formato YYYY-MM-DD sem conversão
// automática de fuso horário.

function validarData(valor) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return null;
    }

    if (
        typeof valor !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(valor)
    ) {
        throw criarErro(
            "Data de instalação inválida. Utilize YYYY-MM-DD."
        );
    }

    const [ano, mes, dia] = valor.split("-").map(Number);

    const data = new Date(
        Date.UTC(ano, mes - 1, dia)
    );

    if (
        data.getUTCFullYear() !== ano ||
        data.getUTCMonth() !== mes - 1 ||
        data.getUTCDate() !== dia
    ) {
        throw criarErro("Data de instalação inválida.");
    }

    return valor;
}

// ==========================================
// FUNÇÃO AUXILIAR - VALIDAR STATUS
// ==========================================
// O status representa a condição
// administrativa do sensor.
//
// Valores aceitos: Ativo ou Inativo.

function validarStatus(valor) {
    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {
        return "Ativo";
    }

    if (typeof valor !== "string") {
        throw criarErro("Status do PZEM inválido.");
    }

    const status = valor.trim().toLowerCase();

    if (status === "ativo") {
        return "Ativo";
    }

    if (status === "inativo") {
        return "Inativo";
    }

    throw criarErro(
        "Status inválido. Utilize Ativo ou Inativo."
    );
}

// ==========================================
// SERVICE - SENSORES PZEM
// ==========================================

class PzemService {

    // ======================================
    // VALIDAR DADOS DO SENSOR
    // ======================================
    // Utilizado pelo POST e pelo PUT.
    //
    // Verifica os campos obrigatórios,
    // número de série, ponto de medição
    // e condição de ativação.

    async validarDados(dados, idIgnorar = null) {
        if (
            !dados ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            throw criarErro("Dados do PZEM inválidos.");
        }

        // ==================================
        // VALIDAR PONTO DE MEDIÇÃO
        // ==================================

        const idPontoMedicao = validarId(
            dados.id_ponto_medicao,
            "ID do ponto de medição"
        );

        // ==================================
        // VALIDAR NÚMERO DE SÉRIE
        // ==================================

        const numeroSerie = textoObrigatorio(
            dados.numero_serie,
            "Número de série",
            50
        );

        // ==================================
        // VALIDAR MODELO E VERSÃO
        // ==================================
        // Utiliza PZEM-004T como modelo padrão.

        const modelo =
            dados.modelo === undefined ||
            dados.modelo === null ||
            dados.modelo === ""
                ? "PZEM-004T"
                : textoObrigatorio(
                    dados.modelo,
                    "Modelo",
                    50
                );

        const versao = textoOpcional(
            dados.versao,
            "Versão",
            20
        );

        // ==================================
        // VALIDAR DATA E STATUS
        // ==================================

        const dataInstalacao = validarData(
            dados.data_instalacao
        );

        const status = validarStatus(
            dados.status
        );

        // ==================================
        // VERIFICAR PONTO NO BANCO
        // ==================================
        // Não permite cadastrar um sensor
        // vinculado a um ponto inexistente.

        const ponto =
            await pzemRepository.buscarPontoMedicao(
                idPontoMedicao
            );

        if (!ponto) {
            throw criarErro(
                "Ponto de medição não encontrado.",
                404
            );
        }

        // ==================================
        // VALIDAR ATIVAÇÃO DO SENSOR
        // ==================================
        // Um PZEM ativo não pode estar
        // vinculado a um ponto inativo.

        if (
            status === "Ativo" &&
            ponto.status !== "Ativo"
        ) {
            throw criarErro(
                "Não é permitido ativar um PZEM vinculado a um ponto de medição inativo."
            );
        }

        // ==================================
        // VERIFICAR NÚMERO DE SÉRIE DUPLICADO
        // ==================================
        // Durante o PUT, ignora o próprio
        // registro para evitar falso conflito.

        const existente =
            await pzemRepository.buscarPorNumeroSerie(
                numeroSerie,
                idIgnorar
            );

        if (existente) {
            throw criarErro(
                "Já existe um PZEM com este número de série.",
                409
            );
        }

        // ==================================
        // RETORNAR DADOS VALIDADOS
        // ==================================
        // Os nomes correspondem às colunas
        // utilizadas no Repository.

        return {
            id_ponto_medicao: idPontoMedicao,
            numero_serie: numeroSerie,
            modelo,
            versao,
            data_instalacao: dataInstalacao,
            status
        };
    }

    // ======================================
    // LISTAR TODOS OS SENSORES
    // ======================================

    async listarTodos() {
        return await pzemRepository.listarTodos();
    }

    // ======================================
    // BUSCAR SENSOR PELO ID
    // ======================================

    async buscarPorId(id) {
        const idValidado = validarId(
            id,
            "ID do PZEM"
        );

        const sensor =
            await pzemRepository.buscarPorId(
                idValidado
            );

        if (!sensor) {
            throw criarErro(
                "Sensor PZEM não encontrado.",
                404
            );
        }

        return sensor;
    }

    // ======================================
    // CADASTRAR SENSOR PZEM
    // ======================================

    async criar(dados) {
        const dadosValidados =
            await this.validarDados(dados);

        return await pzemRepository.criar(
            dadosValidados
        );
    }

    // ======================================
    // ATUALIZAR SENSOR PZEM
    // ======================================

    async atualizar(id, dados) {
        const idValidado = validarId(
            id,
            "ID do PZEM"
        );

        // Confirma que o sensor existe.
        await this.buscarPorId(idValidado);

        // Valida os dados e ignora o próprio
        // sensor na verificação de duplicidade.
        const dadosValidados =
            await this.validarDados(
                dados,
                idValidado
            );

        await pzemRepository.atualizar(
            idValidado,
            dadosValidados
        );

        return await this.buscarPorId(idValidado);
    }

    // ======================================
    // ALTERAR STATUS DO SENSOR
    // ======================================
    // Permite ativar ou desativar o PZEM.
    // A reativação exige um ponto ativo.

    async atualizarStatus(id, status) {
        const idValidado = validarId(
            id,
            "ID do PZEM"
        );

        const sensor = await this.buscarPorId(
            idValidado
        );

        // O PATCH exige um status explícito.
        if (
            status === undefined ||
            status === null ||
            status === ""
        ) {
            throw criarErro("Status é obrigatório.");
        }

        const statusValidado = validarStatus(status);

        // Verifica o ponto antes de reativar.
        if (statusValidado === "Ativo") {
            const ponto =
                await pzemRepository.buscarPontoMedicao(
                    sensor.id_ponto_medicao
                );

            if (!ponto || ponto.status !== "Ativo") {
                throw criarErro(
                    "Não é possível ativar o PZEM porque o ponto de medição está inativo ou não existe."
                );
            }
        }

        await pzemRepository.atualizarStatus(
            idValidado,
            statusValidado
        );

        return await this.buscarPorId(idValidado);
    }

    // ======================================
    // EXCLUIR SENSOR PZEM
    // ======================================
    // Protege o histórico energético.
    //
    // Sensores que já possuem medições
    // registradas não podem ser excluídos.

    async excluir(id) {
        const idValidado = validarId(
            id,
            "ID do PZEM"
        );

        await this.buscarPorId(idValidado);

        // Consulta a quantidade de medições
        // relacionadas ao sensor.
        const quantidade =
            await pzemRepository.contarMedicoes(
                idValidado
            );

        if (quantidade > 0) {
            throw criarErro(
                "Não é possível excluir o PZEM porque existem medições vinculadas a ele.",
                409
            );
        }

        await pzemRepository.excluir(
            idValidado
        );

        return true;
    }
}

// ==========================================
// EXPORTAÇÃO DO SERVICE
// ==========================================
// Exporta uma instância para utilização
// pelo Controller do módulo PZEM.

export default new PzemService();
