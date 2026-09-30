// Importa o Repository responsável
// pelas operações da tabela tbl_medicao.
import medicaoRepository
    from "../database/monitoramento/medicaoRepository.js";


// ==========================================
// SERVICE - MEDIÇÃO
// ==========================================
//
// Aqui ficam as regras de negócio
// relacionadas às medições.

class MedicaoService {

    // ======================================
    // LISTAR TODAS AS MEDIÇÕES
    // ======================================

    async listarTodas() {

        const medicoes =
            await medicaoRepository.listarTodas();

        return medicoes;
    }


    // ======================================
    // CRIAR UMA NOVA MEDIÇÃO
    // ======================================

    async criar(dados) {

        // Extrai os dados recebidos.
        const {
            id_pzem,
            tensao,
            corrente,
            potencia_ativa,
            energia_acumulada,
            frequencia,
            fator_potencia
        } = dados;


        // ==================================
        // VALIDAÇÕES BÁSICAS
        // ==================================

        // O PZEM precisa estar identificado.
        if (id_pzem === undefined || id_pzem === null) {
            throw new Error(
                "O campo id_pzem é obrigatório."
            );
        }


        // As grandezas elétricas também
        // precisam estar presentes.
        if (
            tensao === undefined ||
            corrente === undefined ||
            potencia_ativa === undefined ||
            energia_acumulada === undefined ||
            frequencia === undefined ||
            fator_potencia === undefined
        ) {
            throw new Error(
                "Todas as grandezas elétricas são obrigatórias."
            );
        }


        // Fator de potência deve ficar
        // entre 0 e 1.
        if (
            fator_potencia < 0 ||
            fator_potencia > 1
        ) {
            throw new Error(
                "O fator de potência deve estar entre 0 e 1."
            );
        }


        // Monta o objeto que será enviado
        // para o Repository.
        const medicao = {
            id_pzem,
            tensao,
            corrente,
            potencia_ativa,
            energia_acumulada,
            frequencia,
            fator_potencia
        };


        // Solicita ao Repository a gravação.
        const id =
            await medicaoRepository.criar(medicao);


        // Retorna o ID da medição criada.
        return id;
    }
}


// Exporta uma instância do Service.
export default new MedicaoService();