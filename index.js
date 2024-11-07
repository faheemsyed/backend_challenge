const fastify = require('fastify')({ logger: true, connectionTimeout: 5000 });
const generateNewWorker = require('./utils/generateNewWorker');
const requestTracker = require('./utils/requestTracker');
const { v4: uuidv4 } = require('uuid'); // Import the uuid library for generating correlation IDs

let getCatsWorker = generateNewWorker('getCatsWorker');
let getDogsWorker = generateNewWorker('getDogsWorker');

// Middleware/Hook to attach correlationId to header
fastify.addHook('onRequest', (request, reply, done) => {
  const correlationId = request.headers['correlationid'] || uuidv4()
  request.correlationId = correlationId; // Attach to request object
  reply.header('correlationId', correlationId); // Set in response headers
  done();
});

fastify.get('/getCatsInfo', function handler (request, reply) {
  if (getCatsWorker.threadId === -1) { // Check if the worker has been terminated
    getCatsWorker = generateNewWorker('getCatsWorker');
  }
  requestTracker[request.id] = (result) => reply.send(result)
  getCatsWorker.postMessage({ requestId: request.id, correlationId: request.correlationId });
})

fastify.get('/getDogsInfo', function handler (request, reply) {
  if (getDogsWorker.threadId === -1) { // Check if the worker has been terminated
    getDogsWorker = generateNewWorker('getDogsWorker');
  }
  requestTracker[request.id] = (result) => reply.send(result)
  getDogsWorker.postMessage({ requestId: request.id, correlationId: request.correlationId });
})

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

// checking to see if github is setup correctly