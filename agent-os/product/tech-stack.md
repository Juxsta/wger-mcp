# Tech Stack

## MCP Server Framework

### Model Context Protocol SDK
- **SDK:** @modelcontextprotocol/sdk (official MCP SDK for TypeScript)
- **Version:** Latest stable (1.x)
- **Purpose:** Core framework for building MCP-compliant servers with tool definitions, resource handling, and protocol communication

### Transport Layer
- **Transport:** stdio (standard input/output for local Claude Desktop integration)
- **Alternative:** SSE (Server-Sent Events) for web-based deployments
- **Purpose:** Communication protocol between AI assistant and MCP server

## Runtime & Language

### Language & Runtime
- **Language:** TypeScript (strict mode enabled)
- **Runtime:** Node.js 18+ LTS
- **Purpose:** Type-safe development with modern JavaScript features and robust error handling

### Package Manager
- **Package Manager:** npm
- **Version:** npm 9+ (included with Node.js 18+)
- **Purpose:** Dependency management and script execution

## HTTP Client & API Integration

### API Client
- **HTTP Client:** axios
- **Purpose:** Robust HTTP client for wger REST API calls with interceptors for authentication and error handling

### Authentication
- **Method:** JWT (JSON Web Tokens) via wger's /api/v2/token endpoint
- **Token Storage:** In-memory token cache with automatic refresh logic
- **Purpose:** Secure, stateless authentication for user-specific operations

## Data Validation & Type Safety

### Schema Validation
- **Library:** zod
- **Purpose:** Runtime type validation for API responses and tool inputs to ensure data integrity

### Type Generation
- **Approach:** Manual TypeScript interfaces based on wger API documentation
- **Purpose:** Strong typing for all API entities (exercises, routines, ingredients, etc.)

## Development Tools

### Code Quality
- **Linter:** ESLint with TypeScript support
- **Formatter:** Prettier
- **Configuration:** Standard TypeScript + Node.js rules
- **Purpose:** Consistent code style and early error detection

### Build System
- **Compiler:** TypeScript compiler (tsc)
- **Build Output:** CommonJS modules for Node.js compatibility
- **Purpose:** Transpile TypeScript to JavaScript for execution

## Testing & Quality Assurance

### Unit Testing
- **Framework:** Jest
- **Coverage Target:** 80% code coverage minimum
- **Purpose:** Test individual tool functions, API client methods, and utilities

### Integration Testing
- **Approach:** Jest with mock HTTP server (msw - Mock Service Worker)
- **Purpose:** Test complete tool workflows against mocked wger API responses

### Type Checking
- **Tool:** TypeScript compiler in strict mode
- **CI Check:** Type check on every commit
- **Purpose:** Catch type errors before runtime

## Configuration & Environment

### Environment Variables
- **Library:** dotenv
- **Variables:**
  - WGER_API_URL: Base URL for wger API (default: https://wger.de/api/v2)
  - WGER_API_KEY: Optional API key for rate limit increases
  - LOG_LEVEL: Logging verbosity (debug, info, warn, error)
- **Purpose:** Flexible configuration for different environments

### Logging
- **Library:** Custom logger with structured output
- **Format:** JSON for production, pretty-print for development
- **Purpose:** Debugging and monitoring tool execution

## Deployment & Distribution

### Package Distribution
- **Registry:** npm public registry
- **Package Name:** @wger/mcp-server or wger-mcp
- **Purpose:** Easy installation via npm for developers

### MCP Configuration
- **Config File:** claude_desktop_config.json
- **Location:** User's Claude Desktop settings
- **Purpose:** Register server with Claude Desktop application

### Hosting Options
- **Local:** Run directly on developer's machine (primary use case)
- **Server:** Optional deployment to cloud for team sharing
- **Docker:** Optional Dockerfile for containerized deployment
- **Purpose:** Flexible deployment based on user needs

## Third-Party Services

### wger API
- **API:** wger REST API v2
- **Base URL:** https://wger.de/api/v2
- **Documentation:** https://wger.readthedocs.io/en/latest/api/api.html
- **Rate Limits:** Public endpoints unlimited, authenticated endpoints limited per user
- **Purpose:** Source of all exercise, workout, and nutrition data

### Optional Services
- **Monitoring:** Not required for MVP (consider Sentry for production deployments)
- **Analytics:** Not required (consider Mixpanel for usage tracking in hosted scenarios)
- **Purpose:** Future enhancements for production deployments

## Development Environment

### Required Tools
- **Node.js:** 18+ LTS
- **npm:** 9+
- **Git:** For version control
- **Code Editor:** VS Code recommended with TypeScript/ESLint extensions

### Recommended VS Code Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Jest Runner

## Documentation

### Code Documentation
- **Format:** JSDoc comments for all public functions and tools
- **Purpose:** Inline documentation and IDE tooltips

### User Documentation
- **Format:** Markdown files in /docs directory
- **Files:**
  - README.md: Quick start guide
  - SETUP.md: Detailed installation instructions
  - API.md: Tool reference documentation
  - EXAMPLES.md: Usage examples and recipes
- **Purpose:** Help developers integrate and use the MCP server

### API Documentation
- **Tool:** TypeScript declaration files (.d.ts)
- **Purpose:** Type definitions for IDE autocomplete and type checking

## Version Control & CI/CD

### Version Control
- **System:** Git
- **Hosting:** GitHub
- **Branch Strategy:** main branch for releases, feature branches for development

### Continuous Integration
- **Platform:** GitHub Actions
- **Checks:**
  - Type checking (tsc --noEmit)
  - Linting (eslint)
  - Tests (jest with coverage)
  - Build verification
- **Purpose:** Automated quality checks on every pull request

### Release Process
- **Versioning:** Semantic versioning (semver)
- **Changelog:** CHANGELOG.md maintained manually
- **Publishing:** Automated npm publish on GitHub releases
- **Purpose:** Consistent and documented releases
