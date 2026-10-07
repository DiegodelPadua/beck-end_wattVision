// ==========================================
// SUBSCRIBER DE MEDIÇÕES - WATT VISION
// ==========================================

// Service responsável pelas regras de negócio
// e gravação das medições no banco de dados.
import medicaoService from "../services/medicaoService.js";


// Utiliza a conexão MQTT já criada no mqttClient.js.
import mqttClient from "./mqttClient.js";

// Importa as configurações MQTT.
import mqttConfig from "../config/mqttConfig.js";


// ==========================================
// ASSINATURA DO TÓPICO
// ==========================================

// Quando o Backend estiver conectado ao broker,
// realiza a assinatura do tópico de medições.
mqttClient.on("connect", () => {

    console.log(
        `[MQTT] Inscrevendo no tópico: ${mqttConfig.topicoMedicoes}`
    );

    mqttClient.subscribe(
        mqttConfig.topicoMedicoes,
        { qos: 0 },
        (erro) => {

            if (erro) {
                console.error(
                    "[MQTT] Erro ao assinar tópico:",
                    erro.message
                );

                return;
            }

            console.log(
                `[MQTT] Inscrito com sucesso em: ${mqttConfig.topicoMedicoes}`
            );
        }
    );
});


// ==========================================
// RECEBIMENTO DAS MENSAGENS
// ==========================================

mqttClient.on("message", async (topico, mensagem) => {

    // Ignora mensagens de outros tópicos.
    if (topico !== mqttConfig.topicoMedicoes) {
        return;
    }

    console.log("");
    console.log("========================================");
    console.log("       NOVA MEDIÇÃO RECEBIDA");
    console.log("========================================");

    console.log(`[MQTT] Tópico: ${topico}`);

    try {

        // Converte o Buffer recebido pelo MQTT para texto.
        const texto = mensagem.toString();

        // Converte o JSON recebido para objeto JavaScript.
        const medicao = JSON.parse(texto);

        console.log("[MQTT] Dados recebidos:");
        console.log(medicao);

        // ==========================================
        // GRAVAÇÃO DA MEDIÇÃO NO BANCO
        // ==========================================

        try {

            // Envia a medição para a camada de Service.
            // O Service fará as validações e utilizará
            // o Repository para gravar no MySQL.
            const idMedicao = await medicaoService.criar(medicao);

            console.log("");
            console.log(
                `[BANCO] Medição salva com sucesso! ID: ${idMedicao}`
            );

        } catch (erro) {

            console.error("");
            console.error(
                "[BANCO] Erro ao salvar medição:",
                erro.message
            );
        }

    } catch (erro) {

        console.error(
            "[MQTT] Mensagem recebida não contém um JSON válido:",
            erro.message
        );
    }

    console.log("========================================");
    console.log("");
});