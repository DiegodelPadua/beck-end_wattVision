
import localService from "../services/localService.js";

// ==========================================
// CONTROLLER - LOCAIS
// ==========================================
// Recebe as requisições HTTP e devolve JSON.

class LocalController {

    // Centraliza o tratamento de erros.
    tratarErro(erro, res) {
        console.error("[LOCAL]", erro);

        return res.status(erro.status || 500).json({
            sucesso: false,
            mensagem: erro.status
                ? erro.message
                : "Erro interno ao processar o local."
        });
    }

    // GET /api/locais
    async listarTodos(req, res) {
        try {
            const locais = await localService.listarTodos();

            return res.status(200).json({
                sucesso: true,
                quantidade: locais.length,
                dados: locais
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // GET /api/locais/:id
    async buscarPorId(req, res) {
        try {
            const local =
                await localService.buscarPorId(req.params.id);

            return res.status(200).json({
                sucesso: true,
                dados: local
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // POST /api/locais
    async criar(req, res) {
        try {
            const id = await localService.criar(req.body);

            return res.status(201).json({
                sucesso: true,
                mensagem: "Local cadastrado com sucesso.",
                id_local: id
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // PUT /api/locais/:id
    async atualizar(req, res) {
        try {
            const local = await localService.atualizar(
                req.params.id,
                req.body
            );

            return res.status(200).json({
                sucesso: true,
                dados: local
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // PATCH /api/locais/:id/status
    async atualizarStatus(req, res) {
        try {
            const local = await localService.atualizarStatus(
                req.params.id,
                req.body?.status
            );

            return res.status(200).json({
                sucesso: true,
                dados: local
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }
}

export default new LocalController();
