document.addEventListener("DOMContentLoaded", () => {
    // Seleciona os elementos do HTML
    const form = document.getElementById("download-form");
    const urlInput = document.getElementById("url-input");
    const downloadButton = document.getElementById("download-button");
    const buttonText = downloadButton.querySelector(".button-text");
    const buttonLoader = downloadButton.querySelector(".button-loader");
    const messageArea = document.getElementById("message-area");
    const resultArea = document.getElementById("result-area");
    const platformSelect = document.getElementById("platform-select");

    // Evento principal: ao enviar o formulário
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userUrl = urlInput.value.trim();
        const platform = platformSelect.value;

        if (!userUrl) {
            showMessage("Por favor, insira um URL.", "error");
            return;
        }

        // Inicia o estado de carregamento
        setLoading(true);
        showMessage("Processando... ⚡", "loading");
        resultArea.innerHTML = "";

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
            console.error(error);
            setLoading(false);
            showMessage(error.message || "Oops! Algo deu errado. Tente novamente.", "error");
            resultArea.innerHTML = "";
            return;
        }

        // Finaliza o carregamento
        setLoading(false);
        showMessage("");
    });

    /**
     * Função: Download Instagram
     */
    async function downloadInstagram(userUrl) {
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/instagram/mp4?url=${encodeURIComponent(userUrl)}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Falha na API (IG). Status: ${response.status}`);
        }

        const videoBlob = await response.blob();
        if (!videoBlob.type.startsWith("video/")) {
            throw new Error("A API (IG) não retornou um vídeo válido.");
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
     * Função: Download TikTok
     */
    async function downloadTikTok(userUrl) {
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/tiktok/mp4?url=${encodeURIComponent(userUrl)}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Falha na API (TT). Status: ${response.status}`);
        }

        const videoBlob = await response.blob();
        if (!videoBlob.type.startsWith("video/")) {
            throw new Error("A API (TT) não retornou um vídeo válido.");
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
     * ✅ NOVA FUNÇÃO CORRIGIDA: Download Kwai
     * Usa fetch() + blob para baixar o arquivo corretamente
     * e faz fallback para abrir em nova aba se houver bloqueio CORS
     */
    async function downloadKwai(userUrl) {
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/kwai/mp4?url=${encodeURIComponent(userUrl)}`;

        try {
            const response = await fetch(apiUrl);

            // Se a resposta for inválida, abre a URL direto
            if (!response.ok) {
                window.open(apiUrl, "_blank");
                throw new Error(`Falha na API (Kwai). Status: ${response.status}. Abri a URL em nova aba.`);
            }

            const blob = await response.blob();

            if (!blob.type || !blob.type.startsWith("video/")) {
                // Fallback se não for um vídeo
                window.open(apiUrl, "_blank");
                throw new Error("A API (Kwai) não retornou um arquivo de vídeo. Abri a URL em nova aba.");
            }

            // Cria URL local do vídeo
            const videoUrl = URL.createObjectURL(blob);
            const filename = `video-kwai-${Date.now()}.mp4`;

            // Força o download
            const tempLink = document.createElement("a");
            tempLink.href = videoUrl;
            tempLink.download = filename;
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);

            // Mostra link manual
            resultArea.innerHTML = `
                <a href="${videoUrl}" class="download-link" download="${filename}">
                    Download (Kwai) pronto — clique aqui se o arquivo não baixou automaticamente ❤️
                </a>
            `;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Funções auxiliares
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
