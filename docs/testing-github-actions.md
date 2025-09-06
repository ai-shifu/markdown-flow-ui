# Testing GitHub Actions Locally with Act

This document explains how to test the GitHub Actions workflow locally using [act](https://github.com/nektos/act).

## Prerequisites

1. **Docker** - Act uses Docker to run containers
2. **act** - Install with `brew install act` (on macOS)

## Quick Start

Use the provided script to test actions:

```bash
# Test only the test job
./scripts/test-actions.sh test

# Test only the version job
./scripts/test-actions.sh version

# Test only the publish job
./scripts/test-actions.sh publish

# Test only the release job
./scripts/test-actions.sh release

# Run all jobs in sequence
./scripts/test-actions.sh all

# Show what would run without executing
./scripts/test-actions.sh dry-run

# List all available jobs
./scripts/test-actions.sh list
```

## Configuration Files

### .actrc

Contains default configuration for act:

- Uses Ubuntu 20.04 image for compatibility
- Enables verbose logging
- Sets container architecture

### .env.act

Contains environment variables needed for testing:

- `GITHUB_TOKEN` - Required for GitHub API access
- `NPM_TOKEN` - Required for npm publishing (optional for testing)

**Important**: Update `.env.act` with real tokens before running tests that require them.

## Common Issues and Solutions

### Issue: Docker Permission Denied

```bash
# Solution: Add your user to docker group
sudo usermod -aG docker $USER
# Then logout and login again
```

### Issue: Container Architecture Mismatch

```bash
# Solution: Set architecture in .actrc (already configured)
--container-architecture linux/amd64
```

### Issue: Missing Dependencies

```bash
# Solution: Use larger container image
-P ubuntu-latest=catthehacker/ubuntu:full-20.04
```

## Testing Strategy

### 1. Test Job Only

Most common test - validates code quality:

```bash
./scripts/test-actions.sh test
```

This will:

- Set up pnpm and Node.js
- Install dependencies
- Run linting and format checks
- Build the package
- Build Storybook

### 2. Version Job Testing

To test version bumping logic:

```bash
./scripts/test-actions.sh version
```

Note: This requires proper git history and conventional commits.

### 3. Publish Job Testing

To test npm publishing logic:

```bash
./scripts/test-actions.sh publish
```

**Warning**: This could actually publish to npm if NPM_TOKEN is valid. Use with caution.

### 4. Release Job Testing

To test GitHub release creation:

```bash
./scripts/test-actions.sh release
```

**Warning**: This could create actual GitHub releases if GITHUB_TOKEN has write permissions.

## Advanced Usage

### Running with Custom Events

```bash
# Simulate a push to main
act push

# Simulate a pull request
act pull_request

# Run with custom event data
act push -e custom-event.json
```

### Custom Environment Variables

```bash
# Override environment variables
act -e MY_VAR=value
```

### Using Different Container Images

```bash
# Use full Ubuntu image (larger but more complete)
act -P ubuntu-latest=catthehacker/ubuntu:full-20.04
```

### Debugging

```bash
# Run with maximum verbosity
act --verbose

# Run specific workflow file
act -W .github/workflows/publish.yml

# Run and keep container for debugging
act --reuse
```

## Limitations

1. **No Secrets**: act doesn't have access to GitHub secrets by default
2. **Limited GitHub API**: Some GitHub-specific features may not work
3. **Container Differences**: Ubuntu container may have different packages than GitHub runners
4. **Network Access**: Limited network access in containers

## Best Practices

1. **Start Simple**: Test the `test` job first
2. **Use Dry Run**: Always use `--dryrun` first to understand what will execute
3. **Check Logs**: Use `--verbose` for detailed debugging
4. **Isolate Jobs**: Test individual jobs before running the full workflow
5. **Update Tokens**: Keep tokens in `.env.act` up to date but never commit them

## Troubleshooting

### Container Won't Start

```bash
# Check Docker is running
docker ps

# Check available images
docker images

# Pull required image manually
docker pull catthehacker/ubuntu:act-20.04
```

### Permission Issues

```bash
# Check file permissions
ls -la scripts/test-actions.sh

# Fix if needed
chmod +x scripts/test-actions.sh
```

### Environment Issues

```bash
# List available variables
act --list

# Check environment file
cat .env.act
```

For more advanced usage, refer to the [act documentation](https://github.com/nektos/act).
