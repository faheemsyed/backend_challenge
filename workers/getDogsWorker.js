const { parentPort } = require('worker_threads');
const mockFetch = require('../utils/mockFetch');

/*
- The 'dogs' API doesn't need token, so we can directly call the 'mockFetch' function.
*/
const handleResponse = async (message) => {
  console.log('handling request to get dogs');
  try {
    const response = await mockFetch('dogs');
    parentPort.postMessage({ response, requestId: message.requestId, correlationId: message.correlationId });
  } catch (error) {
    console.log('handleResponse error:', error)
    parentPort.postMessage({ response: 'error response from getDogsWorker', requestId: message.requestId, correlationId: message.correlationId});
  }
}

/*
- Process the request from the main thread, and respond back with the data.
*/
parentPort.on('message', async (message) => {
  await handleResponse(message);
});