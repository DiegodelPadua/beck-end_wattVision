
import empresaRepository from "../database/monitoramento/empresaRepository.js";

// ==========================================
// SERVICE - EMPRESAS - WATT VISION
// ==========================================

class EmpresaService {

    criarErro(mensagem, status = 400) {
        const erro = new Error(mensagem);
        erro.status = status;
        return erro;
    }

    validarId(id) {
        const numero = Number(id);

        if (!Number.isSafeInteger(numero) || numero <= 0) {
            throw this.criarErro(
                "ID da empresa inválido.",
                400
            );
        }

        return numero;
    }

    validarStatus(status) {
        if (!["Ativa", "Inativa"].includes(status)) {
            throw this.criarErro(
                "O status deve ser Ativa ou Inativa.",
                400
            );
        }

        return status;
    }

    validarDados(dados) {
        if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
            throw this.criarErro("Dados da empresa inválidos.");
        }

        const razao_social = dados.razao_social?.trim();
        const cnpj = dados.cnpj?.trim();

        if (!razao_social || razao_social.length > 150) {
            throw this.criarErro(
                "Razão social obrigatória, com no máximo 150 caracteres."
            );
        }

        if (!cnpj || !/^\d{14}$/.test(cnpj)) {
            throw this.criarErro(
                "CNPJ obrigatório, contendo exatamente 14 números."
            );
        }

        const nome_fantasia = dados.nome_fantasia?.trim() || null;
        const email = dados.email?.trim() || null;
        const telefone = dados.telefone?.trim() || null;
        const status = this.validarStatus(dados.status ?? "Ativa");

        return {
            razao_social,
            nome_fantasia,
            cnpj,
            email,
            telefone,
            status
        };
    }

    // ======================================
    // GET - LISTAR TODAS
    // ======================================
    async listarTodas() {
        return empresaRepository.listarTodas();
    }

    // ======================================
    // GET - BUSCAR POR ID
    // ======================================
    async buscarPorId(id) {
        const idValidado = this.validarId(id);

        const empresa = await empresaRepository.buscarPorId(idValidado);

        if (!empresa) {
            throw this.criarErro(
                "Empresa não encontrada.",
                404
            );
        }

        return empresa;
    }

    // ======================================
    // POST - CADASTRAR
    // ======================================
    async criar(dados) {
        const dadosValidados = this.validarDados(dados);

        const existente = await empresaRepository.buscarPorCnpj(
            dadosValidados.cnpj
        );

        if (existente) {
            throw this.criarErro(
                "Já existe uma empresa cadastrada com esse CNPJ.",
                409
            );
        }

        const id = await empresaRepository.criar(dadosValidados);

        return empresaRepository.buscarPorId(id);
    }

    // ======================================
    // PUT - ATUALIZAR
    // ======================================
    async atualizar(id, dados) {
        const idValidado = this.validarId(id);

        await this.buscarPorId(idValidado);

        const dadosValidados = this.validarDados(dados);

        const existente = await empresaRepository.buscarPorCnpj(
            dadosValidados.cnpj
        );

        if (existente && existente.id !== idValidado) {
            throw this.criarErro(
                "Este CNPJ já pertence a outra empresa.",
                409
            );
        }

        await empresaRepository.atualizar(
            idValidado,
            dadosValidados
        );

        return empresaRepository.buscarPorId(idValidado);
    }

    // ======================================
    // PATCH - ATUALIZAR STATUS
    // ======================================
    async atualizarStatus(id, status) {
        const idValidado = this.validarId(id);

        await this.buscarPorId(idValidado);

        const statusValidado = this.validarStatus(status);

        await empresaRepository.atualizarStatus(
            idValidado,
            statusValidado
        );

        return empresaRepository.buscarPorId(idValidado);
    }
}

export default new EmpresaService();
