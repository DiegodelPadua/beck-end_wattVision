
import limiteService from "../services/limiteService.js";

// ==========================================
// WATT VISION - CONTROLLER DE LIMITES
// ==========================================

class LimiteController {

    // ======================================
    // TRATAMENTO PADRONIZADO DE ERROS
    // ======================================
    tratarErro(erro, res, contexto) {
        console.error(`[LIMITES] ${contexto}:`, erro);

        const status =
            Number.isInteger(erro.status) &&
            erro.status >= 400 &&
            erro.status <= 599
                ? erro.status
                : 500;

        return res.status(status).json({
            sucesso: false,
            mensagem:
                status === 500
                    ? "Erro interno ao processar o limite."
                    : erro.message
        });
    }

    // ======================================
    // GET - LISTAR TODOS OS LIMITES
    // ======================================
    async listarTodos(req, res) {
        try {
            const limites = await limiteService.listarTodos();

            return res.status(200).json({
                sucesso: true,
                quantidade: limites.length,
                dados: limites
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao listar limites"
            );
        }
    }

    // ======================================
    // GET - LISTAR LIMITES ATIVOS
    // ======================================
    async listarAtivos(req, res) {
        try {
            const limites = await limiteService.listarAtivos();

            return res.status(200).json({
                sucesso: true,
                quantidade: limites.length,
                dados: limites
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao listar limites ativos"
            );
        }
    }

    // ======================================
    // GET - BUSCAR LIMITE POR ID
    // ======================================
    async buscarPorId(req, res) {
        try {
            const limite = await limiteService.buscarPorId(
                req.params.id
            );

            return res.status(200).json({
                sucesso: true,
                dados: limite
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao buscar limite"
            );
        }
    }

    // ======================================
    // POST - CADASTRAR LIMITE
    // ======================================
    async criar(req, res) {
        try {
            const limite = await limiteService.criar(
                req.body
            );

            return res.status(201).json({
                sucesso: true,
                mensagem: "Limite cadastrado com sucesso.",
                dados: limite
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao cadastrar limite"
            );
        }
    }

    // ======================================
    // PUT - ATUALIZAR LIMITE
    // ======================================
    async atualizar(req, res) {
        try {
            const limite = await limiteService.atualizar(
                req.params.id,
                req.body
            );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Limite atualizado com sucesso.",
                dados: limite
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao atualizar limite"
            );
        }
    }

    // ======================================
    // PATCH - ATIVAR OU DESATIVAR LIMITE
    // ======================================
    async atualizarStatus(req, res) {
        try {
            const limite = await limiteService.atualizarStatus(
                req.params.id,
                req.body?.ativa
            );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Status do limite atualizado com sucesso.",
                dados: limite
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao alterar status do limite"
            );
        }
    }
}

export default new LimiteController();
