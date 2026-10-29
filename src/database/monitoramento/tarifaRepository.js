
import database from "../../config/database.js";

// ==========================================
// WATT VISION - REPOSITORY DE TARIFAS
// ==========================================

class TarifaRepository {

    // ======================================
    // GET - LISTAR TODAS AS TARIFAS
    // ======================================
    async listarTodas() {
        const [tarifas] = await database.query(`
            SELECT
                t.*,
                e.razao_social AS empresa
            FROM tbl_tarifa t
            INNER JOIN tbl_empresa e
                ON e.id = t.id_empresa
            ORDER BY t.id DESC
        `);

        return tarifas;
    }

    // ======================================
    // GET - BUSCAR TARIFA POR ID
    // ======================================
    async buscarPorId(id) {
        const [tarifas] = await database.query(
            `SELECT *
             FROM tbl_tarifa
             WHERE id = ?`,
            [id]
        );

        return tarifas[0] ?? null;
    }

    // ======================================
    // GET - LISTAR TARIFAS POR EMPRESA
    // ======================================
    async listarPorEmpresa(idEmpresa) {
        const [tarifas] = await database.query(
            `SELECT *
             FROM tbl_tarifa
             WHERE id_empresa = ?
             ORDER BY data_inicial DESC`,
            [idEmpresa]
        );

        return tarifas;
    }

    // ======================================
    // GET - VERIFICAR EMPRESA
    // ======================================
    async buscarEmpresaPorId(idEmpresa) {
        const [empresas] = await database.query(
            `SELECT id, razao_social, status
             FROM tbl_empresa
             WHERE id = ?`,
            [idEmpresa]
        );

        return empresas[0] ?? null;
    }

    // ======================================
    // POST - CADASTRAR TARIFA
    // ======================================
    async criar(dados) {
        const [resultado] = await database.query(
            `INSERT INTO tbl_tarifa (
                id_empresa,
                descricao,
                valor_kwh,
                data_inicial,
                data_final,
                status
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                dados.id_empresa,
                dados.descricao,
                dados.valor_kwh,
                dados.data_inicial,
                dados.data_final,
                dados.status
            ]
        );

        return resultado.insertId;
    }

    // ======================================
    // PUT - ATUALIZAR TARIFA
    // ======================================
    async atualizar(id, dados) {
        const [resultado] = await database.query(
            `UPDATE tbl_tarifa
             SET
                id_empresa = ?,
                descricao = ?,
                valor_kwh = ?,
                data_inicial = ?,
                data_final = ?,
                status = ?
             WHERE id = ?`,
            [
                dados.id_empresa,
                dados.descricao,
                dados.valor_kwh,
                dados.data_inicial,
                dados.data_final,
                dados.status,
                id
            ]
        );

        return resultado.affectedRows > 0;
    }

    // ======================================
    // PATCH - ALTERAR STATUS
    // ======================================
    async atualizarStatus(id, status) {
        const [resultado] = await database.query(
            `UPDATE tbl_tarifa
             SET status = ?
             WHERE id = ?`,
            [status, id]
        );

        return resultado.affectedRows > 0;
    }
}

export default new TarifaRepository();
