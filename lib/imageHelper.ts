// lib/imageHelper.ts
import fs from 'fs';
import path from 'path';

/**
 * Get valid image URL from path or URL
 * Supports:
 * - Local filesystem paths (D:\path\to\image.jpg)
 * - Relative paths (/images/photo.jpg)
 * - Absolute URLs (https://example.com/image.jpg)
 */
export function getValidImageUrl(inputPath: string | null | undefined): string | null {
  if (!inputPath) return null;
  
  // If it's already a full URL (starts with http:// or https://)
  if (inputPath.startsWith('http://') || inputPath.startsWith('https://')) {
    return inputPath;
  }
  
  // If it's a local filesystem path (contains drive letter or backslashes)
  if (inputPath.match(/^[A-Za-z]:\\/) || inputPath.includes(':\\')) {
    // Convert Windows path to URL path
    const normalizedPath = inputPath.replace(/\\/g, '/');
    // Extract filename
    const fileName = path.basename(normalizedPath);
    // Serve from /images/ directory
    return `/images/${fileName}`;
  }
  
  // If it starts with /, it's a public path
  if (inputPath.startsWith('/')) {
    return inputPath;
  }
  
  // Otherwise treat as relative path
  return `/${inputPath}`;
}

/**
 * Check if image exists locally
 */
export function imageExistsLocally(imagePath: string): boolean {
  if (!imagePath) return false;
  
  // For local filesystem paths
  if (imagePath.match(/^[A-Za-z]:\\/)) {
    try {
      return fs.existsSync(imagePath);
    } catch {
      return false;
    }
  }
  
  // For public directory paths
  const publicPath = path.join(process.cwd(), 'public', imagePath);
  try {
    return fs.existsSync(publicPath);
  } catch {
    return false;
  }
}