// Importa o Router do Express.
import { Router } from "express";

// Importa o Controller de medições.
import medicaoController
    from "../controllers/medicaoController.js";


// Cria o roteador.
const router = Router();


// ==========================================
// ROTAS - MEDIÇÕES
// ==========================================


// GET /api/medicoes
//
// Retorna todas as medições.
router.get(
    "/",
    medicaoController.listarTodas
);


// POST /api/medicoes
//
// Cadastra uma nova medição.
router.post(
    "/",
    medicaoController.criar
);


// Exporta o Router.
export default router;