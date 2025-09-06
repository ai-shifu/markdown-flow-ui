#!/bin/bash

# Script to test GitHub Actions locally with act

echo "🎭 Testing GitHub Actions with act"
echo "=================================="

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo "❌ act is not installed. Please install it first:"
    echo "   brew install act"
    exit 1
fi

# Set default action if no argument provided
ACTION=${1:-"test"}

case $ACTION in
    "test")
        echo "🧪 Running test job only..."
        act -j test --env-file .env.act
        ;;
    "version")
        echo "🏷️  Running version job only..."
        act -j version --env-file .env.act
        ;;
    "publish")
        echo "📦 Running publish job only..."
        act -j publish --env-file .env.act
        ;;
    "release")
        echo "🚀 Running release job only..."
        act -j release --env-file .env.act
        ;;
    "all")
        echo "🔄 Running all jobs in sequence..."
        act --env-file .env.act
        ;;
    "dry-run")
        echo "🔍 Showing what would run (dry-run)..."
        act --dryrun
        ;;
    "list")
        echo "📋 Listing available jobs..."
        act --list
        ;;
    *)
        echo "❓ Usage: $0 [test|version|publish|release|all|dry-run|list]"
        echo ""
        echo "Available commands:"
        echo "  test     - Run only the test job"
        echo "  version  - Run only the version job" 
        echo "  publish  - Run only the publish job"
        echo "  release  - Run only the release job"
        echo "  all      - Run all jobs in the workflow"
        echo "  dry-run  - Show what would run without executing"
        echo "  list     - List all available jobs"
        exit 1
        ;;
esac