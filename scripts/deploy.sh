#!/bin/bash

set -e

echo "🚀 Deploying Songstats Scrapers to AWS Lambda..."

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "❌ AWS SAM CLI not found. Please install it first:"
    echo "   pip install aws-sam-cli"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first"
    exit 1
fi

# Get current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 Working directory: $SCRIPT_DIR"

# Build the SAM application
echo "🔨 Building SAM application..."
sam build --use-container

# Deploy the application
echo "🚀 Deploying to AWS..."
sam deploy \
  --guided \
  --stack-name songstats-scrapers \
  --region us-east-1 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides ParameterKey=Environment,ParameterValue=prod

# Get the API endpoint
echo "✅ Deployment complete!"
echo ""
echo "📡 Getting API endpoint URL..."
API_URL=$(aws cloudformation describe-stacks \
  --stack-name songstats-scrapers \
  --query 'Stacks[0].Outputs[?OutputKey==`ScraperApiUrl`].OutputValue' \
  --output text)

if [ -n "$API_URL" ]; then
    echo "🎉 Your API is deployed at: $API_URL"
    echo ""
    echo "🧪 Test endpoints:"
    echo "   Health check: ${API_URL}health"
    echo "   Stream data:  ${API_URL}api/stream-count/4uLU6hMCjMI75M1A2tKUQC"
    echo "   Kworb data:   ${API_URL}api/kworb-country/4uLU6hMCjMI75M1A2tKUQC"
    echo ""
    echo "🔧 Add this to your Vercel environment variables:"
    echo "   SCRAPER_API_URL=$API_URL"
    echo ""
    
    # Test the health endpoint
    echo "🩺 Testing health endpoint..."
    if curl -f "${API_URL}health" &> /dev/null; then
        echo "✅ Health check passed!"
    else
        echo "⚠️  Health check failed - API might still be warming up"
    fi
else
    echo "❌ Could not retrieve API URL from CloudFormation stack"
fi

echo ""
echo "📋 Next steps:"
echo "1. Update your Vercel environment variable SCRAPER_API_URL"
echo "2. Test the endpoints above"
echo "3. Monitor logs: sam logs -n songstats-scrapers --tail" 