
import { Router } from "express";
import alertaController from "../controllers/alertaController.js";

// ==========================================
// WATT VISION - ROTAS DE ALERTAS
// ==========================================

const router = Router();

// GET - Listar todos os alertas
router.get("/", (req, res) =>
    alertaController.listarTodos(req, res)
);

// GET - Listar alertas ativos
router.get("/ativos", (req, res) =>
    alertaController.listarAtivos(req, res)
);

// GET - Listar alertas por dispositivo
router.get("/dispositivo/:idDispositivo", (req, res) =>
    alertaController.listarPorDispositivo(req, res)
);

// GET - Buscar alerta por ID
router.get("/:id", (req, res) =>
    alertaController.buscarPorId(req, res)
);

// POST - Registrar alerta
router.post("/", (req, res) =>
    alertaController.criar(req, res)
);

// PATCH - Reconhecer alerta
router.patch("/:id/reconhecer", (req, res) =>
    alertaController.reconhecer(req, res)
);

export default router;
