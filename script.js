document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("download-form");
    const urlInput = document.getElementById("url-input");
    const downloadButton = document.getElementById("download-button");
    const buttonText = downloadButton.querySelector(".button-text");
    const buttonLoader = downloadButton.querySelector(".button-loader");
    const messageArea = document.getElementById("message-area");
    const resultArea = document.getElementById("result-area");
    const platformSelect = document.getElementById("platform-select");

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

                case "pinterest":
                    if (!userUrl.includes("pinterest.com") && !userUrl.includes("pin.it")) throw new Error("Link inválido do Pinterest.");
                    await downloadPinterest(userUrl);
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
     * Instagram
     */
    async function downloadInstagram(userUrl) {
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/instagram/mp4?url=${encodeURIComponent(userUrl)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Falha na API (IG). Status: ${response.status}`);

        const videoBlob = await response.blob();
        if (!videoBlob.type.startsWith("video/")) throw new Error("A API (IG) não retornou um vídeo válido.");

        const videoUrl = URL.createObjectURL(videoBlob);
        const filename = `video-ig-${Date.now()}.mp4`;

        resultArea.innerHTML = `
            <a href="${videoUrl}" class="download-link" download="${filename}">
                Download Concluído! Clique aqui ❤️
            </a>
        `;
    }

    /**
     * TikTok
     */
    async function downloadTikTok(userUrl) {
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/tiktok/mp4?url=${encodeURIComponent(userUrl)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Falha na API (TT). Status: ${response.status}`);

        const videoBlob = await response.blob();
        if (!videoBlob.type.startsWith("video/")) throw new Error("A API (TT) não retornou um vídeo válido.");

        const videoUrl = URL.createObjectURL(videoBlob);
        const filename = `video-tt-${Date.now()}.mp4`;

        resultArea.innerHTML = `
            <a href="${videoUrl}" class="download-link" download="${filename}">
                Download Concluído! Clique aqui ❤️
            </a>
        `;
    }

    /**
     * Kwai
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
                    Download (Kwai) pronto — clique aqui se o arquivo não baixou automaticamente ❤️
                </a>
            `;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 🆕 Pinterest
     */
    async function downloadPinterest(userUrl) {
        const apiUrl = `http://speedhosting.cloud:2009/download/pinterest-mp4?link=${encodeURIComponent(userUrl)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Falha na API (Pinterest). Status: ${response.status}`);

        const data = await response.json();
        if (!data.status || !data.video) throw new Error("Não foi possível obter o vídeo do Pinterest.");

        const filename = `video-pinterest-${Date.now()}.mp4`;

        resultArea.innerHTML = `
            <div style="text-align:center">
                <h3>${data.titulo || "Vídeo do Pinterest"}</h3>
                <img src="${data.thumb}" width="250" style="border-radius:10px;margin:10px 0;">
                <br>
                <a href="${data.video}" class="download-link" download="${filename}">
                    🎬 Baixar Vídeo do Pinterest ❤️
                </a>
            </div>
        `;
    }

    /**
     * Utilidades
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
