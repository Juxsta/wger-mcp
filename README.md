# wger MCP Server

[![Build Status](https://github.com/yourusername/wger-mcp/workflows/CI/badge.svg)](https://github.com/yourusername/wger-mcp/actions)
[![npm version](https://badge.fury.io/js/wger-mcp.svg)](https://www.npmjs.com/package/wger-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-ready Model Context Protocol (MCP) server that provides AI assistants like Claude with seamless access to the wger fitness API. Search through 400+ exercises, create workout routines, and manage fitness data - all through natural conversation.

## Overview

The wger MCP server enables AI assistants to integrate with [wger](https://wger.de), a free, open-source fitness and workout management platform. With this MCP server, Claude Desktop and other AI applications can:

- Search and discover exercises by muscle group, equipment, or keywords
- Retrieve detailed exercise information including form instructions
- Create and manage workout routines for authenticated users
- Add exercises to routines with customizable sets, reps, and weights

This server implements the [Model Context Protocol](https://modelcontextprotocol.io/), making it compatible with any MCP-enabled AI application.

## Key Features

- **8 Powerful Tools**: Comprehensive exercise discovery and workout management capabilities
- **Type-Safe**: Built with TypeScript in strict mode with full type definitions
- **Intelligent Caching**: Automatic caching of static data to minimize API calls
- **Robust Authentication**: JWT-based auth with automatic token refresh
- **Error Handling**: User-friendly error messages with graceful fallbacks
- **High Test Coverage**: 80%+ code coverage with unit and integration tests
- **Production Ready**: Comprehensive logging, retry logic, and timeout handling
- **Zero Cost**: Access to 400+ exercises from the free wger API

## Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **Claude Desktop** (or another MCP-compatible application)
- **wger Account** (optional, only needed for workout management features)

### Installation

Install globally via npm (once published):

```bash
npm install -g wger-mcp
```

Or for development, clone and build locally:

```bash
git clone https://github.com/yourusername/wger-mcp.git
cd wger-mcp
npm install
npm run build
```

### Basic Configuration

1. **Get your wger API credentials** (optional for read-only features):
   - Visit [wger.de](https://wger.de) and create an account
   - Generate an API key from your account settings
   - Or use your username and password

2. **Configure Claude Desktop**:

   Open your Claude Desktop configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

   Add the wger MCP server:

   ```json
   {
     "mcpServers": {
       "wger": {
         "command": "node",
         "args": ["/absolute/path/to/wger-mcp/dist/index.js"],
         "env": {
           "WGER_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop** and start using the tools!

For detailed setup instructions, see [SETUP.md](docs/SETUP.md).

## Available Tools

### Exercise Discovery

- **`search_exercises`** - Search exercises with filters for muscle, equipment, category, and keywords
- **`get_exercise_details`** - Get comprehensive information about a specific exercise
- **`list_categories`** - List all exercise categories (strength, cardio, stretching, etc.)
- **`list_muscles`** - List all muscle groups for filtering exercises
- **`list_equipment`** - List all equipment types available

### Workout Management (Authentication Required)

- **`create_workout`** - Create a new workout routine
- **`add_exercise_to_routine`** - Add exercises to a routine with sets, reps, and weights
- **`get_user_routines`** - Retrieve all workout routines for the authenticated user

For complete tool documentation, see [API.md](docs/API.md).

## Example Usage

Once configured, simply chat with Claude:

```
You: "Find me some chest exercises I can do with dumbbells"

Claude: [Uses search_exercises tool with muscle=chest, equipment=dumbbells]
"I found several dumbbell chest exercises:
1. Dumbbell Bench Press
2. Dumbbell Flyes
3. Incline Dumbbell Press
..."

You: "Tell me more about the dumbbell bench press"

Claude: [Uses get_exercise_details tool]
"The dumbbell bench press is a compound exercise that targets..."
```

For more detailed examples and scenarios, see [EXAMPLES.md](docs/EXAMPLES.md).

## Authentication

The wger MCP server supports two authentication methods:

### Option 1: API Key (Recommended)

```bash
export WGER_API_KEY="your_api_key_here"
```

### Option 2: Username and Password

```bash
export WGER_USERNAME="your_username"
export WGER_PASSWORD="your_password"
```

Authentication is only required for workout management tools. Exercise discovery tools work without authentication.

## Development

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/wger-mcp.git
cd wger-mcp

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
```

### Build and Test

```bash
# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
wger-mcp/
├── src/
│   ├── tools/          # MCP tool implementations
│   ├── client/         # HTTP client and auth
│   ├── schemas/        # Zod validation schemas
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Error handling and logging
│   ├── config.ts       # Configuration management
│   ├── server.ts       # MCP server setup
│   └── index.ts        # Entry point
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── fixtures/       # Test data
├── docs/               # Documentation
└── dist/               # Compiled JavaScript
```

## API Reference

For complete API documentation including parameters, return values, and examples for all 8 tools, see the [API Reference](docs/API.md).

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- How to set up your development environment
- Code style guidelines
- How to run tests
- Pull request process
- How to report bugs and request features

## Resources

- [wger API Documentation](https://wger.de/en/software/api)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/download)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/wger-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/wger-mcp/discussions)
- **wger Community**: [wger GitHub](https://github.com/wger-project/wger)

## Acknowledgments

- Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol)
- Powered by [wger - Workout Manager](https://wger.de/)
- Created for seamless fitness data integration with AI assistants

---

Made with ❤️ for the AI and fitness communities
