
import { Router } from "express";
import pzemController from "../controllers/pzemController.js";

// ==========================================
// WATT VISION - ROTAS PZEM
// ==========================================
// Gerencia os endpoints dos sensores
// PZEM-004T utilizados no monitoramento.
//
// Prefixo configurado em index.js:
// /api/pzems

const router = Router();

// ==========================================
// LISTAR TODOS OS SENSORES
// ==========================================
// GET /api/pzems

router.get("/", (req, res) =>
    pzemController.listarTodos(req, res)
);

// ==========================================
// CONSULTAR SENSOR POR ID
// ==========================================
// GET /api/pzems/:id

router.get("/:id", (req, res) =>
    pzemController.buscarPorId(req, res)
);

// ==========================================
// CADASTRAR SENSOR
// ==========================================
// POST /api/pzems

router.post("/", (req, res) =>
    pzemController.criar(req, res)
);

// ==========================================
// ATUALIZAR SENSOR
// ==========================================
// PUT /api/pzems/:id

router.put("/:id", (req, res) =>
    pzemController.atualizar(req, res)
);

// ==========================================
// ALTERAR STATUS DO SENSOR
// ==========================================
// PATCH /api/pzems/:id/status

router.patch("/:id/status", (req, res) =>
    pzemController.atualizarStatus(req, res)
);

// ==========================================
// EXCLUIR SENSOR
// ==========================================
// DELETE /api/pzems/:id

router.delete("/:id", (req, res) =>
    pzemController.excluir(req, res)
);

// ==========================================
// EXPORTAÇÃO DAS ROTAS
// ==========================================

export default router;
