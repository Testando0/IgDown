Document.addEventListener("DOMContentLoaded", () => {
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
                    await downloadMedia(userUrl, "instagram", "mp4");
                    break;

                case "tiktok":
                    if (!userUrl.includes("tiktok.com")) throw new Error("Link inválido do TikTok.");
                    await downloadMedia(userUrl, "tiktok", "mp4");
                    break;

                case "kwai":
                    if (!userUrl.includes("kwai.com") && !userUrl.includes("kuaishou.com")) throw new Error("Link inválido do Kwai.");
                    await downloadMedia(userUrl, "kwai", "mp4");
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
        showMessage("Download pronto! ✅");
    });

    /**
     * 📥 Função Única e Robusta de Download de Mídia
     * Substitui as funções downloadInstagram, downloadTikTok e downloadKwai.
     */
    async function downloadMedia(userUrl, platform, format) {
        const apiUrl = `https://api.nexfuture.com.br/api/downloads/${platform}/${format}?url=${encodeURIComponent(userUrl)}`;
        const response = await fetch(apiUrl);
        const contentType = response.headers.get("Content-Type");
        const filename = `video-${platform}-${Date.now()}.mp4`;

        // 1. TRATAMENTO DE ERRO DE STATUS HTTP (4xx ou 5xx)
        if (!response.ok) {
            let errorMessage = `Falha na API (${platform}). Status: ${response.status}.`;
            // Tenta ler a resposta como JSON para pegar a mensagem de erro da API
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {} // Se não for JSON (por exemplo, HTML), usa a mensagem padrão
            throw new Error(errorMessage);
        }

        // 2. TRATAMENTO DE ERRO DE CONTEÚDO (Status 200, mas com JSON/HTML de erro no corpo)
        // Isso resolve o problema de a API retornar JSON de erro com status 200.
        if (!contentType || (!contentType.startsWith("video/") && !contentType.startsWith("image/"))) {
            let errorMessage = `A API (${platform}) retornou um formato inesperado. Verifique o link.`;
            // Tenta ler como JSON para exibir a mensagem de erro da API (clonando a resposta)
            try {
                const errorData = await response.clone().json();
                errorMessage = errorData.message || errorMessage;
            } catch {}
            throw new Error(errorMessage);
        }

        // 3. PROCESSAMENTO BEM-SUCEDIDO
        const mediaBlob = await response.blob();
        
        // Confirma que o Blob tem o tipo correto
        if (!mediaBlob.type.startsWith("video/") && !mediaBlob.type.startsWith("image/")) {
             throw new Error("O arquivo baixado não é uma mídia válida. Tente outra URL.");
        }

        const mediaUrl = URL.createObjectURL(mediaBlob);

        // Se for Kwai e a resposta falhou na API, ela abriu uma nova janela no código original.
        // Removemos essa lógica para manter o fluxo de download no cliente.

        resultArea.innerHTML = `
            <a href="${mediaUrl}" class="download-link" download="${filename}">
                📥 Download concluído — clique aqui ❤️
            </a>
        `;
        
        // Boa prática: Revogar o URL do objeto após o download ser clicado/iniciado para liberar memória
        resultArea.querySelector(".download-link").addEventListener('click', () => {
            setTimeout(() => URL.revokeObjectURL(mediaUrl), 100);
        });
    }

    /**
     * ⚙️ Funções auxiliares (Mantidas)
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
