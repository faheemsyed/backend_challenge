const fastify = require('fastify')({ logger: true, connectionTimeout: 5000 });
const generateNewWorker = require('./utils/generateNewWorker');
const requestTracker = require('./utils/requestTracker');

const getCatsWorker = generateNewWorker('getCatsWorker');
const getDogsWorker = generateNewWorker('getDogsWorker');

fastify.get('/getCatsInfo', function handler (request, reply) {
  requestTracker[request.id] = (result) => reply.send(result)
  getCatsWorker.postMessage({ requestId: request.id});
})

fastify.get('/getDogsInfo', function handler (request, reply) {
  requestTracker[request.id] = (result) => reply.send(result)
  getDogsWorker.postMessage({ requestId: request.id });
})

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
