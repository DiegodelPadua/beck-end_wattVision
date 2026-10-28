
import pzemService from "../services/pzemService.js";

// ==========================================
// WATT VISION - CONTROLLER PZEM
// ==========================================
// Recebe as requisições HTTP relacionadas
// aos sensores PZEM-004T.
//
// Encaminha os dados ao Service e retorna
// respostas padronizadas em JSON.
//
// As validações pertencem ao Service.
// As consultas SQL pertencem ao Repository.

class PzemController {

    // ======================================
    // TRATAMENTO PADRONIZADO DE ERROS
    // ======================================
    // Preserva os códigos HTTP definidos
    // pelo Service e protege detalhes de
    // erros internos do banco de dados.

    tratarErro(erro, res) {
        console.error("[PZEM]", erro);

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
                    ? "Erro interno ao processar o sensor PZEM."
                    : erro.message
        });
    }

    // ======================================
    // GET /api/pzems
    // ======================================
    // Lista todos os sensores cadastrados,
    // incluindo o nome do ponto de medição.

    async listarTodos(req, res) {
        try {
            const sensores = await pzemService.listarTodos();

            return res.status(200).json({
                sucesso: true,
                quantidade: sensores.length,
                dados: sensores
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // GET /api/pzems/:id
    // ======================================
    // Consulta um sensor pelo identificador.

    async buscarPorId(req, res) {
        try {
            const sensor = await pzemService.buscarPorId(
                req.params.id
            );

            return res.status(200).json({
                sucesso: true,
                dados: sensor
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // POST /api/pzems
    // ======================================
    // Cadastra um novo sensor vinculado
    // a um ponto de medição existente.

    async criar(req, res) {
        try {
            const id = await pzemService.criar(req.body);

            return res.status(201).json({
                sucesso: true,
                mensagem: "Sensor PZEM cadastrado com sucesso.",
                id_pzem: id
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // PUT /api/pzems/:id
    // ======================================
    // Atualiza as informações cadastrais
    // de um sensor PZEM existente.

    async atualizar(req, res) {
        try {
            const sensor = await pzemService.atualizar(
                req.params.id,
                req.body
            );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Sensor PZEM atualizado com sucesso.",
                dados: sensor
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // PATCH /api/pzems/:id/status
    // ======================================
    // Altera somente o status do sensor,
    // sem modificar seus demais dados.

    async atualizarStatus(req, res) {
        try {
            const sensor = await pzemService.atualizarStatus(
                req.params.id,
                req.body?.status
            );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Status do PZEM atualizado com sucesso.",
                dados: sensor
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }

    // ======================================
    // DELETE /api/pzems/:id
    // ======================================
    // Exclui o sensor somente quando não
    // existem medições vinculadas a ele.

    async excluir(req, res) {
        try {
            await pzemService.excluir(req.params.id);

            return res.status(200).json({
                sucesso: true,
                mensagem: "Sensor PZEM excluído com sucesso."
            });
        } catch (erro) {
            return this.tratarErro(erro, res);
        }
    }
}

// ==========================================
// EXPORTAÇÃO DO CONTROLLER
// ==========================================
// Disponibiliza uma instância do Controller
// para as rotas do Express.

export default new PzemController();
