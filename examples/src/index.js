import express from 'express';
import DynoConfig from 'dyno-config';
import path from 'path';

const app = express();
const port = 3000;

// Initialize the configuration manager
const configManager = new DynoConfig({
  serviceName: 'web-server',
  redisUrl: 'redis://localhost:6379',
  configPath: path.join(process.cwd(), 'config.jsonc')
});

// Route that uses feature flags
app.get('/features', (req, res) => {
  const featureFlags = configManager.get('feature_flags');
  res.json({
    features: featureFlags,
    message: 'These features can be updated in runtime!'
  });
});

// Route that uses API settings
app.get('/api-settings', (req, res) => {
  const apiSettings = configManager.get('api_settings');
  res.json({
    settings: apiSettings,
    message: 'These settings can be updated in runtime!'
  });
});

// Listen for configuration updates
configManager.onUpdate((key, value) => {
  console.log(`Configuration updated: ${key} = ${JSON.stringify(value)}`);
});

async function startServer() {
  try {
    // Initialize the configuration manager
    await configManager.initialize();
    
    // Start the server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      console.log('Try these endpoints:');
      console.log('- http://localhost:3000/features');
      console.log('- http://localhost:3000/api-settings');
      console.log('\nUse the update-config.js script to update configurations in runtime!');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 