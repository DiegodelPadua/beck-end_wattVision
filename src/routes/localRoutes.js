
import { Router } from "express";
import localController from "../controllers/localController.js";

// ==========================================
// ROTAS - LOCAIS
// ==========================================
// Define os endpoints HTTP para o cadastro
// e gerenciamento dos locais.

const router = Router();

// Lista todos os locais.
router.get("/", (req, res) =>
    localController.listarTodos(req, res)
);

// Consulta um local pelo ID.
router.get("/:id", (req, res) =>
    localController.buscarPorId(req, res)
);

// Cadastra um local.
router.post("/", (req, res) =>
    localController.criar(req, res)
);

// Atualiza todos os campos editáveis do local.
router.put("/:id", (req, res) =>
    localController.atualizar(req, res)
);

// Altera somente o status do local.
router.patch("/:id/status", (req, res) =>
    localController.atualizarStatus(req, res)
);

export default router;
