import Redis from 'ioredis';
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import stripJsonComments from 'strip-json-comments';

/**
 * @typedef {Object} ConfigOptions
 * @property {string} serviceName - The name of the service
 * @property {string} [redisUrl] - The Redis URL to connect to
 * @property {string} [configPath] - The path to the config file
 */

/**
 * @typedef {Object.<string, any>} ConfigSchema
 */

/**
 * Parses a string based on its content type
 * @param {string} content - The content to parse
 * @param {string} filePath - The path of the file (for extension checking)
 * @returns {ConfigSchema} The parsed configuration
 * @private
 */
function parseConfig(content, filePath) {
  const extension = filePath.split('.').pop().toLowerCase();

  // First try based on extension
  if (extension === 'json' || extension === 'jsonc') {
    try {
      return JSON.parse(stripJsonComments(content));
    } catch (e) {
      console.warn(`Failed to parse ${filePath} as JSON, trying YAML`);
    }
  } else if (extension === 'yml' || extension === 'yaml') {
    try {
      return parse(content);
    } catch (e) {
      console.warn(`Failed to parse ${filePath} as YAML, trying JSON`);
    }
  }

  // If extension-based parsing failed, try content-based detection
  try {
    return JSON.parse(stripJsonComments(content));
  } catch (e) {
    try {
      return parse(content);
    } catch (e) {
      throw new Error(`Could not determine the format of ${filePath}`);
    }
  }
}

export class DynamicConfigManager {
  /**
   * @param {ConfigOptions} options - Configuration options
   */
  constructor(options) {
    this.options = options;
    this.serviceName = options.serviceName;
    this.configSchema = this.loadConfigSchema();
    this.redisClient = undefined;
    this.pubsub = undefined;
    this.configCache = new Map();
    this.updateCallbacks = [];
  }

  /**
   * Loads the configuration schema from the specified file
   * @returns {ConfigSchema} The loaded configuration schema
   * @private
   */
  loadConfigSchema() {
    const configPath = this.options.configPath || 'dyn-config.json';
    const configContent = readFileSync(configPath, 'utf-8');
    return parseConfig(configContent, configPath);
  }

  /**
   * Gets the Redis key for a configuration key
   * @param {string} configKey - The configuration key
   * @returns {string} The Redis key
   * @private
   */
  getRedisKey(configKey) {
    return `${this.serviceName}_CONFIG_${configKey}`;
  }

  /**
   * Initializes the Redis clients and sets up subscriptions
   * @private
   */
  async initializeRedis() {
    if (!this.options.redisUrl && !this.options.redisClient) {
      throw new Error('no redis url or client options provided, must provide at least one');
    }
    this.redisClient = this.options.redisClient;
    if (!this.redisClient) {
      this.redisClient = new Redis(this.options.redisUrl || 'redis://localhost:6379');
    }
    this.pubsub = this.redisClient.duplicate();

    // Subscribe to all config keys
    for (const key of Object.keys(this.configSchema)) {
      const redisKey = this.getRedisKey(key);
      try {
        await this.pubsub.subscribe(redisKey);
      } catch (err) {
        console.error(`[${this.serviceName}] Failed to subscribe to ${redisKey}:`, err);
      }
    }

    // Handle messages
    this.pubsub.on('message', (channel, message) => {
      const key = channel.replace(`${this.serviceName}_CONFIG_`, '');
      try {
        const value = JSON.parse(message);
        this.configCache.set(key, value);
        this.notifyUpdate(key, value);
      } catch (err) {
        console.error(`[${this.serviceName}] Error parsing message for ${key}:`, err);
      }
    });
  }

  /**
   * Notifies all callbacks of a configuration update
   * @param {string} key - The configuration key that was updated
   * @param {*} value - The new value
   * @private
   */
  notifyUpdate(key, value) {
    this.updateCallbacks.forEach(callback => callback(key, value));
  }

  /**
   * Initializes the configuration manager
   */
  async initialize() {
    await this.initializeRedis();
    if (!this.redisClient) {
      throw new Error(`redis client not initialized`);
    }
    // Load initial values
    for (const [key, defaultValue] of Object.entries(this.configSchema)) {
      const redisKey = this.getRedisKey(key);
      const redisValue = await this.redisClient.get(redisKey);
      if (redisValue) {
        this.configCache.set(key, JSON.parse(redisValue));
      } else {
        this.configCache.set(key, defaultValue);
      }
    }
  }

  /**
   * Gets a configuration value
   * @template T
   * @param {string} key - The configuration key
   * @returns {T} The configuration value
   */
  get(key) {
    if (!this.configCache.has(key)) {
      throw new Error(`Configuration key "${key}" not found`);
    }
    return this.configCache.get(key);
  }

  /**
   * Sets a configuration value
   * @param {string} key - The configuration key
   * @param {*} value - The new value
   */
  async set(key, value) {
    if (!this.configSchema[key]) {
      throw new Error(`Configuration key "${key}" not found in schema`);
    }
    if (!this.redisClient) {
      throw new Error(`redis client not initialized`);
    }
    const redisKey = this.getRedisKey(key);
    try {
      await this.redisClient.set(redisKey, JSON.stringify(value));
      await this.redisClient.publish(redisKey, JSON.stringify(value));
      this.configCache.set(key, value);
      this.notifyUpdate(key, value);
    } catch (err) {
      console.error(`[${this.serviceName}] Error updating ${key}:`, err);
      throw err;
    }
  }

  /**
   * Refreshes all configuration values from Redis
   */
  async refresh() {
    this.configCache.clear();
    await this.initialize();
  }

  /**
   * Registers a callback for configuration updates
   * @param {(key: string, value: *) => void} callback - The callback function
   */
  onUpdate(callback) {
    this.updateCallbacks.push(callback);
  }

  /**
   * Disconnects from Redis
   */
  async disconnect() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    if (this.pubsub) {
      await this.pubsub.quit();
    }
  }
} 