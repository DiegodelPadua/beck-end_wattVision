// Importa a aplicação Express configurada no arquivo src/app.js
import app from "./src/app.js";

// Define a porta onde o servidor Backend ficará disponível
const PORT = 3000;

// Inicia o servidor e faz com que ele fique aguardando requisições
app.listen(PORT, () => {

    // Esta mensagem será exibida no terminal quando o servidor iniciar
    console.log(`Servidor Watt Vision rodando na porta ${PORT}`);
});