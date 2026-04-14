const http = require('http');
const axios = require('axios');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PIXEL_ID = '359988621109574';
const ACCESS_TOKEN = 'EABVsPwmVH20BREL54FbOJyk1pfjZBdZBv3OQSv7cXpFXJEIyxXr9QaZBRNZCQZA3BZCExH8pQga58AryB2MLloZAVqMTGiZADr8aCNkoTaj4HQDEbQ4jVGqX1YkgHkrZAbKwdJ7t72ApxdXkwncsMZCFgAS9otkPKdYUvyQv8kb84J3O329l6kkvRjzbCWlR5KtEwslgZDZD';

// Fonction pour hasher une valeur
function hashValue(value) {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(String(value).toLowerCase().trim()).digest('hex');
}

// Fonction pour normaliser et hasher le phone (digits only)
function hashPhone(phone) {
  if (!phone) return undefined;
  const digits = String(phone).replace(/\D/g, '');
  return crypto.createHash('sha256').update(digits).digest('hex');
}

// Fonction pour normaliser et hasher un nom (remove spaces and special chars)
function hashName(name) {
  if (!name) return undefined;
  const normalized = String(name).toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

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
              event_name: 'Purchase', // Ou 'Lead'
              event_time: Math.floor(Date.now() / 1000),
              action_source: 'system_generated',
              user_data: {
                em: hashValue(event.customer_email),
                ph: hashPhone(event.customer_phone),
                fn: hashName(event.customer_first_name),
                ln: hashName(event.customer_last_name),
                ct: hashValue(event.customer_city),
                st: hashValue(event.customer_state),
                zp: hashValue(event.customer_zip),
                country: hashValue(event.customer_country),
              },
              test_event_code: 'TEST65399',
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