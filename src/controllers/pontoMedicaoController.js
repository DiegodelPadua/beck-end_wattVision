
import pontoMedicaoService from "../services/pontoMedicaoService.js";

// ==========================================
// CONTROLLER - PONTOS DE MEDIÇÃO
// ==========================================
// Recebe requisições HTTP, chama o Service
// e devolve respostas padronizadas em JSON.

class PontoMedicaoController {

    // ======================================
    // TRATAMENTO PADRONIZADO DE ERROS
    // ======================================
    tratarErro(erro, res) {
        console.error("[PONTO DE MEDIÇÃO]", erro);

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
                    : "Erro interno ao processar o ponto de medição."
        });
    }

    // ======================================
    // GET /api/pontos-medicao
    // ======================================
    async listarTodos(req, res) {
        try {
            const pontos =
                await pontoMedicaoService.listarTodos();

            return res.status(200).json({
                sucesso: true,
                quantidade: pontos.length,
                dados: pontos
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // GET /api/pontos-medicao/:id
    // ======================================
    async buscarPorId(req, res) {
        try {
            const ponto =
                await pontoMedicaoService.buscarPorId(
                    req.params.id
                );

            return res.status(200).json({
                sucesso: true,
                dados: ponto
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // GET /api/pontos-medicao/dispositivo/:idDispositivo
    // ======================================
    async listarPorDispositivo(req, res) {
        try {
            const pontos =
                await pontoMedicaoService.listarPorDispositivo(
                    req.params.idDispositivo
                );

            return res.status(200).json({
                sucesso: true,
                quantidade: pontos.length,
                dados: pontos
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // POST /api/pontos-medicao
    // ======================================
    async criar(req, res) {
        try {
            const id = await pontoMedicaoService.criar(
                req.body
            );

            return res.status(201).json({
                sucesso: true,
                mensagem: "Ponto de medição cadastrado com sucesso.",
                id_ponto_medicao: id
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // PUT /api/pontos-medicao/:id
    // ======================================
    async atualizar(req, res) {
        try {
            const ponto =
                await pontoMedicaoService.atualizar(
                    req.params.id,
                    req.body
                );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Ponto de medição atualizado com sucesso.",
                dados: ponto
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // PATCH /api/pontos-medicao/:id/status
    // ======================================
    async atualizarStatus(req, res) {
        try {
            const ponto =
                await pontoMedicaoService.atualizarStatus(
                    req.params.id,
                    req.body?.status
                );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Status do ponto de medição atualizado com sucesso.",
                dados: ponto
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }
}

export default new PontoMedicaoController();
