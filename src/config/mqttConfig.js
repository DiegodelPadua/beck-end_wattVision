// ==========================================
// CONFIGURAÇÃO MQTT - WATT VISION
// ==========================================

// Centraliza as configurações utilizadas
// para conectar o Backend ao broker MQTT.

const mqttConfig = {

    // Endereço do broker.
    url: process.env.MQTT_BROKER_URL,

    // Identificador exclusivo do Backend.
    clientId: "wattvision_backend",

    // Tópico utilizado para receber medições.
    topicoMedicoes: process.env.MQTT_TOPIC_MEDICOES,

    // Reconexão automática a cada 5 segundos.
    reconnectPeriod: 5000,

    // Tempo máximo para estabelecer conexão.
    connectTimeout: 10000
};

export default mqttConfig;