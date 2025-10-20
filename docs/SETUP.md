# Setup Guide

This guide provides detailed instructions for installing and configuring the wger MCP server for use with Claude Desktop and other MCP-compatible applications.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js**: Version 18.0.0 or higher
  - Check your version: `node --version`
  - Download from: [nodejs.org](https://nodejs.org/)

- **npm**: Version 8.0.0 or higher (comes with Node.js)
  - Check your version: `npm --version`

### Optional (for workout management features)

- **wger Account**: Free account at [wger.de](https://wger.de)
  - Required only if you want to create and manage workout routines
  - Exercise search and discovery work without authentication

## Installation

### Option 1: Install via npm (Recommended)

Once published to npm, install globally:

```bash
npm install -g wger-mcp
```

This makes the `wger-mcp` command available system-wide.

### Option 2: Install from Source (Development)

For development or if you want to modify the code:

```bash
# Clone the repository
git clone https://github.com/yourusername/wger-mcp.git
cd wger-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Verify the build
ls dist/index.js  # Should exist
```

## Configuration

### Step 1: Obtain wger Credentials (Optional)

If you want to use workout management features, you need to authenticate with wger:

1. **Create a wger account**:
   - Visit [wger.de/en/user/registration](https://wger.de/en/user/registration)
   - Complete the registration form
   - Verify your email address

2. **Generate an API key** (recommended):
   - Log in to your wger account
   - Navigate to your profile settings
   - Go to the "API Key" section
   - Click "Generate API Key"
   - Copy the generated key (you'll need this for configuration)

Alternatively, you can use your username and password directly, but API key authentication is more secure and recommended.

### Step 2: Configure Environment Variables

You have two options for providing credentials:

#### Option A: Environment Variables File (Development)

Create a `.env` file in the wger-mcp directory:

```bash
# Copy the example file
cp .env.example .env

# Edit the file with your credentials
```

Add your credentials to `.env`:

```bash
# Authentication (choose one method)
WGER_API_KEY=your_api_key_here

# OR use username/password
# WGER_USERNAME=your_username
# WGER_PASSWORD=your_password

# Optional: Custom configuration
WGER_API_URL=https://wger.de/api/v2
LOG_LEVEL=info
HTTP_TIMEOUT=10000
CACHE_TTL_STATIC=86400
CACHE_TTL_EXERCISE=3600
```

#### Option B: Claude Desktop Configuration (Production)

For Claude Desktop, provide environment variables in the MCP server configuration (see next section).

## Claude Desktop Integration

### Locate Claude Desktop Config File

The configuration file location depends on your operating system:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

If the file doesn't exist, create it.

### Configure the MCP Server

#### For npm Installation

If you installed via npm globally:

```json
{
  "mcpServers": {
    "wger": {
      "command": "npx",
      "args": ["wger-mcp"],
      "env": {
        "WGER_API_KEY": "your_api_key_here",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

#### For Local Development Build

If you built from source:

```json
{
  "mcpServers": {
    "wger": {
      "command": "node",
      "args": ["/absolute/path/to/wger-mcp/dist/index.js"],
      "env": {
        "WGER_API_KEY": "your_api_key_here",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**Important**:
- Replace `/absolute/path/to/wger-mcp/` with the actual absolute path to your installation
- On Windows, use double backslashes: `C:\\Users\\YourName\\wger-mcp\\dist\\index.js`
- If you have an existing `mcpServers` section, add the `wger` entry to it

### Configuration Options

Here's a complete example with all available environment variables:

```json
{
  "mcpServers": {
    "wger": {
      "command": "node",
      "args": ["/path/to/wger-mcp/dist/index.js"],
      "env": {
        "WGER_API_KEY": "your_api_key_here",
        "WGER_API_URL": "https://wger.de/api/v2",
        "LOG_LEVEL": "info",
        "HTTP_TIMEOUT": "10000",
        "CACHE_TTL_STATIC": "86400",
        "CACHE_TTL_EXERCISE": "3600"
      }
    }
  }
}
```

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WGER_API_KEY` | No* | - | Your wger API key for authentication |
| `WGER_USERNAME` | No* | - | Your wger username (alternative to API key) |
| `WGER_PASSWORD` | No* | - | Your wger password (required with username) |
| `WGER_API_URL` | No | `https://wger.de/api/v2` | Base URL for the wger API |
| `LOG_LEVEL` | No | `info` | Logging level: `debug`, `info`, `warn`, `error` |
| `HTTP_TIMEOUT` | No | `10000` | HTTP request timeout in milliseconds |
| `CACHE_TTL_STATIC` | No | `86400` | Cache TTL for static data (seconds) |
| `CACHE_TTL_EXERCISE` | No | `3600` | Cache TTL for exercise details (seconds) |

*Note: Authentication (API key OR username/password) is only required for workout management tools. Exercise discovery tools work without authentication.

### Restart Claude Desktop

After modifying the configuration:

1. **Completely quit Claude Desktop**
   - macOS: Cmd+Q or quit from the menu bar
   - Windows: Right-click system tray icon and select "Quit"
   - Linux: Close the window and ensure the process is terminated

2. **Start Claude Desktop again**

3. **Verify the server is loaded**
   - Look for a tools icon or menu in Claude Desktop
   - The wger tools should appear in the available tools list

## Verification

### Test the Installation

Once Claude Desktop is restarted, test the connection by asking Claude:

```
"What exercise tools are available?"
```

Claude should list all 8 wger tools:
- search_exercises
- get_exercise_details
- list_categories
- list_muscles
- list_equipment
- create_workout
- add_exercise_to_routine
- get_user_routines

### Test Exercise Discovery

Try a simple exercise search:

```
"Find me some chest exercises"
```

Claude should successfully use the `search_exercises` tool and return exercise results.

### Test Workout Management (if authenticated)

If you configured authentication, test creating a workout:

```
"Create a new workout called 'Upper Body Day'"
```

Claude should successfully use the `create_workout` tool and confirm the workout was created.

### Test without Authentication

You can test exercise discovery features without authentication:

```
"List all exercise categories"
"List all muscle groups"
"Search for pushup exercises"
```

All of these should work without requiring authentication.

## Troubleshooting

### Common Issues

#### 1. Tools Not Appearing in Claude Desktop

**Symptoms**: Claude doesn't recognize wger tools or says they're unavailable.

**Solutions**:
- Verify the config file path is correct for your OS
- Check that the JSON syntax is valid (use a JSON validator)
- Ensure the path to `dist/index.js` is absolute, not relative
- Make sure you completely quit and restarted Claude Desktop
- Check Claude Desktop logs for MCP server errors

#### 2. Authentication Errors

**Symptoms**: "Authentication required" or "Invalid credentials" errors.

**Solutions**:
- Verify your API key is correct (no extra spaces or quotes)
- If using username/password, ensure both are set
- Try generating a new API key from wger.de
- Check that the environment variables are correctly set in the config
- Verify your wger account is active and verified

#### 3. "Command not found" or "Cannot find module" Errors

**Symptoms**: Server fails to start with module or command errors.

**Solutions**:
- If using npm install: Run `npm install -g wger-mcp` again
- If using source: Run `npm install` and `npm run build` in the project directory
- Verify Node.js version is 18.0.0 or higher: `node --version`
- Check that the path in the config points to the built `dist/index.js` file
- On Windows, ensure you're using double backslashes in the path

#### 4. Network or Timeout Errors

**Symptoms**: "Request timeout" or "Network error" messages.

**Solutions**:
- Check your internet connection
- Verify wger.de is accessible: Visit https://wger.de in your browser
- Increase the `HTTP_TIMEOUT` value in configuration (e.g., `"HTTP_TIMEOUT": "30000"`)
- Check if a firewall is blocking Node.js network access
- Try setting `LOG_LEVEL` to `debug` to see detailed network logs

#### 5. Permission Errors

**Symptoms**: "Permission denied" or "EACCES" errors.

**Solutions**:
- On macOS/Linux: Run `chmod +x dist/index.js` in the wger-mcp directory
- Ensure you have write permissions for the npm global directory
- Try installing without sudo if you used it previously
- Check file permissions on the Claude Desktop config file

### Viewing Logs

To see detailed logs for debugging:

1. Set `LOG_LEVEL` to `debug` in your configuration:
   ```json
   "env": {
     "LOG_LEVEL": "debug"
   }
   ```

2. Restart Claude Desktop

3. Check the logs:
   - **macOS**: `~/Library/Logs/Claude/mcp-server-wger.log`
   - **Windows**: `%APPDATA%\Claude\Logs\mcp-server-wger.log`
   - **Linux**: `~/.config/Claude/logs/mcp-server-wger.log`

   (Note: Log locations may vary by Claude Desktop version)

### Getting Help

If you're still experiencing issues:

1. **Check existing issues**: [GitHub Issues](https://github.com/yourusername/wger-mcp/issues)
2. **Create a new issue**: Include:
   - Your OS and Node.js version
   - Full error message
   - Relevant logs (with sensitive data removed)
   - Steps to reproduce the problem
3. **Ask the community**: [GitHub Discussions](https://github.com/yourusername/wger-mcp/discussions)

## Advanced Configuration

### Using a Custom wger Instance

If you're running your own wger instance:

```json
{
  "env": {
    "WGER_API_URL": "https://your-wger-instance.com/api/v2",
    "WGER_API_KEY": "your_api_key"
  }
}
```

### Adjusting Cache Settings

To change how long data is cached:

```json
{
  "env": {
    "CACHE_TTL_STATIC": "43200",    // 12 hours for categories/muscles/equipment
    "CACHE_TTL_EXERCISE": "1800"     // 30 minutes for exercise details
  }
}
```

Shorter TTLs mean more API calls but fresher data. Longer TTLs reduce API calls but data may be stale.

### Running Multiple MCP Servers

You can run wger alongside other MCP servers:

```json
{
  "mcpServers": {
    "wger": {
      "command": "npx",
      "args": ["wger-mcp"],
      "env": {
        "WGER_API_KEY": "your_api_key"
      }
    },
    "another-server": {
      "command": "node",
      "args": ["/path/to/other-server/index.js"]
    }
  }
}
```

## Next Steps

Now that you have the wger MCP server installed and configured:

1. **Explore the tools**: See [API.md](API.md) for complete tool documentation
2. **Try examples**: See [EXAMPLES.md](EXAMPLES.md) for common usage scenarios
3. **Build integrations**: Use the tools to create workout plans, search exercises, and more
4. **Contribute**: See [CONTRIBUTING.md](../CONTRIBUTING.md) to help improve the project

Enjoy using wger with Claude!
