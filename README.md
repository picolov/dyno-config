# Dyno Config
<div align="center">
  <img src="https://github.com/picolov/dyno-config/blob/master/dyno.png" alt="Dyno Config Logo" width="200" />
</div>

[![npm version](https://img.shields.io/npm/v/dyno-config.svg?style=flat-square)](https://www.npmjs.com/package/dyno-config)
[![npm downloads](https://img.shields.io/npm/dm/dyno-config.svg?style=flat-square)](https://www.npmjs.com/package/dyno-config)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0.0-blue?style=flat-square)](https://bun.sh)

A dynamic configuration library that allows runtime updates to configuration values using Redis as a backend.

## ✨ Features

- Configuration defined in YAML, JSON, or JSONC files
- Runtime configuration updates
- Redis-backed configuration storage
- Type-safe configuration access
- Automatic configuration updates through Redis pub/sub
- Force refresh capability
- Support both Node and Bun, created using Bun

## 📦 Installation

```bash
npm install --save dyno-config
```

## 🚀 Quick Start

1. First, create a configuration file in your project root. You can use either YAML, JSON, or JSONC format:

```yaml
# config.yml
feature_flags:
  experimentalFeature: false
  maintenanceMode: false

api_settings:
  timeout: 5000
  retryCount: 3
  baseUrl: "https://api.example.com"
```

```json
// config.json
{
  "feature_flags": {
    "random": 123,
    "experimentalFeature": false,
    "maintenanceMode": false
  },
  "api_settings": {
    "timeout": 5000,
    "retryCount": 3,
    "baseUrl": "https://api.example.com"
  }
}
```

```jsonc
// config.jsonc
{
  // Feature flags configuration
  "feature_flags": {
    "random": 123,              // Random number for feature testing
    "experimentalFeature": false,  // Enable experimental features
    "maintenanceMode": false    // Enable maintenance mode
  },
  // API settings
  "api_settings": {
    "timeout": 5000,        // Request timeout in milliseconds
    "retryCount": 3,        // Number of retry attempts
    "baseUrl": "https://api.example.com"  // API base URL
  }
}
```

2. Initialize and use the configuration manager:

```javascript
import { DynamicConfigManager } from 'dyno-config';

// Create the configuration manager
const configManager = new DynamicConfigManager({
  serviceName: 'my-service',
  redisUrl: 'redis://localhost:6379',
  configPath: 'config.json' // optional, defaults to 'dyn-config.json'
});

// Or use an existing Redis client
const redisClient = new Redis('redis://localhost:6379');
const configManager = new DynamicConfigManager({
  serviceName: 'my-service',
  redisClient: redisClient
});

// Initialize the manager (this connects to Redis and loads configurations)
await configManager.initialize();

// Get configuration values
const featureFlags = configManager.get('feature_flags');
console.log(featureFlags.random); // 123

// Listen for configuration updates
configManager.onUpdate((key, value) => {
  console.log(`Configuration ${key} updated to:`, value);
});

// Update a configuration value
await configManager.set('feature_flags', {
  experimentalFeature: true,
  maintenanceMode: false
});

// Force refresh all configurations
await configManager.refresh();

// Clean up when done
await configManager.disconnect();
```

## 📚 Examples

Check out the `examples` folder for complete working examples:

- `node-web-server`: A simple web server that uses dyno-config for dynamic configuration
- Demonstrates how to:
  - Initialize the configuration manager
  - Use configuration values in a web server
  - Update configurations at runtime
  - Handle configuration updates

## 🔌 Redis Integration

The library uses Redis for:
- Storing configuration values
- Publishing configuration updates
- Subscribing to configuration changes

Configuration keys in Redis follow the pattern: `DYNO_CONFIG_<service_name>_<config_key>`
