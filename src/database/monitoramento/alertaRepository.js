
import database from "../../config/database.js";

// ==========================================
// WATT VISION - REPOSITORY DE ALERTAS
// ==========================================

class AlertaRepository {

    // ======================================
    // GET - LISTAR TODOS OS ALERTAS
    // ======================================
    async listarTodos() {
        const [alertas] = await database.query(`
            SELECT
                a.*,
                ta.nome AS tipo_alerta,
                ta.categoria AS categoria_alerta
            FROM tbl_alerta a
            INNER JOIN tbl_tipo_alerta ta
                ON ta.id = a.id_tipo_alerta
            ORDER BY a.data_hora DESC, a.id DESC
        `);

        return alertas;
    }

    // ======================================
    // GET - BUSCAR ALERTA POR ID
    // ======================================
    async buscarPorId(id) {
        const [alertas] = await database.query(
            `SELECT *
             FROM tbl_alerta
             WHERE id = ?`,
            [id]
        );

        return alertas[0] ?? null;
    }

    // ======================================
    // GET - LISTAR ALERTAS ATIVOS
    // ======================================
    async listarAtivos() {
        const [alertas] = await database.query(`
            SELECT
                a.*,
                ta.nome AS tipo_alerta
            FROM tbl_alerta a
            INNER JOIN tbl_tipo_alerta ta
                ON ta.id = a.id_tipo_alerta
            WHERE a.status = 'ativo'
            ORDER BY a.data_hora DESC, a.id DESC
        `);

        return alertas;
    }

    // ======================================
    // GET - LISTAR POR DISPOSITIVO
    // ======================================
    async listarPorDispositivo(idDispositivo) {
        const [alertas] = await database.query(
            `SELECT *
             FROM tbl_alerta
             WHERE id_dispositivo_iot = ?
             ORDER BY data_hora DESC, id DESC`,
            [idDispositivo]
        );

        return alertas;
    }

    // ======================================
    // GET - VERIFICAR TIPO DE ALERTA
    // ======================================
    async buscarTipoPorId(idTipo) {
        const [tipos] = await database.query(
            `SELECT id, nome, categoria
             FROM tbl_tipo_alerta
             WHERE id = ?`,
            [idTipo]
        );

        return tipos[0] ?? null;
    }

    // ======================================
    // POST - REGISTRAR ALERTA
    // ======================================
    async criar(dados) {
        const [resultado] = await database.query(
            `INSERT INTO tbl_alerta (
                id_tipo_alerta,
                id_limite,
                id_dispositivo_iot,
                id_medicao,
                valor_detectado,
                valor_limite,
                severidade,
                mensagem,
                data_hora,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'ativo')`,
            [
                dados.id_tipo_alerta,
                dados.id_limite,
                dados.id_dispositivo_iot,
                dados.id_medicao,
                dados.valor_detectado,
                dados.valor_limite,
                dados.severidade,
                dados.mensagem
            ]
        );

        return resultado.insertId;
    }

    // ======================================
    // PATCH - RECONHECER ALERTA
    // ======================================
    async reconhecer(id, idUsuario) {
        const [resultado] = await database.query(
            `UPDATE tbl_alerta
             SET status = 'reconhecido',
                 reconhecido_por = ?,
                 data_reconhecimento = NOW()
             WHERE id = ?
               AND status = 'ativo'`,
            [idUsuario, id]
        );

        return resultado.affectedRows > 0;
    }
}

export default new AlertaRepository();
