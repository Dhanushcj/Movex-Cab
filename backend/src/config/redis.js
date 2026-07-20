const { createClient } = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://default:T3PnQ7gYyOlltt3ROmaLB6lsFJyw62IX@organic-supersmooth-honorable-63504.db.redis.io:10451',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.log('Redis retries exhausted, giving up.');
            return new Error('Retry time exhausted');
          }
          return Math.min(retries * 50, 500);
        }
      }
    });

    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.on('connect', () => console.log('✅ Redis connected successfully'));

    await redisClient.connect();
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error.message);
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
