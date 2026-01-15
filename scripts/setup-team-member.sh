```bash
#!/bin/bash

echo "🚀 Setting up Task Management System for new team member..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is required but not installed${NC}"
    echo "Please install Git from https://git-scm.com/"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

# Run tests to verify setup
echo "🧪 Running tests to verify setup..."
npm test

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Some tests failed, but setup can continue${NC}"
else
    echo -e "${GREEN}✅ All tests passed${NC}"
fi

# Setup Git hooks (optional)
echo "🔧 Setting up Git hooks..."
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running tests before commit..."
npm test
if [ $? -ne 0 ]; then
    echo "Tests failed. Commit aborted."
    exit 1
fi
EOF

chmod +x .git/hooks/pre-commit
echo -e "${GREEN}✅ Git hooks setup complete${NC}"

# Final instructions
echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Start development server: ${YELLOW}npm start${NC}"
echo "2. Visit http://localhost:3000 to see the application"
echo "3. Read CONTRIBUTING.md for development guidelines"
echo "4. Create a feature branch for your work: ${YELLOW}git checkout -b feature/your-feature${NC}"
echo ""
echo "Happy coding! 🚀"
```