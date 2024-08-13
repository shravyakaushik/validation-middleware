const fs = require('fs');
const path = require('path');
const amqp = require('amqplib');

// Define the log file path and RabbitMQ queue
const logFilePath = path.join(__dirname, 'logs.txt');
const queue = 'log_queue';
let channel;

// Connect to RabbitMQ and create channel
async function connectToRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    console.log('Connected to RabbitMQ and queue created');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ:', err);
  }
}

// Send log entry to RabbitMQ
async function sendToQueue(message) {
  if (!channel) {
    await connectToRabbitMQ(); // Ensure RabbitMQ is connected
  }
  try {
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log('Message sent to queue:', message);
  } catch (err) {
    console.error('Failed to send message to queue:', err);
  }
}

// Start RabbitMQ consumer
async function startConsumer() {
  if (!channel) {
    await connectToRabbitMQ(); // Ensure RabbitMQ is connected
  }
  try {
    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const logEntry = JSON.parse(msg.content.toString());
        const logText = `${new Date().toISOString()} - ${JSON.stringify(logEntry)}\n`;
        fs.appendFile(logFilePath, logText, (err) => {
          if (err) {
            console.error('Failed to write log to file:', err);
          } else {
            console.log('Log entry written to file:', logText);
          }
        });
        channel.ack(msg); // Acknowledge the message
      }
    });
    console.log('Consumer is processing messages from RabbitMQ');
  } catch (err) {
    console.error('Failed to start consumer:', err);
  }
}

// Middleware to log requests to RabbitMQ
const loggerMiddleware = async (req, res, next) => {
  // Construct the log entry
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    body: req.body
  };

  // Send the log entry to RabbitMQ
  await sendToQueue(logEntry);

  // Continue to the next middleware or route handler
  next();
};

// Start the RabbitMQ consumer when the server starts
startConsumer();

module.exports = loggerMiddleware;
