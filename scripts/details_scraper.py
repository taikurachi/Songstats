import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
import time
from typing import Dict, List, Optional

class MyStreamCountJSONScraper:
    def __init__(self, delay: float = 1.0):
        """
        Initialize the JSON scraper for MyStreamCount
        
        Args:
            delay: Delay between requests in seconds
        """
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
    
    def extract_track_id_from_url(self, url: str) -> Optional[str]:
        """Extract track ID from MyStreamCount URL"""
        match = re.search(r'/track/([a-zA-Z0-9]+)', url)
        return match.group(1) if match else None
    
    def scrape_track(self, track_id: str) -> Dict:
        """
        Scrape all data for a track and return as JSON
        
        Args:
            track_id: Spotify track ID
            
        Returns:
            Dictionary containing all track data
        """
        url = f"https://www.mystreamcount.com/track/{track_id}"
        
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract basic track info
            track_data = {
                'track_id': track_id,
                'url': url,
                'scraped_at': datetime.now().isoformat(),
                'track_info': self._extract_track_info(soup),
                'streaming_data': self._extract_streaming_data(soup),
                'chart_data': self._extract_chart_data_from_api(soup, track_id),
                'related_tracks': self._extract_related_tracks(soup)
            }
            
            return track_data
            
        except Exception as e:
            return {
                'track_id': track_id,
                'url': url,
                'scraped_at': datetime.now().isoformat(),
                'error': str(e),
                'success': False
            }
        
        finally:
            time.sleep(self.delay)
    
    def _extract_track_info(self, soup: BeautifulSoup) -> Dict:
        """Extract basic track information"""
        track_info = {}
        
        # Extract title
        title_elem = soup.select_one('h1.text-xl.font-bold.text-gray-900')
        if title_elem:
            track_info['title'] = title_elem.get_text().strip()
        
        # Extract artist
        artist_elem = soup.select_one('p.text-md.text-gray-500.font-medium.mt-1 a')
        if artist_elem:
            track_info['artist'] = artist_elem.get_text().strip()
            track_info['artist_url'] = artist_elem.get('href', '')
        
        # Extract album artwork
        artwork_elem = soup.select_one('div.w-64.mx-auto img')
        if artwork_elem:
            track_info['artwork_url'] = artwork_elem.get('src', '')
            track_info['album_name'] = artwork_elem.get('alt', '')
        
        # Extract Spotify URL
        spotify_link = soup.select_one('div.w-64.mx-auto a')
        if spotify_link:
            track_info['spotify_url'] = spotify_link.get('href', '')
        
        # Extract total streams from description text
        streams_text = soup.select_one('p.text-md.text-gray-900.my-4.px-4')
        if streams_text:
            text = streams_text.get_text()
            # Look for the pattern with total streams
            streams_match = re.search(r'(\d{1,3}(?:,\d{3})*)\s*times on Spotify', text)
            if streams_match:
                track_info['total_streams'] = int(streams_match.group(1).replace(',', ''))
                track_info['streams_text'] = text.strip()
        
        # Extract release date if mentioned
        release_match = re.search(r'since its release on (.+?)\.', streams_text.get_text() if streams_text else '')
        if release_match:
            track_info['release_date'] = release_match.group(1)
        
        return track_info
    
    def _extract_streaming_data(self, soup: BeautifulSoup) -> Dict:
        """Extract streaming data from JavaScript"""
        streaming_data = {}
        
        # Look for the loadStreams function and API endpoint
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string and 'loadStreams' in script.string:
                # Extract API URL
                api_match = re.search(r'url:\s*["\']([^"\']+)["\']', script.string)
                if api_match:
                    streaming_data['api_url'] = api_match.group(1)
                
                # Extract CSRF token
                token_match = re.search(r'_token:\s*["\']([^"\']+)["\']', script.string)
                if token_match:
                    streaming_data['csrf_token'] = token_match.group(1)
        
        # Look for chart creation function
        for script in scripts:
            if script.string and 'createGraph' in script.string:
                # Try to extract any hardcoded data
                data_matches = re.findall(r'total\.push\(\[new Date\([^)]+\)\.getTime\(\), ([^\]]+)\]\)', script.string)
                if data_matches:
                    streaming_data['sample_total_data'] = data_matches
                
                daily_matches = re.findall(r'daily\.push\(\[new Date\([^)]+\)\.getTime\(\), ([^\]]+)\]\)', script.string)
                if daily_matches:
                    streaming_data['sample_daily_data'] = daily_matches
        
        return streaming_data
    
    def _extract_chart_data_from_api(self, soup: BeautifulSoup, track_id: str) -> Optional[Dict]:
        """
        Attempt to get chart data from the API endpoint
        """
        try:
            # Extract CSRF token from the page
            csrf_token = None
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string and '_token:' in script.string:
                    token_match = re.search(r'_token:\s*["\']([^"\']+)["\']', script.string)
                    if token_match:
                        csrf_token = token_match.group(1)
                        break
            
            if not csrf_token:
                return {'error': 'CSRF token not found'}
            
            # Make API request
            api_url = f"https://www.mystreamcount.com/api/track/{track_id}/streams"
            api_response = self.session.post(
                api_url,
                data={'_token': csrf_token},
                timeout=30
            )
            
            if api_response.status_code == 200:
                api_data = api_response.json()
                return {
                    'api_response': api_data,
                    'api_status': api_data.get('status'),
                    'chart_data': api_data.get('data') if api_data.get('status') == 'ready' else None
                }
            else:
                return {
                    'error': f'API request failed with status {api_response.status_code}',
                    'status_code': api_response.status_code
                }
                
        except Exception as e:
            return {'error': f'API request failed: {str(e)}'}
    
    def _extract_related_tracks(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract related tracks from the same artist"""
        related_tracks = []
        
        # Find the "Other songs" section
        tracks_section = soup.select('ul.divide-y.divide-gray-100 li')
        
        for track_item in tracks_section:
            track_data = {}
            
            # Extract track image
            img_elem = track_item.select_one('img')
            if img_elem:
                track_data['artwork_url'] = img_elem.get('src', '')
                track_data['album_name'] = img_elem.get('alt', '')
            
            # Extract track title and URL
            title_link = track_item.select_one('p.text-md.font-semibold a')
            if title_link:
                track_data['title'] = title_link.get_text().strip()
                track_data['url'] = title_link.get('href', '')
                # Extract track ID from URL
                track_id_match = re.search(r'/track/([a-zA-Z0-9]+)', track_data['url'])
                if track_id_match:
                    track_data['track_id'] = track_id_match.group(1)
            
            # Extract artist
            artist_elem = track_item.select_one('p.text-sm.text-gray-500')
            if artist_elem:
                track_data['artist'] = artist_elem.get_text().strip()
            
            if track_data:  # Only add if we found some data
                related_tracks.append(track_data)
        
        return related_tracks
    
    def scrape_multiple_tracks(self, track_ids: List[str]) -> List[Dict]:
        """
        Scrape multiple tracks and return list of JSON objects
        
        Args:
            track_ids: List of Spotify track IDs
            
        Returns:
            List of dictionaries containing track data
        """
        results = []
        
        for i, track_id in enumerate(track_ids):
            print(f"Scraping track {i+1}/{len(track_ids)}: {track_id}")
            
            track_data = self.scrape_track(track_id)
            track_data['batch_index'] = i
            results.append(track_data)
        
        return results
    
    def scrape_from_urls(self, urls: List[str]) -> List[Dict]:
        """
        Scrape tracks from MyStreamCount URLs
        
        Args:
            urls: List of MyStreamCount URLs
            
        Returns:
            List of dictionaries containing track data
        """
        track_ids = []
        
        for url in urls:
            track_id = self.extract_track_id_from_url(url)
            if track_id:
                track_ids.append(track_id)
            else:
                print(f"Warning: Could not extract track ID from URL: {url}")
        
        return self.scrape_multiple_tracks(track_ids)
    
    def save_json(self, data: Dict, filename: str = None) -> str:
        """
        Save data to JSON file
        
        Args:
            data: Data to save
            filename: Optional filename, will generate if not provided
            
        Returns:
            Filename where data was saved
        """
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"mystreamcount_data_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"Data saved to {filename}")
        return filename
    
    def get_chart_data_only(self, track_id: str, max_retries: int = 3) -> Dict:
        """
        Get only the chart data for a track by polling the API
        
        Args:
            track_id: Spotify track ID
            max_retries: Maximum number of API polling attempts
            
        Returns:
            Dictionary with chart data
        """
        # First get the page to extract CSRF token
        url = f"https://www.mystreamcount.com/track/{track_id}"
        response = self.session.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract CSRF token
        csrf_token = None
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string and '_token:' in script.string:
                token_match = re.search(r'_token:\s*["\']([^"\']+)["\']', script.string)
                if token_match:
                    csrf_token = token_match.group(1)
                    break
        
        if not csrf_token:
            return {'error': 'CSRF token not found'}
        
        # Poll the API
        api_url = f"https://www.mystreamcount.com/api/track/{track_id}/streams"
        
        for attempt in range(max_retries):
            try:
                api_response = self.session.post(
                    api_url,
                    data={'_token': csrf_token},
                    timeout=30
                )
                
                if api_response.status_code == 200:
                    api_data = api_response.json()
                    
                    if api_data.get('status') == 'ready':
                        return {
                            'track_id': track_id,
                            'status': 'success',
                            'chart_data': api_data.get('data'),
                            'retrieved_at': datetime.now().isoformat()
                        }
                    elif api_data.get('status') == 'processing':
                        print(f"Data processing, attempt {attempt + 1}/{max_retries}...")
                        time.sleep(3)  # Wait before retry
                        continue
                    else:
                        return {
                            'track_id': track_id,
                            'status': 'error',
                            'error': api_data.get('error', 'Unknown error'),
                            'api_response': api_data
                        }
                else:
                    return {
                        'track_id': track_id,
                        'status': 'error',
                        'error': f'HTTP {api_response.status_code}',
                        'status_code': api_response.status_code
                    }
                    
            except Exception as e:
                if attempt == max_retries - 1:  # Last attempt
                    return {
                        'track_id': track_id,
                        'status': 'error',
                        'error': str(e)
                    }
                else:
                    print(f"Attempt {attempt + 1} failed: {e}")
                    time.sleep(2)
        
        return {
            'track_id': track_id,
            'status': 'error',
            'error': 'Max retries exceeded'
        }

# Command line interface
def main():
    """Main function to handle command line arguments"""
    import argparse
    import sys
    
    parser = argparse.ArgumentParser(description='Scrape MyStreamCount data for tracks')
    parser.add_argument('--track-id', help='Spotify track ID to scrape')
    parser.add_argument('--track-url', help='MyStreamCount URL to scrape')
    parser.add_argument('--output-file', help='Output file to save results (optional)')
    parser.add_argument('--delay', type=float, default=1.5, help='Delay between requests (default: 1.5)')
    
    args = parser.parse_args()
    
    # Validate arguments
    if not args.track_id and not args.track_url:
        print(json.dumps({
            'error': 'Either --track-id or --track-url must be provided',
            'success': False
        }), file=sys.stderr)
        sys.exit(1)
    
    try:
        scraper = MyStreamCountJSONScraper(delay=args.delay)
        
        # Determine track ID
        if args.track_id:
            track_id = args.track_id
        else:
            track_id = scraper.extract_track_id_from_url(args.track_url)
            if not track_id:
                print(json.dumps({
                    'error': f'Could not extract track ID from URL: {args.track_url}',
                    'success': False
                }), file=sys.stderr)
                sys.exit(1)
        
        # Scrape the track
        track_data = scraper.scrape_track(track_id)
        
        # Add success flag
        track_data['success'] = True
        
        # Save to file if requested
        if args.output_file:
            scraper.save_json(track_data, args.output_file)
            track_data['saved_to'] = args.output_file
        
        # Output JSON to stdout for the Node.js API to parse
        print(json.dumps(track_data, indent=2, default=str))
        
    except Exception as e:
        error_data = {
            'error': str(e),
            'success': False,
            'timestamp': datetime.now().isoformat()
        }
        print(json.dumps(error_data), file=sys.stderr)
        sys.exit(1)

def example_usage():
    """Example usage of the JSON scraper"""
    scraper = MyStreamCountJSONScraper(delay=1.5)
    
    # Example track ID from the provided HTML
    track_id = "0phzfJn8NeT1LkbqfV2peI"  # "Lejos de Ti" by The Marías
    
    # Example URLs
    example_urls = [
        "https://www.mystreamcount.com/track/0phzfJn8NeT1LkbqfV2peI",
        # Add more URLs here
    ]
    
    print("=== Scraping Single Track ===")
    single_track_data = scraper.scrape_track(track_id)
    print(json.dumps(single_track_data, indent=2, default=str))
    
    # Save single track data
    scraper.save_json(single_track_data, f"track_{track_id}.json")
    
    print("\n=== Getting Chart Data Only ===")
    chart_data = scraper.get_chart_data_only(track_id)
    print(json.dumps(chart_data, indent=2, default=str))
    
    print("\n=== Scraping from URLs ===")
    url_results = scraper.scrape_from_urls(example_urls)
    
    # Save all results
    final_data = {
        'scraping_session': {
            'timestamp': datetime.now().isoformat(),
            'total_tracks': len(url_results),
            'scraper_version': '1.0'
        },
        'tracks': url_results
    }
    
    scraper.save_json(final_data, "mystreamcount_complete_data.json")
    
    print(f"\nScraping completed! Processed {len(url_results)} tracks.")
    return final_data

if __name__ == "__main__":
    main()