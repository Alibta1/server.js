const http = require('http');
const axios = require('axios');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PIXEL_ID = '359988621109574';
const ACCESS_TOKEN = 'EAAm2xmInmFsBRIPFi73MrInfVdyG3GCDeffc0SZChxpF9tUgqijMHRBWGYgfgieO3zqZCYINc4QHaov2S6PFycsl7W4BKXuzmiOlnBZACD5bMCU9UG7mUp0fBH3PcBZCcM3lY9Gx6XyvdBwZCyixjT8U26sN45g16jiZBjKM6W9R3hXUIaSAFNobnIkIk6kWaFNjxbBcFEerEmC0C6c36ZCA8VdY5WQ3N7ZC74vLIMST1SqIP8wd4RhmZBZB8tE1vB3Rk3pbHq0HJjZAqtbgJ4fTbiCVZAO9I5ZAOLQZDZD';

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const event = JSON.parse(body);
        
        // Envoyer à Meta
        const metaPayload = {
          data: [
            {
              event_name: 'Lead', // Ou 'Purchase'
              event_time: Math.floor(Date.now() / 1000),
              action_source: 'website',
              user_data: {
                em: event.customer_email ? crypto.createHash('sha256').update(event.customer_email.toLowerCase()).digest('hex') : undefined,
              },
              test_event_code: 'TEST59669',
            }
          ]
        };
        
        await axios.post(
          `https://graph.facebook.com/v20.0/${PIXEL_ID}/events`,
          metaPayload,
          { params: { access_token: ACCESS_TOKEN } }
        );
        
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
        
      } catch (error) {
        console.error('Erreur:', error.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`✅ Serveur sur port ${PORT}`);
});