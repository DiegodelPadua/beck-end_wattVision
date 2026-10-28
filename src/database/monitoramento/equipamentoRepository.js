
import database from "../../config/database.js";

// ==========================================
// REPOSITORY - EQUIPAMENTOS
// ==========================================
// Responsável pelas consultas SQL da tabela
// tbl_equipamento, conforme o novo banco
// de dados do Watt Vision.

class EquipamentoRepository {

    // ======================================
    // LISTAR TODOS OS EQUIPAMENTOS
    // ======================================
    // Retorna os equipamentos cadastrados,
    // incluindo o nome do setor e do local.
    async listarTodos() {
        const [equipamentos] = await database.query(`
            SELECT
                e.*,
                s.nome AS nome_setor,
                l.nome AS nome_local
            FROM tbl_equipamento e
            INNER JOIN tbl_setor s
                ON s.id = e.id_setor
            INNER JOIN tbl_local l
                ON l.id = s.id_local
            ORDER BY e.nome ASC
        `);

        return equipamentos;
    }

    // ======================================
    // BUSCAR EQUIPAMENTO POR ID
    // ======================================
    async buscarPorId(id) {
        const [equipamentos] = await database.query(
            `
            SELECT
                e.*,
                s.nome AS nome_setor,
                l.nome AS nome_local
            FROM tbl_equipamento e
            INNER JOIN tbl_setor s
                ON s.id = e.id_setor
            INNER JOIN tbl_local l
                ON l.id = s.id_local
            WHERE e.id = ?
            `,
            [id]
        );

        return equipamentos[0] ?? null;
    }

    // ======================================
    // LISTAR EQUIPAMENTOS POR SETOR
    // ======================================
    async listarPorSetor(idSetor) {
        const [equipamentos] = await database.query(
            `
            SELECT *
            FROM tbl_equipamento
            WHERE id_setor = ?
            ORDER BY nome ASC
            `,
            [idSetor]
        );

        return equipamentos;
    }

    // ======================================
    // VERIFICAR SE O SETOR EXISTE
    // ======================================
    // Utilizado pelo Service antes de criar
    // ou transferir um equipamento.
    async buscarSetorPorId(idSetor) {
        const [setores] = await database.query(
            `
            SELECT
                s.id,
                s.nome,
                s.status,
                l.status AS status_local,
                emp.status AS status_empresa
            FROM tbl_setor s
            INNER JOIN tbl_local l
                ON l.id = s.id_local
            INNER JOIN tbl_empresa emp
                ON emp.id = l.id_empresa
            WHERE s.id = ?
            `,
            [idSetor]
        );

        return setores[0] ?? null;
    }


    // ======================================
    // VERIFICAR CÓDIGO DUPLICADO
    // ======================================
    // Permite ignorar o próprio equipamento
    // durante uma operação de atualização.
    async buscarPorCodigo(codigo, idIgnorar = null) {
        const [equipamentos] = await database.query(
            `
            SELECT id, codigo
            FROM tbl_equipamento
            WHERE codigo = ?
              AND (? IS NULL OR id <> ?)
            LIMIT 1
            `,
            [codigo, idIgnorar, idIgnorar]
        );

        return equipamentos[0] ?? null;
    }


    // ======================================
    // CADASTRAR EQUIPAMENTO
    // ======================================
    async criar(dados) {
        const [resultado] = await database.query(
            `
            INSERT INTO tbl_equipamento (
                id_setor,
                codigo,
                nome,
                tipo_equipamento,
                fabricante,
                modelo,
                numero_serie,
                potencia_nominal,
                tensao_nominal,
                data_instalacao,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                dados.id_setor,
                dados.codigo,
                dados.nome,
                dados.tipo_equipamento,
                dados.fabricante,
                dados.modelo,
                dados.numero_serie,
                dados.potencia_nominal,
                dados.tensao_nominal,
                dados.data_instalacao,
                dados.status
            ]
        );

        return resultado.insertId;
    }

    // ======================================
    // ATUALIZAR EQUIPAMENTO
    // ======================================
    async atualizar(id, dados) {
        const [resultado] = await database.query(
            `
            UPDATE tbl_equipamento
            SET
                id_setor = ?,
                codigo = ?,
                nome = ?,
                tipo_equipamento = ?,
                fabricante = ?,
                modelo = ?,
                numero_serie = ?,
                potencia_nominal = ?,
                tensao_nominal = ?,
                data_instalacao = ?,
                status = ?
            WHERE id = ?
            `,
            [
                dados.id_setor,
                dados.codigo,
                dados.nome,
                dados.tipo_equipamento,
                dados.fabricante,
                dados.modelo,
                dados.numero_serie,
                dados.potencia_nominal,
                dados.tensao_nominal,
                dados.data_instalacao,
                dados.status,
                id
            ]
        );

        return resultado.affectedRows > 0;
    }

    // ======================================
    // ATIVAR OU INATIVAR EQUIPAMENTO
    // ======================================
    async atualizarStatus(id, status) {
        const [resultado] = await database.query(
            `
            UPDATE tbl_equipamento
            SET status = ?
            WHERE id = ?
            `,
            [status, id]
        );

        return resultado.affectedRows > 0;
    }
}

// Exporta uma instância para utilização
// pela camada Service.
export default new EquipamentoRepository();
