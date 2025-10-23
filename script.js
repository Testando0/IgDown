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

                case "threads":
                    if (!userUrl.includes("threads.net")) {
                         throw new Error("Este não parece ser um link válido do Threads.");
                    }
                    await downloadThreads(userUrl); // Chama a função corrigida
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
     * NOVO: Função para cuidar do download do Threads (Corrigida com Proxy CORS)
     */
    async function downloadThreads(userUrl) {
        
        // 1. URL da API que retorna o JSON com os links
        const apiUrl = `https://world-ecletix.onrender.com/api/threads2?url=${encodeURIComponent(userUrl)}`;
        
        // 2. Usamos um proxy CORS (allorigins.win) para conseguir chamar a API 'world-ecletix'
        //    O 'api.allorigins.win/raw?url=' baixa o conteúdo da URL fornecida
        const proxyApiUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;

        showMessage("Conectando ao proxy da API... 📡 (1/3)", "loading");
        
        let apiResponse;
        try {
            // Tenta buscar o JSON da API do Threads através do proxy
            apiResponse = await fetch(proxyApiUrl);
        } catch (e) {
            throw new Error("Falha ao conectar no proxy CORS. Verifique a conexão ou o proxy.");
        }

        if (!apiResponse.ok) {
            throw new Error(`Falha na API (Threads) via Proxy. (Status: ${apiResponse.status})`);
        }

        const data = await apiResponse.json();

        // 3. Validação da resposta da API (baseado no seu 'case' original)
        if (!data || data.statusCode !== 200 || !data.resultado || !Array.isArray(data.resultado.resultado) || data.resultado.resultado.length === 0) {
            throw new Error("Nenhuma mídia encontrada ou resposta inválida da API do Threads.");
        }

        const midias = data.resultado.resultado;
        resultArea.innerHTML = ""; // Limpa área de resultados
        showMessage(`Mídia(s) encontrada(s): ${midias.length}. Baixando... ⏳ (2/3)`, "loading");

        let mediaCount = 0;
        
        // 4. Iteramos por cada mídia encontrada (vídeo ou imagem de um carrossel, por ex.)
        for (const item of midias) {
            const mediaUrl = item.link; // Este é o link direto para o cdn.facebook.com/...
            if (!mediaUrl) continue;
            
            mediaCount++;
            showMessage(`Baixando item ${mediaCount}/${midias.length}...`, "loading");

            try {
                // 5. USAMOS O PROXY DE NOVO!
                // Desta vez, para baixar o *arquivo* (vídeo/imagem) que está no CDN
                const mediaProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(mediaUrl)}`;

                const mediaResponse = await fetch(mediaProxyUrl);
                
                if (!mediaResponse.ok) {
                    throw new Error(`Falha ao baixar mídia do item ${mediaCount}`);
                }

                // 6. Pegamos o Blob (o arquivo em si)
                const mediaBlob = await mediaResponse.blob();

                // 7. Criamos um Object URL local (Exatamente como nas funções do IG e TT)
                //    Isso permite que o atributo 'download' funcione
                const blobUrl = URL.createObjectURL(mediaBlob);
                
                // Detecta o tipo e define o nome do arquivo
                const isVideo = mediaBlob.type.startsWith('video/');
                const extension = isVideo ? 'mp4' : 'jpg'; // Suposição simples
                const filename = `media-threads-${Date.now()}-${mediaCount}.${extension}`;

                // 8. Criar o link de download final
                const linkElement = document.createElement('a');
                linkElement.href = blobUrl;
                linkElement.className = "download-link";
                linkElement.download = filename; // Agora o 'download' funciona!
                linkElement.textContent = `Download ${isVideo ? 'Vídeo' : 'Imagem'} ${mediaCount} ❤️`;
                
                resultArea.appendChild(linkElement); // Adiciona o link à área de resultados
                
            } catch (err) {
                console.error(err);
                // Se um item falhar, mostra um erro mas continua para o próximo
                const errorElement = document.createElement('p');
                errorElement.textContent = `Falha ao baixar item ${mediaCount}.`;
                errorElement.className = "error-message";
                resultArea.appendChild(errorElement);
            }
        }
        
        if (mediaCount === 0) {
             throw new Error("API respondeu, mas não foi possível extrair mídias válidas.");
        }

        // 9. Sucesso
        setLoading(false);
        showMessage("Downloads prontos! (3/3)", ""); // Limpa mensagem de loading

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
