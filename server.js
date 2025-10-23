const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch'); // Certifique-se de ter 'node-fetch' instalado

const app = express();
const port = 3000;

// Configurar CORS para permitir requisições de diferentes origens
app.use(cors());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para buscar músicas/vídeos no YouTube (SEU CÓDIGO ORIGINAL - MANTIDO)
app.get('/api/search', async (req, res) => {
    const query = req.query.query; 
    if (!query) {
        return res.status(400).json({ error: 'Parâmetro "query" é obrigatório para a busca.' });
    }

    try {
        const response = await fetch(`https://api.nexfuture.com.br/api/pesquisas/youtube?query=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Resposta da API de busca (NexFuture):', data); 

        if (!data || !data.resultado) {
            return res.status(200).json({ results: [], message: 'Nenhum resultado encontrado para a sua busca.' });
        }

        const videoResult = {
            title: data.resultado.titulo,
            id: data.resultado.id,
            thumbnail: data.resultado.imagem,
            channel: data.resultado.canal,
            description: data.resultado.descricao,
            views: data.resultado.views,
            duration: data.resultado.duracao,
            url: data.resultado.url, 
        };

        res.json({ results: [videoResult] });

    } catch (error) {
        console.error('Erro na busca de músicas:', error.message);
        res.status(500).json({ error: error.message || 'Erro ao buscar músicas.' });
    }
});

// Endpoint para baixar MP3 ou MP4 do YouTube (SEU CÓDIGO ORIGINAL - MANTIDO)
app.get('/api/download', async (req, res) => {
    const { title, url, format } = req.query; 

    if (!format || (format !== 'mp3' && format !== 'mp4')) {
        return res.status(400).json({ error: 'Parâmetro "format" inválido. Deve ser "mp3" ou "mp4".' });
    }
    // ... (resto do seu código /api/download ... )
    
    if (!title) {
        return res.status(400).json({ error: 'Parâmetro "title" é obrigatório para nomear o arquivo.' });
    }
    
    if (!url) {
        return res.status(400).json({ error: 'Parâmetro "url" (do vídeo do YouTube) é obrigatório.' });
    }
    
    const filename = `${title.replace(/[^a-zA-Z0-9\s-_]/g, '_').replace(/\s+/g, '_')}.${format}`;

    
    if (format === 'mp3') {
        // --- LÓGICA DO MP3 ---
        try {
            const jsonApiUrl = `https://api.nexfuture.com.br/api/downloads/youtube/mp3/v3?url=${encodeURIComponent(url)}`;
            console.log(`Buscando link de download MP3 (NexFuture JSON) para: ${url}`);
            const jsonResponse = await fetch(jsonApiUrl);
            // ... (resto da sua lógica de MP3) ...
            if (!jsonResponse.ok) { throw new Error('Falha na API JSON MP3'); }
            const data = await jsonResponse.json();
            const downloadLink = data.downloadLink || data.resultado?.downloadLink || data.download?.downloadLink;
            if (!downloadLink) { throw new Error('Link MP3 não encontrado'); }
            const streamResponse = await fetch(downloadLink);
            if (!streamResponse.ok) { throw new Error('Falha no stream MP3'); }
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            streamResponse.body.pipe(res);
        } catch (error) {
            console.error(`Erro no download MP3:`, error.message);
            res.status(500).json({ error: error.message || `Erro ao gerar ou baixar o MP3.` });
        }

    } else {
        // --- LÓGICA DO MP4 (YOUTUBE) ---
        try {
            const directStreamApiUrl = `https://api.nexfuture.com.br/api/downloads/youtube/mp4?url=${encodeURIComponent(url)}`;
            console.log(`Iniciando proxy MP4 direto da API: ${directStreamApiUrl}`);
            const streamResponse = await fetch(directStreamApiUrl); 
            if (!streamResponse.ok) {
                const errorText = await streamResponse.text(); 
                throw new Error(`Erro HTTP ${streamResponse.status} ao fazer fetch direto do stream (MP4): ${errorText.substring(0, 150)}`);
            }
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            streamResponse.body.pipe(res); 
        } catch (error) {
            console.error(`Erro no download MP4:`, error.message);
            if (!res.headersSent) {
                res.status(500).json({ error: error.message || `Erro ao gerar ou baixar o MP4.` });
            }
        }
    }
});


/**
 * =======================================================================
 * NOVO ENDPOINT (A SOLUÇÃO)
 * Este endpoint serve como proxy para o seu primeiro formulário
 * (que baixa de Instagram, TikTok e YouTube).
 * =======================================================================
 */
app.get('/api/proxy-download', async (req, res) => {
    const { url, platform } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Parâmetro "url" é obrigatório.' });
    }
    if (!platform || !["instagram", "tiktok", "youtube"].includes(platform)) {
        return res.status(400).json({ error: 'Parâmetro "platform" inválido.' });
    }

    let directStreamApiUrl = "";
    let filename = "";

    try {
        // 1. Monta a URL da API correta e o nome do arquivo
        switch (platform) {
            case "instagram":
                directStreamApiUrl = `https://api.nexfuture.com.br/api/downloads/instagram/mp4?url=${encodeURIComponent(url)}`;
                filename = `video-ig-${Date.now()}.mp4`;
                break;
            case "tiktok":
                directStreamApiUrl = `https://api.nexfuture.com.br/api/downloads/tiktok/mp4?url=${encodeURIComponent(url)}`;
                filename = `video-tt-${Date.now()}.mp4`;
                break;
            case "youtube":
                directStreamApiUrl = `https://api.nexfuture.com.br/api/downloads/youtube/mp4?url=${encodeURIComponent(url)}`;
                filename = `video-yt-${Date.now()}.mp4`;
                break;
        }

        // 2. Lógica do Proxy (igual à sua lógica de MP4)
        console.log(`Iniciando proxy MP4 (${platform}) direto da API: ${directStreamApiUrl}`);
        const streamResponse = await fetch(directStreamApiUrl); // Faz o fetch do stream

        if (!streamResponse.ok) {
            const errorText = await streamResponse.text(); 
            throw new Error(`Erro HTTP ${streamResponse.status} ao fazer fetch do stream (${platform}): ${errorText.substring(0, 150)}`);
        }

        // 3. Envia o stream para o usuário
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        streamResponse.body.pipe(res); // Envia o stream direto para o cliente

    } catch (error) {
        console.error(`Erro no download MP4 (${platform}):`, error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message || `Erro ao gerar ou baixar o MP4.` });
        }
    }
});


// Rota padrão para servir o arquivo 'index.html'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar o servidor na porta especificada
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
