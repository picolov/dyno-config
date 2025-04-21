import RedisServer from 'redis-server';

/**
 * Starts a Redis server instance
 */
async function startRedis() {
  try {
    const redisServer = new RedisServer({
      port: 6379,
      bin: '/opt/homebrew/opt/redis/bin/redis-server'
    });

    await redisServer.open();
    console.log('Redis server started successfully');
  } catch (error) {
    console.error('Failed to start Redis server:', error);
    process.exit(1);
  }
}

startRedis(); 