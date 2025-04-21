import RedisServer from 'redis-server';

/**
 * Stops the Redis server instance
 */
async function stopRedis() {
  try {
    const redisServer = new RedisServer({
      port: 6379,
      bin: '/opt/homebrew/opt/redis/bin/redis-server'
    });

    await redisServer.close();
    console.log('Redis server stopped successfully');
  } catch (error) {
    console.error('Failed to stop Redis server:', error);
    process.exit(1);
  }
}

stopRedis(); 