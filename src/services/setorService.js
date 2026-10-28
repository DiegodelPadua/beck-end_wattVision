
import setorRepository from "../database/monitoramento/setorRepository.js";

// ==========================================
// SERVICE - SETORES
// ==========================================
// Responsável pelas validações e regras
// de negócio do gerenciamento de setores.

class SetorService {

    // Cria erros com códigos HTTP definidos.
    criarErro(mensagem, status = 400) {
        const erro = new Error(mensagem);
        erro.status = status;
        return erro;
    }

    // Valida identificadores positivos.
    validarId(valor) {
        if (
            valor === null ||
            valor === undefined ||
            typeof valor === "boolean" ||
            (typeof valor === "string" && !valor.trim())
        ) {
            throw this.criarErro("Identificador inválido.");
        }

        const id = Number(valor);

        if (!Number.isSafeInteger(id) || id <= 0) {
            throw this.criarErro("Identificador inválido.");
        }

        return id;
    }

    // Valida campos obrigatórios.
    validarTextoObrigatorio(valor, campo, limite) {
        if (
            typeof valor !== "string" ||
            !valor.trim() ||
            valor.trim().length > limite
        ) {
            throw this.criarErro(
                `${campo} deve conter entre 1 e ${limite} caracteres.`
            );
        }

        return valor.trim();
    }

    // Valida campos opcionais.
    validarTextoOpcional(valor, campo, limite) {
        if (valor === null || valor === undefined) {
            return null;
        }

        if (
            typeof valor !== "string" ||
            valor.trim().length > limite
        ) {
            throw this.criarErro(
                `${campo} deve conter no máximo ${limite} caracteres.`
            );
        }

        return valor.trim() || null;
    }

    // Valida o status do setor.
    validarStatus(status) {
        if (!["Ativo", "Inativo"].includes(status)) {
            throw this.criarErro(
                "O status deve ser Ativo ou Inativo."
            );
        }

        return status;
    }

    // ======================================
    // VALIDAÇÃO DOS DADOS DO SETOR
    // ======================================
    async validarDados(dados, idAtual = null) {

        if (
            !dados ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            throw this.criarErro(
                "Os dados do setor são obrigatórios."
            );
        }

        // CÓDIGO
        const codigo = this.validarTextoObrigatorio(
            dados.codigo,
            "O código",
            20
        );

        // NOME
        const nome = this.validarTextoObrigatorio(
            dados.nome,
            "O nome",
            100
        );

        // RESPONSÁVEL
        const responsavel = this.validarTextoOpcional(
            dados.responsavel,
            "O responsável",
            100
        );

        // DESCRIÇÃO
        const descricao = this.validarTextoOpcional(
            dados.descricao,
            "A descrição",
            255
        );

        // STATUS
        const status = this.validarStatus(
            dados.status ?? "Ativo"
        );

        // LOCAL
        const idLocal = this.validarId(
            dados.id_local
        );

        const local = await setorRepository.buscarLocalPorId(
            idLocal
        );

        if (!local) {
            throw this.criarErro(
                "Local não encontrado.",
                404
            );
        }

        // Impede setor ativo em local inativo.
        if (
            status === "Ativo" &&
            local.status !== "Ativo"
        ) {
            throw this.criarErro(
                "Não é possível manter um setor ativo em um local inativo."
            );
        }

        // CÓDIGO ÚNICO
        const existente = await setorRepository.buscarPorCodigo(
            codigo,
            idAtual
        );

        if (existente) {
            throw this.criarErro(
                `Já existe um setor com o código "${codigo}".`,
                409
            );
        }

        return {
            id_local: idLocal,
            codigo,
            nome,
            responsavel,
            descricao,
            status
        };
    }

    // ======================================
    // GET - LISTAR TODOS
    // ======================================
    async listarTodos() {
        return setorRepository.listarTodos();
    }

    // ======================================
    // GET - BUSCAR POR ID
    // ======================================
    async buscarPorId(id) {
        const idValidado = this.validarId(id);

        const setor = await setorRepository.buscarPorId(
            idValidado
        );

        if (!setor) {
            throw this.criarErro(
                "Setor não encontrado.",
                404
            );
        }

        return setor;
    }

    // ======================================
    // GET - LISTAR POR LOCAL
    // ======================================
    async listarPorLocal(idLocal) {
        const idValidado = this.validarId(idLocal);

        const local = await setorRepository.buscarLocalPorId(
            idValidado
        );

        if (!local) {
            throw this.criarErro(
                "Local não encontrado.",
                404
            );
        }

        return setorRepository.listarPorLocal(
            idValidado
        );
    }

    // ======================================
    // POST - CADASTRAR SETOR
    // ======================================
    async criar(dados) {
        const setor = await this.validarDados(dados);

        try {
            return await setorRepository.criar(setor);
        } catch (erro) {
            if (erro.code === "ER_DUP_ENTRY") {
                throw this.criarErro(
                    "Já existe um setor cadastrado com este código.",
                    409
                );
            }

            throw erro;
        }
    }

    // ======================================
    // PUT - ATUALIZAR SETOR
    // ======================================
    async atualizar(id, dados) {
        const idValidado = this.validarId(id);

        await this.buscarPorId(idValidado);

        const setor = await this.validarDados(
            dados,
            idValidado
        );

        try {
            await setorRepository.atualizar(
                idValidado,
                setor
            );
        } catch (erro) {
            if (erro.code === "ER_DUP_ENTRY") {
                throw this.criarErro(
                    "Já existe um setor cadastrado com este código.",
                    409
                );
            }

            throw erro;
        }

        return setorRepository.buscarPorId(idValidado);
    }

    // ======================================
    // PATCH - ATUALIZAR STATUS
    // ======================================
    async atualizarStatus(id, status) {
        const idValidado = this.validarId(id);

        const setor = await this.buscarPorId(
            idValidado
        );

        const statusValidado = this.validarStatus(
            status
        );

        // Para ativar um setor, o local
        // ao qual pertence precisa estar ativo.
        if (statusValidado === "Ativo") {
            const local =
                await setorRepository.buscarLocalPorId(
                    setor.id_local
                );

            if (!local || local.status !== "Ativo") {
                throw this.criarErro(
                    "Ative o local antes de reativar o setor."
                );
            }
        }

        await setorRepository.atualizarStatus(
            idValidado,
            statusValidado
        );

        return setorRepository.buscarPorId(idValidado);
    }
}

export default new SetorService();
