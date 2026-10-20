
import localRepository from "../database/monitoramento/localRepository.js";

// ==========================================
// SERVICE - LOCAIS
// ==========================================
// Contém as validações e regras de negócio.

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

        if (!Number.isSafeInteger(id) || id <= 0) {
            throw this.criarErro("Identificador inválido.");
        }

        return id;
    }

    // Valida e prepara os dados de um local.
    async validarDados(dados) {
        const nome = dados?.nome?.trim();

        if (!nome || nome.length > 100) {
            throw this.criarErro(
                "O nome deve conter entre 1 e 100 caracteres."
            );
        }

        const descricao = dados.descricao ?? null;

        if (
            descricao !== null &&
            (typeof descricao !== "string" ||
             descricao.length > 255)
        ) {
            throw this.criarErro("Descrição inválida.");
        }

        const status = dados.status ?? "ATIVO";

        if (!["ATIVO", "INATIVO"].includes(status)) {
            throw this.criarErro(
                "O status deve ser ATIVO ou INATIVO."
            );
        }

        const idEmpresa = this.validarId(dados.id_empresa);

        // Impede associar o local a uma empresa inexistente.
        const empresa =
            await localRepository.buscarEmpresaPorId(idEmpresa);

        if (!empresa) {
            throw this.criarErro(
                "Empresa não encontrada.",
                404
            );
        }

        return {
            nome,
            descricao,
            status,
            id_empresa: idEmpresa
        };
    }

    // Lista todos os locais.
    async listarTodos() {
        return localRepository.listarTodos();
    }

    // Consulta um local específico.
    async buscarPorId(id) {
        const local =
            await localRepository.buscarPorId(this.validarId(id));

        if (!local) {
            throw this.criarErro("Local não encontrado.", 404);
        }

        return local;
    }

    // Cadastra um novo local.
    async criar(dados) {
        const local = await this.validarDados(dados);
        return localRepository.criar(local);
    }

    // Atualiza um local existente.
    async atualizar(id, dados) {
        const idValidado = this.validarId(id);

        await this.buscarPorId(idValidado);

        const local = await this.validarDados(dados);

        await localRepository.atualizar(idValidado, local);

        return localRepository.buscarPorId(idValidado);
    }

    // Ativa ou desativa um local.
    async atualizarStatus(id, status) {
        const idValidado = this.validarId(id);

        await this.buscarPorId(idValidado);

        if (!["ATIVO", "INATIVO"].includes(status)) {
            throw this.criarErro("Status inválido.");
        }

        await localRepository.atualizarStatus(
            idValidado,
            status
        );

        return localRepository.buscarPorId(idValidado);
    }
}

export default new LocalService();
