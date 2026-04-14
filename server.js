const http = require('http');
const axios = require('axios');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PIXEL_ID = '359988621109574';
const ACCESS_TOKEN = 'EABVsPwmVH20BREL54FbOJyk1pfjZBdZBv3OQSv7cXpFXJEIyxXr9QaZBRNZCQZA3BZCExH8pQga58AryB2MLloZAVqMTGiZADr8aCNkoTaj4HQDEbQ4jVGqX1YkgHkrZAbKwdJ7t72ApxdXkwncsMZCFgAS9otkPKdYUvyQv8kb84J3O329l6kkvRjzbCWlR5KtEwslgZDZD';

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
          `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`,
          metaPayload,
          { params: { access_token: ACCESS_TOKEN } }
        );
        
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
        
      } catch (error) {
        console.error('Erreur:', error.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.response ? error.response.data : error.message }));
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`✅ Serveur sur port ${PORT}`);
});