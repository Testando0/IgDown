Document.addEventListener("DOMContentLoaded", () => {
    
    // Seleciona os elementos do HTML (mantidos)
    const form = document.getElementById("download-form");
    const urlInput = document.getElementById("url-input");
    const downloadButton = document.getElementById("download-button");
    const buttonText = downloadButton.querySelector(".button-text");
    const buttonLoader = downloadButton.querySelector(".button-loader");
    const messageArea = document.getElementById("message-area");
    const resultArea = document.getElementById("result-area");
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
        showMessage("Processando... ⚡", "loading"); // Mensagem alterada para refletir a nova lógica
        resultArea.innerHTML = ""; // Limpa resultados anteriores

        // 3. Lógica de seleção de plataforma
        try {
            switch (platform) {
                case "instagram":
                    if (!userUrl.includes("instagram.com")) {
                        throw new Error("Este não parece ser um link válido do Instagram.");
                    }
                    await downloadInstagram(userUrl);
                    break;
                
                case "tiktok":
                    if (!userUrl.includes("tiktok.com")) {
                        throw new Error("Este não parece ser um link válido do TikTok.");
                    }
                    await downloadTikTok(userUrl);
                    break;

                case "kwai":
                    if (!userUrl.includes("kwai.com") && !userUrl.includes("kuaishou.com")) {
                         throw new Error("Este não parece ser um link válido do Kwai.");
                    }
                    // CHAMADA PARA A NOVA FUNÇÃO DE REDIRECIONAMENTO
                    downloadKwaiSimple(userUrl); 
                    // SAÍDA: O downloadKwaisimple faz o redirecionamento e a função retorna
                    setLoading(false);
                    showMessage("Tentando iniciar o download... Verifique o pop-up ou a barra de downloads.", "loading");
                    return; // Retorna para evitar o tratamento de erros catch padrão
                
                default:
                    throw new Error("Plataforma desconhecida ou ainda não suportada.");
            }

        } catch (error) {
            // 7. Tratar erros
            console.error(error); 
            setLoading(false);
            showMessage(error.message || "Oops! Algo deu errado. Tente novamente.", "error");
            resultArea.innerHTML = "";
        }
        
        // Finaliza o carregamento para Instagram/TikTok se tiver sucesso no try
        setLoading(false); 
        showMessage(""); 
    });

    /**
     * Função para cuidar do download do Instagram (mantida)
     */
    async function downloadInstagram(userUrl) {
        // ... (código mantido)
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/instagram/mp4?url=${encodeURIComponent(userUrl)}`;
        
        const response = await fetch(apiUrl);
        // ... (código mantido)
        if (!response.ok) {
            throw new Error(`Falha na API (IG). Link inválido ou offline? (Status: ${response.status})`);
        }

        const videoBlob = await response.blob();
        if (!videoBlob.type.startsWith('video/')) {
            throw new Error("A API (IG) não retornou um vídeo. O link pode ser privado ou inválido.");
        }

        const videoUrl = URL.createObjectURL(videoBlob);
        
        const filename = `video-ig-${Date.now()}.mp4`; 
        
        resultArea.innerHTML = `
            <a href="${videoUrl}" class="download-link" download="${filename}">
                Download Concluído! Clique aqui ❤️
            </a>
        `;
    }

    /**
     * Função para cuidar do download do TikTok (mantida)
     */
    async function downloadTikTok(userUrl) {
        // ... (código mantido)
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/tiktok/mp4?url=${encodeURIComponent(userUrl)}`;
        
        const response = await fetch(apiUrl);
        // ... (código mantido)
        if (!response.ok) {
            throw new Error(`Falha na API (TT). Link inválido ou offline? (Status: ${response.status})`);
        }

        const videoBlob = await response.blob();
        if (!videoBlob.type.startsWith('video/')) {
            throw new Error("A API (TT) não retornou um vídeo. O link pode ser privado ou inválido.");
        }

        const videoUrl = URL.createObjectURL(videoBlob);
        
        const filename = `video-tt-${Date.now()}.mp4`; 
        
        resultArea.innerHTML = `
            <a href="${videoUrl}" class="download-link" download="${filename}">
                Download Concluído! Clique aqui ❤️
            </a>
        `;
    }

    /**
     * NOVO MÉTODO (Simples): Função para cuidar do download do Kwai
     * Esta função não usa fetch/blob, mas redireciona o usuário (ou abre em nova aba)
     * para forçar o download direto da API.
     */
    function downloadKwaiSimple(userUrl) {
        // 1. URL da API
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/kwai/mp4?url=${encodeURIComponent(userUrl)}`;
        
        // 2. Cria um link temporário, o clica e o remove
        const linkElement = document.createElement('a');
        linkElement.href = apiUrl;
        
        // Define o nome, embora o servidor deva fornecer o Content-Disposition
        linkElement.download = `video-kwai-${Date.now()}.mp4`; 
        
        // É essencial adicionar e clicar o elemento para que o atributo 'download' funcione
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        
        // NOTA: O estado de carregamento deve ser removido pelo evento 'submit' que chamou esta função.
    }


    // Função para ligar/desligar o estado de carregamento do botão (mantida)
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

    // Função para mostrar mensagens ao usuário (mantida)
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
