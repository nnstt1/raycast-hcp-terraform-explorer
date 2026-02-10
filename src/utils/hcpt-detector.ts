import { execSync } from "child_process";
import { existsSync } from "fs";
import { getPreferenceValues } from "@raycast/api";
import { Preferences } from "../types";

export interface HcptInfo {
  available: boolean;
  path?: string;
  version?: string;
}

/**
 * Detect if hcpt CLI tool is available on the system
 * Checks custom path from preferences first, then common installation paths and PATH environment variable
 */
export function detectHcpt(): HcptInfo {
  // Check custom path from preferences first
  try {
    const preferences = getPreferenceValues<Preferences>();
    if (preferences.hcptPath) {
      const customPath = preferences.hcptPath.trim();

      if (existsSync(customPath)) {
        try {
          const version = execSync(`${customPath} --version`, {
            encoding: "utf-8",
            timeout: 5000,
            stdio: ["ignore", "pipe", "ignore"],
          }).trim();

          return { available: true, path: customPath, version };
        } catch {
          return { available: true, path: customPath };
        }
      }
    }
  } catch {
    // Failed to get preferences
  }

  // Common installation paths
  const possiblePaths = [
    "/usr/local/bin/hcpt",
    "/opt/homebrew/bin/hcpt",
    process.env.HOME + "/go/bin/hcpt",
    process.env.GOPATH ? process.env.GOPATH + "/bin/hcpt" : null,
  ].filter((path): path is string => path !== null);

  // Check each possible path
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      try {
        const version = execSync(`${path} --version`, {
          encoding: "utf-8",
          timeout: 5000,
          stdio: ["ignore", "pipe", "ignore"], // Suppress stderr
        }).trim();

        return { available: true, path, version };
      } catch {
        // Version command failed, but binary exists - try next path
        continue;
      }
    }
  }

  // Try searching in PATH environment variable directly
  const pathEnv = process.env.PATH || "";

  if (pathEnv) {
    const pathDirs = pathEnv.split(":");
    for (const dir of pathDirs) {
      const hcptPath = `${dir}/hcpt`;
      if (existsSync(hcptPath)) {
        try {
          const version = execSync(`${hcptPath} --version`, {
            encoding: "utf-8",
            timeout: 5000,
            stdio: ["ignore", "pipe", "ignore"],
          }).trim();

          return { available: true, path: hcptPath, version };
        } catch {
          // Version command failed, but binary exists
          return { available: true, path: hcptPath };
        }
      }
    }
  }

  // Try using 'which' command to find in PATH (fallback)
  try {
    const path = execSync("which hcpt", {
      encoding: "utf-8",
      timeout: 5000,
      stdio: ["ignore", "pipe", "ignore"], // Suppress stderr
    }).trim();

    if (path) {
      try {
        const version = execSync(`${path} --version`, {
          encoding: "utf-8",
          timeout: 5000,
          stdio: ["ignore", "pipe", "ignore"],
        }).trim();

        return { available: true, path, version };
      } catch {
        // Version command failed, but binary was found
        return { available: true, path };
      }
    }
  } catch {
    // 'which' command failed or hcpt not found in PATH
  }

  // hcpt not found
  return { available: false };
}

/**
 * Get version number as numeric array [major, minor, patch]
 * @param version Version string (e.g., "v1.2.3" or "1.2.3")
 */
export function parseVersion(version: string): [number, number, number] | null {
  const match = version.match(/v?(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return null;
  }

  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

/**
 * Check if hcpt version meets minimum requirement
 * @param version Version string to check
 * @param minVersion Minimum required version [major, minor, patch]
 */
export function meetsMinimumVersion(version: string, minVersion: [number, number, number]): boolean {
  const parsed = parseVersion(version);
  if (!parsed) {
    return false;
  }

  const [major, minor, patch] = parsed;
  const [minMajor, minMinor, minPatch] = minVersion;

  if (major > minMajor) return true;
  if (major < minMajor) return false;

  if (minor > minMinor) return true;
  if (minor < minMinor) return false;

  return patch >= minPatch;
}
