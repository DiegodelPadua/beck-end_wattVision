
import equipamentoRepository from
    "../database/monitoramento/equipamentoRepository.js";

// ==========================================
// SERVICE - EQUIPAMENTOS
// ==========================================
// Centraliza as regras de negócio.

class EquipamentoService {

    // Retorna todos os equipamentos.
    async listarTodos() {
        return await equipamentoRepository.listarTodos();
    }

    // Busca um equipamento por ID.
    async buscarPorId(id) {
        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            throw new Error("ID do equipamento inválido.");
        }

        return await equipamentoRepository.buscarPorId(id);
    }

    // Busca equipamentos de determinado setor.
    async listarPorSetor(idSetor) {
        if (!Number.isInteger(Number(idSetor)) || Number(idSetor) <= 0) {
            throw new Error("ID do setor inválido.");
        }

        return await equipamentoRepository.listarPorSetor(idSetor);
    }
}

export default new EquipamentoService();
