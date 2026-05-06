# Makefile for frontend-vite-vue-3

.PHONY: setup dev test coverage generate build lint format clean

# Install dependencies
setup:
	npm install

# Run development server
dev:
	npm run dev

# Run all tests
test:
	npm run test

# Run tests with coverage report
coverage:
	npm run test:coverage

# Generate new module (Ex: make generate)
generate:
	npm run generate

# Build for production
build:
	npm run build

# Run lint checks
lint:
	npm run lint

# Format code
format:
	npm run format

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf coverage/
