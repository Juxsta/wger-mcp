# Contributing to wger MCP Server

Thank you for your interest in contributing to the wger MCP Server! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. Please be respectful and considerate in all interactions.

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members
- Provide constructive feedback

## How Can I Contribute?

There are many ways to contribute to this project:

### Reporting Bugs

Found a bug? Please create an issue with:

- **Clear title**: Describe the issue in one sentence
- **Description**: Detailed explanation of the problem
- **Steps to reproduce**: Numbered steps to recreate the issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: OS, Node.js version, etc.
- **Logs**: Relevant error messages or stack traces

### Suggesting Enhancements

Have an idea for improvement? Create an issue with:

- **Clear title**: Describe the enhancement
- **Use case**: Why is this needed?
- **Proposed solution**: How should it work?
- **Alternatives**: Other approaches you've considered

### Contributing Code

We welcome code contributions! Please see the sections below for detailed guidance.

### Improving Documentation

Documentation improvements are always welcome:

- Fix typos or unclear explanations
- Add examples or usage scenarios
- Improve API documentation
- Enhance setup instructions

## Development Setup

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Git**: For version control

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/wger-mcp.git
   cd wger-mcp
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/yourusername/wger-mcp.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your wger API credentials (optional for testing)
   ```

6. **Build the project**:
   ```bash
   npm run build
   ```

7. **Run tests to verify setup**:
   ```bash
   npm test
   ```

If all tests pass, you're ready to start developing!

## Development Workflow

### Creating a Feature Branch

Always create a new branch for your work:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features (e.g., `feature/add-nutrition-tools`)
- `fix/` - Bug fixes (e.g., `fix/authentication-retry`)
- `docs/` - Documentation only (e.g., `docs/improve-setup-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/cache-implementation`)
- `test/` - Test additions/changes (e.g., `test/add-integration-tests`)

### Making Changes

1. **Write your code** following our [style guidelines](#code-style-guidelines)

2. **Build frequently** to catch TypeScript errors:
   ```bash
   npm run build
   ```

3. **Run linter** to check code style:
   ```bash
   npm run lint

   # Auto-fix issues where possible
   npm run format
   ```

4. **Run tests** to ensure nothing breaks:
   ```bash
   npm test

   # Run with coverage
   npm run test:coverage
   ```

5. **Commit your changes** with clear messages:
   ```bash
   git add .
   git commit -m "Add feature: description of what you did"
   ```

   Good commit messages:
   - `Add list_nutrition tool for retrieving nutrition data`
   - `Fix authentication retry logic in wger client`
   - `Update API documentation with new examples`
   - `Refactor cache implementation to use Map instead of Object`

### Keeping Your Branch Updated

Regularly sync with upstream:

```bash
git checkout main
git pull upstream main
git checkout your-feature-branch
git rebase main
```

## Code Style Guidelines

This project uses TypeScript with strict mode and enforces consistent style with ESLint and Prettier.

### TypeScript Guidelines

- **Use strict types**: No `any` types unless absolutely necessary
- **Explicit return types**: Always specify return types for functions
- **Use interfaces**: Define interfaces for all data structures
- **Document with JSDoc**: Add JSDoc comments to all public functions
- **Handle errors**: Always include proper error handling

Example:

```typescript
/**
 * Fetch exercise details from the wger API
 * @param exerciseId - The ID of the exercise
 * @returns Exercise details with all metadata
 * @throws NotFoundError if exercise doesn't exist
 */
async function getExerciseDetails(exerciseId: number): Promise<Exercise> {
  // Implementation
}
```

### Naming Conventions

- **Variables and functions**: camelCase (`getUserRoutines`, `exerciseId`)
- **Classes and interfaces**: PascalCase (`AuthManager`, `Exercise`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `DEFAULT_TIMEOUT`)
- **Files**: kebab-case (`wger-client.ts`, `search-exercises.ts`)

### Code Organization

- **One class/interface per file** (except small related types)
- **Export at the end** of the file (except for classes)
- **Group imports** logically: external packages, then local imports
- **Keep functions small**: Aim for < 50 lines per function
- **DRY principle**: Don't repeat yourself - extract common logic

### Comments

- **JSDoc for public APIs**: Required for all exported functions
- **Inline comments**: Explain "why", not "what"
- **TODO comments**: Include issue number: `// TODO(#123): Fix this`

## Testing Requirements

All code contributions must include tests. We aim for 80% code coverage minimum.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm test -- --watch

# Run tests with coverage report
npm run test:coverage

# Run a specific test file
npm test -- path/to/test.test.ts
```

### Writing Tests

1. **Unit tests** for individual functions and modules
2. **Integration tests** for tool workflows
3. **Use descriptive test names** that explain what is being tested

Example test structure:

```typescript
describe('searchExercisesHandler', () => {
  it('should return exercises matching the search query', async () => {
    // Arrange
    const args = { query: 'push' };

    // Act
    const result = await searchExercisesHandler(args);

    // Assert
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].name).toContain('push');
  });

  it('should throw ValidationError for invalid limit', async () => {
    // Arrange
    const args = { limit: 1000 }; // Max is 100

    // Act & Assert
    await expect(searchExercisesHandler(args)).rejects.toThrow(ValidationError);
  });
});
```

### Test Coverage Requirements

- **Minimum 80%**: Overall code coverage must be at least 80%
- **Critical paths**: 90%+ coverage for authentication and core tools
- **New features**: All new code must include tests
- **Bug fixes**: Include a test that reproduces the bug

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**: `npm test`
2. **Check code style**: `npm run lint`
3. **Verify type checking**: `npm run type-check`
4. **Update documentation**: If you changed APIs or behavior
5. **Update CHANGELOG**: Add entry for your changes (if applicable)

### Submitting a Pull Request

1. **Push your branch**:
   ```bash
   git push origin your-feature-branch
   ```

2. **Create pull request** on GitHub:
   - Use a clear, descriptive title
   - Reference any related issues (#123)
   - Describe what changed and why
   - List any breaking changes
   - Add screenshots if relevant (for docs changes)

3. **PR template** (copy this structure):

   ```markdown
   ## Description
   Brief description of what this PR does

   ## Motivation
   Why is this change needed?

   ## Changes
   - List of specific changes made
   - Another change

   ## Related Issues
   Fixes #123
   Related to #456

   ## Testing
   How was this tested?
   - Unit tests added
   - Integration tests added
   - Manual testing performed

   ## Breaking Changes
   None | List any breaking changes

   ## Checklist
   - [ ] Tests pass locally
   - [ ] Linter passes
   - [ ] Documentation updated
   - [ ] Tests added/updated
   - [ ] Coverage maintained/improved
   ```

### Review Process

- **Maintainers will review** your PR within a few days
- **Be responsive**: Address feedback and questions promptly
- **CI must pass**: All automated checks must pass
- **Approval required**: At least one maintainer approval needed
- **Squash merging**: Your commits may be squashed when merged

### After Your PR is Merged

1. **Delete your branch**:
   ```bash
   git branch -d your-feature-branch
   git push origin --delete your-feature-branch
   ```

2. **Update your main**:
   ```bash
   git checkout main
   git pull upstream main
   ```

3. **Celebrate**: Your contribution is now part of the project!

## Issue Reporting

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Configure '...'
2. Run command '...'
3. Call tool '...'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Actual behavior**
What actually happened.

**Environment:**
 - OS: [e.g. macOS 14, Windows 11, Ubuntu 22.04]
 - Node.js version: [e.g. 18.17.0]
 - wger-mcp version: [e.g. 0.1.0]
 - Claude Desktop version: [if applicable]

**Logs**
```
Paste relevant error messages or logs here
```

**Additional context**
Add any other context about the problem here.
```

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of alternative solutions or features.

**Use case**
Explain the use case for this feature. Who would use it and why?

**Additional context**
Add any other context or screenshots about the feature request.
```

## Project Structure

Understanding the codebase:

```
wger-mcp/
├── src/
│   ├── tools/              # MCP tool implementations
│   │   ├── search-exercises.ts
│   │   ├── create-workout.ts
│   │   └── ...
│   ├── client/             # HTTP client and authentication
│   │   ├── wger-client.ts  # Main API client
│   │   ├── auth.ts         # Authentication manager
│   │   └── cache.ts        # Caching layer
│   ├── schemas/            # Zod validation schemas
│   ├── types/              # TypeScript interfaces
│   ├── utils/              # Utilities (errors, logging)
│   ├── config.ts           # Configuration management
│   ├── server.ts           # MCP server setup
│   └── index.ts            # Entry point
├── tests/
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/           # Test data
├── docs/                   # Documentation
│   ├── API.md              # API reference
│   ├── SETUP.md            # Setup guide
│   └── EXAMPLES.md         # Usage examples
└── dist/                   # Compiled JavaScript (generated)
```

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Chat**: Join our community chat (if available)
- **Issues**: Search existing issues first
- **Email**: Contact maintainers for private concerns

## Recognition

Contributors are recognized in:
- GitHub contributor list
- Release notes for significant contributions
- Special mentions in documentation for major features

Thank you for contributing to wger MCP Server!
