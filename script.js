Document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("download-form");
    const urlInput = document.getElementById("url-input");
    const downloadButton = document.getElementById("download-button");
    const buttonText = downloadButton.querySelector(".button-text");
    const buttonLoader = downloadButton.querySelector(".button-loader");
    const messageArea = document.getElementById("message-area");
    const resultArea = document.getElementById("result-area");
    const platformSelect = document.getElementById("platform-select");

    // =================================================================
    // !! ALERTA DE SEGURANÇA !!
    // Colocar sua chave de API aqui é MUITO PERIGOSO.
    // Qualquer visitante do site pode roubá-la.
    // Considere criar um endpoint em 'api.nexfuture.com.br' para 
    // fazer essa chamada no servidor (back-end).
    // =================================================================
    const API_KEY_BRONXYS = "KEY-TEMPORARIA-TELEGRAM-ALEATORY"; 
    // =================================================================

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userUrl = urlInput.value.trim();
        const platform = platformSelect.value;

        if (!userUrl) {
            showMessage("Por favor, insira um URL.", "error");
            return;
        }

        setLoading(true);
        showMessage("Processando... ⚡", "loading");
        resultArea.innerHTML = "";

        try {
            switch (platform) {
                case "instagram":
                    if (!userUrl.includes("instagram.com")) throw new Error("Link inválido do Instagram.");
                    await downloadInstagram(userUrl);
                    break;

                case "tiktok":
                    if (!userUrl.includes("tiktok.com")) throw new Error("Link inválido do TikTok.");
                    await downloadTikTok(userUrl);
                    break;

                case "kwai":
                    if (!userUrl.includes("kwai.com") && !userUrl.includes("kuaishou.com")) throw new Error("Link inválido do Kwai.");
                    await downloadKwai(userUrl);
                    break;
                
                // CASE ATUALIZADO
                case "threads":
                    if (!userUrl.includes("threads.net")) throw new Error("Link inválido do Threads.");
                    await downloadThreads(userUrl);
                    break;

                default:
                    throw new Error("Plataforma desconhecida ou não suportada.");
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
            showMessage(error.message || "Oops! Algo deu errado. Tente novamente.", "error");
            resultArea.innerHTML = "";
            return;
        }

        setLoading(false);
        showMessage("");
    });

    /**
     * 📸 Instagram
     */
    async function downloadInstagram(userUrl) {
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/instagram/mp4?url=${encodeURIComponent(userUrl)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Falha na API (Instagram). Status: ${response.status}`);

        const videoBlob = await response.blob();
        if (!videoBlob.type.startsWith("video/")) throw new Error("A API (Instagram) não retornou um vídeo válido.");

        const videoUrl = URL.createObjectURL(videoBlob);
        const filename = `video-instagram-${Date.now()}.mp4`;

        resultArea.innerHTML = `
            <a href="${videoUrl}" class="download-link" download="${filename}">
                📥 Download concluído — clique aqui ❤️
            </a>
        `;
    }

    /**
     * 🎵 TikTok
     */
    async function downloadTikTok(userUrl) {
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/tiktok/mp4?url=${encodeURIComponent(userUrl)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Falha na API (TikTok). Status: ${response.status}`);

        const videoBlob = await response.blob();
        if (!videoBlob.type.startsWith("video/")) throw new Error("A API (TikTok) não retornou um vídeo válido.");

        const videoUrl = URL.createObjectURL(videoBlob);
        const filename = `video-tiktok-${Date.now()}.mp4`;

        resultArea.innerHTML = `
            <a href="${videoUrl}" class="download-link" download="${filename}">
                📥 Download concluído — clique aqui ❤️
            </a>
        `;
    }

    /**
     * 🌟 Kwai
     */
    async function downloadKwai(userUrl) {
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/kwai/mp4?url=${encodeURIComponent(userUrl)}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                window.open(apiUrl, "_blank");
                throw new Error(`Falha na API (Kwai). Status: ${response.status}`);
            }

            const blob = await response.blob();
            if (!blob.type.startsWith("video/")) {
                window.open(apiUrl, "_blank");
                throw new Error("A API (Kwai) não retornou um arquivo de vídeo.");
            }

            const videoUrl = URL.createObjectURL(blob);
            const filename = `video-kwai-${Date.now()}.mp4`;

            const tempLink = document.createElement("a");
            tempLink.href = videoUrl;
            tempLink.download = filename;
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);

            resultArea.innerHTML = `
                <a href="${videoUrl}" class="download-link" download="${filename}">
                    📥 Download (Kwai) pronto — clique aqui se o arquivo não baixou automaticamente ❤️
                </a>
            `;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 🧵 Threads (FUNÇÃO ATUALIZADA)
     * Usa a API 'bronxyshost' que você forneceu.
     * Inclui um fallback 'window.open' similar ao Kwai,
     * pois o 'fetch' de APIs externas pode ser bloqueado por CORS.
     */
    async function downloadThreads(userUrl) {
        if (!API_KEY_BRONXYS || API_KEY_BRONXYS === "COLOQUE_SUA_API_KEY_AQUI") {
            throw new Error("API Key do Threads (Bronxys) não está configurada.");
        }

        const apiUrl = `https://api.bronxyshost.com.br/api-bronxys/threads?url=${encodeURIComponent(userUrl)}&apikey=${API_KEY_BRONXYS}`;

        try {
            // Tenta fazer o fetch (pode falhar por CORS)
            const response = await fetch(apiUrl);

            if (!response.ok) {
                // Se a API retornar um erro (404, 500, etc)
                window.open(apiUrl, "_blank"); // Abre em nova aba como fallback
                throw new Error(`Falha na API (Threads/Bronxys). Status: ${response.status}`);
            }

            const blob = await response.blob();
            if (!blob.type.startsWith("video/")) {
                // Se a resposta for OK, mas não for um vídeo (ex: JSON de erro)
                window.open(apiUrl, "_blank"); // Abre em nova aba como fallback
                throw new Error("A API (Threads/Bronxys) não retornou um arquivo de vídeo.");
            }

            // Se o fetch funcionou e é um vídeo:
            const videoUrl = URL.createObjectURL(blob);
            const filename = `video-threads-${Date.now()}.mp4`;

            // Força o download
            const tempLink = document.createElement("a");
            tempLink.href = videoUrl;
            tempLink.download = filename;
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);

            resultArea.innerHTML = `
                <a href="${videoUrl}" class="download-link" download="${filename}">
                    📥 Download (Threads) pronto — clique aqui se o arquivo não baixou automaticamente ❤️
                </a>
            `;

        } catch (err) {
            // Isso geralmente acontece por erro de CORS (quando o fetch é bloqueado)
            console.warn("Fetch falhou (provavelmente CORS), usando fallback window.open(). Erro:", err.message);

            // Fallback: Abrir a URL da API diretamente em uma nova aba.
            // O navegador tentará baixar o arquivo que a API enviar.
            window.open(apiUrl, "_blank");
            resultArea.innerHTML = `
                <a href="${apiUrl}" class="download-link" target="_blank">
                    📥 O download deve iniciar em uma nova aba. Clique aqui se não funcionar.
                </a>
            `;
            // Não relançamos o erro aqui, pois o fallback é um comportamento esperado.
        }
    }


    /**
     * ⚙️ Funções auxiliares
     */
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
