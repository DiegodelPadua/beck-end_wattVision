
import equipamentoService from "../services/equipamentoService.js";

// ==========================================
// CONTROLLER - EQUIPAMENTOS
// ==========================================
// Recebe requisições HTTP, chama o Service
// e devolve respostas padronizadas em JSON.

class EquipamentoController {

    // ======================================
    // TRATAMENTO PADRONIZADO DE ERROS
    // ======================================
    tratarErro(erro, res) {
        console.error("[EQUIPAMENTO]", erro);

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
                    : "Erro interno ao processar o equipamento."
        });
    }

    // ======================================
    // GET /api/equipamentos
    // ======================================
    async listarTodos(req, res) {
        try {
            const equipamentos =
                await equipamentoService.listarTodos();

            return res.status(200).json({
                sucesso: true,
                quantidade: equipamentos.length,
                dados: equipamentos
            });

        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // GET /api/equipamentos/:id
    // ======================================
    async buscarPorId(req, res) {
        try {
            const equipamento =
                await equipamentoService.buscarPorId(
                    req.params.id
                );

            return res.status(200).json({
                sucesso: true,
                dados: equipamento
            });

        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // GET /api/equipamentos/setor/:idSetor
    // ======================================
    async listarPorSetor(req, res) {
        try {
            const equipamentos =
                await equipamentoService.listarPorSetor(
                    req.params.idSetor
                );

            return res.status(200).json({
                sucesso: true,
                quantidade: equipamentos.length,
                dados: equipamentos
            });

        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // POST /api/equipamentos
    // ======================================
    async criar(req, res) {
        try {
            const id = await equipamentoService.criar(
                req.body
            );

            return res.status(201).json({
                sucesso: true,
                mensagem: "Equipamento cadastrado com sucesso.",
                id_equipamento: id
            });

        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // PUT /api/equipamentos/:id
    // ======================================
    async atualizar(req, res) {
        try {
            const equipamento =
                await equipamentoService.atualizar(
                    req.params.id,
                    req.body
                );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Equipamento atualizado com sucesso.",
                dados: equipamento
            });

        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // PATCH /api/equipamentos/:id/status
    // ======================================
    async atualizarStatus(req, res) {
        try {
            const equipamento =
                await equipamentoService.atualizarStatus(
                    req.params.id,
                    req.body?.status
                );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Status do equipamento atualizado com sucesso.",
                dados: equipamento
            });

        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }
}

export default new EquipamentoController();
