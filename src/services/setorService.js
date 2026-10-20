
import setorRepository from "../database/monitoramento/setorRepository.js";

// ==========================================
// SERVICE - SETORES
// ==========================================
// Valida os dados e aplica as regras
// de negócio dos setores.

class SetorService {

    // Cria erros com códigos HTTP.
    criarErro(mensagem, status = 400) {
        const erro = new Error(mensagem);
        erro.status = status;
        return erro;
    }

    // Valida IDs recebidos nas requisições.
    validarId(valor) {
        const id = Number(valor);

        if (!Number.isSafeInteger(id) || id <= 0) {
            throw this.criarErro("Identificador inválido.");
        }

        return id;
    }

    // Valida os campos do setor.
    async validarDados(dados) {
        if (
            typeof dados?.nome !== "string" ||
            !dados.nome.trim() ||
            dados.nome.trim().length > 100
        ) {
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

        const idLocal = this.validarId(dados.id_local);

        // Verifica se o setor está associado
        // a um local realmente cadastrado.
        const local =
            await setorRepository.buscarLocalPorId(idLocal);

        if (!local) {
            throw this.criarErro("Local não encontrado.", 404);
        }

        // Não permite criar ou mover um setor ativo
        // para um local que esteja inativo.
        if (status === "ATIVO" && local.status !== "ATIVO") {
            throw this.criarErro(
                "Não é possível manter um setor ativo em um local inativo."
            );
        }

        return {
            nome: dados.nome.trim(),
            descricao,
            status,
            id_local: idLocal
        };
    }

    // Lista todos os setores.
    async listarTodos() {
        return setorRepository.listarTodos();
    }

    // Busca um setor pelo ID.
    async buscarPorId(id) {
        const setor =
            await setorRepository.buscarPorId(this.validarId(id));

        if (!setor) {
            throw this.criarErro("Setor não encontrado.", 404);
        }

        return setor;
    }

    // Lista os setores de determinado local.
    async listarPorLocal(idLocal) {
        const id = this.validarId(idLocal);

        const local = await setorRepository.buscarLocalPorId(id);

        if (!local) {
            throw this.criarErro("Local não encontrado.", 404);
        }

        return setorRepository.listarPorLocal(id);
    }

    // Cadastra um novo setor.
    async criar(dados) {
        const setor = await this.validarDados(dados);
        return setorRepository.criar(setor);
    }

    // Atualiza os dados de um setor.
    async atualizar(id, dados) {
        const idValidado = this.validarId(id);

        await this.buscarPorId(idValidado);

        const setor = await this.validarDados(dados);

        await setorRepository.atualizar(idValidado, setor);

        return setorRepository.buscarPorId(idValidado);
    }

    // Altera o status de um setor.
    async atualizarStatus(id, status) {
        const idValidado = this.validarId(id);

        const setor = await this.buscarPorId(idValidado);

        if (!["ATIVO", "INATIVO"].includes(status)) {
            throw this.criarErro("Status inválido.");
        }

        // Para reativar, o local também deve estar ativo.
        if (status === "ATIVO") {
            const local =
                await setorRepository.buscarLocalPorId(
                    setor.id_local
                );

            if (local.status !== "ATIVO") {
                throw this.criarErro(
                    "Ative o local antes de reativar o setor."
                );
            }
        }

        await setorRepository.atualizarStatus(
            idValidado,
            status
        );

        return setorRepository.buscarPorId(idValidado);
    }
}

export default new SetorService();
