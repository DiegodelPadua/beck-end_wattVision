
import empresaService from "../services/empresaService.js";

// ==========================================
// WATT VISION - CONTROLLER DE EMPRESAS
// ==========================================

class EmpresaController {

    // ======================================
    // TRATAMENTO PADRONIZADO DE ERROS
    // ======================================
    tratarErro(erro, res, contexto) {
        console.error(`[EMPRESAS] ${contexto}:`, erro);

        const status =
            Number.isInteger(erro.status) &&
            erro.status >= 400 &&
            erro.status <= 599
                ? erro.status
                : erro.code === "ER_DUP_ENTRY"
                    ? 409
                    : 500;

        return res.status(status).json({
            sucesso: false,
            mensagem:
                status === 500
                    ? "Erro interno ao processar a empresa."
                    : status === 409 && erro.code === "ER_DUP_ENTRY"
                        ? "Já existe uma empresa com esse CNPJ."
                        : erro.message
        });
    }

    // ======================================
    // GET /api/empresas
    // ======================================
    async listarTodas(req, res) {
        try {
            const empresas = await empresaService.listarTodas();

            return res.status(200).json({
                sucesso: true,
                quantidade: empresas.length,
                dados: empresas
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao listar empresas"
            );
        }
    }

    // ======================================
    // GET /api/empresas/:id
    // ======================================
    async buscarPorId(req, res) {
        try {
            const empresa = await empresaService.buscarPorId(
                req.params.id
            );

            return res.status(200).json({
                sucesso: true,
                dados: empresa
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao buscar empresa"
            );
        }
    }

    // ======================================
    // POST /api/empresas
    // ======================================
    async criar(req, res) {
        try {
            const empresa = await empresaService.criar(
                req.body
            );

            return res.status(201).json({
                sucesso: true,
                mensagem: "Empresa cadastrada com sucesso.",
                dados: empresa
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao cadastrar empresa"
            );
        }
    }

    // ======================================
    // PUT /api/empresas/:id
    // ======================================
    async atualizar(req, res) {
        try {
            const empresa = await empresaService.atualizar(
                req.params.id,
                req.body
            );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Empresa atualizada com sucesso.",
                dados: empresa
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao atualizar empresa"
            );
        }
    }

    // ======================================
    // PATCH /api/empresas/:id/status
    // ======================================
    async atualizarStatus(req, res) {
        try {
            const empresa = await empresaService.atualizarStatus(
                req.params.id,
                req.body?.status
            );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Status da empresa atualizado com sucesso.",
                dados: empresa
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao atualizar status da empresa"
            );
        }
    }
}

export default new EmpresaController();
