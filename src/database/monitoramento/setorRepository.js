
import database from "../../config/database.js";

// ==========================================
// REPOSITORY - SETORES
// ==========================================
// Responsável pelas operações SQL
// relacionadas à tabela tbl_setor.

class SetorRepository {

    // Lista todos os setores com o nome do local.
    async listarTodos() {
        const [setores] = await database.query(`
            SELECT
                s.id,
                s.id_local,
                s.codigo,
                s.nome,
                s.responsavel,
                s.descricao,
                s.status,
                l.nome AS nome_local
            FROM tbl_setor s
            INNER JOIN tbl_local l
                ON l.id = s.id_local
            ORDER BY s.nome ASC
        `);

        return setores;
    }

    // Busca um setor pelo ID.
    async buscarPorId(id) {
        const [setores] = await database.query(
            `
            SELECT
                s.id,
                s.id_local,
                s.codigo,
                s.nome,
                s.responsavel,
                s.descricao,
                s.status,
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

    // Lista os setores pertencentes a um local.
    async listarPorLocal(idLocal) {
        const [setores] = await database.query(
            `
            SELECT
                id,
                id_local,
                codigo,
                nome,
                responsavel,
                descricao,
                status
            FROM tbl_setor
            WHERE id_local = ?
            ORDER BY nome ASC
            `,
            [idLocal]
        );

        return setores;
    }

    // Verifica se o local informado existe.
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

    // Verifica se já existe outro setor
    // cadastrado com o mesmo código.
    async buscarPorCodigo(codigo, idIgnorar = null) {
        const [setores] = await database.query(
            `
            SELECT id, codigo
            FROM tbl_setor
            WHERE codigo = ?
              AND (? IS NULL OR id <> ?)
            LIMIT 1
            `,
            [codigo, idIgnorar, idIgnorar]
        );

        return setores[0] ?? null;
    }

    // Cadastra um novo setor.
    async criar(dados) {
        const [resultado] = await database.query(
            `
            INSERT INTO tbl_setor (
                id_local,
                codigo,
                nome,
                responsavel,
                descricao,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                dados.id_local,
                dados.codigo,
                dados.nome,
                dados.responsavel ?? null,
                dados.descricao ?? null,
                dados.status ?? "Ativo"
            ]
        );

        return resultado.insertId;
    }

    // Atualiza um setor existente.
    async atualizar(id, dados) {
        const [resultado] = await database.query(
            `
            UPDATE tbl_setor
            SET
                id_local = ?,
                codigo = ?,
                nome = ?,
                responsavel = ?,
                descricao = ?,
                status = ?
            WHERE id = ?
            `,
            [
                dados.id_local,
                dados.codigo,
                dados.nome,
                dados.responsavel ?? null,
                dados.descricao ?? null,
                dados.status,
                id
            ]
        );

        return resultado.affectedRows > 0;
    }

    // Atualiza somente o status do setor.
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
