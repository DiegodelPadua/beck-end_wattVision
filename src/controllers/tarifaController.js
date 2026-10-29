
import tarifaService from "../services/tarifaService.js";

// ==========================================
// WATT VISION - CONTROLLER DE TARIFAS
// ==========================================

class TarifaController {

    // ======================================
    // TRATAMENTO PADRONIZADO DE ERROS
    // ======================================
    tratarErro(erro, res, contexto) {
        console.error(`[TARIFAS] ${contexto}:`, erro);

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
                    ? "Erro interno ao processar a tarifa."
                    : erro.message
        });
    }

    // ======================================
    // GET - LISTAR TODAS AS TARIFAS
    // ======================================
    async listarTodas(req, res) {
        try {
            const tarifas = await tarifaService.listarTodas();

            return res.status(200).json({
                sucesso: true,
                quantidade: tarifas.length,
                dados: tarifas
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao listar tarifas"
            );
        }
    }

    // ======================================
    // GET - BUSCAR TARIFA POR ID
    // ======================================
    async buscarPorId(req, res) {
        try {
            const tarifa = await tarifaService.buscarPorId(
                req.params.id
            );

            return res.status(200).json({
                sucesso: true,
                dados: tarifa
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao buscar tarifa"
            );
        }
    }

    // ======================================
    // GET - LISTAR TARIFAS POR EMPRESA
    // ======================================
    async listarPorEmpresa(req, res) {
        try {
            const tarifas = await tarifaService.listarPorEmpresa(
                req.params.idEmpresa
            );

            return res.status(200).json({
                sucesso: true,
                quantidade: tarifas.length,
                dados: tarifas
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao listar tarifas da empresa"
            );
        }
    }

    // ======================================
    // POST - CADASTRAR TARIFA
    // ======================================
    async criar(req, res) {
        try {
            const tarifa = await tarifaService.criar(
                req.body
            );

            return res.status(201).json({
                sucesso: true,
                mensagem: "Tarifa cadastrada com sucesso.",
                dados: tarifa
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao cadastrar tarifa"
            );
        }
    }

    // ======================================
    // PUT - ATUALIZAR TARIFA
    // ======================================
    async atualizar(req, res) {
        try {
            const tarifa = await tarifaService.atualizar(
                req.params.id,
                req.body
            );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Tarifa atualizada com sucesso.",
                dados: tarifa
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao atualizar tarifa"
            );
        }
    }

    // ======================================
    // PATCH - ALTERAR STATUS
    // ======================================
    async atualizarStatus(req, res) {
        try {
            const tarifa = await tarifaService.atualizarStatus(
                req.params.id,
                req.body?.status
            );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Status da tarifa atualizado com sucesso.",
                dados: tarifa
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao atualizar status da tarifa"
            );
        }
    }
}

export default new TarifaController();
