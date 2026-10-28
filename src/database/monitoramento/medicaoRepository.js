
import database from "../../config/database.js";

// ==========================================
// WATT VISION - REPOSITORY DE MEDIÇÕES
// ==========================================
// Responsável pelo acesso aos dados das
// medições elétricas armazenadas no MySQL.
//
// Preserva os métodos utilizados pelo Service.
//
// O Repository executa consultas SQL.
// As validações ficam no Service.

class MedicaoRepository {

    // ======================================
    // LISTAR TODAS AS MEDIÇÕES
    // ======================================
    // Retorna o histórico completo em ordem
    // decrescente de data e identificador.

    async listarTodas() {
        const [medicoes] = await database.query(`
            SELECT *
            FROM tbl_medicao
            ORDER BY data_hora DESC, id DESC
        `);

        return medicoes;
    }

    // ======================================
    // CONSULTAR PZEM E SEUS VÍNCULOS
    // ======================================
    // Retorna o sensor, seu ponto de medição
    // e o dispositivo IoT associado.
    //
    // Esses dados serão utilizados pelo
    // Service para validar as leituras.

    async buscarPzemPorId(id_pzem) {
        const [rows] = await database.query(
            `
            SELECT
                p.id,
                p.id_ponto_medicao,
                p.status,
                pm.status AS status_ponto_medicao,
                pm.id_dispositivo_iot,
                d.status AS status_dispositivo_iot
            FROM tbl_pzem p
            INNER JOIN tbl_ponto_medicao pm
                ON pm.id = p.id_ponto_medicao
            INNER JOIN tbl_dispositivo_iot d
                ON d.id = pm.id_dispositivo_iot
            WHERE p.id = ?
            `,
            [id_pzem]
        );

        return rows[0] || null;
    }

    // ======================================
    // RESOLVER PONTO DE MEDIÇÃO DO PZEM
    // ======================================
    // Mantido para compatibilidade com
    // o Service existente.

    async buscarPontoMedicaoDoPzem(id_pzem) {
        const [rows] = await database.query(
            `
            SELECT id_ponto_medicao
            FROM tbl_pzem
            WHERE id = ?
            `,
            [id_pzem]
        );

        return rows[0] || null;
    }

    // ======================================
    // ÚLTIMAS MEDIÇÕES POR PONTO
    // ======================================
    // Retorna a última medição de cada PZEM
    // registrada no ponto informado.
    //
    // Utiliza m.id_ponto_medicao para preservar
    // o histórico mesmo que o sensor seja
    // transferido posteriormente.

    async buscarUltimasPorPonto(idPonto) {
        const [medicoes] = await database.query(
            `
            SELECT
                m.id,
                m.id_pzem,
                m.id_ponto_medicao,
                m.data_hora,
                m.tensao,
                m.corrente,
                m.potencia_ativa,
                m.energia_acumulada,
                m.frequencia,
                m.fator_potencia
            FROM tbl_medicao m
            WHERE m.id_ponto_medicao = ?
              AND m.id = (
                  SELECT m2.id
                  FROM tbl_medicao m2
                  WHERE m2.id_pzem = m.id_pzem
                    AND m2.id_ponto_medicao = m.id_ponto_medicao
                  ORDER BY m2.data_hora DESC, m2.id DESC
                  LIMIT 1
              )
            ORDER BY m.id_pzem
            `,
            [idPonto]
        );

        return medicoes;
    }

    // ======================================
    // CONSULTAR MEDIÇÕES PARA CONSUMO
    // ======================================
    // Retorna as leituras de energia acumulada
    // dentro do período solicitado.
    //
    // O intervalo inclui o dia final inteiro.

    async buscarMedicoesParaConsumo(idPzem, inicio, fim) {
        const [medicoes] = await database.query(
            `
            SELECT
                id,
                id_pzem,
                id_ponto_medicao,
                data_hora,
                energia_acumulada
            FROM tbl_medicao
            WHERE id_pzem = ?
              AND data_hora >= ?
              AND data_hora < DATE_ADD(?, INTERVAL 1 DAY)
            ORDER BY data_hora ASC, id ASC
            `,
            [idPzem, inicio, fim]
        );

        return medicoes;
    }

    // ======================================
    // CONSULTAR TARIFA VIGENTE
    // ======================================
    // Identifica a empresa a partir do ponto
    // de medição vinculado ao PZEM.
    //
    // O ponto pode monitorar:
    // - um local;
    // - um setor;
    // - um equipamento.
    //
    // Preserva a consulta de tarifas existente.
    // A estrutura de tbl_tarifa ainda precisa
    // ser confirmada no banco.

    async buscarTarifaParaPeriodo(idPzem, inicio, fim) {
        const [tarifas] = await database.query(
            `
            SELECT
                t.id,
                t.descricao,
                t.valor_kwh,
                t.data_inicial,
                t.data_final
            FROM tbl_tarifa t
            WHERE t.id_empresa = (
                SELECT l.id_empresa
                FROM tbl_pzem p
                INNER JOIN tbl_ponto_medicao pm
                    ON pm.id = p.id_ponto_medicao
                LEFT JOIN tbl_equipamento e
                    ON e.id = pm.id_equipamento
                LEFT JOIN tbl_setor s
                    ON s.id = COALESCE(
                        pm.id_setor,
                        e.id_setor
                    )
                LEFT JOIN tbl_local l
                    ON l.id = COALESCE(
                        pm.id_local,
                        s.id_local
                    )
                WHERE p.id = ?
            )
              AND t.status = 'Ativa'
              AND t.data_inicial <= ?
              AND (
                  t.data_final IS NULL
                  OR t.data_final >= ?
              )
            ORDER BY t.data_inicial DESC, t.id DESC
            `,
            [idPzem, inicio, fim]
        );

        return tarifas;
    }

    // ======================================
    // CADASTRAR MEDIÇÃO ELÉTRICA
    // ======================================
    // Insere as grandezas elétricas enviadas
    // pelo ESP32 ou pela API.
    //
    // O Service deverá validar os dados
    // antes de executar esta operação.

    async criar(medicao) {
        const {
            id_pzem,
            id_ponto_medicao,
            data_hora,
            tensao,
            corrente,
            potencia_ativa,
            energia_acumulada,
            frequencia,
            fator_potencia
        } = medicao;

        const [resultado] = await database.query(
            `
            INSERT INTO tbl_medicao (
                id_pzem,
                id_ponto_medicao,
                data_hora,
                tensao,
                corrente,
                potencia_ativa,
                energia_acumulada,
                frequencia,
                fator_potencia
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                id_pzem,
                id_ponto_medicao,
                data_hora,
                tensao,
                corrente,
                potencia_ativa,
                energia_acumulada,
                frequencia,
                fator_potencia
            ]
        );

        return resultado.insertId;
    }

    // ======================================
    // BUSCAR ÚLTIMA MEDIÇÃO
    // ======================================
    // Retorna a leitura mais recente do banco.

    async buscarUltima() {
        const [rows] = await database.query(`
            SELECT
                id,
                id_pzem,
                id_ponto_medicao,
                data_hora,
                tensao,
                corrente,
                potencia_ativa,
                energia_acumulada,
                frequencia,
                fator_potencia
            FROM tbl_medicao
            ORDER BY data_hora DESC, id DESC
            LIMIT 1
        `);

        return rows[0] || null;
    }

    // ======================================
    // CONSULTAR SÉRIE TEMPORAL
    // ======================================
    // Retorna o histórico de um PZEM nas
    // últimas horas para gráficos e análises.
    //
    // Limita a consulta a 10.000 registros.

    async obterSerieTemporal(idPzem, horas) {
        const [medicoes] = await database.query(
            `
            SELECT
                id,
                id_pzem,
                id_ponto_medicao,
                data_hora,
                tensao,
                corrente,
                potencia_ativa,
                energia_acumulada,
                frequencia,
                fator_potencia
            FROM tbl_medicao
            WHERE id_pzem = ?
              AND data_hora >= DATE_SUB(
                  NOW(),
                  INTERVAL ? HOUR
              )
            ORDER BY data_hora ASC, id ASC
            LIMIT 10000
            `,
            [idPzem, horas]
        );

        return medicoes;
    }
}

// ==========================================
// EXPORTAÇÃO DO REPOSITORY
// ==========================================
// Disponibiliza a instância para o Service.

export default new MedicaoRepository();
