// Importa a conexão com o banco de dados MySQL.
import database from "../../config/database.js";


// ==========================================
// REPOSITORY - MEDIÇÃO
// ==========================================

class MedicaoRepository {

    async listarTodas() {

        const [medicoes] = await database.query(`
            SELECT *
            FROM tbl_medicao
            ORDER BY data_hora DESC
        `);

        return medicoes;
    }


    // ======================================
    // VERIFICAR SE O PZEM EXISTE
    // ======================================

    async buscarPzemPorId(id_pzem) {

        const [resultado] = await database.query(
            `
            SELECT id
            FROM tbl_pzem
            WHERE id = ?
            `,
            [id_pzem]
        );

        if (resultado.length === 0) {
            return null;
        }

        return resultado[0];
    }



    // ==========================================
    // ÚLTIMAS MEDIÇÕES POR PONTO DE MEDIÇÃO
    // ==========================================
    // Retorna a leitura mais recente de cada PZEM
    // associado ao ponto de medição informado.

    async buscarUltimasPorPonto(idPonto) {

        const [medicoes] = await database.query(
            `
            SELECT
                m.id,
                m.id_pzem,
                m.data_hora,
                m.tensao,
                m.corrente,
                m.potencia_ativa,
                m.energia_acumulada,
                m.frequencia,
                m.fator_potencia
            FROM tbl_medicao m
            INNER JOIN tbl_pzem p
                ON p.id = m.id_pzem
            WHERE p.id_ponto_medicao = ?
            AND m.id = (
                SELECT m2.id
                FROM tbl_medicao m2
                WHERE m2.id_pzem = m.id_pzem
                ORDER BY m2.data_hora DESC, m2.id DESC
                LIMIT 1
            )
            ORDER BY m.id_pzem
            `,
            [idPonto]
        );

        return medicoes;
    }


    // ==========================================
// CONSULTAR MEDIÇÕES PARA CÁLCULO DE CONSUMO
// ==========================================
// Busca as leituras de um PZEM dentro de um
// período, mantendo a ordem cronológica.

async buscarMedicoesParaConsumo(idPzem, inicio, fim) {

    const [medicoes] = await database.query(
        `
        SELECT
            id,
            id_pzem,
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


    // ==========================================
    // CONSULTAR TARIFA VIGENTE DO PZEM
    // ==========================================
    // Localiza a empresa proprietária do ponto
    // de medição e procura uma tarifa ativa
    // que cubra todo o período informado.
    //
    // Esta primeira versão exige uma única
    // tarifa para todo o intervalo.

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
            INNER JOIN tbl_local l
                ON l.id_empresa = t.id_empresa
            INNER JOIN tbl_ponto_medicao pm
                ON pm.id_local = l.id
            INNER JOIN tbl_pzem p
                ON p.id_ponto_medicao = pm.id
            WHERE p.id = ?
            AND t.status = 'ATIVA'
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
    // CRIAR UMA NOVA MEDIÇÃO
    // ======================================

    async criar(medicao) {

        const {
            id_pzem,
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
            INSERT INTO tbl_medicao
            (
                id_pzem,
                data_hora,
                tensao,
                corrente,
                potencia_ativa,
                energia_acumulada,
                frequencia,
                fator_potencia
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                id_pzem,
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
    // BUSCAR A ÚLTIMA MEDIÇÃO NO MYSQL
    // ======================================
    // Consulta a tabela tbl_medicao e retorna
    // apenas o registro com a data mais recente.

    async buscarUltima() {

        const [resultado] = await database.query(`
            SELECT
                id,
                id_pzem,
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

        // Se não houver registros, retorna null.
        if (resultado.length === 0) {
            return null;
        }

        // Retorna o objeto da medição encontrada.
        return resultado[0];
    }


    // ==========================================
    // CONSULTAR HISTÓRICO POR PZEM E PERÍODO
    // ==========================================
    // Retorna as medições em ordem cronológica,
    // permitindo a construção de gráficos.

    async obterSerieTemporal(idPzem, horas) {

        const [medicoes] = await database.query(
            `
            SELECT
                id,
                id_pzem,
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


// Exporta uma instância do Repository.
export default new MedicaoRepository();