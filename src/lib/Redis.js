import Redis from 'ioredis';

// Create a new Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST_DEV || 'localhost', // default to localhost if not set
  port: process.env.REDIS_PORT_DEV || 6379,       // default to 6379 if not set
  password: process.env.REDIS_PASSWORD_DEV || '', // optional, depending on your Redis setup
});

export default redis;
