# AWS Lambda Deployment Guide for Songstats Scrapers

Deploy your Python scrapers to AWS Lambda for reliable, cost-effective chart data scraping.

## ✅ Benefits of AWS Lambda

- **💰 Cost-effective**: Pay only for requests (~$1/month for moderate usage)
- **🚀 Auto-scaling**: Handles traffic spikes automatically
- **⚡ Fast cold starts**: Python 3.9 runtime optimized for speed
- **🔄 Session management**: Proper CSRF token handling
- **📊 Monitoring**: Built-in CloudWatch logging and metrics

## 🛠️ Prerequisites

### 1. Install AWS CLI

```bash
pip install awscli
aws --version
```

### 2. Configure AWS Credentials

```bash
aws configure
```

Enter your:

- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

### 3. Install SAM CLI (Recommended)

```bash
pip install aws-sam-cli
sam --version
```

**OR** install Serverless Framework (Alternative):

```bash
npm install -g serverless
serverless --version
```

## 🚀 Deployment Options

### Option A: AWS SAM (Recommended)

#### 1. Deploy with SAM

```bash
cd scripts
./deploy.sh
```

The script will:

- Build the Lambda function with dependencies
- Deploy using CloudFormation
- Set up API Gateway automatically
- Output your API URL

#### 2. Manual SAM Deployment

```bash
cd scripts

# Build
sam build --use-container

# Deploy (first time - guided)
sam deploy --guided

# Deploy (subsequent times)
sam deploy
```

### Option B: Serverless Framework

#### 1. Install Dependencies

```bash
cd scripts
npm init -y
npm install serverless-python-requirements
```

#### 2. Deploy

```bash
serverless deploy
```

#### 3. Get API URL

```bash
serverless info
```

## 📋 Post-Deployment Setup

### 1. Test Your API

After deployment, test the endpoints:

```bash
# Replace YOUR_API_URL with the actual URL from deployment
API_URL="https://abc123.execute-api.us-east-1.amazonaws.com/Prod/"

# Health check
curl "${API_URL}health"

# Test stream data
curl -X POST "${API_URL}api/stream-count/4uLU6hMCjMI75M1A2tKUQC"

# Test Kworb data
curl -X POST "${API_URL}api/kworb-country/4uLU6hMCjMI75M1A2tKUQC"
```

### 2. Update Next.js Environment Variable

In your **Vercel dashboard** → Project Settings → Environment Variables:

```env
SCRAPER_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/Prod/
```

Or in your local `.env.local`:

```env
SCRAPER_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/Prod/
```

### 3. Test Integration

Test your Next.js app to ensure it's calling the Lambda API:

```bash
# Start your Next.js app
npm run dev

# Test a song details page - check browser network tab for API calls
```

## 📊 API Endpoints

| Endpoint                          | Method   | Description              | Timeout |
| --------------------------------- | -------- | ------------------------ | ------- |
| `/health`                         | GET      | Health check             | 5s      |
| `/api/stream-count/{track_id}`    | GET/POST | Full MyStreamCount data  | 30s     |
| `/api/chart-data-only/{track_id}` | GET/POST | Chart data only (faster) | 30s     |
| `/api/kworb-country/{track_id}`   | GET/POST | Country streaming data   | 30s     |
| `/api/batch-scrape`               | POST     | Multiple tracks (max 5)  | 30s     |

## 💰 Cost Estimation

AWS Lambda pricing (us-east-1):

- **Requests**: $0.20 per 1M requests
- **Duration**: $0.0000166667 per GB-second

Example monthly costs:

- **10,000 requests**: ~$0.05
- **100,000 requests**: ~$0.50
- **1,000,000 requests**: ~$5.00

Plus API Gateway:

- **$3.50 per million API calls**

**Total estimated cost: $1-10/month** for typical usage.

## 🔧 Configuration Options

### Memory & Timeout Settings

Edit `template.yaml` or `serverless.yml`:

```yaml
# For heavy scraping workloads
MemorySize: 1024 # More memory = faster execution
Timeout: 60 # Longer timeout for complex sites
```

### Environment Variables

Add environment variables in your deployment config:

```yaml
Environment:
  Variables:
    LOG_LEVEL: INFO
    SCRAPER_DELAY: 0.5
    MAX_RETRIES: 3
```

## 📈 Monitoring & Debugging

### CloudWatch Logs

```bash
# View logs with SAM
sam logs -n songstats-scrapers --tail

# View logs with AWS CLI
aws logs tail /aws/lambda/songstats-scrapers --follow
```

### Performance Metrics

- Monitor in AWS Console → Lambda → Functions → songstats-scrapers
- Check duration, error rate, and throttles
- Set up CloudWatch alarms for failures

### Common Issues & Solutions

1. **Cold Start Timeouts**

   - Increase memory allocation (512MB → 1024MB)
   - Use provisioned concurrency for critical endpoints

2. **Import Errors**

   - Ensure all dependencies are in `requirements_lambda.txt`
   - Check Lambda logs for specific import failures

3. **CORS Issues**

   - CORS is configured in the templates
   - Check browser network tab for preflight requests

4. **Rate Limiting**
   - Implement exponential backoff in scrapers
   - Add delays between requests to avoid blocking

## 🔄 Updates & Maintenance

### Deploy Updates

```bash
# With SAM
sam build && sam deploy

# With Serverless
serverless deploy
```

### Rollback if Needed

```bash
# SAM rollback
aws cloudformation cancel-update-stack --stack-name songstats-scrapers

# Serverless rollback
serverless rollback
```

### Monitor Performance

- Set up CloudWatch dashboards
- Configure error alerts
- Monitor costs in AWS Billing dashboard

## 🎯 Next Steps

1. **Deploy** using your preferred method (SAM recommended)
2. **Test** all endpoints to ensure they work
3. **Update** your Vercel environment variable
4. **Monitor** performance and costs
5. **Scale** as needed (increase memory/timeout)

Your Python scrapers will now have:

- ✅ Reliable CSRF token handling
- ✅ Proper session management
- ✅ Chart data that actually works
- ✅ Cost-effective scaling
- ✅ Built-in monitoring

## 🆘 Troubleshooting

If you encounter issues:

1. **Check CloudWatch logs** for error details
2. **Test locally** with the lambda handler
3. **Verify AWS credentials** and permissions
4. **Check API Gateway** configuration
5. **Monitor memory/timeout** usage

The chart data should work perfectly now! 🎉
