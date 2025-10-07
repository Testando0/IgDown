document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('download-form');
    const urlInput = document.getElementById('instagram-url');
    const resultDiv = document.getElementById('result');
    const downloadBtn = document.getElementById('download-btn');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página
        
        const url = urlInput.value.trim();
        if (!url) {
            showError("Por favor, insira um link do Instagram.");
            return;
        }

        // Mostra o spinner de carregamento e desabilita o botão
        showLoading();
        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Buscando...';

        const apiKey = 'alucard';
        const apiUrl = `https://zero-two-apis.com.br/api/instagram?url=${encodeURIComponent(url)}&apikey=${apiKey}`;

        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`Erro na rede: ${response.statusText}`);
            }

            const data = await response.json();

            // A API pode retornar o status de erro dentro do JSON
            if (data.status && data.status !== 200) {
                 throw new Error(data.message || 'Não foi possível encontrar o vídeo.');
            }

            // Assumindo que a URL do vídeo está em data.url ou data.data.url
            const videoUrl = data.url || (data.data && data.data.url);

            if (videoUrl) {
                showDownloadLink(videoUrl);
            } else {
                throw new Error('Link para download não encontrado na resposta da API.');
            }

        } catch (error) {
            showError(`Ocorreu um erro: ${error.message}`);
        } finally {
            // Reabilita o botão
            downloadBtn.disabled = false;
            downloadBtn.textContent = 'Baixar Vídeo';
        }
    });

    function showLoading() {
        resultDiv.innerHTML = '<div class="loading-spinner"></div>';
    }

    function showError(message) {
        resultDiv.innerHTML = `<p class="error-message">${message}</p>`;
    }

    function showDownloadLink(videoUrl) {
        resultDiv.innerHTML = `
            <a href="${videoUrl}" class="download-link" target="_blank" rel="noopener noreferrer" download>
                Prontinho! Clique para Baixar 😈
            </a>
        `;
    }
});
