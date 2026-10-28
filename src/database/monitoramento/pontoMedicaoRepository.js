
import database from "../../config/database.js";

// ==========================================
// REPOSITORY - PONTOS DE MEDIÇÃO
// ==========================================
// Responsável pelas consultas SQL da
// tabela tbl_ponto_medicao.

class PontoMedicaoRepository {

    // ======================================
    // LISTAR TODOS OS PONTOS
    // ======================================
    async listarTodos() {
        const [pontos] = await database.query(`
            SELECT
                pm.*,
                l.nome AS nome_local,
                s.nome AS nome_setor,
                e.nome AS nome_equipamento
            FROM tbl_ponto_medicao pm
            LEFT JOIN tbl_local l
                ON l.id = pm.id_local
            LEFT JOIN tbl_setor s
                ON s.id = pm.id_setor
            LEFT JOIN tbl_equipamento e
                ON e.id = pm.id_equipamento
            ORDER BY pm.nome ASC
        `);

        return pontos;
    }

    // ======================================
    // BUSCAR PONTO POR ID
    // ======================================
    async buscarPorId(id) {
        const [pontos] = await database.query(
            `
            SELECT
                pm.*,
                l.nome AS nome_local,
                s.nome AS nome_setor,
                e.nome AS nome_equipamento
            FROM tbl_ponto_medicao pm
            LEFT JOIN tbl_local l
                ON l.id = pm.id_local
            LEFT JOIN tbl_setor s
                ON s.id = pm.id_setor
            LEFT JOIN tbl_equipamento e
                ON e.id = pm.id_equipamento
            WHERE pm.id = ?
            `,
            [id]
        );

        return pontos[0] ?? null;
    }

    // ======================================
    // LISTAR PONTOS POR DISPOSITIVO IOT
    // ======================================
    async listarPorDispositivo(idDispositivo) {
        const [pontos] = await database.query(
            `
            SELECT *
            FROM tbl_ponto_medicao
            WHERE id_dispositivo_iot = ?
            ORDER BY nome ASC
            `,
            [idDispositivo]
        );

        return pontos;
    }

    // ======================================
    // BUSCAR LOCAL POR ID
    // ======================================
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

    // ======================================
    // BUSCAR SETOR POR ID
    // ======================================
    async buscarSetorPorId(idSetor) {
        const [setores] = await database.query(
            `
            SELECT
                s.id,
                s.nome,
                s.status,
                s.id_local,
                l.status AS status_local
            FROM tbl_setor s
            INNER JOIN tbl_local l
                ON l.id = s.id_local
            WHERE s.id = ?
            `,
            [idSetor]
        );

        return setores[0] ?? null;
    }

    // ======================================
    // BUSCAR EQUIPAMENTO POR ID
    // ======================================
    async buscarEquipamentoPorId(idEquipamento) {
        const [equipamentos] = await database.query(
            `
            SELECT
                e.id,
                e.nome,
                e.status,
                e.id_setor,
                s.id_local,
                s.status AS status_setor,
                l.status AS status_local
            FROM tbl_equipamento e
            INNER JOIN tbl_setor s
                ON s.id = e.id_setor
            INNER JOIN tbl_local l
                ON l.id = s.id_local
            WHERE e.id = ?
            `,
            [idEquipamento]
        );

        return equipamentos[0] ?? null;
    }

    // ======================================
    // VERIFICAR DISPOSITIVO IOT
    // ======================================
    async buscarDispositivoPorId(idDispositivo) {
        const [dispositivos] = await database.query(
            `
            SELECT *
            FROM tbl_dispositivo_iot
            WHERE id = ?
            `,
            [idDispositivo]
        );

        return dispositivos[0] ?? null;
    }

    // ======================================
    // CADASTRAR PONTO DE MEDIÇÃO
    // ======================================
    async criar(dados) {
        const [resultado] = await database.query(
            `
            INSERT INTO tbl_ponto_medicao (
                nome,
                descricao,
                data_instalacao,
                status,
                id_local,
                id_setor,
                id_equipamento,
                id_dispositivo_iot
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                dados.nome,
                dados.descricao ?? null,
                dados.data_instalacao ?? null,
                dados.status ?? "Ativo",
                dados.id_local ?? null,
                dados.id_setor ?? null,
                dados.id_equipamento ?? null,
                dados.id_dispositivo_iot
            ]
        );

        return resultado.insertId;
    }

    // ======================================
    // ATUALIZAR PONTO DE MEDIÇÃO
    // ======================================
    async atualizar(id, dados) {
        const [resultado] = await database.query(
            `
            UPDATE tbl_ponto_medicao
            SET
                nome = ?,
                descricao = ?,
                data_instalacao = ?,
                status = ?,
                id_local = ?,
                id_setor = ?,
                id_equipamento = ?,
                id_dispositivo_iot = ?
            WHERE id = ?
            `,
            [
                dados.nome,
                dados.descricao ?? null,
                dados.data_instalacao ?? null,
                dados.status,
                dados.id_local ?? null,
                dados.id_setor ?? null,
                dados.id_equipamento ?? null,
                dados.id_dispositivo_iot,
                id
            ]
        );

        return resultado.affectedRows > 0;
    }

    // ======================================
    // ATIVAR OU INATIVAR PONTO
    // ======================================
    async atualizarStatus(id, status) {
        const [resultado] = await database.query(
            `
            UPDATE tbl_ponto_medicao
            SET status = ?
            WHERE id = ?
            `,
            [status, id]
        );

        return resultado.affectedRows > 0;
    }
}

export default new PontoMedicaoRepository();
