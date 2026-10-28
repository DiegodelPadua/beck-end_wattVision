
import pool from "../../config/database.js";

// ==========================================
// REPOSITORY - DISPOSITIVOS IOT
// ==========================================
// Responsável pelo acesso à tabela
// tbl_dispositivo_iot do banco Watt Vision.
//
// Não realiza validações de regras de negócio.
// Essas validações pertencem ao Service.

class DispositivoIotRepository {

    // ======================================
    // LISTAR TODOS OS DISPOSITIVOS
    // ======================================
    // Retorna os dispositivos cadastrados,
    // ordenados pelo identificador.
    async listarTodos() {
        const [rows] = await pool.query(`
            SELECT *
            FROM tbl_dispositivo_iot
            ORDER BY identificador ASC
        `);

        return rows;
    }

    // ======================================
    // BUSCAR DISPOSITIVO PELO ID
    // ======================================
    // Consulta um dispositivo específico.
    async buscarPorId(id) {
        const [rows] = await pool.query(
            `SELECT *
             FROM tbl_dispositivo_iot
             WHERE id = ?`,
            [id]
        );

        return rows[0] || null;
    }

    // ======================================
    // BUSCAR POR IDENTIFICADOR
    // ======================================
    // Utilizado para impedir identificadores
    // duplicados durante o cadastro.
    async buscarPorIdentificador(identificador, idIgnorar = null) {
        const [rows] = await pool.query(
            `SELECT id, identificador
             FROM tbl_dispositivo_iot
             WHERE identificador = ?
               AND (? IS NULL OR id <> ?)
             LIMIT 1`,
            [identificador, idIgnorar, idIgnorar]
        );

        return rows[0] || null;
    }

    // ======================================
    // BUSCAR POR ENDEREÇO MAC
    // ======================================
    // Impede que dois dispositivos utilizem
    // o mesmo endereço físico de rede.
    async buscarPorMac(macAddress, idIgnorar = null) {
        const [rows] = await pool.query(
            `SELECT id, mac_address
             FROM tbl_dispositivo_iot
             WHERE mac_address = ?
               AND (? IS NULL OR id <> ?)
             LIMIT 1`,
            [macAddress, idIgnorar, idIgnorar]
        );

        return rows[0] || null;
    }

    // ======================================
    // CONSULTAR EMPRESA
    // ======================================
    // Verifica se a empresa informada existe
    // antes de vincular um dispositivo.
    async buscarEmpresaPorId(idEmpresa) {
        const [rows] = await pool.query(
            `SELECT id, status
             FROM tbl_empresa
             WHERE id = ?`,
            [idEmpresa]
        );

        return rows[0] || null;
    }

    // ======================================
    // CADASTRAR DISPOSITIVO IOT
    // ======================================
    // Insere um novo ESP32 com as informações
    // de identificação, rede e comunicação.
    async criar(dados) {
        const [resultado] = await pool.query(
            `INSERT INTO tbl_dispositivo_iot (
                id_empresa,
                nome,
                identificador,
                mac_address,
                modelo,
                numero_serie,
                ip,
                versao_firmware,
                data_instalacao,
                ssid,
                broker,
                port,
                topic,
                client_id,
                tx_interval_sec,
                wifi,
                mqtt,
                status,
                data_comunicacao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                dados.id_empresa,
                dados.nome,
                dados.identificador,
                dados.mac_address,
                dados.modelo,
                dados.numero_serie,
                dados.ip,
                dados.versao_firmware,
                dados.data_instalacao,
                dados.ssid,
                dados.broker,
                dados.port,
                dados.topic,
                dados.client_id,
                dados.tx_interval_sec,
                dados.wifi,
                dados.mqtt,
                dados.status,
                dados.data_comunicacao
            ]
        );

        return resultado.insertId;
    }

    // ======================================
    // ATUALIZAR DISPOSITIVO IOT
    // ======================================
    // Atualiza os dados cadastrais e as
    // configurações de comunicação.
    async atualizar(id, dados) {
        const [resultado] = await pool.query(
            `UPDATE tbl_dispositivo_iot
             SET
                id_empresa = ?,
                nome = ?,
                identificador = ?,
                mac_address = ?,
                modelo = ?,
                numero_serie = ?,
                ip = ?,
                versao_firmware = ?,
                data_instalacao = ?,
                ssid = ?,
                broker = ?,
                port = ?,
                topic = ?,
                client_id = ?,
                tx_interval_sec = ?,
                wifi = ?,
                mqtt = ?,
                status = ?,
                data_comunicacao = ?
             WHERE id = ?`,
            [
                dados.id_empresa,
                dados.nome,
                dados.identificador,
                dados.mac_address,
                dados.modelo,
                dados.numero_serie,
                dados.ip,
                dados.versao_firmware,
                dados.data_instalacao,
                dados.ssid,
                dados.broker,
                dados.port,
                dados.topic,
                dados.client_id,
                dados.tx_interval_sec,
                dados.wifi,
                dados.mqtt,
                dados.status,
                dados.data_comunicacao,
                id
            ]
        );

        return resultado.affectedRows > 0;
    }

    // ======================================
    // ATUALIZAR STATUS
    // ======================================
    // Permite alterar o status de comunicação
    // sem modificar os demais dados cadastrais.
    async atualizarStatus(id, status) {
        const [resultado] = await pool.query(
            `UPDATE tbl_dispositivo_iot
             SET status = ?
             WHERE id = ?`,
            [status, id]
        );

        return resultado.affectedRows > 0;
    }

    // ======================================
    // VERIFICAR VÍNCULOS COM PONTOS
    // ======================================
    // Impede a exclusão de dispositivos que
    // já possuem pontos de medição associados.
    async contarPontosVinculados(id) {
        const [rows] = await pool.query(
            `SELECT COUNT(*) AS quantidade
             FROM tbl_ponto_medicao
             WHERE id_dispositivo_iot = ?`,
            [id]
        );

        return Number(rows[0].quantidade);
    }

    // ======================================
    // EXCLUIR DISPOSITIVO
    // ======================================
    // Remove o registro apenas quando o
    // Service autorizar a exclusão.
    async excluir(id) {
        const [resultado] = await pool.query(
            `DELETE FROM tbl_dispositivo_iot
             WHERE id = ?`,
            [id]
        );

        return resultado.affectedRows > 0;
    }
}

export default new DispositivoIotRepository();
