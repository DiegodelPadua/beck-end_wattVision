
import { Router } from "express";
import tarifaController from "../controllers/tarifaController.js";

// ==========================================
// WATT VISION - ROTAS DE TARIFAS
// ==========================================

const router = Router();

// GET - Listar todas as tarifas
router.get("/", (req, res) =>
    tarifaController.listarTodas(req, res)
);

// GET - Listar tarifas por empresa
// Deve ficar antes de /:id
router.get("/empresa/:idEmpresa", (req, res) =>
    tarifaController.listarPorEmpresa(req, res)
);

// GET - Buscar tarifa por ID
router.get("/:id", (req, res) =>
    tarifaController.buscarPorId(req, res)
);

// POST - Cadastrar tarifa
router.post("/", (req, res) =>
    tarifaController.criar(req, res)
);

// PUT - Atualizar tarifa
router.put("/:id", (req, res) =>
    tarifaController.atualizar(req, res)
);

// PATCH - Ativar ou inativar tarifa
router.patch("/:id/status", (req, res) =>
    tarifaController.atualizarStatus(req, res)
);

export default router;
