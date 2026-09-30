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