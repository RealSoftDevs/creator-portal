# extract_products_with_images.py
#!/usr/bin/env python3
"""
Extract all product details (including images) and save to a JSON file
Usage: python extract_products_with_images.py --file data.txt
"""

import re
import time
import json
import requests
from typing import Dict, List

def extract_urls(file_path: str) -> List[str]:
    """Extract URLs from text file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    patterns = [
        r'https?://(?:www\.)?amzn\.to/[^\s"\'<>)\]]+',
        r'https?://(?:www\.)?amazon\.(?:in|com)/[^\s"\'<>)\]]+',
    ]
    
    urls = []
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        urls.extend(matches)
    
    # Clean and deduplicate
    unique_urls = []
    seen = set()
    for url in urls:
        url = url.rstrip('.,;:!?\'"`')
        if url not in seen:
            seen.add(url)
            unique_urls.append(url)
    
    return unique_urls

def fetch_product_details(url: str, base_url: str = "http://localhost:3000") -> Dict:
    """Fetch product details including image"""
    try:
        api_url = f"{base_url}/api/product-preview?url={requests.utils.quote(url)}"
        response = requests.get(api_url, timeout=30)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"  ⚠️ API returned {response.status_code}")
            return {}
    except Exception as e:
        print(f"  ⚠️ Error: {e}")
        return {}

def main():
    input_file = "data.txt"
    output_file = "products_with_images.json"
    
    print("="*50)
    print("📦 EXTRACTING PRODUCTS WITH IMAGES")
    print("="*50)
    
    # Extract URLs
    urls = extract_urls(input_file)
    print(f"📊 Found {len(urls)} product URLs")
    
    products = []
    
    for i, url in enumerate(urls, 1):
        print(f"\n[{i}/{len(urls)}] Processing: {url[:60]}...")
        
        # Fetch details
        details = fetch_product_details(url)
        
        if details.get('imageUrl'):
            product = {
                'url': url,
                'title': details.get('title', f'Product {i}'),
                'price': details.get('price', ''),
                'imageUrl': details['imageUrl'],
                'platform': 'amazon',
                'category': 'misc'
            }
            products.append(product)
            print(f"  ✅ Image found: {product['imageUrl'][:60]}...")
            print(f"  📝 Title: {product['title'][:60]}...")
            print(f"  💰 Price: {product['price']}")
        else:
            print(f"  ❌ No image found - skipping")
        
        # Delay between requests
        time.sleep(1)
    
    # Save to JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*50}")
    print(f"✅ Extracted {len(products)} products with images")
    print(f"📁 Saved to: {output_file}")
    print(f"{'='*50}")

if __name__ == '__main__':
    main()