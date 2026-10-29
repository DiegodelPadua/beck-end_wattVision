
import database from "../../config/database.js";

// ==========================================
// WATT VISION - REPOSITORY DE LIMITES
// ==========================================

class LimiteRepository {

    // GET - LISTAR TODOS
    async listarTodos() {
        const [limites] = await database.query(`
            SELECT *
            FROM tbl_limite
            ORDER BY id DESC
        `);

        return limites;
    }

    // GET - BUSCAR POR ID
    async buscarPorId(id) {
        const [limites] = await database.query(
            `SELECT *
             FROM tbl_limite
             WHERE id = ?`,
            [id]
        );

        return limites[0] ?? null;
    }

    // GET - LISTAR LIMITES ATIVOS
    async listarAtivos() {
        const [limites] = await database.query(`
            SELECT *
            FROM tbl_limite
            WHERE ativa = 1
            ORDER BY id DESC
        `);

        return limites;
    }

    // POST - CADASTRAR LIMITE
    async criar(dados) {
        const [resultado] = await database.query(
            `INSERT INTO tbl_limite (
                descricao,
                grandeza,
                operador,
                valor,
                severidade,
                periodo_inicial,
                periodo_final,
                ativa,
                id_local,
                id_setor,
                id_equipamento
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                dados.descricao,
                dados.grandeza,
                dados.operador,
                dados.valor,
                dados.severidade,
                dados.periodo_inicial,
                dados.periodo_final,
                dados.ativa,
                dados.id_local,
                dados.id_setor,
                dados.id_equipamento
            ]
        );

        return resultado.insertId;
    }

    // PUT - ATUALIZAR LIMITE
    async atualizar(id, dados) {
        const [resultado] = await database.query(
            `UPDATE tbl_limite
             SET descricao = ?,
                 grandeza = ?,
                 operador = ?,
                 valor = ?,
                 severidade = ?,
                 periodo_inicial = ?,
                 periodo_final = ?,
                 ativa = ?,
                 id_local = ?,
                 id_setor = ?,
                 id_equipamento = ?
             WHERE id = ?`,
            [
                dados.descricao,
                dados.grandeza,
                dados.operador,
                dados.valor,
                dados.severidade,
                dados.periodo_inicial,
                dados.periodo_final,
                dados.ativa,
                dados.id_local,
                dados.id_setor,
                dados.id_equipamento,
                id
            ]
        );

        return resultado.affectedRows > 0;
    }

    // PATCH - ATIVAR OU DESATIVAR
    async atualizarStatus(id, ativa) {
        const [resultado] = await database.query(
            `UPDATE tbl_limite
             SET ativa = ?
             WHERE id = ?`,
            [ativa, id]
        );

        return resultado.affectedRows > 0;
    }
}

export default new LimiteRepository();
