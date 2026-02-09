/**
 * Build Optimization Utility
 * Analyzes build output and provides optimization recommendations
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

export interface BuildStats {
  totalSize: number;
  compressedSize: number;
  compressionRatio: number;
  files: Array<{
    path: string;
    size: number;
    compressedSize: number;
  }>;
  largeFiles: Array<{
    path: string;
    size: number;
    sizeInMB: number;
  }>;
  warnings: string[];
}

/**
 * Analyze build directory for size and compression
 */
export function analyzeBuildOutput(buildDir: string): BuildStats {
  if (!fs.existsSync(buildDir)) {
    throw new Error(`Build directory not found: ${buildDir}`);
  }

  const stats: BuildStats = {
    totalSize: 0,
    compressedSize: 0,
    compressionRatio: 0,
    files: [],
    largeFiles: [],
    warnings: [],
  };

  const walkDir = (dir: string): void => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (stat.isFile()) {
        const fileSize = stat.size;
        const relativePath = path.relative(buildDir, filePath);
        
        // Read file and compress it
        const fileContent = fs.readFileSync(filePath);
        const compressedBuffer = zlib.gzipSync(fileContent);

        stats.totalSize += fileSize;
        stats.compressedSize += compressedBuffer.length;

        stats.files.push({
          path: relativePath,
          size: fileSize,
          compressedSize: compressedBuffer.length,
        });

        // Track files > 500KB
        if (fileSize > 500 * 1024) {
          stats.largeFiles.push({
            path: relativePath,
            size: fileSize,
            sizeInMB: fileSize / (1024 * 1024),
          });
        }
      }
    }
  };

  walkDir(buildDir);

  // Calculate compression ratio
  stats.compressionRatio =
    stats.totalSize > 0
      ? ((1 - stats.compressedSize / stats.totalSize) * 100).toFixed(2) as any
      : 0;

  // Generate warnings
  if (stats.largeFiles.length > 0) {
    stats.warnings.push(
      `⚠️  Found ${stats.largeFiles.length} large files (>500KB). Consider code splitting or lazy loading.`
    );
  }

  if (stats.compressionRatio > 80) {
    stats.warnings.push(
      `✅ Excellent compression ratio (${stats.compressionRatio}%). Build is well optimized.`
    );
  } else if (stats.compressionRatio > 60) {
    stats.warnings.push(
      `⚠️  Good compression (${stats.compressionRatio}%), but could be better.`
    );
  } else {
    stats.warnings.push(
      `🔴 Poor compression (${stats.compressionRatio}%). Consider optimization.`
    );
  }

  return stats;
}

/**
 * Format build stats for display
 */
export function formatBuildStats(stats: BuildStats): string {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  let output = '\n📊 BUILD OPTIMIZATION REPORT\n';
  output += '='.repeat(50) + '\n\n';

  output += `Total Size: ${formatBytes(stats.totalSize)}\n`;
  output += `Compressed Size: ${formatBytes(stats.compressedSize)}\n`;
  output += `Compression Ratio: ${stats.compressionRatio}%\n\n`;

  if (stats.largeFiles.length > 0) {
    output += `⚠️  LARGE FILES (>500KB):\n`;
    stats.largeFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach((file) => {
        output += `   ${file.path}: ${formatBytes(file.size)}\n`;
      });
    output += '\n';
  }

  if (stats.warnings.length > 0) {
    output += `⚠️  WARNINGS:\n`;
    stats.warnings.forEach((warning) => {
      output += `   ${warning}\n`;
    });
    output += '\n';
  }

  output += `📁 Total Files: ${stats.files.length}\n`;
  output += '='.repeat(50) + '\n';

  return output;
}

/**
 * Check if build output is acceptable for production
 */
export function isBuildAcceptable(stats: BuildStats): {
  acceptable: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for unminified files in production
  const unminifiedFiles = stats.files.filter(
    (f) =>
      (f.path.includes('.js') || f.path.includes('.css')) &&
      !f.path.includes('.min.')
  );

  if (unminifiedFiles.length > 0) {
    warnings.push(
      `Found ${unminifiedFiles.length} potentially unminified files`
    );
  }

  // Check total size
  const totalSizeMB = stats.totalSize / (1024 * 1024);
  if (totalSizeMB > 500) {
    warnings.push(`Build size is ${totalSizeMB.toFixed(2)}MB (consider optimization)`);
  }

  if (totalSizeMB > 1000) {
    errors.push(`Build size is too large: ${totalSizeMB.toFixed(2)}MB`);
  }

  // Check for source maps in production
  const sourceMaps = stats.files.filter((f) => f.path.includes('.map'));
  if (sourceMaps.length > 0) {
    warnings.push(
      `Found ${sourceMaps.length} source map files. Consider removing for production.`
    );
  }

  return {
    acceptable: errors.length === 0,
    errors,
    warnings,
  };
}
