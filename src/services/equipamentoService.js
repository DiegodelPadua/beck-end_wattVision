
import equipamentoRepository from "../database/monitoramento/equipamentoRepository.js";

// ==========================================
// SERVICE - EQUIPAMENTOS
// ==========================================
// Responsável pelas validações e regras
// de negócio do módulo de equipamentos.

class EquipamentoService {

    // Cria erros com códigos HTTP.
    criarErro(mensagem, status = 400) {
        const erro = new Error(mensagem);
        erro.status = status;
        return erro;
    }

    // Valida identificadores positivos.
    validarId(valor, campo = "ID") {
        if (
            valor === null ||
            valor === undefined ||
            typeof valor === "boolean" ||
            (typeof valor === "string" && !valor.trim())
        ) {
            throw this.criarErro(`${campo} inválido.`);
        }

        const id = Number(valor);

        if (!Number.isSafeInteger(id) || id <= 0) {
            throw this.criarErro(`${campo} inválido.`);
        }

        return id;
    }

    // Valida campos obrigatórios.
    textoObrigatorio(valor, campo, limite) {
        if (
            typeof valor !== "string" ||
            !valor.trim() ||
            valor.trim().length > limite
        ) {
            throw this.criarErro(
                `${campo} obrigatório, com no máximo ${limite} caracteres.`
            );
        }

        return valor.trim();
    }

    // Valida campos opcionais.
    textoOpcional(valor, campo, limite) {
        if (
            valor === undefined ||
            valor === null ||
            valor === ""
        ) {
            return null;
        }

        if (typeof valor !== "string") {
            throw this.criarErro(`${campo} inválido.`);
        }

        const texto = valor.trim();

        if (texto.length > limite) {
            throw this.criarErro(
                `${campo} permite no máximo ${limite} caracteres.`
            );
        }

        return texto || null;
    }

    // Valida valores numéricos não negativos.
    numeroOpcional(valor, campo) {
        if (
            valor === undefined ||
            valor === null ||
            valor === ""
        ) {
            return null;
        }

        if (
            typeof valor === "boolean" ||
            typeof valor === "object"
        ) {
            throw this.criarErro(
                `${campo} deve ser um número não negativo.`
            );
        }

        const numero = Number(valor);

        if (!Number.isFinite(numero) || numero < 0) {
            throw this.criarErro(
                `${campo} deve ser um número não negativo.`
            );
        }

        if (numero > 99999999.99) {
            throw this.criarErro(
                `${campo} excede o limite permitido.`
            );
        }

        return numero;
    }

    // Valida datas no formato YYYY-MM-DD.
    dataOpcional(valor) {
        if (
            valor === undefined ||
            valor === null ||
            valor === ""
        ) {
            return null;
        }

        if (
            typeof valor !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(valor)
        ) {
            throw this.criarErro(
                "data_instalacao deve estar no formato YYYY-MM-DD."
            );
        }

        const data = new Date(`${valor}T00:00:00Z`);

        if (
            Number.isNaN(data.getTime()) ||
            data.toISOString().slice(0, 10) !== valor
        ) {
            throw this.criarErro(
                "data_instalacao inválida."
            );
        }

        return valor;
    }

    // Valida o status.
    validarStatus(status) {
        if (!["Ativo", "Inativo"].includes(status)) {
            throw this.criarErro(
                "Status deve ser Ativo ou Inativo."
            );
        }

        return status;
    }

    // Verifica se a hierarquia está ativa.
    async validarHierarquiaAtiva(idSetor) {
        const setor =
            await equipamentoRepository.buscarSetorPorId(idSetor);

        if (!setor) {
            throw this.criarErro(
                "Setor não encontrado.",
                404
            );
        }

        if (
            setor.status !== "Ativo" ||
            setor.status_local !== "Ativo" ||
            setor.status_empresa !== "Ativa"
        ) {
            throw this.criarErro(
                "O setor, local e empresa devem estar ativos."
            );
        }

        return setor;
    }

    // ======================================
    // VALIDAR DADOS DO EQUIPAMENTO
    // ======================================
    async validarDados(dados, idAtual = null) {
        if (
            !dados ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            throw this.criarErro(
                "Informe os dados do equipamento."
            );
        }

        const id_setor = this.validarId(
            dados.id_setor,
            "ID do setor"
        );

        const codigo = this.textoObrigatorio(
            dados.codigo,
            "Código",
            20
        );

        const nome = this.textoObrigatorio(
            dados.nome,
            "Nome",
            100
        );

        const status = this.validarStatus(
            dados.status ?? "Ativo"
        );

        // Confirma a existência do setor.
        const setor =
            await equipamentoRepository.buscarSetorPorId(id_setor);

        if (!setor) {
            throw this.criarErro(
                "Setor não encontrado.",
                404
            );
        }

        // Impede equipamento ativo em uma
        // hierarquia inativa.
        if (status === "Ativo") {
            await this.validarHierarquiaAtiva(id_setor);
        }

        // Verifica se outro equipamento já
        // utiliza o código informado.
        const existente =
            await equipamentoRepository.buscarPorCodigo(
                codigo,
                idAtual
            );

        if (existente) {
            throw this.criarErro(
                "Já existe um equipamento com este código.",
                409
            );
        }

        return {
            id_setor,
            codigo,
            nome,

            tipo_equipamento: this.textoOpcional(
                dados.tipo_equipamento,
                "Tipo de equipamento",
                100
            ),

            fabricante: this.textoOpcional(
                dados.fabricante,
                "Fabricante",
                100
            ),

            modelo: this.textoOpcional(
                dados.modelo,
                "Modelo",
                100
            ),

            numero_serie: this.textoOpcional(
                dados.numero_serie,
                "Número de série",
                50
            ),

            potencia_nominal: this.numeroOpcional(
                dados.potencia_nominal,
                "Potência nominal"
            ),

            tensao_nominal: this.numeroOpcional(
                dados.tensao_nominal,
                "Tensão nominal"
            ),

            data_instalacao: this.dataOpcional(
                dados.data_instalacao
            ),

            status
        };
    }

    // ======================================
    // CONSULTAS
    // ======================================
    async listarTodos() {
        return equipamentoRepository.listarTodos();
    }

    async buscarPorId(id) {
        const idValidado = this.validarId(id);

        const equipamento =
            await equipamentoRepository.buscarPorId(idValidado);

        if (!equipamento) {
            throw this.criarErro(
                "Equipamento não encontrado.",
                404
            );
        }

        return equipamento;
    }

    async listarPorSetor(idSetor) {
        const idValidado = this.validarId(
            idSetor,
            "ID do setor"
        );

        const setor =
            await equipamentoRepository.buscarSetorPorId(
                idValidado
            );

        if (!setor) {
            throw this.criarErro(
                "Setor não encontrado.",
                404
            );
        }

        return equipamentoRepository.listarPorSetor(
            idValidado
        );
    }

    // ======================================
    // CADASTRO
    // ======================================
    async criar(dados) {
        const equipamento = await this.validarDados(dados);

        try {
            return await equipamentoRepository.criar(
                equipamento
            );
        } catch (erro) {
            if (erro.code === "ER_DUP_ENTRY") {
                throw this.criarErro(
                    "Já existe um equipamento com este código.",
                    409
                );
            }

            throw erro;
        }
    }

    // ======================================
    // ATUALIZAÇÃO
    // ======================================
    async atualizar(id, dados) {
        const idValidado = this.validarId(id);

        await this.buscarPorId(idValidado);

        const equipamento = await this.validarDados(
            dados,
            idValidado
        );

        try {
            await equipamentoRepository.atualizar(
                idValidado,
                equipamento
            );
        } catch (erro) {
            if (erro.code === "ER_DUP_ENTRY") {
                throw this.criarErro(
                    "Já existe um equipamento com este código.",
                    409
                );
            }

            throw erro;
        }

        return this.buscarPorId(idValidado);
    }

    // ======================================
    // ATUALIZAÇÃO DE STATUS
    // ======================================
    async atualizarStatus(id, status) {
        const idValidado = this.validarId(id);

        const equipamento = await this.buscarPorId(
            idValidado
        );

        const statusValidado = this.validarStatus(
            status
        );

        // Para ativar o equipamento, todos
        // os níveis superiores devem estar ativos.
        if (statusValidado === "Ativo") {
            await this.validarHierarquiaAtiva(
                equipamento.id_setor
            );
        }

        await equipamentoRepository.atualizarStatus(
            idValidado,
            statusValidado
        );

        return this.buscarPorId(idValidado);
    }
}

export default new EquipamentoService();
