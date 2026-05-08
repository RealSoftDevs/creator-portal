# scripts/bulk_import_products.py (Fixed version)
#!/usr/bin/env python3
"""
Bulk Product Import Script for Creator Portal - Fixed for proper title/description
"""

import re
import json
import time
import argparse
import requests
from typing import List, Dict, Optional
from urllib.parse import urlparse
import sys

class CreatorPortalImporter:
    def __init__(self, base_url: str, email: str = None, password: str = None, cookie: str = None):
        self.base_url = base_url.rstrip('/')
        self.email = email
        self.password = password
        self.cookie = cookie
        self.session = requests.Session()
        self.token = None

    def login(self) -> bool:
        """Login to get authentication token using either email/password or cookie"""

        # Method 1: Use cookie if provided
        if self.cookie:
            print(f"🔐 Using provided cookie for authentication...")
            self.session.headers.update({'Cookie': self.cookie})

            try:
                response = self.session.get(f"{self.base_url}/api/portal/products", timeout=10)
                if response.status_code == 200:
                    print(f"✅ Cookie authentication successful!")
                    return True
                else:
                    print(f"❌ Cookie authentication failed (Status: {response.status_code})")
                    if self.email and self.password:
                        print("   Falling back to email/password login...")
                    else:
                        return False
            except Exception as e:
                print(f"❌ Cookie verification failed: {e}")
                if not (self.email and self.password):
                    return False

        # Method 2: Use email/password
        if self.email and self.password:
            print(f"🔐 Logging in as {self.email}...")

            # Try different login endpoints
            login_endpoints = [
                f"{self.base_url}/api/login",
                f"{self.base_url}/api/auth/login",
                f"{self.base_url}/api/user/login",
            ]

            for endpoint in login_endpoints:
                try:
                    response = self.session.post(endpoint, json={
                        'email': self.email,
                        'password': self.password
                    }, timeout=10)

                    if response.status_code == 200:
                        data = response.json()
                        if 'token' in data:
                            self.token = data['token']
                            self.session.headers.update({'Authorization': f'Bearer {self.token}'})
                        print(f"✅ Login successful via {endpoint}!")
                        return True
                except Exception as e:
                    continue

            print(f"❌ Login failed with email/password")
            return False

        print(f"❌ No valid authentication method provided")
        return False

    def extract_products_from_json(self, file_path: str) -> List[Dict]:
        """Extract products from JSON file (already has images)"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                products_data = json.load(f)

            products = []
            for item in products_data:
                product = {
                    'url': item.get('url', ''),
                    'title': item.get('title', ''),
                    'price': item.get('price', ''),
                    'image_url': item.get('imageUrl', item.get('image_url', '')),  # Handle both keys
                    'platform': item.get('platform', 'amazon'),
                    'category': item.get('category', 'misc'),
                    'description': item.get('description', '')
                }
                products.append(product)

            print(f"📊 Loaded {len(products)} products from JSON")
            return products
        except Exception as e:
            print(f"❌ Failed to parse JSON: {e}")
            return []

    def extract_products_from_text(self, text: str) -> List[Dict]:
        """Extract products from raw text"""
        products = []

        # URL patterns
        url_patterns = [
            r'https?://(?:www\.)?amzn\.to/[^\s"\'<>)]+',
            r'https?://(?:www\.)?amazon\.(?:in|com)/[^\s"\'<>)]+',
            r'https?://(?:www\.)?myntra\.com/[^\s"\'<>)]+',
            r'https?://(?:www\.)?flipkart\.com/[^\s"\'<>)]+',
        ]

        # Find all URLs
        all_urls = []
        for pattern in url_patterns:
            matches = re.findall(pattern, text)
            all_urls.extend(matches)

        seen = set()
        unique_urls = []
        for url in all_urls:
            if url not in seen:
                seen.add(url)
                unique_urls.append(url)

        print(f"📊 Found {len(unique_urls)} unique product URLs")

        for url in unique_urls:
            product = {
                'url': url,
                'title': '',
                'price': '',
                'image_url': '',
                'platform': self.detect_platform(url),
                'category': 'misc',
                'description': ''
            }

            # Find context around URL
            url_index = text.find(url)
            if url_index != -1:
                start = max(0, url_index - 300)
                end = min(len(text), url_index + len(url) + 500)
                context = text[start:end]

                # Extract title
                title_patterns = [
                    r'title=["\']([^"\']{10,300})["\']',
                    r'alt=["\']([^"\']{10,300})["\']',
                    r'<h3[^>]*>([^<]{10,300})</h3>',
                    r'<meta[^>]*property="og:title"[^>]*content="([^"]+)"',
                ]

                for pattern in title_patterns:
                    match = re.search(pattern, context, re.IGNORECASE)
                    if match:
                        title = match.group(1).strip()
                        title = title.replace('&amp;', '&').replace('&quot;', '"')
                        title = re.sub(r'\s*[|:-]\s*Amazon\..*$', '', title)
                        if 10 < len(title) < 300:
                            product['title'] = title
                            break

                # Extract price
                price_match = re.search(r'[₹](\d{1,3}(?:,\d{3})*)', context)
                if price_match:
                    price_num = price_match.group(1).replace(',', '')
                    if price_num.isdigit():
                        product['price'] = f"₹{int(price_num):,}"

                # Extract image
                image_match = re.search(r'src=["\'](https?://[^"\']+\.(?:jpg|jpeg|png|webp|gif))["\']', context, re.IGNORECASE)
                if image_match:
                    product['image_url'] = image_match.group(1)

            if not product['title']:
                product['title'] = f"Product from {product['platform'].upper()}"

            products.append(product)

        return products

    def detect_platform(self, url: str) -> str:
        url_lower = url.lower()
        if 'amazon' in url_lower or 'amzn' in url_lower:
            return 'amazon'
        elif 'myntra' in url_lower:
            return 'myntra'
        elif 'flipkart' in url_lower:
            return 'flipkart'
        return 'custom'

    def fetch_product_details(self, url: str) -> Dict:
        """Fetch complete product details using the API"""
        try:
            api_url = f"{self.base_url}/api/product-preview?url={requests.utils.quote(url)}"
            response = self.session.get(api_url, timeout=30)
            if response.status_code == 200:
                return response.json()
            return {}
        except Exception as e:
            print(f"  ⚠️ Error fetching details: {e}")
            return {}

    def add_product(self, product: Dict, fetch_details: bool = True) -> bool:
        """Add a single product to the portal"""
        try:
            # Fetch details if needed
            if fetch_details and not product.get('image_url'):
                print(f"  🔍 Fetching product details...")
                details = self.fetch_product_details(product['url'])
                if details:
                    if details.get('title'):
                        product['title'] = details['title']
                    if details.get('price'):
                        product['price'] = details['price']
                    if details.get('imageUrl'):
                        product['image_url'] = details['imageUrl']
                    if details.get('description'):
                        product['description'] = details['description']

            # Prepare product data with proper fields
            product_data = {
                'title': product['title'][:200] if product['title'] else 'Product',
                'description': (product.get('description') or '')[:500],
                'imageUrl': product.get('image_url', ''),
                'buyLink': product['url'],
                'price': product.get('price', '').replace('₹', '').replace(',', '').strip(),
                'platform': product.get('platform', 'amazon'),
                'category': product.get('category', 'misc')
            }

            print(f"  📝 Title: {product_data['title'][:60]}...")
            print(f"  🖼️ Image: {product_data['imageUrl'][:60] if product_data['imageUrl'] else 'None'}...")
            print(f"  💰 Price: {product_data['price']}")

            # Add product via API
            response = self.session.post(
                f"{self.base_url}/api/portal/products",
                json=product_data,
                timeout=30
            )

            if response.status_code in [200, 201]:
                return True
            else:
                print(f"  ❌ API Error: {response.status_code}")
                if response.text:
                    print(f"     {response.text[:200]}")
                return False

        except Exception as e:
            print(f"  ❌ Exception: {e}")
            return False

    def delete_all_products(self) -> int:
        """Delete all existing products"""
        print(f"\n🗑️ Fetching existing products...")

        try:
            response = self.session.get(f"{self.base_url}/api/portal/products", timeout=10)
            if response.status_code == 200:
                products = response.json().get('products', [])
                if not products:
                    print("✅ No products to delete")
                    return 0

                print(f"📊 Found {len(products)} existing products")
                deleted = 0
                for product in products:
                    try:
                        del_resp = self.session.delete(f"{self.base_url}/api/portal/products?id={product['id']}")
                        if del_resp.status_code in [200, 204]:
                            deleted += 1
                            print(f"  ✅ Deleted: {product['title'][:40]}...")
                        time.sleep(0.1)
                    except Exception as e:
                        print(f"  ❌ Failed to delete: {e}")

                print(f"✅ Deleted {deleted} products")
                return deleted
            return 0
        except Exception as e:
            print(f"⚠️ Error deleting products: {e}")
            return 0

    def import_products_from_file(self, file_path: str, fetch_details: bool = True,
                                   delay: float = 1.0, category: Optional[str] = None,
                                   platform: Optional[str] = None, delete_first: bool = False) -> Dict:
        """Import products from a file (text or JSON)"""

        print(f"\n📖 Reading file: {file_path}")

        # Check if it's JSON
        if file_path.endswith('.json'):
            products = self.extract_products_from_json(file_path)
        else:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
                products = self.extract_products_from_text(text)
            except Exception as e:
                print(f"❌ Failed to read file: {e}")
                return {'success': 0, 'failed': 0}

        if not products:
            print("❌ No products found in file")
            return {'success': 0, 'failed': 0}

        print(f"\n📊 Found {len(products)} products to import")

        # Delete existing if requested
        if delete_first:
            self.delete_all_products()

        # Apply global category/platform
        if category:
            for p in products:
                p['category'] = category
            print(f"  🏷️ Applying category '{category}' to all products")

        if platform:
            for p in products:
                p['platform'] = platform
            print(f"  🛒 Applying platform '{platform}' to all products")

        # Display products
        print("\n📋 Products to import:")
        for i, p in enumerate(products[:5], 1):  # Show first 5
            print(f"  {i}. {p['title'][:60]}...")
            print(f"     URL: {p['url'][:80]}...")
            if p.get('price'):
                print(f"     Price: {p['price']}")
            if p.get('image_url'):
                print(f"     Image: {p['image_url'][:60]}...")

        if len(products) > 5:
            print(f"  ... and {len(products) - 5} more")

        # Confirm
        print(f"\n⚠️ About to import {len(products)} products")
        confirm = input("Continue? (y/n): ")
        if confirm.lower() != 'y':
            print("❌ Import cancelled")
            return {'success': 0, 'failed': 0}

        # Import
        success_count = 0
        fail_count = 0

        for i, product in enumerate(products, 1):
            print(f"\n[{i}/{len(products)}] {product['title'][:50]}...")

            if self.add_product(product, fetch_details):
                success_count += 1
                print(f"  ✅ Success!")
            else:
                fail_count += 1
                print(f"  ❌ Failed!")

            if i < len(products):
                time.sleep(delay)

        # Summary
        print("\n" + "="*50)
        print("📊 IMPORT SUMMARY")
        print("="*50)
        print(f"✅ Successfully imported: {success_count}")
        print(f"❌ Failed: {fail_count}")

        return {'success': success_count, 'failed': fail_count}


def main():
    parser = argparse.ArgumentParser(description='Bulk import products to Creator Portal')
    parser.add_argument('--file', '-f', required=True, help='Path to text file or JSON file containing product data')
    parser.add_argument('--url', '-u', default='http://localhost:3000', help='Base URL of Creator Portal')
    parser.add_argument('--email', '-e', help='Admin email for login')
    parser.add_argument('--password', '-p', help='Admin password')
    parser.add_argument('--cookie', '-c', help='Browser cookie')
    parser.add_argument('--no-fetch', action='store_true', help='Skip fetching additional product details')
    parser.add_argument('--delay', '-d', type=float, default=1.0, help='Delay between requests')
    parser.add_argument('--category', help='Apply category to all products')
    parser.add_argument('--platform', help='Apply platform to all products')
    parser.add_argument('--delete-first', action='store_true', help='Delete all existing products before importing')

    args = parser.parse_args()

    print("="*50)
    print("🚀 CREATOR PORTAL BULK PRODUCT IMPORTER")
    print("="*50)
    print(f"📁 File: {args.file}")
    print(f"🌐 URL: {args.url}")
    if args.category:
        print(f"🏷️ Category: {args.category}")
    if args.delete_first:
        print(f"🗑️ Delete existing: YES")
    print("="*50)

    # Create importer
    importer = CreatorPortalImporter(
        base_url=args.url,
        email=args.email,
        password=args.password,
        cookie=args.cookie
    )

    # Login
    if not importer.login():
        print("❌ Authentication failed. Exiting.")
        sys.exit(1)

    # Import
    result = importer.import_products_from_file(
        file_path=args.file,
        fetch_details=not args.no_fetch,
        delay=args.delay,
        category=args.category,
        platform=args.platform,
        delete_first=args.delete_first
    )

    if result['success'] > 0:
        print(f"\n✨ Successfully imported {result['success']} products!")
        print(f"🔗 View at: {args.url}/studio")
    else:
        print("\n❌ No products were imported.")
        sys.exit(1)


if __name__ == '__main__':
    main()