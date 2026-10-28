
import { Router } from "express";

// ==========================================
// WATT VISION - ROTAS DE MEDIÇÕES
// ==========================================
// Importa o Controller responsável pelas
// requisições relacionadas às medições.

import medicaoController
    from "../controllers/medicaoController.js";

// ==========================================
// CRIAÇÃO DO ROTEADOR
// ==========================================
// O prefixo /api/medicoes é registrado
// no arquivo src/routes/index.js.

const router = Router();

// ==========================================
// GET /api/medicoes
// ==========================================
// Lista todas as medições armazenadas
// no banco de dados.

router.get(
    "/",
    (req, res) =>
        medicaoController.listarTodas(req, res)
);

// ==========================================
// GET /api/medicoes/ultima
// ==========================================
// Retorna a medição mais recente.

router.get(
    "/ultima",
    (req, res) =>
        medicaoController.buscarUltima(req, res)
);

// ==========================================
// GET /api/medicoes/resumo
// ==========================================
// Retorna os indicadores utilizados
// pelos cards do dashboard.

router.get(
    "/resumo",
    (req, res) =>
        medicaoController.obterResumo(req, res)
);

// ==========================================
// GET /api/medicoes/serie-temporal
// ==========================================
// Consulta o histórico de um PZEM.
//
// Parâmetros:
// id_pzem - Identificador do sensor
// horas   - Período de 1 a 168 horas

router.get(
    "/serie-temporal",
    (req, res) =>
        medicaoController.obterSerieTemporal(req, res)
);

// ==========================================
// GET /api/medicoes/ponto/:id/ultima
// ==========================================
// Retorna a última leitura de cada
// PZEM associada ao ponto informado.

router.get(
    "/ponto/:id/ultima",
    (req, res) =>
        medicaoController.buscarUltimasPorPonto(req, res)
);

// ==========================================
// GET /api/medicoes/consumo
// ==========================================
// Calcula consumo em kWh e custo estimado.
//
// Parâmetros:
// id_pzem - Identificador do sensor
// inicio  - Data inicial YYYY-MM-DD
// fim     - Data final YYYY-MM-DD

router.get(
    "/consumo",
    (req, res) =>
        medicaoController.consultarConsumo(req, res)
);

// ==========================================
// POST /api/medicoes
// ==========================================
// Cadastra uma leitura elétrica.
//
// O corpo da requisição deve conter
// o ID do PZEM, data e grandezas elétricas.

router.post(
    "/",
    (req, res) =>
        medicaoController.criar(req, res)
);

// ==========================================
// EXPORTAÇÃO DAS ROTAS
// ==========================================
// Disponibiliza o roteador para o index.js.

export default router;
