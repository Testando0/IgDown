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

        // 3. Lógica de seleção de plataforma (ATUALIZADA)
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
                    // Validação específica do TikTok
                    if (!userUrl.includes("tiktok.com")) {
                        throw new Error("Este não parece ser um link válido do TikTok.");
                    }
                    // Chama a nova função de download
                    await downloadTikTok(userUrl);
                    break;

                // NOVO: Case do Threads
                case "threads":
                    // Validação específica do Threads
                    if (!userUrl.includes("threads.net")) {
                         throw new Error("Este não parece ser um link válido do Threads.");
                    }
                    // Chama a nova função de download
                    await downloadThreads(userUrl);
                    break;
                
                // REMOVIDO: Case do YouTube
                
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
     * NOVO: Função para cuidar do download do Threads
     */
    async function downloadThreads(userUrl) {
        // API baseada no case fornecido
        const apiUrl = `https://world-ecletix.onrender.com/api/threads2?url=${encodeURIComponent(userUrl)}`;
        
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Falha na API (Threads). Link inválido ou offline? (Status: ${response.status})`);
        }

        const data = await response.json();

        // Validação da resposta da API, baseada no case
        if (!data || data.statusCode !== 200 || !data.resultado || !Array.isArray(data.resultado.resultado) || data.resultado.resultado.length === 0) {
            throw new Error("Nenhuma mídia encontrada ou resposta inválida da API do Threads.");
        }

        const midias = data.resultado.resultado;
        let foundMedia = false;
        
        // Limpa a área de resultados (já feito no 'submit', mas garantimos aqui)
        resultArea.innerHTML = ""; 

        // Itera sobre todas as mídias encontradas (carrossel)
        for (const item of midias) {
            const link = item.link;
            if (!link) continue;

            foundMedia = true;

            // Detecta se o link parece ser um vídeo
            const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(link) || link.includes("/video");
            
            // Determina a extensão para o nome do arquivo
            const extension = isVideo ? 'mp4' : 'jpg'; // Supomos jpg para imagens
            const filename = `media-threads-${Date.now()}.${extension}`; 

            // Cria um link de download para cada item
            const linkElement = document.createElement('a');
            linkElement.href = link;
            linkElement.className = "download-link";
            linkElement.download = filename; // Atributo download sugere o nome do arquivo
            linkElement.textContent = `Download ${isVideo ? 'Vídeo' : 'Imagem'} ❤️`;
            
            // Adiciona um target="_blank" para abrir em nova aba (melhor UX para links diretos)
            linkElement.target = "_blank";
            linkElement.rel = "noopener noreferrer";
            
            resultArea.appendChild(linkElement);
        }

        if (!foundMedia) {
            throw new Error("A API do Threads respondeu, mas não foi possível encontrar links de mídia válidos.");
        }

        // 6. Mostrar o resultado
        setLoading(false); // Sucesso, desliga o loading
        showMessage(""); // Limpa a mensagem de "carregando"
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
