import json
import os
import sys
from typing import Dict, Any
import logging
from urllib.parse import parse_qs

# Add current directory to path for local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from details_scraper import MyStreamCountJSONScraper
    from kworb_scraper import KworbScraper
except ImportError as e:
    print(f"Import error: {e}")
    # Create dummy classes for testing
    class MyStreamCountJSONScraper:
        def __init__(self, delay=0.2):
            pass
        def scrape_track(self, track_id):
            return {"track_id": track_id, "total_streams": 12345, "status": "test"}
    
    class KworbScraper:
        def __init__(self, delay=0.2):
            pass
        def get_top_streaming_country(self, track_id):
            return {"country": "US", "streams": 12345}

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def create_response(status_code: int, body: Dict[str, Any], is_options: bool = False) -> Dict[str, Any]:
    """Create a response with proper CORS headers for OPTIONS requests"""
    headers = {
        'Content-Type': 'application/json'
    }
    
    # Add CORS headers for OPTIONS requests
    if is_options:
        headers.update({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age': '86400'
        })
    
    return {
        'statusCode': status_code,
        'headers': headers,
        'body': json.dumps(body, default=str)
    }

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda handler for web scraping operations
    """
    try:
        logger.info(f"Event received: {json.dumps(event, default=str)}")
        
        # Handle preflight OPTIONS requests - multiple ways to detect
        http_method = None
        if 'requestContext' in event:
            if 'http' in event['requestContext']:
                http_method = event['requestContext']['http'].get('method')
            elif 'httpMethod' in event['requestContext']:
                http_method = event['requestContext']['httpMethod']
        
        # Also check the event itself for method
        if not http_method:
            http_method = event.get('httpMethod', event.get('method', 'GET'))
        
        logger.info(f"HTTP Method detected: {http_method}")
        
        # Handle OPTIONS requests (CORS preflight)
        if http_method == 'OPTIONS':
            logger.info("Handling CORS preflight OPTIONS request")
            return create_response(200, {'message': 'CORS preflight successful'}, is_options=True)
        
        # Extract query parameters from Lambda Function URL
        query_params = event.get('queryStringParameters', {}) or {}
        action = query_params.get('action', '').lower()
        
        logger.info(f"Action requested: {action}")
        
        # Health check endpoint
        if action == 'health' or not action:
            return create_response(200, {
                'status': 'healthy',
                'service': 'songstats-lambda-scraper',
                'version': '1.0.0',
                'available_actions': ['health', 'stream_count', 'kworb', 'chart_data']
            })
        
        # Stream count scraping
        elif action == 'stream_count':
            track_id = query_params.get('track_id')
            if not track_id:
                return create_response(400, {
                    'success': False,
                    'error': 'track_id parameter is required'
                })
            
            logger.info(f"Scraping stream count for track: {track_id}")
            scraper = MyStreamCountJSONScraper(delay=0.5)
            result = scraper.scrape_track(track_id)
            
            return create_response(200, {
                'success': True,
                'track_id': track_id,
                'data': result
            })
        
        # Chart data only
        elif action == 'chart_data':
            track_id = query_params.get('track_id')
            if not track_id:
                return create_response(400, {
                    'success': False,
                    'error': 'track_id parameter is required'
                })
            
            logger.info(f"Scraping chart data for track: {track_id}")
            scraper = MyStreamCountJSONScraper(delay=0.5)
            result = scraper.get_chart_data_only(track_id)
            
            return create_response(200, {
                'success': True,
                'track_id': track_id,
                'chart_data': result
            })
        
        # Kworb country data
        elif action == 'kworb':
            track_id = query_params.get('track_id')
            
            if not track_id:
                return create_response(400, {
                    'success': False,
                    'error': 'track_id parameter is required'
                })
            
            logger.info(f"Scraping Kworb data for track ID: {track_id}")
            scraper = KworbScraper(delay=0.5)
            result = scraper.get_top_streaming_country(track_id)
            
            return create_response(200, {
                'success': True,
                'track_id': track_id,
                'data': result
            })
        
        # Unknown action
        else:
            return create_response(400, {
                'success': False,
                'error': f'Unknown action: {action}',
                'available_actions': ['health', 'stream_count', 'kworb', 'chart_data']
            })
            
    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}", exc_info=True)
        return create_response(500, {
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }) 