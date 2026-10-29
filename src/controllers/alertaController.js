
import alertaService from "../services/alertaService.js";

// ==========================================
// WATT VISION - CONTROLLER DE ALERTAS
// ==========================================

class AlertaController {

    // ======================================
    // TRATAMENTO PADRONIZADO DE ERROS
    // ======================================
    tratarErro(erro, res, contexto) {
        console.error(`[ALERTAS] ${contexto}:`, erro);

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
                    ? "Erro interno ao processar o alerta."
                    : erro.message
        });
    }

    // ======================================
    // GET - LISTAR TODOS OS ALERTAS
    // ======================================
    async listarTodos(req, res) {
        try {
            const alertas = await alertaService.listarTodos();

            return res.status(200).json({
                sucesso: true,
                quantidade: alertas.length,
                dados: alertas
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao listar alertas"
            );
        }
    }

    // ======================================
    // GET - LISTAR ALERTAS ATIVOS
    // ======================================
    async listarAtivos(req, res) {
        try {
            const alertas = await alertaService.listarAtivos();

            return res.status(200).json({
                sucesso: true,
                quantidade: alertas.length,
                dados: alertas
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao listar alertas ativos"
            );
        }
    }

    // ======================================
    // GET - BUSCAR ALERTA POR ID
    // ======================================
    async buscarPorId(req, res) {
        try {
            const alerta = await alertaService.buscarPorId(
                req.params.id
            );

            return res.status(200).json({
                sucesso: true,
                dados: alerta
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao buscar alerta"
            );
        }
    }

    // ======================================
    // GET - LISTAR ALERTAS POR DISPOSITIVO
    // ======================================
    async listarPorDispositivo(req, res) {
        try {
            const alertas = await alertaService.listarPorDispositivo(
                req.params.idDispositivo
            );

            return res.status(200).json({
                sucesso: true,
                quantidade: alertas.length,
                dados: alertas
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao listar alertas do dispositivo"
            );
        }
    }

    // ======================================
    // POST - REGISTRAR ALERTA
    // ======================================
    async criar(req, res) {
        try {
            const alerta = await alertaService.criar(
                req.body
            );

            return res.status(201).json({
                sucesso: true,
                mensagem: "Alerta registrado com sucesso.",
                dados: alerta
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao registrar alerta"
            );
        }
    }

    // ======================================
    // PATCH - RECONHECER ALERTA
    // ======================================
    async reconhecer(req, res) {
        try {
            const alerta = await alertaService.reconhecer(
                req.params.id,
                req.body?.id_usuario
            );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Alerta reconhecido com sucesso.",
                dados: alerta
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao reconhecer alerta"
            );
        }
    }
}

export default new AlertaController();
