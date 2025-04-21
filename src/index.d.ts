export default class DynoConfig {
    /**
     * @param {ConfigOptions} options - Configuration options
     */
    constructor(options: ConfigOptions);
    /**
     * @type {ConfigOptions}
     * @private
     */
    private options;
    /**
     * @type {string}
     * @private
     */
    private serviceName;
    /**
     * @type {ConfigSchema}
     * @private
     */
    private configSchema;
    /**
     * @type {import('ioredis').Redis|undefined}
     * @private
     */
    private redisClient;
    /**
     * @type {import('ioredis').Redis|undefined}
     * @private
     */
    private pubsub;
    /**
     * @type {Map<string, any>}
     * @private
     */
    private configCache;
    /**
     * @type {Array<(key: string, value: any) => void>}
     * @private
     */
    private updateCallbacks;
    /**
     * Loads the configuration schema from the specified file
     * @returns {ConfigSchema} The loaded configuration schema
     * @private
     */
    private loadConfigSchema;
    /**
     * Gets the Redis key for a configuration key
     * @param {string} configKey - The configuration key
     * @returns {string} The Redis key
     * @private
     */
    private getRedisKey;
    /**
     * Initializes the Redis clients and sets up subscriptions
     * @private
     */
    private initializeRedis;
    /**
     * Notifies all callbacks of a configuration update
     * @param {string} key - The configuration key that was updated
     * @param {*} value - The new value
     * @private
     */
    private notifyUpdate;
    /**
     * Initializes the configuration manager
     */
    initialize(): Promise<void>;
    /**
     * Gets a configuration value
     * @template T
     * @param {string} key - The configuration key
     * @returns {T} The configuration value
     */
    get<T>(key: string): T;
    /**
     * Sets a configuration value
     * @param {string} key - The configuration key
     * @param {*} value - The new value
     */
    set(key: string, value: any): Promise<void>;
    /**
     * Deletes a configuration value
     * @param {string} key - The configuration key to delete
     */
    del(key: string): Promise<void>;
    /**
     * Refreshes all configuration values from Redis
     */
    refresh(): Promise<void>;
    /**
     * Registers a callback for configuration updates
     * @param {(key: string, value: *) => void} callback - The callback function
     */
    onUpdate(callback: (key: string, value: any) => void): void;
    /**
     * Disconnects from Redis
     */
    disconnect(): Promise<void>;
}
export type ConfigOptions = {
    /**
     * - The name of the service
     */
    serviceName: string;
    /**
     * - The Redis URL to connect to
     */
    redisUrl?: string;
    /**
     * - The path to the config file
     */
    configPath?: string;
    /**
     * - Optional Redis client instance
     */
    redisClient?: import("ioredis").Redis;
};
export type ConfigSchema = {
    [x: string]: any;
};
