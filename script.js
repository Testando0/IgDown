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
        showMessage("Conectando aos servidores... ☁️", "loading");
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
                    await downloadKwai(userUrl); 
                    break;
                
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
    });

    /**
     * Função para cuidar do download do Instagram
     */
    async function downloadInstagram(userUrl) {
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/instagram/mp4?url=${encodeURIComponent(userUrl)}`;
        
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Falha na API (IG). Link inválido ou offline? (Status: ${response.status})`);
        }

        const videoBlob = await response.blob();

        if (!videoBlob.type.startsWith('video/')) {
            throw new Error("A API (IG) não retornou um vídeo. O link pode ser privado ou inválido.");
        }

        const videoUrl = URL.createObjectURL(videoBlob);

        setLoading(false); 
        showMessage(""); 
        
        const filename = `video-ig-${Date.now()}.mp4`; 
        
        resultArea.innerHTML = `
            <a href="${videoUrl}" class="download-link" download="${filename}">
                Download Concluído! Clique aqui ❤️
            </a>
        `;
    }

    /**
     * Função para cuidar do download do TikTok
     */
    async function downloadTikTok(userUrl) {
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/tiktok/mp4?url=${encodeURIComponent(userUrl)}`;
        
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Falha na API (TT). Link inválido ou offline? (Status: ${response.status})`);
        }

        const videoBlob = await response.blob();

        if (!videoBlob.type.startsWith('video/')) {
            throw new Error("A API (TT) não retornou um vídeo. O link pode ser privado ou inválido.");
        }

        const videoUrl = URL.createObjectURL(videoBlob);

        setLoading(false); 
        showMessage(""); 
        
        const filename = `video-tt-${Date.now()}.mp4`; 
        
        resultArea.innerHTML = `
            <a href="${videoUrl}" class="download-link" download="${filename}">
                Download Concluído! Clique aqui ❤️
            </a>
        `;
    }

    /**
     * NOVA: Função para cuidar do download do Kwai
     * (Versão com tratamento de erro e tipo de mídia mais robusto)
     */
    async function downloadKwai(userUrl) {
        // Usa a API do Kwai fornecida
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/kwai/mp4?url=${encodeURIComponent(userUrl)}`;
        
        // 1. Otimização: Adiciona cabeçalhos para aceitar formatos binários
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'video/mp4, application/octet-stream' 
            }
        });

        if (!response.ok) {
            // Se o status for 4xx/5xx, lança o erro
            throw new Error(`Falha na API (Kwai). Link inválido ou offline? (Status: ${response.status})`);
        }
        
        const videoBlob = await response.blob();
        
        // 2. Otimização: Tratamento do tipo (MIME Type)
        // Pega o Content-Type do cabeçalho ou do Blob.
        const contentType = response.headers.get('Content-Type') || videoBlob.type;
        
        // Verifica se o tipo é vídeo OU um tipo binário genérico ('application/octet-stream')
        if (!contentType.startsWith('video/') && !contentType.includes('octet-stream')) {
             throw new Error(`A API (Kwai) retornou um tipo inválido (${contentType}). O link pode ser privado ou inválido.`);
        }
        
        const extension = 'mp4'; // Assumimos MP4 para o download do Kwai via esta API
        
        const videoUrl = URL.createObjectURL(videoBlob);

        setLoading(false); 
        showMessage(""); // Limpa a mensagem de carregamento
        
        // Nome do arquivo específico do Kwai
        const filename = `video-kwai-${Date.now()}.${extension}`; 
        
        resultArea.innerHTML = `
            <a href="${videoUrl}" class="download-link" download="${filename}">
                Download Kwai Pronto! Clique aqui ❤️
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
