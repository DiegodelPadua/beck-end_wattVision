
import pool from "../../config/database.js";

// ==========================================
// WATT VISION - REPOSITORY PZEM
// ==========================================
// Responsável pelas operações SQL da tabela
// tbl_pzem.
//
// O Repository acessa o banco de dados.
// As regras de negócio ficam no Service.

class PzemRepository {

    // ======================================
    // LISTAR TODOS OS SENSORES
    // ======================================
    // Retorna os PZEMs cadastrados junto
    // com o nome do ponto de medição.

    async listarTodos() {
        const [rows] = await pool.query(`
            SELECT
                p.*,
                pm.nome AS nome_ponto_medicao
            FROM tbl_pzem p
            INNER JOIN tbl_ponto_medicao pm
                ON pm.id = p.id_ponto_medicao
            ORDER BY p.id ASC
        `);

        return rows;
    }

    // ======================================
    // BUSCAR SENSOR PELO ID
    // ======================================
    // Consulta um PZEM específico.

    async buscarPorId(id) {
        const [rows] = await pool.query(
            `SELECT
                p.*,
                pm.nome AS nome_ponto_medicao
             FROM tbl_pzem p
             INNER JOIN tbl_ponto_medicao pm
                 ON pm.id = p.id_ponto_medicao
             WHERE p.id = ?`,
            [id]
        );

        return rows[0] || null;
    }

    // ======================================
    // BUSCAR PELO NÚMERO DE SÉRIE
    // ======================================
    // Auxilia a verificação de duplicidade.
    // Permite ignorar o próprio registro
    // durante uma atualização.

    async buscarPorNumeroSerie(numeroSerie, idIgnorar = null) {
        const [rows] = await pool.query(
            `SELECT id, numero_serie
             FROM tbl_pzem
             WHERE numero_serie = ?
               AND (? IS NULL OR id <> ?)
             LIMIT 1`,
            [numeroSerie, idIgnorar, idIgnorar]
        );

        return rows[0] || null;
    }

    // ======================================
    // CONSULTAR PONTO DE MEDIÇÃO
    // ======================================
    // Verifica a existência e o status
    // do ponto que receberá o sensor.

    async buscarPontoMedicao(idPontoMedicao) {
        const [rows] = await pool.query(
            `SELECT id, nome, status
             FROM tbl_ponto_medicao
             WHERE id = ?`,
            [idPontoMedicao]
        );

        return rows[0] || null;
    }

    // ======================================
    // CADASTRAR SENSOR PZEM
    // ======================================
    // Insere um novo sensor vinculado a
    // um ponto de medição existente.

    async criar(dados) {
        const [resultado] = await pool.query(
            `INSERT INTO tbl_pzem (
                id_ponto_medicao,
                numero_serie,
                modelo,
                versao,
                data_instalacao,
                status
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                dados.id_ponto_medicao,
                dados.numero_serie,
                dados.modelo,
                dados.versao,
                dados.data_instalacao,
                dados.status
            ]
        );

        return resultado.insertId;
    }

    // ======================================
    // ATUALIZAR SENSOR PZEM
    // ======================================
    // Atualiza os dados cadastrais do sensor.

    async atualizar(id, dados) {
        const [resultado] = await pool.query(
            `UPDATE tbl_pzem
             SET
                id_ponto_medicao = ?,
                numero_serie = ?,
                modelo = ?,
                versao = ?,
                data_instalacao = ?,
                status = ?
             WHERE id = ?`,
            [
                dados.id_ponto_medicao,
                dados.numero_serie,
                dados.modelo,
                dados.versao,
                dados.data_instalacao,
                dados.status,
                id
            ]
        );

        return resultado.affectedRows > 0;
    }

    // ======================================
    // ATUALIZAR STATUS DO SENSOR
    // ======================================
    // Altera apenas o status do PZEM.

    async atualizarStatus(id, status) {
        const [resultado] = await pool.query(
            `UPDATE tbl_pzem
             SET status = ?
             WHERE id = ?`,
            [status, id]
        );

        return resultado.affectedRows > 0;
    }

    // ======================================
    // VERIFICAR HISTÓRICO DE MEDIÇÕES
    // ======================================
    // Conta os registros associados ao PZEM.
    // Essa informação será utilizada para
    // impedir exclusões que comprometam
    // o histórico de consumo energético.

    async contarMedicoes(id) {
        const [rows] = await pool.query(
            `SELECT COUNT(*) AS quantidade
             FROM tbl_medicao
             WHERE id_pzem = ?`,
            [id]
        );

        return Number(rows[0].quantidade);
    }

    // ======================================
    // EXCLUIR SENSOR PZEM
    // ======================================
    // A exclusão só deverá ser autorizada
    // pelo Service após verificar os vínculos.

    async excluir(id) {
        const [resultado] = await pool.query(
            `DELETE FROM tbl_pzem
             WHERE id = ?`,
            [id]
        );

        return resultado.affectedRows > 0;
    }
}

// ==========================================
// EXPORTAÇÃO DO REPOSITORY
// ==========================================

export default new PzemRepository();
