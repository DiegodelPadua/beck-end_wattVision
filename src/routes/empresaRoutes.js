
import { Router } from "express";
import empresaController from "../controllers/empresaController.js";

const router = Router();

// ==========================================
// ROTAS DE EMPRESAS - WATT VISION
// ==========================================

// Listar todas as empresas
router.get("/", (req, res) =>
    empresaController.listarTodas(req, res)
);

// Buscar empresa por ID
router.get("/:id", (req, res) =>
    empresaController.buscarPorId(req, res)
);

// Cadastrar empresa
router.post("/", (req, res) =>
    empresaController.criar(req, res)
);

// Atualizar empresa
router.put("/:id", (req, res) =>
    empresaController.atualizar(req, res)
);

// Ativar ou inativar empresa
router.patch("/:id/status", (req, res) =>
    empresaController.atualizarStatus(req, res)
);

export default router;
