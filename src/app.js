// Importa o framework Express.
import express from "express";

// Importa o CORS.
// Permite comunicação entre Front-end e Back-end.
import cors from "cors";

// Importa o conjunto principal de rotas da API.
import routes from "./routes/index.js";


// Cria a aplicação Express.
const app = express();


// ==========================================
// MIDDLEWARES
// ==========================================

// Habilita o CORS.
app.use(cors());

// Permite que o Backend receba JSON.
app.use(express.json());


// ==========================================
// ROTA DE TESTE
// ==========================================

// Utilizada para verificar se o servidor
// está funcionando.
app.get("/", (req, res) => {

    res.json({
        sistema: "Watt Vision",
        status: "Backend funcionando"
    });
});


// ==========================================
// ROTAS DA API
// ==========================================

// Todas as rotas do sistema começam
// com o prefixo /api.
app.use("/api", routes);


// Exporta a aplicação para o server.js.
export default app;