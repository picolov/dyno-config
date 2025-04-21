import { randomInt } from 'crypto';
import DynoConfig from 'dyno-config';
import path from 'path';

/**
 * Updates configuration values in Redis
 */
async function updateConfig() {
  try {
    const configManager = new DynoConfig({
      serviceName: 'web-server',
      redisUrl: 'redis://localhost:6379',
      configPath: path.join(process.cwd(), 'config.yml')
    });

    await configManager.initialize();

    // Update feature flags
    await configManager.set('feature_flags', {
      randomVal: randomInt(1000),
      experimentalFeature: true,
      maintenanceMode: false
    });

    // Update API settings
    await configManager.set('api_settings', {
      randomVal: randomInt(1000),
      timeout: 5000,
      max_retries: 3,
      baseUrl: 'https://api.example.com'
    });

    console.log('Configuration updated successfully');
    await configManager.disconnect();
  } catch (error) {
    console.error('Failed to update configuration:', error);
    process.exit(1);
  }
}

updateConfig(); 