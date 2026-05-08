# upload.py
#!/usr/bin/env python3
"""
Bulk Product Import Script for Creator Portal
Default usage: python upload.py
"""

import re
import json
import time
import argparse
import requests
from typing import List, Dict, Optional
import sys
import os

class CreatorPortalImporter:
    def __init__(self, base_url: str, email: str = None, password: str = None, cookie: str = None):
        self.base_url = base_url.rstrip('/')
        self.email = email
        self.password = password
        self.cookie = cookie
        self.session = requests.Session()
        self.token = None

    def login(self) -> bool:
        """Login to get authentication token"""

        if self.email and self.password:
            print(f"🔐 Logging in as {self.email}...")

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
                        print(f"✅ Login successful!")
                        return True
                except:
                    continue

            print(f"❌ Login failed")
            return False

        print(f"❌ No authentication method provided")
        return False

    def extract_urls_from_file(self, file_path: str) -> List[str]:
        """Extract all product URLs from file (supports both .txt and .json)"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"❌ Failed to read file: {e}")
            return []

        # If JSON file, try to parse it
        if file_path.endswith('.json'):
            try:
                data = json.loads(content)
                # If it's an array of objects with 'url' field
                if isinstance(data, list):
                    urls = [item.get('url', item.get('buyLink', '')) for item in data if item.get('url') or item.get('buyLink')]
                    if urls:
                        print(f"📊 Found {len(urls)} URLs from JSON file")
                        return urls
            except:
                pass

        # URL patterns for text files
        url_patterns = [
            r'https?://(?:www\.)?amzn\.to/[^\s"\'<>)\]]+',
            r'https?://(?:www\.)?amazon\.(?:in|com)/[^\s"\'<>)\]]+',
            r'https?://(?:www\.)?myntra\.com/[^\s"\'<>)\]]+',
            r'https?://(?:www\.)?flipkart\.com/[^\s"\'<>)\]]+',
            r'https?://(?:www\.)?etsy\.com/[^\s"\'<>)\]]+',
        ]

        urls = []
        for pattern in url_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            urls.extend(matches)

        # Clean and deduplicate
        unique_urls = []
        seen = set()
        for url in urls:
            url = url.rstrip('.,;:!?\'"`')
            if url not in seen:
                seen.add(url)
                unique_urls.append(url)

        print(f"📊 Found {len(unique_urls)} product URLs")
        return unique_urls

    def fetch_product_details(self, url: str) -> Dict:
        """Fetch product details using the same API that the Add Product modal uses"""
        try:
            api_url = f"{self.base_url}/api/product-preview?url={requests.utils.quote(url)}"
            response = self.session.get(api_url, timeout=30)

            if response.status_code == 200:
                return response.json()
            else:
                print(f"  ⚠️ API returned status {response.status_code}")
                return {}
        except Exception as e:
            print(f"  ⚠️ Error fetching details: {e}")
            return {}

    def add_product(self, url: str, category: str = 'misc', platform: str = None) -> bool:
        """Add a single product - sets title as description as well"""
        try:
            print(f"  📡 Fetching product details...")
            details = self.fetch_product_details(url)

            if not details:
                print(f"  ❌ Could not fetch product details")
                return False

            # Get fetched data
            fetched_title = details.get('title', '')
            fetched_description = details.get('description', '')
            fetched_image = details.get('imageUrl', '')
            fetched_price = details.get('price', '')

            # If description is empty, use title as description
            if not fetched_description and fetched_title:
                fetched_description = fetched_title
                print(f"  📝 Note: Using title as description (description was empty)")

            print(f"  📝 Title: {fetched_title[:80] if fetched_title else 'NOT FOUND'}...")
            print(f"  📄 Description: {fetched_description[:80] if fetched_description else 'NOT FOUND'}...")
            print(f"  🖼️ Image: {fetched_image[:60] if fetched_image else 'NOT FOUND'}...")
            print(f"  💰 Price: {fetched_price if fetched_price else 'NOT FOUND'}")

            # Prepare product data
            product_data = {
                'title': (fetched_title or f'Product from URL')[:200],
                'description': (fetched_description or fetched_title or '')[:500],
                'imageUrl': fetched_image,
                'buyLink': url,
                'price': fetched_price,
                'platform': platform or self.detect_platform(url),
                'category': category
            }

            print(f"\n  📦 Final Product Data:")
            print(f"     Title: {product_data['title'][:80]}...")
            print(f"     Description: {product_data['description'][:80] if product_data['description'] else 'EMPTY'}...")
            print(f"     Image: {product_data['imageUrl'][:60] if product_data['imageUrl'] else 'EMPTY'}...")

            # Add product via portal API
            response = self.session.post(
                f"{self.base_url}/api/portal/products",
                json=product_data,
                timeout=30
            )

            if response.status_code in [200, 201]:
                print(f"  ✅ Uploaded successfully!")
                return True
            else:
                print(f"  ❌ Upload failed: HTTP {response.status_code}")
                if response.text:
                    print(f"     Response: {response.text[:200]}")
                return False

        except Exception as e:
            print(f"  ❌ Exception: {e}")
            return False

    def detect_platform(self, url: str) -> str:
        url_lower = url.lower()
        if 'amazon' in url_lower or 'amzn' in url_lower:
            return 'amazon'
        elif 'myntra' in url_lower:
            return 'myntra'
        elif 'flipkart' in url_lower:
            return 'flipkart'
        return 'custom'

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
                confirm = input(f"⚠️ Delete all {len(products)} products? (yes/no): ")

                if confirm.lower() != 'yes':
                    print("❌ Deletion cancelled")
                    return 0

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

    def import_products(self, file_path: str, category: str = 'misc',
                        platform: str = None, delete_first: bool = False,
                        delay: float = 2.0) -> Dict:
        """Main import function"""

        print(f"\n📖 Reading file: {file_path}")
        urls = self.extract_urls_from_file(file_path)

        if not urls:
            print("❌ No product URLs found in file")
            return {'success': 0, 'failed': 0}

        print(f"📊 Found {len(urls)} product URLs to import")

        if delete_first:
            self.delete_all_products()

        print(f"\n⚠️ About to import {len(urls)} products")
        confirm = input("Continue? (y/n): ")
        if confirm.lower() != 'y':
            print("❌ Import cancelled")
            return {'success': 0, 'failed': 0}

        success_count = 0
        fail_count = 0

        for i, url in enumerate(urls, 1):
            print(f"\n{'='*60}")
            print(f"[{i}/{len(urls)}] Processing: {url[:80]}...")
            print(f"{'='*60}")

            if self.add_product(url, category, platform):
                success_count += 1
            else:
                fail_count += 1

            if i < len(urls):
                print(f"  ⏳ Waiting {delay}s before next request...")
                time.sleep(delay)

        return {'success': success_count, 'failed': fail_count, 'total': len(urls)}


def main():
    # Default values
    default_file = 'data.txt'
    default_email = 'dr.charuwagle@gmail.com'
    default_password = '!qaz2wsX'
    default_category = 'electronics'
    default_delay = 2
    default_url = 'http://localhost:3000'

    parser = argparse.ArgumentParser(description='Bulk import products')
    parser.add_argument('--file', '-f', default=default_file, help=f'Product file (.txt or .json) (default: {default_file})')
    parser.add_argument('--url', '-u', default=default_url, help=f'Server URL (default: {default_url})')
    parser.add_argument('--email', '-e', default=default_email, help=f'Email (default: {default_email})')
    parser.add_argument('--password', '-p', default=default_password, help='Password')
    parser.add_argument('--category', '-c', default=default_category, help=f'Category (default: {default_category})')
    parser.add_argument('--platform', help='Platform (auto-detected if not specified)')
    parser.add_argument('--delay', '-d', type=float, default=default_delay, help=f'Delay in seconds (default: {default_delay})')
    parser.add_argument('--delete-first', action='store_true', help='Delete existing products first')

    args = parser.parse_args()

    print("="*60)
    print("🚀 CREATOR PORTAL BULK PRODUCT IMPORTER")
    print("="*60)
    print(f"📁 File: {args.file}")
    print(f"🌐 URL: {args.url}")
    print(f"👤 Email: {args.email}")
    print(f"🏷️ Category: {args.category}")
    print(f"⏱️ Delay: {args.delay}s")
    if args.delete_first:
        print(f"🗑️ Delete existing: YES")
    print("="*60)

    if not os.path.exists(args.file):
        print(f"❌ File not found: {args.file}")
        sys.exit(1)

    try:
        requests.get(args.url, timeout=5)
        print("✅ Server is reachable")
    except:
        print(f"❌ Cannot reach {args.url}")
        print("\n💡 Make sure your Next.js server is running: npm run dev")
        sys.exit(1)

    importer = CreatorPortalImporter(args.url, args.email, args.password)

    if not importer.login():
        sys.exit(1)

    result = importer.import_products(
        file_path=args.file,
        category=args.category,
        platform=args.platform,
        delete_first=args.delete_first,
        delay=args.delay
    )

    print("\n" + "="*60)
    print("📊 IMPORT SUMMARY")
    print("="*60)
    print(f"✅ Successfully imported: {result['success']}")
    print(f"❌ Failed: {result['failed']}")
    print(f"📦 Total URLs processed: {result['total']}")

    if result['success'] > 0:
        print(f"\n✨ Successfully added {result['success']} products!")
        print(f"🔗 View at: {args.url}/studio")

if __name__ == '__main__':
    main()