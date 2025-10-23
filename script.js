// Espera o conteúdo da página carregar antes de rodar o script
document.addEventListener("DOMContentLoaded", () => {
    
    // Seleciona os elementos do HTML (nenhuma mudança aqui)
    const form = document.getElementById("download-form");
    const urlInput = document.getElementById("url-input");
    const downloadButton = document.getElementById("download-button");
    const buttonText = downloadButton.querySelector(".button-text");
    const buttonLoader = downloadButton.querySelector(".button-loader");
    const messageArea = document.getElementById("message-area");
    const resultArea = document.getElementById("result-area");

    // Adiciona um "ouvinte" para o evento de submit do formulário
    form.addEventListener("submit", async (event) => {
        // Impede que o formulário recarregue a página
        event.preventDefault(); 
        
        const userUrl = urlInput.value.trim();

        // 1. Validação simples
        if (!userUrl) {
            showMessage("Por favor, insira um URL.", "error");
            return;
        }
        
        if (!userUrl.includes("instagram.com")) {
            showMessage("Parece que isso não é um link do Instagram.", "error");
            return;
        }

        // 2. Iniciar o estado de carregamento
        setLoading(true);
        showMessage("Processando seu vídeo... 💖", "loading");
        resultArea.innerHTML = ""; // Limpa resultados anteriores

        // 3. Chamar a NOVA API
        try {
            // Nova URL da API
            const apiUrl = `https://api.nexfuture.com.br/api/downloads/instagram/mp4?url=${encodeURIComponent(userUrl)}`;
            
            // Usamos fetch para chamar a API
            const response = await fetch(apiUrl);

            // Se a resposta não for OK (ex: erro 404 ou 500)
            if (!response.ok) {
                throw new Error(`Falha ao buscar. Link inválido ou API offline? (Status: ${response.status})`);
            }

            // 4. Processar a resposta como um VÍDEO (Blob)
            // Não usamos mais .json(), usamos .blob()
            const videoBlob = await response.blob();

            // Verificação extra: Se a API falhar e retornar um erro em JSON,
            // o tipo do blob não será "video/mp4".
            if (!videoBlob.type.startsWith('video/')) {
                throw new Error("A API não retornou um vídeo. O link pode ser de um post privado ou inválido.");
            }

            // 5. Criar um link de download para o Blob
            // URL.createObjectURL() cria um link local temporário para o arquivo
            const videoUrl = URL.createObjectURL(videoBlob);

            // 6. Mostrar o resultado
            setLoading(false);
            showMessage(""); // Limpa a mensagem de loading
            
            // Cria um link <a> para o download
            // Adicionamos o atributo 'download' para sugerir um nome de arquivo
            resultArea.innerHTML = `
                <a href="${videoUrl}" class="download-link" download="video-instagram.mp4">
                    Seu vídeo está pronto! Clique aqui 🚀
                </a>
            `;

        } catch (error) {
            // 7. Tratar erros
            console.error(error); // Loga o erro no console do navegador
            setLoading(false);
            showMessage(error.message || "Oops! Algo deu errado. Tente novamente.", "error");
            resultArea.innerHTML = "";
        }
    });

    // Função para ligar/desligar o estado de carregamento do botão (nenhuma mudança aqui)
    function setLoading(isLoading) {
        if (isLoading) {
            downloadButton.disabled = true;
            buttonText.style.display = "none";
            buttonLoader.style.display = "block";
        } else {
            downloadButton.disabled = false;
            buttonText.style.display = "block";
            buttonLoader.style.display = "none";
        }
    }

    // Função para mostrar mensagens ao usuário (nenhuma mudança aqui)
    function showMessage(message, type = "") {
        messageArea.textContent = message;
        if (type === "error") {
            messageArea.className = "error-message";
        } else if (type === "loading") {
            messageArea.className = "loading-message";
        } else {
            messageArea.className = "";
        }
    }
});
