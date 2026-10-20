
import { Router } from "express";
import setorController from "../controllers/setorController.js";

// ==========================================
// ROTAS - SETORES
// ==========================================

const router = Router();

// Lista os setores cadastrados.
router.get("/", (req, res) =>
    setorController.listarTodos(req, res)
);

// Lista setores de um local específico.
// Esta rota deve ficar antes de "/:id".
router.get("/local/:idLocal", (req, res) =>
    setorController.listarPorLocal(req, res)
);

// Consulta um setor pelo ID.
router.get("/:id", (req, res) =>
    setorController.buscarPorId(req, res)
);

// Cadastra um setor.
router.post("/", (req, res) =>
    setorController.criar(req, res)
);

// Atualiza um setor.
router.put("/:id", (req, res) =>
    setorController.atualizar(req, res)
);

// Ativa ou desativa um setor.
router.patch("/:id/status", (req, res) =>
    setorController.atualizarStatus(req, res)
);

export default router;
