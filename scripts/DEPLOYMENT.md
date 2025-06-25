# Python Scraper API Deployment Guide

This guide will help you deploy your Python scrapers as a separate API service and integrate it with your Next.js app on Vercel.

## Architecture Overview

```
┌─────────────────┐    HTTP API     ┌──────────────────┐
│   Vercel        │ ─────────────→  │  Railway/Render  │
│   (Next.js)     │                 │  (Python API)    │
│                 │ ←─────────────── │                  │
│ - UI Components │   JSON Data     │ - Web Scrapers   │
│ - API Routes    │                 │ - Session Mgmt   │
└─────────────────┘                 └──────────────────┘
```

## Benefits of This Approach

✅ **Reliable CSRF handling** - Python `requests.Session()` maintains session state  
✅ **Better scraping performance** - Native Python libraries (BeautifulSoup, requests)  
✅ **Easy scaling** - Separate services can scale independently  
✅ **Platform flexibility** - Use best platform for each service

## Step 1: Deploy Python Scraper API

### Option A: Railway (Recommended)

1. **Sign up for Railway**: https://railway.app
2. **Create new project** from GitHub repository
3. **Add environment variables**:
   ```
   PORT=5000
   DEBUG=false
   ```
4. **Railway will automatically**:
   - Detect Python app
   - Install dependencies from `requirements_api.txt`
   - Start with `Procfile` command

### Option B: Render

1. **Sign up for Render**: https://render.com
2. **Create new Web Service**
3. **Configure**:
   - Build Command: `pip install -r requirements_api.txt`
   - Start Command: `gunicorn --bind 0.0.0.0:$PORT scraper_api:app`
   - Environment: `PORT=5000`

### Option C: Docker (Any Platform)

```bash
# Build image
docker build -t songstats-scrapers .

# Run locally
docker run -p 5000:5000 songstats-scrapers

# Deploy to any Docker-compatible platform
```

## Step 2: Test Python API

Once deployed, test your endpoints:

```bash
# Health check
curl https://your-api-url.com/health

# Test stream count scraping
curl -X POST https://your-api-url.com/api/stream-count/4uLU6hMCjMI75M1A2tKUQC

# Test Kworb scraping
curl -X POST https://your-api-url.com/api/kworb-country/4uLU6hMCjMI75M1A2tKUQC
```

## Step 3: Configure Next.js App

### Add Environment Variable

In your Vercel dashboard or `.env.local`:

```env
SCRAPER_API_URL=https://your-python-scraper-api.railway.app
```

### For Local Development

```bash
# Terminal 1: Start Python API
cd scripts
python scraper_api.py

# Terminal 2: Start Next.js (in another terminal)
npm run dev
```

Set local environment:

```env
SCRAPER_API_URL=http://localhost:5000
```

## API Endpoints

### Stream Count Data

- **URL**: `/api/stream-count/{track_id}`
- **Method**: GET or POST
- **Response**: Full MyStreamCount data with chart data
- **Timeout**: 30 seconds

### Chart Data Only (Faster)

- **URL**: `/api/chart-data-only/{track_id}`
- **Method**: GET or POST
- **Response**: Just chart data
- **Timeout**: 30 seconds

### Kworb Country Data

- **URL**: `/api/kworb-country/{track_id}`
- **Method**: GET or POST
- **Response**: Country streaming statistics
- **Timeout**: 30 seconds

### Batch Processing

- **URL**: `/api/batch-scrape`
- **Method**: POST
- **Body**: `{"track_ids": ["id1", "id2", ...]}`
- **Limit**: 10 tracks per request
- **Timeout**: 60 seconds

## Performance Considerations

### Caching Strategy

Add Redis caching to Python API:

```python
import redis
import json

r = redis.Redis(host='localhost', port=6379, db=0)

def get_cached_data(track_id):
    cached = r.get(f"track:{track_id}")
    if cached:
        return json.loads(cached)
    return None

def cache_data(track_id, data, expire_seconds=3600):
    r.setex(f"track:{track_id}", expire_seconds, json.dumps(data))
```

### Rate Limiting

Add rate limiting to protect scraped sites:

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["10 per minute"]
)

@app.route('/api/stream-count/<track_id>')
@limiter.limit("3 per minute")
def get_stream_count_data(track_id):
    # ... existing code
```

## Monitoring & Debugging

### Health Check

```bash
curl https://your-api-url.com/health
```

Expected response:

```json
{
  "status": "healthy",
  "service": "songstats-scrapers",
  "version": "1.0.0"
}
```

### Logs

- **Railway**: View logs in dashboard
- **Render**: View logs in service dashboard
- **Docker**: `docker logs container-name`

### Common Issues

1. **CORS Errors**: Ensure `flask-cors` is installed and configured
2. **Timeout Issues**: Increase timeout for slow scraping sites
3. **Memory Issues**: Monitor memory usage, add swap if needed
4. **Rate Limiting**: Implement delays between requests

## Cost Estimates

- **Railway**: $5/month for Hobby plan (512MB RAM)
- **Render**: $7/month for Starter plan (512MB RAM)
- **AWS Lambda**: ~$1/month for moderate usage
- **Google Cloud Run**: ~$2/month for moderate usage

## Next Steps

1. Deploy Python API to your chosen platform
2. Update `SCRAPER_API_URL` environment variable
3. Test integration between Next.js and Python API
4. Monitor performance and add caching if needed
5. Set up monitoring/alerting for production

Your chart data should now work reliably! 🎉
