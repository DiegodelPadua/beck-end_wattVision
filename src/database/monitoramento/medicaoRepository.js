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


    // ======================================
    // CRIAR UMA NOVA MEDIÇÃO
    // ======================================

    async criar(medicao) {

        const {
            id_pzem,
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
            VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)
            `,
            [
                id_pzem,
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
}


// Exporta uma instância do Repository.
export default new MedicaoRepository();