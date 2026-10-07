// ==========================================
// CLIENTE MQTT - WATT VISION
// ==========================================

// Biblioteca responsável pela comunicação MQTT.
import mqtt from "mqtt";

// Configurações centralizadas do MQTT.
import mqttConfig from "../config/mqttConfig.js";


// ==========================================
// CRIAÇÃO DO CLIENTE MQTT
// ==========================================

// Conecta o Backend ao broker configurado no .env.
const mqttClient = mqtt.connect(
    mqttConfig.url,
    {
        clientId: mqttConfig.clientId,
        reconnectPeriod: mqttConfig.reconnectPeriod,
        connectTimeout: mqttConfig.connectTimeout
    }
);


// ==========================================
// EVENTO: CONEXÃO REALIZADA
// ==========================================

mqttClient.on("connect", () => {

    console.log("");
    console.log("========================================");
    console.log("           MQTT - WATT VISION");
    console.log("========================================");

    console.log("[MQTT] Conectado ao broker com sucesso!");

    console.log("========================================");
    console.log("");

});


// ==========================================
// EVENTO: TENTATIVA DE RECONEXÃO
// ==========================================

mqttClient.on("reconnect", () => {

    console.log(
        "[MQTT] Tentando reconectar ao broker..."
    );

});


// ==========================================
// EVENTO: CONEXÃO ENCERRADA
// ==========================================

mqttClient.on("close", () => {

    console.log(
        "[MQTT] Conexão com o broker encerrada."
    );

});


// ==========================================
// EVENTO: ERRO MQTT
// ==========================================

mqttClient.on("error", (erro) => {

    console.error(
        "[MQTT] Erro:",
        erro.message
    );

});


// ==========================================
// EXPORTAÇÃO
// ==========================================

// Permite que outros módulos utilizem
// a mesma conexão MQTT.
export default mqttClient;