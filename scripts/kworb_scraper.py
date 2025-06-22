import requests
from bs4 import BeautifulSoup
import json
import re
import argparse
import sys
from typing import Dict, Optional

class KworbScraper:
    def __init__(self, delay: float = 1.0):
        """
        Initialize the Kworb scraper
        
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
    
    def get_top_streaming_country(self, track_id: str) -> Dict:
        """
        Get the country with the most streams for a track from kworb.net
        
        Args:
            track_id: Spotify track ID
            
        Returns:
            Dictionary containing top streaming country data
        """
        url = f"https://kworb.net/spotify/track/{track_id}.html"
        
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find the country streams table
            # Kworb typically has a table with countries and their stream counts
            country_data = self._extract_country_streams(soup)
            
            if country_data:
                # Find the country with the highest stream count
                top_country = max(country_data, key=lambda x: x['streams'])
                
                return {
                    'success': True,
                    'track_id': track_id,
                    'url': url,
                    'topStreamsByCountry': top_country['country'],
                    'topStreamCount': top_country['streams'],
                    'allCountries': country_data
                }
            else:
                return {
                    'success': False,
                    'track_id': track_id,
                    'url': url,
                    'error': 'No country data found',
                    'topStreamsByCountry': None
                }
                
        except requests.RequestException as e:
            return {
                'success': False,
                'track_id': track_id,
                'url': url,
                'error': f'Request failed: {str(e)}',
                'topStreamsByCountry': None
            }
        except Exception as e:
            return {
                'success': False,
                'track_id': track_id,
                'url': url,
                'error': f'Scraping failed: {str(e)}',
                'topStreamsByCountry': None
            }
    
    def _extract_country_streams(self, soup: BeautifulSoup) -> list:
        """Extract country stream counts from the kworb page"""
        # Look for the main table with country stream data
        tables = soup.find_all('table')
        
        country_streams = {}
        
        for table in tables:
            rows = table.find_all('tr')
            
            if len(rows) < 2:
                continue
                
            # Get header row to identify country columns
            header_row = rows[0]
            headers = header_row.find_all(['th', 'td'])
            
            if len(headers) < 3:
                continue
                
            # Skip first column (Date) and process country columns
            country_columns = []
            for i, header in enumerate(headers[1:], 1):  # Skip first column (Date)
                country_code = header.get_text().strip()
                if len(country_code) == 2 and country_code.isupper():
                    country_columns.append((i, country_code))
            
            if not country_columns:
                continue
                
            # Look specifically for the "Total" row with stream counts
            for row in rows:
                cells = row.find_all(['td', 'th'])
                
                if len(cells) < len(headers):
                    continue
                
                # Check if this is the "Total" row
                first_cell = cells[0].get_text().strip()
                if first_cell.lower() == 'total':
                    # Process each country column to get stream counts
                    for col_index, country_code in country_columns:
                        if col_index < len(cells):
                            stream_text = cells[col_index].get_text().strip()
                            
                            # Extract stream count (remove commas)
                            stream_match = re.search(r'([\d,]+)', stream_text)
                            if stream_match:
                                try:
                                    streams = int(stream_match.group(1).replace(',', ''))
                                    country_streams[country_code] = {
                                        'streams': streams,
                                        'raw_text': stream_text
                                    }
                                except ValueError:
                                    continue
                    break  # Found the Total row, no need to continue
        
        # Convert to the expected format
        country_data = []
        for country_code, data in country_streams.items():
            country_data.append({
                'country': country_code,
                'streams': data['streams'],
                'raw_country': country_code,
                'raw_streams': data['raw_text']
            })
        
        return country_data
    

    
    def _normalize_country_code(self, country_text: str) -> str:
        """Convert country names to standard codes"""
        # Common country name to code mappings
        country_mappings = {
            'United States': 'US',
            'United Kingdom': 'GB',
            'Germany': 'DE',
            'France': 'FR',
            'Canada': 'CA',
            'Australia': 'AU',
            'Brazil': 'BR',
            'Mexico': 'MX',
            'Spain': 'ES',
            'Italy': 'IT',
            'Netherlands': 'NL',
            'Sweden': 'SE',
            'Norway': 'NO',
            'Denmark': 'DK',
            'Finland': 'FI',
            'Poland': 'PL',
            'Russia': 'RU',
            'Japan': 'JP',
            'South Korea': 'KR',
            'India': 'IN',
            'China': 'CN'
        }
        
        # If it's already a 2-letter code, return as is
        if len(country_text) == 2 and country_text.isupper():
            return country_text
        
        # Try to find in mappings
        return country_mappings.get(country_text, country_text)

def main():
    parser = argparse.ArgumentParser(description='Scrape top streaming country from kworb.net')
    parser.add_argument('--track-id', required=True, help='Spotify track ID')
    
    args = parser.parse_args()
    
    scraper = KworbScraper()
    result = scraper.get_top_streaming_country(args.track_id)
    
    # Output JSON to stdout for Node.js to parse
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main() 