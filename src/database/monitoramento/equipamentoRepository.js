
import database from "../../config/database.js";

// ==========================================
// REPOSITORY - EQUIPAMENTOS
// ==========================================
// Responsável pelas consultas SQL relacionadas
// aos equipamentos industriais do Watt Vision.

class EquipamentoRepository {

    // Lista os equipamentos e os dados associados.
    async listarTodos() {
        const [equipamentos] = await database.query(`
            SELECT
                e.*,
                s.nome AS setor,
                te.nome AS tipo_equipamento,
                se.nome AS status_equipamento,
                f.nome AS fabricante
            FROM tbl_equipamento e
            INNER JOIN tbl_setor s
                ON e.id_setor = s.id
            INNER JOIN tbl_tipo_equipamento te
                ON e.id_tipo_equipamento = te.id
            INNER JOIN tbl_status_equipamento se
                ON e.id_status_equipamento = se.id
            LEFT JOIN tbl_fabricante f
                ON e.id_fabricante = f.id
            ORDER BY e.id DESC
        `);

        return equipamentos;
    }

    // Consulta um equipamento pelo seu ID.
    async buscarPorId(id) {
        const [equipamentos] = await database.query(
            `
            SELECT *
            FROM tbl_equipamento
            WHERE id = ?
            `,
            [id]
        );

        return equipamentos[0] ?? null;
    }

    // Lista equipamentos pertencentes a um setor.
    async listarPorSetor(idSetor) {
        const [equipamentos] = await database.query(
            `
            SELECT *
            FROM tbl_equipamento
            WHERE id_setor = ?
            ORDER BY nome
            `,
            [idSetor]
        );

        return equipamentos;
    }
}

export default new EquipamentoRepository();
