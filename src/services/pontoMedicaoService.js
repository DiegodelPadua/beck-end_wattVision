
import pontoMedicaoRepository from "../database/monitoramento/pontoMedicaoRepository.js";

// ==========================================
// SERVICE - PONTOS DE MEDIÇÃO
// ==========================================
// Valida os dados e relacionamentos antes
// de executar operações no banco MySQL.

class PontoMedicaoService {

    criarErro(mensagem, status = 400) {
        const erro = new Error(mensagem);
        erro.status = status;
        return erro;
    }

    validarId(valor, campo = "ID") {
        if (
            valor === null ||
            valor === undefined ||
            typeof valor === "boolean" ||
            (typeof valor === "string" && !valor.trim())
        ) {
            throw this.criarErro(`${campo} inválido.`);
        }

        const numero = Number(valor);

        if (!Number.isSafeInteger(numero) || numero <= 0) {
            throw this.criarErro(`${campo} inválido.`);
        }

        return numero;
    }

    textoObrigatorio(valor, campo, limite) {
        if (
            typeof valor !== "string" ||
            !valor.trim() ||
            valor.trim().length > limite
        ) {
            throw this.criarErro(
                `${campo} obrigatório, com no máximo ${limite} caracteres.`
            );
        }

        return valor.trim();
    }

    textoOpcional(valor, campo, limite) {
        if (valor === null || valor === undefined || valor === "") {
            return null;
        }

        if (typeof valor !== "string") {
            throw this.criarErro(`${campo} inválido.`);
        }

        const texto = valor.trim();

        if (texto.length > limite) {
            throw this.criarErro(
                `${campo} permite no máximo ${limite} caracteres.`
            );
        }

        return texto || null;
    }

    validarStatus(status) {
        if (!["Ativo", "Inativo"].includes(status)) {
            throw this.criarErro(
                "Status deve ser Ativo ou Inativo."
            );
        }

        return status;
    }

    validarData(valor) {
        if (valor === undefined || valor === null || valor === "") {
            return null;
        }

        if (
            typeof valor !== "string" ||
            !/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/.test(valor)
        ) {
            throw this.criarErro(
                "data_instalacao deve estar no formato YYYY-MM-DD HH:mm:ss."
            );
        }

        const dataNormalizada =
            valor.length === 10 ? `${valor} 00:00:00` : valor;

        const data = new Date(
            dataNormalizada.replace(" ", "T") + "Z"
        );

        if (
            Number.isNaN(data.getTime()) ||
            data.toISOString().replace("T", " ").slice(0, 19) !==
                dataNormalizada
        ) {
            throw this.criarErro(
                "data_instalacao inválida."
            );
        }

        return dataNormalizada;
    }

    // ======================================
    // VALIDAR DADOS E RELACIONAMENTOS
    // ======================================
    async validarDados(dados) {
        if (
            !dados ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            throw this.criarErro(
                "Informe os dados do ponto de medição."
            );
        }

        const nome = this.textoObrigatorio(
            dados.nome,
            "Nome",
            100
        );

        const descricao = this.textoOpcional(
            dados.descricao,
            "Descrição",
            150
        );

        const data_instalacao = this.validarData(
            dados.data_instalacao
        );

        const status = this.validarStatus(
            dados.status ?? "Ativo"
        );

        const id_dispositivo_iot = this.validarId(
            dados.id_dispositivo_iot,
            "ID do dispositivo IoT"
        );

        // O ponto deve estar associado a exatamente
        // um nível: local, setor ou equipamento.
        const vinculos = [
            "id_local",
            "id_setor",
            "id_equipamento"
        ];

        const informados = vinculos.filter(
            campo =>
                dados[campo] !== null &&
                dados[campo] !== undefined &&
                dados[campo] !== ""
        );

        if (informados.length !== 1) {
            throw this.criarErro(
                "Informe exatamente um vínculo: id_local, id_setor ou id_equipamento."
            );
        }

        const ids = {
            id_local: null,
            id_setor: null,
            id_equipamento: null
        };

        const campo = informados[0];

        ids[campo] = this.validarId(
            dados[campo],
            campo
        );

        // Confirma o dispositivo IoT.
        const dispositivo =
            await pontoMedicaoRepository.buscarDispositivoPorId(
                id_dispositivo_iot
            );

        if (!dispositivo) {
            throw this.criarErro(
                "Dispositivo IoT não encontrado.",
                404
            );
        }

        // Confirma o vínculo informado.
        let entidade = null;

        if (ids.id_local !== null) {
            entidade =
                await pontoMedicaoRepository.buscarLocalPorId(
                    ids.id_local
                );
        }

        if (ids.id_setor !== null) {
            entidade =
                await pontoMedicaoRepository.buscarSetorPorId(
                    ids.id_setor
                );
        }

        if (ids.id_equipamento !== null) {
            entidade =
                await pontoMedicaoRepository.buscarEquipamentoPorId(
                    ids.id_equipamento
                );
        }

        if (!entidade) {
            throw this.criarErro(
                "Local, setor ou equipamento não encontrado.",
                404
            );
        }

        // Não permite ativar ponto associado
        // a uma entidade inativa.
        if (status === "Ativo") {
            if (
                entidade.status !== "Ativo" ||
                (entidade.status_local &&
                    entidade.status_local !== "Ativo") ||
                (entidade.status_setor &&
                    entidade.status_setor !== "Ativo")
            ) {
                throw this.criarErro(
                    "Não é possível ativar um ponto vinculado a uma entidade inativa."
                );
            }
        }

        return {
            nome,
            descricao,
            data_instalacao,
            status,
            ...ids,
            id_dispositivo_iot
        };
    }

    // ======================================
    // CONSULTAS
    // ======================================
    async listarTodos() {
        return pontoMedicaoRepository.listarTodos();
    }

    async buscarPorId(id) {
        const idValidado = this.validarId(id);

        const ponto =
            await pontoMedicaoRepository.buscarPorId(
                idValidado
            );

        if (!ponto) {
            throw this.criarErro(
                "Ponto de medição não encontrado.",
                404
            );
        }

        return ponto;
    }

    async listarPorDispositivo(idDispositivo) {
        const idValidado = this.validarId(
            idDispositivo,
            "ID do dispositivo IoT"
        );

        const dispositivo =
            await pontoMedicaoRepository.buscarDispositivoPorId(
                idValidado
            );

        if (!dispositivo) {
            throw this.criarErro(
                "Dispositivo IoT não encontrado.",
                404
            );
        }

        return pontoMedicaoRepository.listarPorDispositivo(
            idValidado
        );
    }

    // ======================================
    // CADASTRO
    // ======================================
    async criar(dados) {
        const dadosValidados = await this.validarDados(
            dados
        );

        return pontoMedicaoRepository.criar(
            dadosValidados
        );
    }

    // ======================================
    // ATUALIZAÇÃO
    // ======================================
    async atualizar(id, dados) {
        const idValidado = this.validarId(id);

        await this.buscarPorId(idValidado);

        const dadosValidados = await this.validarDados(
            dados
        );

        await pontoMedicaoRepository.atualizar(
            idValidado,
            dadosValidados
        );

        return this.buscarPorId(idValidado);
    }

    // ======================================
    // ATUALIZAÇÃO DE STATUS
    // ======================================
    async atualizarStatus(id, status) {
        const idValidado = this.validarId(id);

        const ponto = await this.buscarPorId(
            idValidado
        );

        const statusValidado = this.validarStatus(
            status
        );

        // Revalida os relacionamentos antes
        // de ativar o ponto.
        if (statusValidado === "Ativo") {
            await this.validarDados({
                nome: ponto.nome,
                descricao: ponto.descricao,
                data_instalacao: ponto.data_instalacao instanceof Date
                    ? [
                        ponto.data_instalacao.getUTCFullYear(),
                        String(ponto.data_instalacao.getUTCMonth() + 1).padStart(2, "0"),
                        String(ponto.data_instalacao.getUTCDate()).padStart(2, "0")
                    ].join("-") + " " + [
                        String(ponto.data_instalacao.getUTCHours()).padStart(2, "0"),
                        String(ponto.data_instalacao.getUTCMinutes()).padStart(2, "0"),
                        String(ponto.data_instalacao.getUTCSeconds()).padStart(2, "0")
                    ].join(":")
                    : ponto.data_instalacao,
                status: "Ativo",
                id_local: ponto.id_local,
                id_setor: ponto.id_setor,
                id_equipamento: ponto.id_equipamento,
                id_dispositivo_iot: ponto.id_dispositivo_iot
            });
        }

        await pontoMedicaoRepository.atualizarStatus(
            idValidado,
            statusValidado
        );

        return this.buscarPorId(idValidado);
    }
}

export default new PontoMedicaoService();
