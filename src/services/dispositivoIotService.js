
import dispositivoIotRepository from "../database/monitoramento/dispositivoIotRepository.js";

// ==========================================
// SERVICE - DISPOSITIVOS IOT
// ==========================================
// Responsável pelas regras de negócio,
// validações e gerenciamento dos dispositivos
// ESP32 utilizados pelo Watt Vision.
//
// O Service não executa SQL diretamente.
// Todas as consultas são feitas pelo Repository.

// ==========================================
// FUNÇÃO AUXILIAR - CRIAR ERROS HTTP
// ==========================================
// Padroniza os erros para que o Controller
// possa devolver o código HTTP adequado.

function criarErro(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

// ==========================================
// FUNÇÃO AUXILIAR - VALIDAR ID
// ==========================================
// Aceita somente números inteiros positivos,
// evitando IDs vazios, negativos ou inválidos.

function validarId(valor, campo = "ID") {
    if (
        valor === null ||
        valor === undefined ||
        typeof valor === "boolean" ||
        (typeof valor === "string" && !valor.trim())
    ) {
        throw criarErro(`${campo} inválido.`);
    }

    const numero = Number(valor);

    if (!Number.isSafeInteger(numero) || numero <= 0) {
        throw criarErro(`${campo} inválido.`);
    }

    return numero;
}

// ==========================================
// FUNÇÃO AUXILIAR - TEXTO OBRIGATÓRIO
// ==========================================
// Valida textos que não podem ser vazios
// e respeita o tamanho máximo do banco.

function textoObrigatorio(valor, campo, limite) {
    if (typeof valor !== "string" || !valor.trim()) {
        throw criarErro(`${campo} é obrigatório.`);
    }

    const texto = valor.trim();

    if (texto.length > limite) {
        throw criarErro(
            `${campo} deve ter no máximo ${limite} caracteres.`
        );
    }

    return texto;
}

// ==========================================
// FUNÇÃO AUXILIAR - TEXTO OPCIONAL
// ==========================================
// Retorna null quando o campo não é informado.
// Caso exista, verifica o limite de caracteres.

function textoOpcional(valor, campo, limite) {
    if (valor === null || valor === undefined || valor === "") {
        return null;
    }

    if (typeof valor !== "string") {
        throw criarErro(`${campo} deve ser um texto.`);
    }

    const texto = valor.trim();

    if (!texto) {
        return null;
    }

    if (texto.length > limite) {
        throw criarErro(
            `${campo} deve ter no máximo ${limite} caracteres.`
        );
    }

    return texto;
}

// ==========================================
// FUNÇÃO AUXILIAR - VALIDAR INTEIROS
// ==========================================
// Utilizada para porta MQTT e intervalo
// de transmissão das medições.

function inteiroOpcional(valor, campo, minimo, maximo) {
    if (valor === null || valor === undefined || valor === "") {
        return null;
    }

    const numero = Number(valor);

    if (
        typeof valor === "boolean" ||
        !Number.isSafeInteger(numero) ||
        numero < minimo ||
        numero > maximo
    ) {
        throw criarErro(
            `${campo} deve ser um número inteiro entre ${minimo} e ${maximo}.`
        );
    }

    return numero;
}

// ==========================================
// FUNÇÃO AUXILIAR - VALIDAR BOOLEANOS
// ==========================================
// Os campos wifi e mqtt são TINYINT(1).
// Aceita true/false ou 1/0.

function validarIndicador(valor, campo) {
    if (valor === undefined || valor === null) {
        return 0;
    }

    if (valor === true || valor === 1) {
        return 1;
    }

    if (valor === false || valor === 0) {
        return 0;
    }

    throw criarErro(
        `${campo} deve ser 0, 1, true ou false.`
    );
}

// ==========================================
// FUNÇÃO AUXILIAR - VALIDAR MAC ADDRESS
// ==========================================
// Exige o formato XX:XX:XX:XX:XX:XX,
// utilizado para identificar o ESP32.

function validarMac(valor) {
    const mac = textoObrigatorio(
        valor,
        "Endereço MAC",
        17
    ).toUpperCase();

    const formatoMac =
        /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/;

    if (!formatoMac.test(mac)) {
        throw criarErro(
            "Endereço MAC inválido. Utilize XX:XX:XX:XX:XX:XX."
        );
    }

    return mac;
}

// ==========================================
// FUNÇÃO AUXILIAR - VALIDAR IPV4
// ==========================================
// Verifica o formato IPv4 quando informado.
// O IP pode ser null, pois o ESP32 pode
// receber endereço dinâmico via DHCP.

function validarIp(valor) {
    const ip = textoOpcional(valor, "IP", 45);

    if (ip === null) {
        return null;
    }

    const partes = ip.split(".");

    if (
        partes.length !== 4 ||
        !partes.every(parte =>
            /^\d{1,3}$/.test(parte) &&
            Number(parte) >= 0 &&
            Number(parte) <= 255
        )
    ) {
        throw criarErro("Endereço IPv4 inválido.");
    }

    return ip;
}

// ==========================================
// FUNÇÃO AUXILIAR - VALIDAR DATA
// ==========================================
// O campo data_instalacao é do tipo DATE.
// Aceita somente datas YYYY-MM-DD e
// verifica se o dia realmente existe.

function validarData(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return null;
    }

    if (
        typeof valor !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(valor)
    ) {
        throw criarErro(
            "Data de instalação inválida. Utilize YYYY-MM-DD."
        );
    }

    const [ano, mes, dia] = valor.split("-").map(Number);

    const data = new Date(Date.UTC(ano, mes - 1, dia));

    if (
        data.getUTCFullYear() !== ano ||
        data.getUTCMonth() !== mes - 1 ||
        data.getUTCDate() !== dia
    ) {
        throw criarErro("Data de instalação inválida.");
    }

    return valor;
}

// ==========================================
// FUNÇÃO AUXILIAR - VALIDAR DATETIME
// ==========================================
// Mantém o padrão do MySQL e evita
// conversões de fuso horário.
//
// Formato: YYYY-MM-DD HH:mm:ss

function validarDataHora(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return null;
    }

    if (typeof valor !== "string") {
        throw criarErro("Data de comunicação inválida.");
    }

    const formato =
        /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;

    const partes = valor.match(formato);

    if (!partes) {
        throw criarErro(
            "Data de comunicação deve utilizar YYYY-MM-DD HH:mm:ss."
        );
    }

    const [, ano, mes, dia, hora, minuto, segundo] =
        partes.map(Number);

    const data = new Date(
        Date.UTC(ano, mes - 1, dia, hora, minuto, segundo)
    );

    if (
        data.getUTCFullYear() !== ano ||
        data.getUTCMonth() !== mes - 1 ||
        data.getUTCDate() !== dia ||
        data.getUTCHours() !== hora ||
        data.getUTCMinutes() !== minuto ||
        data.getUTCSeconds() !== segundo
    ) {
        throw criarErro("Data de comunicação inválida.");
    }

    return valor;
}

// ==========================================
// FUNÇÃO AUXILIAR - VALIDAR STATUS
// ==========================================
// Define os estados de conectividade do
// dispositivo IoT.
//
// O status indica a comunicação do ESP32,
// não a ativação administrativa do cadastro.

function validarStatus(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return "offline";
    }

    if (typeof valor !== "string") {
        throw criarErro("Status inválido.");
    }

    const status = valor.trim().toLowerCase();

    const permitidos = ["online", "offline"];

    if (!permitidos.includes(status)) {
        throw criarErro(
            "Status inválido. Utilize online ou offline."
        );
    }

    return status;
}

// ==========================================
// SERVICE - DISPOSITIVOS IOT
// ==========================================

class DispositivoIotService {

    // ======================================
    // VALIDAR DADOS DO DISPOSITIVO
    // ======================================
    // Centraliza as validações utilizadas
    // tanto no POST quanto no PUT.

    async validarDados(dados, idIgnorar = null) {
        if (
            !dados ||
            typeof dados !== "object" ||
            Array.isArray(dados)
        ) {
            throw criarErro("Dados do dispositivo IoT inválidos.");
        }

        // Identifica a empresa responsável.
        const idEmpresa = validarId(
            dados.id_empresa,
            "ID da empresa"
        );

        // Campos obrigatórios do cadastro.
        const nome = textoObrigatorio(
            dados.nome,
            "Nome",
            100
        );

        const identificador = textoObrigatorio(
            dados.identificador,
            "Identificador",
            50
        );

        const macAddress = validarMac(dados.mac_address);

        // Campos opcionais de identificação.
        const modelo = textoOpcional(
            dados.modelo,
            "Modelo",
            100
        );

        const numeroSerie = textoOpcional(
            dados.numero_serie,
            "Número de série",
            50
        );

        const ip = validarIp(dados.ip);

        const versaoFirmware = textoOpcional(
            dados.versao_firmware,
            "Versão do firmware",
            20
        );

        const dataInstalacao = validarData(
            dados.data_instalacao
        );

        // Configurações de Wi-Fi e MQTT.
        const ssid = textoOpcional(
            dados.ssid,
            "SSID",
            100
        );

        const broker = textoOpcional(
            dados.broker,
            "Broker MQTT",
            100
        );

        const port = inteiroOpcional(
            dados.port,
            "Porta MQTT",
            1,
            65535
        );

        const topic = textoOpcional(
            dados.topic,
            "Tópico MQTT",
            150
        );

        const clientId = textoOpcional(
            dados.client_id,
            "Client ID",
            100
        );

        const txIntervalSec = inteiroOpcional(
            dados.tx_interval_sec,
            "Intervalo de transmissão",
            1,
            86400
        );

        const wifi = validarIndicador(
            dados.wifi,
            "Wi-Fi"
        );

        const mqtt = validarIndicador(
            dados.mqtt,
            "MQTT"
        );

        const status = validarStatus(dados.status);

        const dataComunicacao = validarDataHora(
            dados.data_comunicacao
        );

        // ==================================
        // VALIDAR EXISTÊNCIA DA EMPRESA
        // ==================================

        const empresa =
            await dispositivoIotRepository.buscarEmpresaPorId(
                idEmpresa
            );

        if (!empresa) {
            throw criarErro(
                "Empresa não encontrada.",
                404
            );
        }

        if (empresa.status !== "Ativa") {
            throw criarErro(
                "Não é permitido vincular dispositivos a uma empresa inativa.",
                400
            );
        }

        // ==================================
        // VERIFICAR IDENTIFICADOR DUPLICADO
        // ==================================

        const identificadorExistente =
            await dispositivoIotRepository.buscarPorIdentificador(
                identificador,
                idIgnorar
            );

        if (identificadorExistente) {
            throw criarErro(
                "Já existe um dispositivo IoT com este identificador.",
                409
            );
        }

        // ==================================
        // VERIFICAR MAC DUPLICADO
        // ==================================

        const macExistente =
            await dispositivoIotRepository.buscarPorMac(
                macAddress,
                idIgnorar
            );

        if (macExistente) {
            throw criarErro(
                "Já existe um dispositivo IoT com este endereço MAC.",
                409
            );
        }

        // ==================================
        // RETORNAR DADOS VALIDADOS
        // ==================================
        // Os nomes correspondem às colunas
        // utilizadas pelo Repository.

        return {
            id_empresa: idEmpresa,
            nome,
            identificador,
            mac_address: macAddress,
            modelo,
            numero_serie: numeroSerie,
            ip,
            versao_firmware: versaoFirmware,
            data_instalacao: dataInstalacao,
            ssid,
            broker,
            port,
            topic,
            client_id: clientId,
            tx_interval_sec: txIntervalSec,
            wifi,
            mqtt,
            status,
            data_comunicacao: dataComunicacao
        };
    }

    // ======================================
    // LISTAR DISPOSITIVOS
    // ======================================

    async listarTodos() {
        return await dispositivoIotRepository.listarTodos();
    }

    // ======================================
    // BUSCAR DISPOSITIVO POR ID
    // ======================================

    async buscarPorId(id) {
        const idValidado = validarId(
            id,
            "ID do dispositivo IoT"
        );

        const dispositivo =
            await dispositivoIotRepository.buscarPorId(
                idValidado
            );

        if (!dispositivo) {
            throw criarErro(
                "Dispositivo IoT não encontrado.",
                404
            );
        }

        return dispositivo;
    }

    // ======================================
    // CADASTRAR DISPOSITIVO
    // ======================================

    async criar(dados) {
        const dadosValidados =
            await this.validarDados(dados);

        return await dispositivoIotRepository.criar(
            dadosValidados
        );
    }

    // ======================================
    // ATUALIZAR DISPOSITIVO
    // ======================================

    async atualizar(id, dados) {
        const idValidado = validarId(
            id,
            "ID do dispositivo IoT"
        );

        // Confirma que o dispositivo existe.
        await this.buscarPorId(idValidado);

        // Ignora o próprio registro nas
        // verificações de identificador e MAC.
        const dadosValidados =
            await this.validarDados(
                dados,
                idValidado
            );

        await dispositivoIotRepository.atualizar(
            idValidado,
            dadosValidados
        );

        return await this.buscarPorId(idValidado);
    }

    // ======================================
    // ATUALIZAR STATUS
    // ======================================

    async atualizarStatus(id, status) {
        const idValidado = validarId(
            id,
            "ID do dispositivo IoT"
        );

        await this.buscarPorId(idValidado);

        // Exige que o campo seja informado
        // explicitamente no PATCH.
        if (
            status === undefined ||
            status === null ||
            status === ""
        ) {
            throw criarErro("Status é obrigatório.");
        }

        const statusValidado = validarStatus(status);

        await dispositivoIotRepository.atualizarStatus(
            idValidado,
            statusValidado
        );

        return await this.buscarPorId(idValidado);
    }

    // ======================================
    // EXCLUIR DISPOSITIVO
    // ======================================
    // A exclusão somente será permitida
    // quando não houver pontos de medição
    // vinculados ao dispositivo.

    async excluir(id) {
        const idValidado = validarId(
            id,
            "ID do dispositivo IoT"
        );

        await this.buscarPorId(idValidado);

        const quantidade =
            await dispositivoIotRepository.contarPontosVinculados(
                idValidado
            );

        if (quantidade > 0) {
            throw criarErro(
                "Não é possível excluir o dispositivo IoT porque existem pontos de medição vinculados.",
                409
            );
        }

        await dispositivoIotRepository.excluir(
            idValidado
        );

        return true;
    }
}

export default new DispositivoIotService();
