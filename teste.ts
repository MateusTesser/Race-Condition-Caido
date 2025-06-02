import https from 'https';

const agent = new https.Agent({ keepAlive: true, maxSockets: 1 });

const makeRequest = (id: number) => {
  const options: https.RequestOptions = {
    hostname: 'jsonplaceholder.typicode.com',
    path: `/todos/${id}`,
    method: 'GET',
    agent,  // Reutiliza o mesmo Agent/socket
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`Requisição ${id}:`, JSON.parse(data));
    });
  });

  req.end();
};



// Dispara 10 requisições concorrentes no mesmo socket
const raceRequests = Array.from({ length: 10 }, (_, i) => makeRequest(i + 1));
await Promise.allSettled(raceRequests);
