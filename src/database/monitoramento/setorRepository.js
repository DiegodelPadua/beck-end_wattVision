
import database from "../../config/database.js";

// ==========================================
// REPOSITORY - SETORES
// ==========================================
// Responsável pelas operações SQL na
// tabela tbl_setor.

class SetorRepository {

    // Lista os setores com o nome do local.
    async listarTodos() {
        const [setores] = await database.query(`
            SELECT
                s.id,
                s.nome,
                s.descricao,
                s.status,
                s.id_local,
                l.nome AS nome_local
            FROM tbl_setor s
            INNER JOIN tbl_local l
                ON l.id = s.id_local
            ORDER BY s.nome ASC
        `);

        return setores;
    }

    // Consulta um setor específico.
    async buscarPorId(id) {
        const [setores] = await database.query(
            `
            SELECT
                s.id,
                s.nome,
                s.descricao,
                s.status,
                s.id_local,
                l.nome AS nome_local
            FROM tbl_setor s
            INNER JOIN tbl_local l
                ON l.id = s.id_local
            WHERE s.id = ?
            `,
            [id]
        );

        return setores[0] ?? null;
    }

    // Consulta os setores pertencentes a um local.
    async listarPorLocal(idLocal) {
        const [setores] = await database.query(
            `
            SELECT
                id,
                nome,
                descricao,
                status,
                id_local
            FROM tbl_setor
            WHERE id_local = ?
            ORDER BY nome ASC
            `,
            [idLocal]
        );

        return setores;
    }

    // Confere se o local existe.
    async buscarLocalPorId(idLocal) {
        const [locais] = await database.query(
            `
            SELECT id, nome, status
            FROM tbl_local
            WHERE id = ?
            `,
            [idLocal]
        );

        return locais[0] ?? null;
    }

    // Cadastra um setor.
    async criar(dados) {
        const [resultado] = await database.query(
            `
            INSERT INTO tbl_setor
                (nome, descricao, status, id_local)
            VALUES (?, ?, ?, ?)
            `,
            [
                dados.nome,
                dados.descricao,
                dados.status,
                dados.id_local
            ]
        );

        return resultado.insertId;
    }

    // Atualiza um setor.
    async atualizar(id, dados) {
        const [resultado] = await database.query(
            `
            UPDATE tbl_setor
            SET nome = ?,
                descricao = ?,
                status = ?,
                id_local = ?
            WHERE id = ?
            `,
            [
                dados.nome,
                dados.descricao,
                dados.status,
                dados.id_local,
                id
            ]
        );

        return resultado.affectedRows > 0;
    }

    // Ativa ou desativa um setor.
    async atualizarStatus(id, status) {
        const [resultado] = await database.query(
            `
            UPDATE tbl_setor
            SET status = ?
            WHERE id = ?
            `,
            [status, id]
        );

        return resultado.affectedRows > 0;
    }
}

export default new SetorRepository();
