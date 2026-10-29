
import database from "../../config/database.js";

// ==========================================
// REPOSITORY - EMPRESAS
// ==========================================

class EmpresaRepository {

    async listarTodas() {
        const [empresas] = await database.query(`
            SELECT id, razao_social, nome_fantasia,
                   cnpj, email, telefone, status
            FROM tbl_empresa
            ORDER BY razao_social ASC
        `);

        return empresas;
    }

    async buscarPorId(id) {
        const [empresas] = await database.query(
            "SELECT * FROM tbl_empresa WHERE id = ?",
            [id]
        );

        return empresas[0] ?? null;
    }

    async buscarPorCnpj(cnpj) {
        const [empresas] = await database.query(
            "SELECT id FROM tbl_empresa WHERE cnpj = ?",
            [cnpj]
        );

        return empresas[0] ?? null;
    }

    async criar(dados) {
        const [resultado] = await database.query(
            `INSERT INTO tbl_empresa
                (razao_social, nome_fantasia, cnpj,
                 email, telefone, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                dados.razao_social,
                dados.nome_fantasia ?? null,
                dados.cnpj,
                dados.email ?? null,
                dados.telefone ?? null,
                dados.status ?? "Ativa"
            ]
        );

        return resultado.insertId;
    }

    async atualizar(id, dados) {
        const [resultado] = await database.query(
            `UPDATE tbl_empresa
             SET razao_social = ?,
                 nome_fantasia = ?,
                 cnpj = ?,
                 email = ?,
                 telefone = ?,
                 status = ?
             WHERE id = ?`,
            [
                dados.razao_social,
                dados.nome_fantasia ?? null,
                dados.cnpj,
                dados.email ?? null,
                dados.telefone ?? null,
                dados.status,
                id
            ]
        );

        return resultado.affectedRows > 0;
    }

    async atualizarStatus(id, status) {
        const [resultado] = await database.query(
            `UPDATE tbl_empresa
             SET status = ?
             WHERE id = ?`,
            [status, id]
        );

        return resultado.affectedRows > 0;
    }
}

export default new EmpresaRepository();
