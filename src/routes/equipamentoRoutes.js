
import { Router } from "express";

import equipamentoController from
    "../controllers/equipamentoController.js";

// Cria o roteador de equipamentos.
const router = Router();

// Lista todos os equipamentos.
router.get("/", equipamentoController.listarTodos);

// Lista os equipamentos de um setor.
// Esta rota deve vir antes de /:id.
router.get(
    "/setor/:idSetor",
    equipamentoController.listarPorSetor
);

// Consulta um equipamento pelo ID.
router.get("/:id", equipamentoController.buscarPorId);

export default router;
