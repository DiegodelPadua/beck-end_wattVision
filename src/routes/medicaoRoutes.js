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

// ==========================================
// GET /api/medicoes/ultima
// ==========================================
// Retorna a medição mais recente do banco.
// Deve ser declarada antes de futuras rotas
// dinâmicas, como GET /:id.

router.get(
    "/ultima",
    medicaoController.buscarUltima
);


// ==========================================
// GET /api/medicoes/resumo
// ==========================================
// Fornece os indicadores elétricos para
// os cards do dashboard.

router.get(
    "/resumo",
    medicaoController.obterResumo
);


// ==========================================
// GET /api/medicoes/serie-temporal
// ==========================================
// Consulta medições de um PZEM por período.
// Exemplo: ?id_pzem=1&horas=24

router.get(
    "/serie-temporal",
    medicaoController.obterSerieTemporal
);


// ==========================================
// GET /api/medicoes/ponto/:id/ultima
// ==========================================
// Retorna a última medição de cada PZEM
// associado ao ponto de medição informado.

router.get(
    "/ponto/:id/ultima",
    medicaoController.buscarUltimasPorPonto
);

// ==========================================
// GET /api/medicoes/consumo
// ==========================================
// Calcula consumo e custo por PZEM e período.

router.get(
    "/consumo",
    medicaoController.consultarConsumo
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