// Importa o Service responsável
// pelas regras de negócio das medições.
import medicaoService
    from "../services/medicaoService.js";


// ==========================================
// CONTROLLER - MEDIÇÃO
// ==========================================
//
// Recebe as requisições HTTP,
// chama o Service e devolve a resposta.

class MedicaoController {

    // ======================================
    // LISTAR TODAS AS MEDIÇÕES
    // ======================================

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

            console.error(
                "Erro ao listar medições:",
                erro
            );

            return res.status(500).json({
                sucesso: false,
                mensagem:
                    "Erro interno ao buscar as medições."
            });
        }

    }


        // ======================================
        // OBTER RESUMO ELÉTRICO
        // ======================================
        // Prepara a resposta HTTP para o dashboard.

        async obterResumo(req, res) {
            try {
                const resumo = await medicaoService.obterResumo();

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
                console.error("Erro ao obter resumo:", erro);

                return res.status(500).json({
                    sucesso: false,
                    mensagem: "Erro interno ao obter resumo elétrico."
                });
            }
        }


    // ======================================
    // BUSCAR A ÚLTIMA MEDIÇÃO
    // ======================================
    // Recebe a requisição HTTP, consulta o
    // Service e devolve a última medição.

    async buscarUltima(req, res) {

        try {

            // Solicita ao Service a medição mais recente.
            const medicao =
                await medicaoService.buscarUltima();

            // Caso o banco ainda não tenha medições.
            if (!medicao) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhuma medição encontrada."
                });
            }

            // Retorna somente um registro.
            return res.status(200).json({
                sucesso: true,
                dados: medicao
            });

        } catch (erro) {

            // Registra o erro para diagnóstico.
            console.error(
                "Erro ao buscar última medição:",
                erro
            );

            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro interno ao buscar a última medição."
            });
        }
    }


    // ==========================================
    // CONSULTAR SÉRIE TEMPORAL
    // ==========================================
    // Recebe os filtros e retorna as medições
    // para os gráficos históricos do dashboard.

    async obterSerieTemporal(req, res) {
        try {
            const { id_pzem, horas } = req.query;

            const dados = await medicaoService.obterSerieTemporal(
                id_pzem,
                horas
            );

            return res.status(200).json({
                sucesso: true,
                quantidade: dados.length,
                dados
            });

        } catch (erro) {
            console.error("Erro na série temporal:", erro);

            // Erros de validação dos filtros.
            if (erro.status === 400) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: erro.message
                });
            }

            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro interno ao consultar histórico."
            });
        }
    }


    // ==========================================
    // ÚLTIMAS MEDIÇÕES DE UM PONTO
    // ==========================================
    // Consulta as últimas leituras dos PZEMs
    // associados ao ponto informado na URL.

    async buscarUltimasPorPonto(req, res) {

        try {
            const { id } = req.params;

            const medicoes =
                await medicaoService.buscarUltimasPorPonto(id);

            return res.status(200).json({
                sucesso: true,
                id_ponto_medicao: Number(id),
                quantidade: medicoes.length,
                dados: medicoes
            });

        } catch (erro) {
            console.error(
                "Erro ao consultar ponto de medição:",
                erro
            );

            if (erro.status === 400) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: erro.message
                });
            }

            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro interno ao consultar o ponto de medição."
            });
        }
    }


    // ==========================================
    // CONSULTAR CONSUMO E CUSTO
    // ==========================================
    // Recebe os parâmetros do Postman ou
    // Front-end e solicita o cálculo ao Service.

    async consultarConsumo(req, res) {

        try {
            const { id_pzem, inicio, fim } = req.query;

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

            console.error(
                "Erro ao calcular consumo:",
                erro
            );

            return res.status(erro.status || 500).json({
                sucesso: false,
                mensagem: erro.status
                    ? erro.message
                    : "Erro interno ao calcular consumo."
            });
        }
    }


    // ======================================
    // CRIAR UMA NOVA MEDIÇÃO
    // ======================================

    async criar(req, res) {

        try {

            // req.body contém o JSON enviado
            // para o Backend.
            const dados = req.body;


            // Envia os dados para o Service.
            const id =
                await medicaoService.criar(dados);


            // HTTP 201 significa:
            // recurso criado com sucesso.
            return res.status(201).json({

                sucesso: true,

                mensagem:
                    "Medição cadastrada com sucesso.",

                id_medicao: id
            });

        } catch (erro) {

            console.error(
                "Erro ao cadastrar medição:",
                erro
            );


            // Por enquanto retornamos 400
            // para erros ocorridos durante
            // a validação/cadastro.
            return res.status(400).json({

                sucesso: false,

                mensagem: erro.message
            });
        }
    }
}


// Exporta uma instância do Controller.
export default new MedicaoController();