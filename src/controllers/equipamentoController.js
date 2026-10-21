
import equipamentoService from "../services/equipamentoService.js";

// ==========================================
// CONTROLLER - EQUIPAMENTOS
// ==========================================
// Recebe as requisições HTTP e devolve JSON.

class EquipamentoController {

    // GET /api/equipamentos
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
            console.error("Erro ao listar equipamentos:", erro);

            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao consultar equipamentos."
            });
        }
    }

    // GET /api/equipamentos/setor/:idSetor
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
            return res.status(400).json({
                sucesso: false,
                mensagem: erro.message
            });
        }
    }

    // GET /api/equipamentos/:id
    async buscarPorId(req, res) {
        try {
            const equipamento =
                await equipamentoService.buscarPorId(
                    req.params.id
                );

            if (!equipamento) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Equipamento não encontrado."
                });
            }

            return res.status(200).json({
                sucesso: true,
                dados: equipamento
            });
        } catch (erro) {
            return res.status(400).json({
                sucesso: false,
                mensagem: erro.message
            });
        }
    }
}

export default new EquipamentoController();
