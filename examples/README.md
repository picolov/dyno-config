# Dyno Config Example - Web Server

This example demonstrates how to use the Dyno Config library in a web server application.

## Prerequisites

- Node.js installed
- No need to install Redis separately - the example includes an embedded Redis server

## Setup

1. Start the web server (this will automatically start Redis):
```bash
npm run start
```

2. In a separate terminal, run the configuration updater:
```bash
npm run update-config
```

3. To stop Redis when you're done:
```bash
npm run stop-redis
```

## Project Structure

```
dyno-config/              # Parent library
├── src/                  # Library source code
├── dist/                 # Built library code
└── examples/
    └── web-server/      # This example
        ├── src/         # Example source code
        ├── config.yml   # Configuration file
        └── package.json # Example dependencies
```

## What This Example Demonstrates

1. **Dynamic Configuration in Web Server**
   - The web server uses Dyno Config to manage its configuration
   - Configuration values are injected into each request
   - Two endpoints demonstrate different configuration sections:
     - `/features` - Shows feature flags
     - `/api-settings` - Shows API settings

2. **Runtime Configuration Updates**
   - The `update-config.ts` script demonstrates how to update configurations in runtime
   - Changes are immediately reflected in the web server
   - The server logs configuration updates as they happen

3. **Configuration Types**
   - Object configurations (feature_flags, api_settings)
   - String configurations (log_level)
   - Number configurations (cache_ttl)

4. **Embedded Redis Server**
   - No need to install Redis separately
   - Redis server starts automatically with the application
   - Proper cleanup on application shutdown

## How to Test

1. Start the web server (this will start Redis automatically):
```bash
bun run start
```

2. Visit the endpoints:
   - http://localhost:3000/features
   - http://localhost:3000/api-settings

3. In a separate terminal, run the configuration updater:
```bash
bun run update-config
```

4. Refresh the endpoints to see the updated configurations

5. When you're done, stop Redis:
```bash
bun run stop-redis
```

## Key Features Demonstrated

- Configuration initialization
- Runtime updates
- Type-safe configuration access
- Redis integration
- Configuration update notifications
- Embedded Redis server management

## Development Notes

This example uses a local version of the dyno-config library through a file dependency in package.json:
```json
{
  "dependencies": {
    "dyno-config": "file:../.."
  }
}
```

When making changes to the parent library:
1. Build the library: `cd ../.. && bun run build`
2. Restart the example server to pick up the changes

## Troubleshooting

If you encounter any issues:

1. Make sure the parent library is built:
```bash
cd ../..
bun run build
cd examples/web-server
```

2. Clean and reinstall dependencies:
```bash
rm -rf node_modules
bun install
```

3. Make sure Redis is not running on port 6379 from a previous session:
```bash
bun run stop-redis
``` 