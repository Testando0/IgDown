document.addEventListener("DOMContentLoaded", () => {
    
    // Seleciona os elementos do HTML
    const form = document.getElementById("download-form");
    const urlInput = document.getElementById("url-input");
    const downloadButton = document.getElementById("download-button");
    const buttonText = downloadButton.querySelector(".button-text");
    const buttonLoader = downloadButton.querySelector(".button-loader");
    const messageArea = document.getElementById("message-area");
    const resultArea = document.getElementById("result-area");
    
    // Selecionar o dropdown
    const platformSelect = document.getElementById("platform-select");

    // Adiciona um "ouvinte" para o evento de submit do formulário
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); 
        
        const userUrl = urlInput.value.trim();
        const platform = platformSelect.value; 

        // 1. Validação simples
        if (!userUrl) {
            showMessage("Por favor, insira um URL.", "error");
            return;
        }

        // 2. Iniciar o estado de carregamento
        setLoading(true);
        // Emoji atualizado para algo mais "fofo" (nuvem)
        showMessage("Conectando aos servidores... ☁️", "loading");
        resultArea.innerHTML = ""; // Limpa resultados anteriores

        // 3. Lógica de seleção de plataforma
        try {
            switch (platform) {
                case "instagram":
                    // Validação específica do Instagram
                    if (!userUrl.includes("instagram.com")) {
                        throw new Error("Este não parece ser um link válido do Instagram.");
                    }
                    // Chama a função de download específica
                    await downloadInstagram(userUrl);
                    break;
                
                case "tiktok":
                case "youtube":
                    // Mensagem de "em breve" para outras plataformas
                    throw new Error(`Downloads do ${platform.charAt(0).toUpperCase() + platform.slice(1)} ainda não são suportados. Em breve!`);
                
                default:
                    throw new Error("Plataforma desconhecida.");
            }

        } catch (error) {
            // 7. Tratar erros
            console.error(error); 
            setLoading(false);
            showMessage(error.message || "Oops! Algo deu errado. Tente novamente.", "error");
            resultArea.innerHTML = "";
        }
    });

    /**
     * Função refatorada para cuidar APENAS do download do Instagram
     */
    async function downloadInstagram(userUrl) {
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/instagram/mp4?url=${encodeURIComponent(userUrl)}`;
        
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Falha na API. Link inválido ou offline? (Status: ${response.status})`);
        }

        const videoBlob = await response.blob();

        if (!videoBlob.type.startsWith('video/')) {
            throw new Error("A API não retornou um vídeo. O link pode ser privado ou inválido.");
        }

        const videoUrl = URL.createObjectURL(videoBlob);

        // 6. Mostrar o resultado
        setLoading(false); // Sucesso, desliga o loading
        showMessage(""); // Limpa a mensagem
        
        const filename = `video-ig-${Date.now()}.mp4`; 
        
        // Emoji atualizado para coração
        resultArea.innerHTML = `
            <a href="${videoUrl}" class="download-link" download="${filename}">
                Download Concluído! Clique aqui ❤️
            </a>
        `;
    }


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
