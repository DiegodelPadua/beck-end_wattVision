// ==========================================
// BACKEND - WATT VISION
// ==========================================

// Importa a aplicação Express configurada no arquivo src/app.js
import app from "./src/app.js";

// Inicializa a conexão MQTT do Backend com o broker
import "./src/mqtt/medicaoSubscriber.js";


// ==========================================
// CONFIGURAÇÃO DO SERVIDOR
// ==========================================

// Utiliza a porta definida no .env.
// Caso não exista, utiliza 3000 como padrão.
const PORT = process.env.PORT || 3000;


// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================

// Inicia o servidor HTTP do Watt Vision.
app.listen(PORT, () => {

    console.log("");
    console.log("========================================");
    console.log("         BACKEND - WATT VISION");
    console.log("========================================");

    console.log(`Servidor rodando na porta ${PORT}`);

    console.log("========================================");
    console.log("");
});