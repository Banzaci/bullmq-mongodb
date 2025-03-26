Start mongodb:
docker run -d --name mongodb -p 27017:27017 mongo

Start Redis
docker run -d --name redis -p 6379:6379 redis


Add:
curl -X POST http://localhost:3000/add-job \
     -H "Content-Type: application/json" \
     -d '{"name": "MongoDB Job", "delay": 1000}'


High priorety:
curl -X POST http://localhost:3000/add-job \
     -H "Content-Type: application/json" \
     -d '{"name": "Urgent Job", "priority": 1}'

Every 30 secc:
curl -X POST http://localhost:3000/add-job \
     -H "Content-Type: application/json" \
     -d '{"name": "Recurring Job", "repeatEvery": 30000}'


Get all jobs:
curl -X GET http://localhost:3000/jobs


✅ MongoDB-integration: Jobb lagras och uppdateras i databasen
✅ Felhantering & Retries: Om jobbet misslyckas försöker det igen
✅ Prioritering: Jobb med högre prioritet körs först
✅ Schemalagda jobb: Automatiska jobb kan sättas upp
✅ API för att hämta jobbstatus



// 
node workers/emailWorker.js
node workers/uploadWorker.js

curl -X POST http://localhost:3002/send-email \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "subject": "Hello!", "message": "This is a test."}'

curl -X POST http://localhost:3002/upload-document \
     -H "Content-Type: application/json" \
     -d '{"filename": "file.pdf"}'

// 🛠 Lägg till en QueueScheduler (nödvändig för rate-limiting)
const emailQueueScheduler = new QueueScheduler("emailQueue", {
  connection: redisClient,
});

// Rate limiting
export const uploadQueue = new Queue("uploadQueue", {
  connection: redisClient,
  limiter: {
    max: 3, // 🚀 Max 3 jobb per minut
    duration: 60000, // 60000ms = 1 minut
  },
});

Endast 10 e-post skickas per minut pga rate-limiting.

Max 5 e-post behandlas samtidigt tack vare concurrency.

Systemet är optimerat och undviker överbelastning! 🚀


pm2 start ecosystem.config.cjs --env dev or pm2 start ecosystem.config.js --import


pm2 list
pm2 logs workers
pm2 restart workers
pm2 stop workers
pm2 delete workers

Save the process to restart on reboot:
pm2 save
pm2 startup
