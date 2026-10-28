
import setorService from "../services/setorService.js";

// ==========================================
// CONTROLLER - SETORES
// ==========================================
// Recebe as requisições HTTP, encaminha
// ao Service e devolve respostas JSON.

class SetorController {

    // Centraliza o tratamento de erros.
    tratarErro(erro, res) {
        console.error("[SETOR]", erro);

        const status =
            Number.isInteger(erro.status) &&
            erro.status >= 400 &&
            erro.status <= 599
                ? erro.status
                : 500;

        return res.status(status).json({
            sucesso: false,
            mensagem:
                status !== 500
                    ? erro.message
                    : "Erro interno ao processar o setor."
        });
    }

    // ======================================
    // GET /api/setores
    // ======================================
    async listarTodos(req, res) {
        try {
            const setores = await setorService.listarTodos();

            return res.status(200).json({
                sucesso: true,
                quantidade: setores.length,
                dados: setores
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // GET /api/setores/:id
    // ======================================
    async buscarPorId(req, res) {
        try {
            const setor = await setorService.buscarPorId(
                req.params.id
            );

            return res.status(200).json({
                sucesso: true,
                dados: setor
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // GET /api/setores/local/:idLocal
    // ======================================
    async listarPorLocal(req, res) {
        try {
            const setores = await setorService.listarPorLocal(
                req.params.idLocal
            );

            return res.status(200).json({
                sucesso: true,
                quantidade: setores.length,
                dados: setores
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // POST /api/setores
    // ======================================
    async criar(req, res) {
        try {
            const id = await setorService.criar(
                req.body
            );

            return res.status(201).json({
                sucesso: true,
                mensagem: "Setor cadastrado com sucesso.",
                id_setor: id
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // PUT /api/setores/:id
    // ======================================
    async atualizar(req, res) {
        try {
            const setor = await setorService.atualizar(
                req.params.id,
                req.body
            );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Setor atualizado com sucesso.",
                dados: setor
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // PATCH /api/setores/:id/status
    // ======================================
    async atualizarStatus(req, res) {
        try {
            const setor = await setorService.atualizarStatus(
                req.params.id,
                req.body?.status
            );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Status do setor atualizado com sucesso.",
                dados: setor
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }
}

export default new SetorController();
