
import { Router } from "express";
import dispositivoIotController from "../controllers/dispositivoIotController.js";

// ==========================================
// ROTAS - DISPOSITIVOS IOT
// ==========================================
// Define os endpoints para gerenciamento
// dos dispositivos ESP32 do Watt Vision.
//
// Prefixo configurado em src/routes/index.js:
// /api/dispositivos-iot

const router = Router();

// ==========================================
// LISTAR DISPOSITIVOS
// ==========================================
// GET /api/dispositivos-iot
// Retorna todos os dispositivos cadastrados.

router.get("/", (req, res) =>
    dispositivoIotController.listarTodos(req, res)
);

// ==========================================
// CONSULTAR DISPOSITIVO POR ID
// ==========================================
// GET /api/dispositivos-iot/:id
// Retorna os dados de um dispositivo.

router.get("/:id", (req, res) =>
    dispositivoIotController.buscarPorId(req, res)
);

// ==========================================
// CADASTRAR DISPOSITIVO
// ==========================================
// POST /api/dispositivos-iot
// Recebe os dados do ESP32 e solicita
// sua validação e persistência.

router.post("/", (req, res) =>
    dispositivoIotController.criar(req, res)
);

// ==========================================
// ATUALIZAR DISPOSITIVO
// ==========================================
// PUT /api/dispositivos-iot/:id
// Atualiza o cadastro e as configurações
// de comunicação do dispositivo.

router.put("/:id", (req, res) =>
    dispositivoIotController.atualizar(req, res)
);

// ==========================================
// ALTERAR STATUS DE COMUNICAÇÃO
// ==========================================
// PATCH /api/dispositivos-iot/:id/status
// Altera somente o status online/offline.

router.patch("/:id/status", (req, res) =>
    dispositivoIotController.atualizarStatus(req, res)
);

// ==========================================
// EXCLUIR DISPOSITIVO
// ==========================================
// DELETE /api/dispositivos-iot/:id
// A exclusão será bloqueada pelo Service
// quando houver pontos de medição vinculados.

router.delete("/:id", (req, res) =>
    dispositivoIotController.excluir(req, res)
);

// ==========================================
// EXPORTAÇÃO DAS ROTAS
// ==========================================
// Disponibiliza o roteador para index.js.

export default router;
