
import medicaoService from "../services/medicaoService.js";

// ==========================================
// WATT VISION - CONTROLLER DE MEDIÇÕES
// ==========================================
// Responsável por receber requisições HTTP,
// chamar os métodos do Service e devolver
// respostas JSON padronizadas.
//
// O Controller não realiza consultas SQL
// nem valida as grandezas elétricas.
//
// Essas responsabilidades pertencem,
// respectivamente, ao Repository e Service.

class MedicaoController {

    // ======================================
    // TRATAMENTO PADRONIZADO DE ERROS
    // ======================================
    // Preserva os códigos HTTP definidos
    // pelo Service:
    //
    // 400 - Dados inválidos
    // 404 - Recurso não encontrado
    // 409 - Conflito com regras de negócio
    // 422 - Dados inconsistentes
    // 500 - Erro interno do servidor

    tratarErro(erro, res, contexto) {
        // Registra o erro completo no terminal
        // para facilitar o diagnóstico.
        console.error(`[MEDIÇÕES] ${contexto}:`, erro);

        // Somente utiliza códigos HTTP válidos.
        // Erros inesperados recebem status 500.
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
                    ? "Erro interno ao processar a medição."
                    : erro.message
        });
    }

    // ======================================
    // GET /api/medicoes
    // ======================================
    // Retorna todas as medições cadastradas
    // em ordem decrescente de data.

    async listarTodas(req, res) {
        try {
            const medicoes =
                await medicaoService.listarTodas();

            return res.status(200).json({
                sucesso: true,
                quantidade: medicoes.length,
                dados: medicoes
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao listar medições"
            );
        }
    }

    // ======================================
    // GET /api/medicoes/ultima
    // ======================================
    // Consulta a medição mais recente
    // registrada no MySQL.

    async buscarUltima(req, res) {
        try {
            const medicao =
                await medicaoService.buscarUltima();

            if (!medicao) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhuma medição encontrada."
                });
            }

            return res.status(200).json({
                sucesso: true,
                dados: medicao
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao buscar última medição"
            );
        }
    }

    // ======================================
    // GET /api/medicoes/resumo
    // ======================================
    // Fornece os indicadores elétricos
    // utilizados nos cards do dashboard.

    async obterResumo(req, res) {
        try {
            const resumo =
                await medicaoService.obterResumo();

            if (!resumo) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhuma medição disponível."
                });
            }

            return res.status(200).json({
                sucesso: true,
                dados: resumo
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao obter resumo elétrico"
            );
        }
    }

    // ======================================
    // GET /api/medicoes/serie-temporal
    // ======================================
    // Consulta o histórico de um PZEM
    // dentro das últimas horas.
    //
    // Exemplo:
    // ?id_pzem=1&horas=24

    async obterSerieTemporal(req, res) {
        try {
            const { id_pzem, horas } = req.query;

            // Se horas não for informado,
            // utiliza o padrão de 24 horas.
            const periodo =
                horas === undefined ? 24 : horas;

            const medicoes =
                await medicaoService.obterSerieTemporal(
                    id_pzem,
                    periodo
                );

            return res.status(200).json({
                sucesso: true,
                quantidade: medicoes.length,
                dados: medicoes
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao consultar série temporal"
            );
        }
    }

    // ======================================
    // GET /api/medicoes/ponto/:id/ultima
    // ======================================
    // Retorna a última leitura de cada
    // PZEM registrada no ponto informado.

    async buscarUltimasPorPonto(req, res) {
        try {
            const { id } = req.params;

            const medicoes =
                await medicaoService.buscarUltimasPorPonto(
                    id
                );

            return res.status(200).json({
                sucesso: true,
                id_ponto_medicao: Number(id),
                quantidade: medicoes.length,
                dados: medicoes
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao consultar ponto de medição"
            );
        }
    }

    // ======================================
    // GET /api/medicoes/consumo
    // ======================================
    // Calcula o consumo energético em kWh
    // e o custo estimado em reais.
    //
    // Exemplo:
    // ?id_pzem=1&inicio=2026-10-28&fim=2026-10-28

    async consultarConsumo(req, res) {
        try {
            const {
                id_pzem,
                inicio,
                fim
            } = req.query;

            const resultado =
                await medicaoService.calcularConsumo(
                    id_pzem,
                    inicio,
                    fim
                );

            return res.status(200).json({
                sucesso: true,
                dados: resultado
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao calcular consumo"
            );
        }
    }

    // ======================================
    // POST /api/medicoes
    // ======================================
    // Recebe uma nova leitura elétrica.
    //
    // O Service valida os valores, consulta
    // o PZEM e identifica automaticamente
    // o ponto de medição correspondente.

    async criar(req, res) {
        try {
            const id =
                await medicaoService.criar(req.body);

            return res.status(201).json({
                sucesso: true,
                mensagem: "Medição cadastrada com sucesso.",
                id_medicao: id
            });

        } catch (erro) {
            return this.tratarErro(
                erro,
                res,
                "Erro ao cadastrar medição"
            );
        }
    }
}

// ==========================================
// EXPORTAÇÃO DO CONTROLLER
// ==========================================
// Exporta uma instância para utilização
// pelo arquivo medicaoRoutes.js.

export default new MedicaoController();
