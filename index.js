const fastify = require('fastify')({ logger: true, connectionTimeout: 5000 });
const generateNewWorker = require('./utils/generateNewWorker');
const requestTracker = require('./utils/requestTracker');
const { v4: uuidv4 } = require('uuid'); // Import the uuid library for generating correlation IDs

const getCatsWorker = generateNewWorker('getCatsWorker');
const getDogsWorker = generateNewWorker('getDogsWorker');

// Middleware to handle correlationId
fastify.addHook('onRequest', (request, reply, done) => {
  const correlationId = request.headers['correlationid'] || uuidv4()
  request.correlationId = correlationId; // Attach to request object
  reply.header('correlationId', correlationId); // Set in response headers
  done();
});

fastify.get('/getCatsInfo', function handler (request, reply) {
  requestTracker[request.id] = (result) => reply.send(result)
  getCatsWorker.postMessage({ requestId: request.id, correlationId: request.correlationId });
})

fastify.get('/getDogsInfo', function handler (request, reply) {
  requestTracker[request.id] = (result) => reply.send(result)
  getDogsWorker.postMessage({ requestId: request.id, correlationId: request.correlationId });
})

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
