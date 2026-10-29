
import alertaRepository from "../database/monitoramento/alertaRepository.js";
import database from "../config/database.js";

// ==========================================
// WATT VISION - SERVICE DE ALERTAS
// ==========================================

class AlertaService {

    criarErro(mensagem, status = 400) {
        const erro = new Error(mensagem);
        erro.status = status;
        return erro;
    }

    // ======================================
    // VALIDAR ID
    // ======================================
    validarId(id, campo = "ID") {
        if (
            id === null ||
            id === undefined ||
            id === "" ||
            typeof id === "boolean"
        ) {
            throw this.criarErro(`${campo} inválido.`);
        }

        const numero = Number(id);

        if (!Number.isSafeInteger(numero) || numero <= 0) {
            throw this.criarErro(`${campo} inválido.`);
        }

        return numero;
    }

    // ======================================
    // VALIDAR ID OPCIONAL
    // ======================================
    validarIdOpcional(id, campo) {
        if (id === null || id === undefined) {
            return null;
        }

        return this.validarId(id, campo);
    }

    // ======================================
    // VERIFICAR REGISTRO NO BANCO
    // ======================================
    async verificarRegistro(tabela, id, descricao) {
        if (id === null) return;

        // Os nomes das tabelas são definidos
        // internamente, não pelo usuário.
        const tabelasPermitidas = [
            "tbl_limite",
            "tbl_dispositivo_iot",
            "tbl_medicao",
            "tbl_usuario"
        ];

        if (!tabelasPermitidas.includes(tabela)) {
            throw this.criarErro("Tabela de consulta inválida.", 500);
        }

        const [registros] = await database.query(
            `SELECT id FROM ${tabela} WHERE id = ?`,
            [id]
        );

        if (registros.length === 0) {
            throw this.criarErro(
                `${descricao} não encontrado.`,
                404
            );
        }
    }

    // ======================================
    // VALIDAR DADOS DO ALERTA
    // ======================================
    async validarDados(dados) {
        if (
            !dados ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            throw this.criarErro("Dados do alerta inválidos.");
        }

        // Tipo de alerta obrigatório
        const id_tipo_alerta = this.validarId(
            dados.id_tipo_alerta,
            "Tipo de alerta"
        );

        const tipo = await alertaRepository.buscarTipoPorId(
            id_tipo_alerta
        );

        if (!tipo) {
            throw this.criarErro(
                "Tipo de alerta não encontrado.",
                404
            );
        }

        // Relacionamentos opcionais
        const id_limite = this.validarIdOpcional(
            dados.id_limite,
            "Limite"
        );

        const id_dispositivo_iot = this.validarIdOpcional(
            dados.id_dispositivo_iot,
            "Dispositivo IoT"
        );

        const id_medicao = this.validarIdOpcional(
            dados.id_medicao,
            "Medição"
        );

        await this.verificarRegistro(
            "tbl_limite",
            id_limite,
            "Limite"
        );

        await this.verificarRegistro(
            "tbl_dispositivo_iot",
            id_dispositivo_iot,
            "Dispositivo IoT"
        );

        await this.verificarRegistro(
            "tbl_medicao",
            id_medicao,
            "Medição"
        );

        // ==================================
        // SEVERIDADE
        // ==================================
        const severidades = [
            "informativo",
            "atencao",
            "critico"
        ];

        if (!severidades.includes(dados.severidade)) {
            throw this.criarErro(
                "Severidade inválida. Utilize informativo, atencao ou critico."
            );
        }

        // ==================================
        // VALORES ELÉTRICOS OPCIONAIS
        // ==================================
        const validarValor = (valor, campo) => {
            if (valor === null || valor === undefined) {
                return null;
            }

            if (
                valor === "" ||
                typeof valor === "boolean" ||
                !Number.isFinite(Number(valor))
            ) {
                throw this.criarErro(
                    `${campo} deve ser um número válido.`
                );
            }

            return Number(valor);
        };

        const valor_detectado = validarValor(
            dados.valor_detectado,
            "Valor detectado"
        );

        const valor_limite = validarValor(
            dados.valor_limite,
            "Valor limite"
        );

        // ==================================
        // MENSAGEM
        // ==================================
        const mensagem =
            typeof dados.mensagem === "string"
                ? dados.mensagem.trim()
                : "";

        if (!mensagem) {
            throw this.criarErro(
                "Mensagem do alerta obrigatória."
            );
        }

        return {
            id_tipo_alerta,
            id_limite,
            id_dispositivo_iot,
            id_medicao,
            valor_detectado,
            valor_limite,
            severidade: dados.severidade,
            mensagem
        };
    }

    // ======================================
    // GET - LISTAR TODOS
    // ======================================
    async listarTodos() {
        return alertaRepository.listarTodos();
    }

    // ======================================
    // GET - BUSCAR POR ID
    // ======================================
    async buscarPorId(id) {
        const idValidado = this.validarId(id);

        const alerta = await alertaRepository.buscarPorId(
            idValidado
        );

        if (!alerta) {
            throw this.criarErro(
                "Alerta não encontrado.",
                404
            );
        }

        return alerta;
    }

    // ======================================
    // GET - LISTAR ATIVOS
    // ======================================
    async listarAtivos() {
        return alertaRepository.listarAtivos();
    }

    // ======================================
    // GET - LISTAR POR DISPOSITIVO
    // ======================================
    async listarPorDispositivo(idDispositivo) {
        const idValidado = this.validarId(
            idDispositivo,
            "Dispositivo IoT"
        );

        await this.verificarRegistro(
            "tbl_dispositivo_iot",
            idValidado,
            "Dispositivo IoT"
        );

        return alertaRepository.listarPorDispositivo(
            idValidado
        );
    }

    // ======================================
    // POST - REGISTRAR ALERTA
    // ======================================
    async criar(dados) {
        const alerta = await this.validarDados(dados);

        const id = await alertaRepository.criar(alerta);

        return alertaRepository.buscarPorId(id);
    }

    // ======================================
    // PATCH - RECONHECER ALERTA
    // ======================================
    async reconhecer(id, idUsuario) {
        const idValidado = this.validarId(
            id,
            "Alerta"
        );

        const idUsuarioValidado = this.validarId(
            idUsuario,
            "Usuário"
        );

        const alerta = await this.buscarPorId(
            idValidado
        );

        if (alerta.status === "reconhecido") {
            throw this.criarErro(
                "Este alerta já foi reconhecido.",
                409
            );
        }

        await this.verificarRegistro(
            "tbl_usuario",
            idUsuarioValidado,
            "Usuário"
        );

        const atualizado = await alertaRepository.reconhecer(
            idValidado,
            idUsuarioValidado
        );

        if (!atualizado) {
            throw this.criarErro(
                "Não foi possível reconhecer o alerta.",
                409
            );
        }

        return alertaRepository.buscarPorId(
            idValidado
        );
    }
}

export default new AlertaService();
