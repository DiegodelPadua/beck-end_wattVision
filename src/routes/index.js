
/**
 * ==========================================
 * WATT VISION - ROTAS PRINCIPAIS DA API
 * ==========================================
 *
 * Este arquivo centraliza as rotas dos
 * diferentes módulos do backend.
 */

// Importa o Router do Express.
import { Router } from "express";

// ==========================================
// IMPORTAÇÃO DAS ROTAS
// ==========================================

// Rotas responsáveis pelas medições elétricas.
import medicaoRoutes from "./medicaoRoutes.js";

// Rotas responsáveis pelos locais.
import localRoutes from "./localRoutes.js";

// Rotas responsáveis pelos setores.
import setorRoutes from "./setorRoutes.js";

// Rotas responsáveis pelos equipamentos.
import equipamentoRoutes from "./equipamentoRoutes.js";

// ==========================================
// CRIAÇÃO DO ROTEADOR PRINCIPAL
// ==========================================

// O router deve ser criado ANTES de registrar
// qualquer rota com router.use().
const router = Router();

// ==========================================
// REGISTRO DAS ROTAS
// ==========================================

// Endpoints de medições.
// Exemplo: GET /api/medicoes
router.use("/medicoes", medicaoRoutes);

// Endpoints de locais.
// Exemplo: GET /api/locais
router.use("/locais", localRoutes);

// Endpoints de setores.
// Exemplo: GET /api/setores
router.use("/setores", setorRoutes);

// Endpoints de equipamentos.
// Exemplo: GET /api/equipamentos
router.use("/equipamentos", equipamentoRoutes);

// ==========================================
// EXPORTAÇÃO DO ROTEADOR
// ==========================================

// Disponibiliza o roteador para o app.js.
export default router;
