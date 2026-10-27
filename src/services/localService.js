
import localRepository from "../database/monitoramento/localRepository.js";

// ==========================================
// SERVICE - LOCAIS
// ==========================================
// Contém as validações e regras de negócio
// para o cadastro e gerenciamento de locais.

class LocalService {

    // Cria erros com código HTTP definido.
    criarErro(mensagem, status = 400) {
        const erro = new Error(mensagem);
        erro.status = status;
        return erro;
    }

    // Valida um identificador positivo.
    validarId(valor) {
        const id = Number(valor);

        if (
            valor === null ||
            valor === undefined ||
            typeof valor === "boolean" ||
            (typeof valor === "string" && !valor.trim()) ||
            !Number.isSafeInteger(id) ||
            id <= 0
        ) {
            throw this.criarErro("Identificador inválido.");
        }

        return id;
    }

    // Valida os valores permitidos para status.
    validarStatus(status) {
        if (!["Ativo", "Inativo"].includes(status)) {
            throw this.criarErro(
                "O status deve ser Ativo ou Inativo."
            );
        }

        return status;
    }

    // Valida um campo de texto obrigatório.
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

    // Valida um campo de texto opcional.
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

    // Valida e prepara os dados de um local.
    async validarDados(dados, idIgnorar = null) {
        if (
            !dados ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            throw this.criarErro(
                "Os dados do local são obrigatórios."
            );
        }

        // Código obrigatório e único.
        const codigo = this.validarTextoObrigatorio(
            dados.codigo,
            "O código",
            20
        );

        // Nome obrigatório.
        const nome = this.validarTextoObrigatorio(
            dados.nome,
            "O nome",
            100
        );

        // Campos opcionais.
        const endereco = this.validarTextoOpcional(
            dados.endereco,
            "O endereço",
            255
        );

        const responsavel = this.validarTextoOpcional(
            dados.responsavel,
            "O responsável",
            100
        );

        const descricao = this.validarTextoOpcional(
            dados.descricao,
            "A descrição",
            255
        );

        // Status do local.
        const status = this.validarStatus(
            dados.status ?? "Ativo"
        );

        // Validação da empresa.
        const idEmpresa = this.validarId(
            dados.id_empresa
        );

        const empresa =
            await localRepository.buscarEmpresaPorId(idEmpresa);

        if (!empresa) {
            throw this.criarErro(
                "Empresa não encontrada.",
                404
            );
        }

        // Verifica duplicidade de código.
        const localExistente =
            await localRepository.buscarPorCodigo(
                codigo,
                idIgnorar
            );

        if (localExistente) {
            throw this.criarErro(
                "Já existe um local cadastrado com este código.",
                409
            );
        }

        return {
            id_empresa: idEmpresa,
            codigo,
            nome,
            endereco,
            responsavel,
            descricao,
            status
        };
    }

    // Lista todos os locais.
    async listarTodos() {
        return localRepository.listarTodos();
    }

    // Consulta um local específico.
    async buscarPorId(id) {
        const idValidado = this.validarId(id);

        const local =
            await localRepository.buscarPorId(idValidado);

        if (!local) {
            throw this.criarErro(
                "Local não encontrado.",
                404
            );
        }

        return local;
    }

    // Cadastra um novo local.
    async criar(dados) {
        const local = await this.validarDados(dados);

        try {
            return await localRepository.criar(local);
        } catch (erro) {
            if (erro.code === "ER_DUP_ENTRY") {
                throw this.criarErro(
                    "Já existe um local cadastrado com este código.",
                    409
                );
            }

            throw erro;
        }
    }

    // Atualiza um local existente.
    async atualizar(id, dados) {
        const idValidado = this.validarId(id);

        await this.buscarPorId(idValidado);

        const local = await this.validarDados(
            dados,
            idValidado
        );

        try {
            await localRepository.atualizar(
                idValidado,
                local
            );
        } catch (erro) {
            if (erro.code === "ER_DUP_ENTRY") {
                throw this.criarErro(
                    "Já existe um local cadastrado com este código.",
                    409
                );
            }

            throw erro;
        }

        return localRepository.buscarPorId(idValidado);
    }

    // Ativa ou desativa um local.
    async atualizarStatus(id, status) {
        const idValidado = this.validarId(id);

        await this.buscarPorId(idValidado);

        const statusValidado = this.validarStatus(
            status
        );

        await localRepository.atualizarStatus(
            idValidado,
            statusValidado
        );

        return localRepository.buscarPorId(idValidado);
    }
}

export default new LocalService();
