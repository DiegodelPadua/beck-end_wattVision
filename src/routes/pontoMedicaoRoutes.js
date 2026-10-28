
import { Router } from "express";
import pontoMedicaoController from "../controllers/pontoMedicaoController.js";

// ==========================================
// ROTAS - PONTOS DE MEDIÇÃO
// ==========================================

const router = Router();

// Lista todos os pontos de medição.
router.get("/", (req, res) =>
    pontoMedicaoController.listarTodos(req, res)
);

// Lista pontos vinculados a um dispositivo IoT.
// Deve ficar antes da rota "/:id".
router.get("/dispositivo/:idDispositivo", (req, res) =>
    pontoMedicaoController.listarPorDispositivo(req, res)
);

// Consulta um ponto de medição pelo ID.
router.get("/:id", (req, res) =>
    pontoMedicaoController.buscarPorId(req, res)
);

// Cadastra um novo ponto de medição.
router.post("/", (req, res) =>
    pontoMedicaoController.criar(req, res)
);

// Atualiza os dados de um ponto de medição.
router.put("/:id", (req, res) =>
    pontoMedicaoController.atualizar(req, res)
);

// Ativa ou desativa um ponto de medição.
router.patch("/:id/status", (req, res) =>
    pontoMedicaoController.atualizarStatus(req, res)
);

export default router;
