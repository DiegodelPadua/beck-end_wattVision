
import dispositivoIotService from "../services/dispositivoIotService.js";

// ==========================================
// CONTROLLER - DISPOSITIVOS IOT
// ==========================================
// Responsável por receber as requisições HTTP,
// encaminhar os dados para o Service e retornar
// respostas JSON padronizadas.
//
// As validações são realizadas pelo Service.
// As consultas SQL são realizadas pelo Repository.

class DispositivoIotController {

    // ======================================
    // TRATAMENTO PADRONIZADO DE ERROS
    // ======================================
    // Utiliza o status HTTP informado pelo
    // Service ou retorna 500 para erros
    // internos não previstos.

    tratarErro(erro, res) {
        console.error("[DISPOSITIVO IOT]", erro);

        const status =
            Number.isInteger(erro.status) &&
            erro.status >= 400 &&
            erro.status <= 599
                ? erro.status
                : 500;

        return res.status(status).json({
            sucesso: false,
            mensagem:
                status === 500
                    ? "Erro interno ao processar o dispositivo IoT."
                    : erro.message
        });
    }

    // ======================================
    // GET /api/dispositivos-iot
    // ======================================
    // Lista todos os dispositivos cadastrados.

    async listarTodos(req, res) {
        try {
            const dispositivos =
                await dispositivoIotService.listarTodos();

            return res.status(200).json({
                sucesso: true,
                quantidade: dispositivos.length,
                dados: dispositivos
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // GET /api/dispositivos-iot/:id
    // ======================================
    // Consulta um dispositivo pelo ID.

    async buscarPorId(req, res) {
        try {
            const dispositivo =
                await dispositivoIotService.buscarPorId(
                    req.params.id
                );

            return res.status(200).json({
                sucesso: true,
                dados: dispositivo
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // POST /api/dispositivos-iot
    // ======================================
    // Cadastra um dispositivo ESP32.

    async criar(req, res) {
        try {
            const id =
                await dispositivoIotService.criar(
                    req.body
                );

            return res.status(201).json({
                sucesso: true,
                mensagem: "Dispositivo IoT cadastrado com sucesso.",
                id_dispositivo_iot: id
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // PUT /api/dispositivos-iot/:id
    // ======================================
    // Atualiza os dados cadastrais e as
    // configurações de comunicação do ESP32.

    async atualizar(req, res) {
        try {
            const dispositivo =
                await dispositivoIotService.atualizar(
                    req.params.id,
                    req.body
                );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Dispositivo IoT atualizado com sucesso.",
                dados: dispositivo
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // PATCH /api/dispositivos-iot/:id/status
    // ======================================
    // Atualiza somente o status de comunicação
    // do dispositivo, sem alterar seu cadastro.

    async atualizarStatus(req, res) {
        try {
            const dispositivo =
                await dispositivoIotService.atualizarStatus(
                    req.params.id,
                    req.body?.status
                );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Status do dispositivo IoT atualizado com sucesso.",
                dados: dispositivo
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // DELETE /api/dispositivos-iot/:id
    // ======================================
    // Exclui um dispositivo apenas quando
    // não houver pontos de medição vinculados.

    async excluir(req, res) {
        try {
            await dispositivoIotService.excluir(
                req.params.id
            );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Dispositivo IoT excluído com sucesso."
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }
}

// ==========================================
// EXPORTAÇÃO DO CONTROLLER
// ==========================================
// Exporta uma instância única para utilização
// pelas rotas do Express.

export default new DispositivoIotController();
