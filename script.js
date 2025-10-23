Document.addEventListener("DOMContentLoaded", () => {
    
    // Seleciona os elementos do HTML
    const form = document.getElementById("download-form");
    const urlInput = document.getElementById("url-input");
    const downloadButton = document.getElementById("download-button");
    const buttonText = downloadButton.querySelector(".button-text");
    const buttonLoader = downloadButton.querySelector(".button-loader");
    const messageArea = document.getElementById("message-area");
    const resultArea = document.getElementById("result-area");
    
    const platformSelect = document.getElementById("platform-select");

    // Adiciona um "ouvinte" para o evento de submit do formulário
    // (Não precisamos mais de 'async' aqui)
    form.addEventListener("submit", (event) => {
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
        showMessage("Preparando seu download... 🔗", "loading");
        resultArea.innerHTML = ""; // Limpa resultados anteriores

        // 3. Lógica de seleção de plataforma (ATUALIZADA)
        try {
            // Validações de plataforma
            switch (platform) {
                case "instagram":
                    if (!userUrl.includes("instagram.com")) {
                        throw new Error("Este não parece ser um link válido do Instagram.");
                    }
                    break;
                
                case "tiktok":
                    if (!userUrl.includes("tiktok.com")) {
                        throw new Error("Este não parece ser um link válido do TikTok.");
                    }
                    break;
                
                case "youtube":
                    if (!userUrl.includes("youtube.com") && !userUrl.includes("youtu.be")) {
                         throw new Error("Este não parece ser um link válido do YouTube.");
                    }
                    break;
                
                default:
                    throw new Error("Plataforma desconhecida.");
            }

            // 4. (A SOLUÇÃO) Monta a URL do NOSSO backend (o proxy)
            // O frontend agora chama o '/api/proxy-download' que criamos no backend.
            const proxyUrl = `/api/proxy-download?platform=${platform}&url=${encodeURIComponent(userUrl)}`;

            // 5. Exibe o link de download
            displayDownloadLink(proxyUrl);
            
            // 6. Sucesso!
            setLoading(false);
            showMessage(""); 

        } catch (error) {
            // 7. Tratar erros
            console.error(error); 
            setLoading(false);
            showMessage(error.message || "Oops! Algo deu errado. Tente novamente.", "error");
            resultArea.innerHTML = "";
        }
    });

    /**
     * ATUALIZADO: Função única para exibir o link de download
     * Esta função não baixa nada, apenas cria o link <a>
     * O 'download' sem nome de arquivo funciona porque o backend (proxy)
     * já está enviando o nome do arquivo (Content-Disposition).
     */
    function displayDownloadLink(proxyUrl) {
        resultArea.innerHTML = `
            <a href="${proxyUrl}" class="download-link" download>
                Download Concluído! Clique aqui ❤️
            </a>
        `;
    }

    // As funções async downloadInstagram, downloadTikTok e downloadYouTube
    // foram removidas pois não são mais necessárias. O backend cuida de tudo.


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
