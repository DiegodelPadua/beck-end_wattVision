
import { Router } from "express";
import limiteController from "../controllers/limiteController.js";

// ==========================================
// WATT VISION - ROTAS DE LIMITES
// ==========================================

const router = Router();

// GET - Listar todos os limites
router.get("/", (req, res) =>
    limiteController.listarTodos(req, res)
);

// GET - Listar somente limites ativos
// Esta rota deve ficar antes de /:id
router.get("/ativos", (req, res) =>
    limiteController.listarAtivos(req, res)
);

// GET - Buscar limite por ID
router.get("/:id", (req, res) =>
    limiteController.buscarPorId(req, res)
);

// POST - Cadastrar limite
router.post("/", (req, res) =>
    limiteController.criar(req, res)
);

// PUT - Atualizar limite
router.put("/:id", (req, res) =>
    limiteController.atualizar(req, res)
);

// PATCH - Ativar ou desativar limite
router.patch("/:id/status", (req, res) =>
    limiteController.atualizarStatus(req, res)
);

export default router;
