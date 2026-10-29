
import tarifaRepository from "../database/monitoramento/tarifaRepository.js";

// ==========================================
// WATT VISION - SERVICE DE TARIFAS
// ==========================================

class TarifaService {

    criarErro(mensagem, status = 400) {
        const erro = new Error(mensagem);
        erro.status = status;
        return erro;
    }

    // ======================================
    // VALIDAÇÃO DO ID
    // ======================================
    validarId(id) {
        const numero = Number(id);

        if (!Number.isSafeInteger(numero) || numero <= 0) {
            throw this.criarErro("ID inválido.");
        }

        return numero;
    }

    // ======================================
    // VALIDAÇÃO DO STATUS
    // ======================================
    validarStatus(status) {
        if (!["Ativa", "Inativa"].includes(status)) {
            throw this.criarErro(
                "Status deve ser Ativa ou Inativa."
            );
        }

        return status;
    }

    // ======================================
    // VALIDAÇÃO DAS DATAS
    // ======================================
    validarData(data, campo) {
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
    }

    // ======================================
    // VALIDAÇÃO DOS DADOS
    // ======================================
    async validarDados(dados) {
        if (
            !dados ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            throw this.criarErro("Dados da tarifa inválidos.");
        }

        const id_empresa = this.validarId(dados.id_empresa);

        const empresa = await tarifaRepository.buscarEmpresaPorId(
            id_empresa
        );

        if (!empresa) {
            throw this.criarErro(
                "Empresa não encontrada.",
                404
            );
        }

        if (empresa.status !== "Ativa") {
            throw this.criarErro(
                "Não é possível cadastrar ou atualizar uma tarifa de empresa inativa."
            );
        }

        const descricao =
            typeof dados.descricao === "string"
                ? dados.descricao.trim()
                : "";

        if (!descricao) {
            throw this.criarErro(
                "Descrição da tarifa obrigatória."
            );
        }

        const valor_kwh = Number(dados.valor_kwh);

        if (
            dados.valor_kwh === null ||
            dados.valor_kwh === undefined ||
            dados.valor_kwh === "" ||
            !Number.isFinite(valor_kwh) ||
            valor_kwh <= 0
        ) {
            throw this.criarErro(
                "Valor do kWh deve ser maior que zero."
            );
        }

        const data_inicial = this.validarData(
            dados.data_inicial,
            "Data inicial"
        );

        const data_final =
            dados.data_final == null || dados.data_final === ""
                ? null
                : this.validarData(
                    dados.data_final,
                    "Data final"
                );

        if (data_final && data_final < data_inicial) {
            throw this.criarErro(
                "Data final não pode ser anterior à data inicial."
            );
        }

        const status = this.validarStatus(
            dados.status ?? "Ativa"
        );

        return {
            id_empresa,
            descricao,
            valor_kwh,
            data_inicial,
            data_final,
            status
        };
    }

    // ======================================
    // GET - LISTAR TODAS
    // ======================================
    async listarTodas() {
        return tarifaRepository.listarTodas();
    }

    // ======================================
    // GET - BUSCAR POR ID
    // ======================================
    async buscarPorId(id) {
        const idValidado = this.validarId(id);

        const tarifa = await tarifaRepository.buscarPorId(
            idValidado
        );

        if (!tarifa) {
            throw this.criarErro(
                "Tarifa não encontrada.",
                404
            );
        }

        return tarifa;
    }

    // ======================================
    // GET - LISTAR POR EMPRESA
    // ======================================
    async listarPorEmpresa(idEmpresa) {
        const idValidado = this.validarId(idEmpresa);

        const empresa = await tarifaRepository.buscarEmpresaPorId(
            idValidado
        );

        if (!empresa) {
            throw this.criarErro(
                "Empresa não encontrada.",
                404
            );
        }

        return tarifaRepository.listarPorEmpresa(idValidado);
    }

    // ======================================
    // POST - CADASTRAR TARIFA
    // ======================================
    async criar(dados) {
        const tarifa = await this.validarDados(dados);

        const id = await tarifaRepository.criar(tarifa);

        return tarifaRepository.buscarPorId(id);
    }

    // ======================================
    // PUT - ATUALIZAR TARIFA
    // ======================================
    async atualizar(id, dados) {
        const idValidado = this.validarId(id);

        await this.buscarPorId(idValidado);

        const tarifa = await this.validarDados(dados);

        await tarifaRepository.atualizar(
            idValidado,
            tarifa
        );

        return tarifaRepository.buscarPorId(idValidado);
    }

    // ======================================
    // PATCH - ALTERAR STATUS
    // ======================================
    async atualizarStatus(id, status) {
        const idValidado = this.validarId(id);

        await this.buscarPorId(idValidado);

        const statusValidado = this.validarStatus(status);

        await tarifaRepository.atualizarStatus(
            idValidado,
            statusValidado
        );

        return tarifaRepository.buscarPorId(idValidado);
    }
}

export default new TarifaService();
