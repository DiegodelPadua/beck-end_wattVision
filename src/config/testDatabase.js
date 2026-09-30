// Importa a conexão configurada com o MySQL.
import database from "./database.js";


// Função responsável por testar a conexão com o banco.
async function testarConexao() {

    try {

        // Executa uma consulta extremamente simples no MySQL.
        // Se ela funcionar, sabemos que a conexão foi estabelecida.
        const [resultado] = await database.query(
            "SELECT 1 AS conexao"
        );

        console.log("=================================");
        console.log("WATT VISION - BANCO DE DADOS");
        console.log("=================================");
        console.log("Conexão com MySQL realizada com sucesso!");
        console.log("Banco:", process.env.DB_NAME);
        console.log("=================================");

    } catch (erro) {

        // Caso a conexão falhe, mostra o erro no terminal.
        console.error("=================================");
        console.error("ERRO NA CONEXÃO COM O MYSQL");
        console.error("=================================");
        console.error(erro.message);
        console.error("=================================");

    }

}


// Executa o teste.
testarConexao();