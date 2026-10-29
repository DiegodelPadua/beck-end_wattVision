
import limiteRepository from "../database/monitoramento/limiteRepository.js";
import database from "../config/database.js";

// ==========================================
// WATT VISION - SERVICE DE LIMITES
// ==========================================

class LimiteService {

    criarErro(mensagem, status = 400) {
        const erro = new Error(mensagem);
        erro.status = status;
        return erro;
    }

    // ======================================
    // VALIDAR ID
    // ======================================
    validarId(id) {
        const numero = Number(id);

        if (!Number.isSafeInteger(numero) || numero <= 0) {
            throw this.criarErro("ID inválido.");
        }

        return numero;
    }

    // ======================================
    // VALIDAR DADOS
    // ======================================
    async validarDados(dados) {
        if (
            !dados ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            throw this.criarErro("Dados do limite inválidos.");
        }

        const descricao =
            typeof dados.descricao === "string"
                ? dados.descricao.trim()
                : "";

        if (!descricao) {
            throw this.criarErro(
                "Descrição do limite obrigatória."
            );
        }

        // Grandezas permitidas no banco
        const grandezas = [
            "tensao",
            "corrente",
            "potencia",
            "energia"
        ];

        if (!grandezas.includes(dados.grandeza)) {
            throw this.criarErro(
                "Grandeza inválida. Utilize tensao, corrente, potencia ou energia."
            );
        }

        // Operadores permitidos
        const operadores = [">", "<", ">=", "<="];

        if (!operadores.includes(dados.operador)) {
            throw this.criarErro(
                "Operador inválido. Utilize >, <, >= ou <=."
            );
        }

        const valor = Number(dados.valor);

        if (
            dados.valor === null ||
            dados.valor === undefined ||
            dados.valor === "" ||
            !Number.isFinite(valor) ||
            valor < 0
        ) {
            throw this.criarErro(
                "Valor do limite deve ser um número maior ou igual a zero."
            );
        }

        // Severidades permitidas no banco
        const severidades = [
            "meta",
            "informativo",
            "atencao",
            "critico"
        ];

        if (!severidades.includes(dados.severidade)) {
            throw this.criarErro(
                "Severidade inválida. Utilize meta, informativo, atencao ou critico."
            );
        }

        // ==================================
        // PERÍODO DE VIGÊNCIA
        // ==================================
        const validarData = (data, campo) => {
            if (
                typeof data !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(data)
            ) {
                throw this.criarErro(
                    `${campo} deve estar no formato YYYY-MM-DD.`
                );
            }

            const [ano, mes, dia] = data.split("-").map(Number);
            const dataUTC = new Date(Date.UTC(ano, mes - 1, dia));

            if (
                dataUTC.getUTCFullYear() !== ano ||
                dataUTC.getUTCMonth() !== mes - 1 ||
                dataUTC.getUTCDate() !== dia
            ) {
                throw this.criarErro(`${campo} inválida.`);
            }

            return data;
        };

        const periodo_inicial =
            dados.periodo_inicial == null ||
            dados.periodo_inicial === ""
                ? null
                : validarData(
                    dados.periodo_inicial,
                    "Período inicial"
                );

        const periodo_final =
            dados.periodo_final == null ||
            dados.periodo_final === ""
                ? null
                : validarData(
                    dados.periodo_final,
                    "Período final"
                );

        if (
            periodo_inicial &&
            periodo_final &&
            periodo_final < periodo_inicial
        ) {
            throw this.criarErro(
                "Período final não pode ser anterior ao inicial."
            );
        }

        // ==================================
        // ATIVO / INATIVO
        // ==================================
        const ativa =
            dados.ativa === undefined
                ? 1
                : this.validarStatus(dados.ativa);

        // ==================================
        // VÍNCULO COM LOCAL / SETOR / EQUIP.
        // ==================================
        const id_local =
            dados.id_local == null
                ? null
                : this.validarId(dados.id_local);

        const id_setor =
            dados.id_setor == null
                ? null
                : this.validarId(dados.id_setor);

        const id_equipamento =
            dados.id_equipamento == null
                ? null
                : this.validarId(dados.id_equipamento);

        const quantidadeVinculos = [
            id_local,
            id_setor,
            id_equipamento
        ].filter(id => id !== null).length;

        if (quantidadeVinculos !== 1) {
            throw this.criarErro(
                "Informe somente um vínculo: id_local, id_setor ou id_equipamento."
            );
        }

        // Confirma que o vínculo existe no MySQL
        const verificacoes = [
            { id: id_local, tabela: "tbl_local" },
            { id: id_setor, tabela: "tbl_setor" },
            { id: id_equipamento, tabela: "tbl_equipamento" }
        ];

        for (const verificacao of verificacoes) {
            if (verificacao.id === null) continue;

            // Os nomes das tabelas são constantes internas,
            // não são recebidos diretamente do usuário.
            const [registros] = await database.query(
                `SELECT id FROM ${verificacao.tabela} WHERE id = ?`,
                [verificacao.id]
            );

            if (registros.length === 0) {
                throw this.criarErro(
                    "Local, setor ou equipamento não encontrado.",
                    404
                );
            }
        }

        return {
            descricao,
            grandeza: dados.grandeza,
            operador: dados.operador,
            valor,
            severidade: dados.severidade,
            periodo_inicial,
            periodo_final,
            ativa,
            id_local,
            id_setor,
            id_equipamento
        };
    }

    // ======================================
    // VALIDAR STATUS
    // ======================================
    validarStatus(ativa) {
        if (
            ativa !== true &&
            ativa !== false &&
            ativa !== 1 &&
            ativa !== 0
        ) {
            throw this.criarErro(
                "O campo ativa deve ser true, false, 1 ou 0."
            );
        }

        return ativa === true || ativa === 1 ? 1 : 0;
    }

    // ======================================
    // GET - LISTAR TODOS
    // ======================================
    async listarTodos() {
        return limiteRepository.listarTodos();
    }

    // ======================================
    // GET - BUSCAR POR ID
    // ======================================
    async buscarPorId(id) {
        const idValidado = this.validarId(id);

        const limite = await limiteRepository.buscarPorId(
            idValidado
        );

        if (!limite) {
            throw this.criarErro(
                "Limite não encontrado.",
                404
            );
        }

        return limite;
    }

    // ======================================
    // GET - LISTAR ATIVOS
    // ======================================
    async listarAtivos() {
        return limiteRepository.listarAtivos();
    }

    // ======================================
    // POST - CADASTRAR LIMITE
    // ======================================
    async criar(dados) {
        const limite = await this.validarDados(dados);

        const id = await limiteRepository.criar(limite);

        return limiteRepository.buscarPorId(id);
    }

    // ======================================
    // PUT - ATUALIZAR LIMITE
    // ======================================
    async atualizar(id, dados) {
        const idValidado = this.validarId(id);

        await this.buscarPorId(idValidado);

        const limite = await this.validarDados(dados);

        await limiteRepository.atualizar(
            idValidado,
            limite
        );

        return limiteRepository.buscarPorId(idValidado);
    }

    // ======================================
    // PATCH - ATIVAR OU DESATIVAR
    // ======================================
    async atualizarStatus(id, ativa) {
        const idValidado = this.validarId(id);

        await this.buscarPorId(idValidado);

        const statusValidado = this.validarStatus(ativa);

        await limiteRepository.atualizarStatus(
            idValidado,
            statusValidado
        );

        return limiteRepository.buscarPorId(idValidado);
    }
}

export default new LimiteService();
