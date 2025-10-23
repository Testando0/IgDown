// Espera o conteúdo da página carregar antes de rodar o script
document.addEventListener("DOMContentLoaded", () => {
    
    // Seleciona os elementos do HTML
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
        showMessage("Buscando sua mídia, aguarde... 💖", "loading");
        resultArea.innerHTML = ""; // Limpa resultados anteriores

        // 3. Chamar a API (usando a lógica do seu 'case')
        try {
            const apiUrl = `https://world-ecletix.onrender.com/api/insta?url=${encodeURIComponent(userUrl)}`;
            
            // Usamos fetch para chamar a API no navegador
            const response = await fetch(apiUrl);

            if (!response.ok) {
                // Erro de rede ou da API
                throw new Error(`Falha na API (Status: ${response.status})`);
            }

            const res = await response.json();

            // 4. Validar a resposta da API
            // (Baseado no seu código: res.data.data é um array)
            if (!res || !res.data || !Array.isArray(res.data.data) || res.data.data.length < 1) {
                throw new Error("Nenhum vídeo ou imagem encontrado. Verifique o link.");
            }

            // Pega a URL da mídia (o primeiro item)
            const mediaUrl = res.data.data[0].url;

            if (!mediaUrl) {
                throw new Error("A API retornou uma resposta, mas sem um link de download.");
            }

            // 5. Mostrar o resultado
            setLoading(false);
            showMessage(""); // Limpa a mensagem de loading
            
            // Cria um link <a> para o download
            // 'download' força o download / 'target="_blank"' abre em nova aba (fallback)
            resultArea.innerHTML = `
                <a href="${mediaUrl}" class="download-link" download target="_blank">
                    Clique aqui para baixar! 🚀
                </a>
            `;

        } catch (error) {
            // 6. Tratar erros
            console.error(error); // Loga o erro no console do navegador
            setLoading(false);
            showMessage(error.message || "Oops! Algo deu errado. Tente novamente.", "error");
            resultArea.innerHTML = "";
        }
    });

    // Função para ligar/desligar o estado de carregamento do botão
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

    // Função para mostrar mensagens ao usuário
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
