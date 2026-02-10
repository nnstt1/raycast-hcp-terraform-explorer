import { getPreferenceValues, showToast, Toast } from "@raycast/api";
import { detectHcpt } from "../utils/hcpt-detector";
import { HcptProvider } from "./hcpt-provider";
import { FetchProvider } from "./fetch-provider";
import { TerraformProvider } from "./types";
import { Preferences, Workspace, WorkspaceWithDetails, Run } from "../types";

let cachedProvider: TerraformProvider | null = null;
let cachedProviderType: "hcpt" | "fetch" | null = null;
let providerInitializationAttempted = false;

/**
 * Get the appropriate provider (hcpt or Fetch API)
 * Uses hcpt if available and enabled in preferences, otherwise falls back to Fetch API
 */
export function getProvider(): TerraformProvider {
  // Return cached provider if available
  if (cachedProvider) {
    return cachedProvider;
  }

  // Prevent multiple initialization attempts
  if (providerInitializationAttempted) {
    cachedProvider = new FetchProvider();
    cachedProviderType = "fetch";
    return cachedProvider;
  }

  providerInitializationAttempted = true;

  try {
    const preferences = getPreferenceValues<Preferences>();
    const hcptInfo = detectHcpt();

    // Check if hcpt should be used
    if (preferences.preferHcpt !== false && hcptInfo.available && hcptInfo.path) {
      try {
        cachedProvider = new HcptProvider(hcptInfo.path);
        cachedProviderType = "hcpt";
        console.log(`Using hcpt provider${hcptInfo.version ? ` (v${hcptInfo.version})` : ""}`);

        // Show a subtle toast notification (optional)
        showToast({
          style: Toast.Style.Success,
          title: "Using hcpt CLI",
          message: hcptInfo.version ? `v${hcptInfo.version}` : undefined,
        }).catch(() => {
          // Ignore toast errors
        });

        return cachedProvider;
      } catch (error) {
        console.warn("Failed to initialize hcpt provider, falling back to Fetch API:", error);
      }
    }
  } catch (error) {
    console.warn("Error during provider initialization:", error);
  }

  // Fallback to Fetch Provider
  cachedProvider = new FetchProvider();
  cachedProviderType = "fetch";
  console.log("Using Fetch API provider");

  return cachedProvider;
}

/**
 * Get the current provider type
 */
export function getProviderType(): "hcpt" | "fetch" | null {
  return cachedProviderType;
}

/**
 * Reset the cached provider (useful for testing or when preferences change)
 */
export function resetProvider(): void {
  cachedProvider = null;
  cachedProviderType = null;
  providerInitializationAttempted = false;
}

/**
 * Execute a provider operation with automatic fallback to Fetch API on error
 */
async function executeWithFallback<T>(
  operation: (provider: TerraformProvider) => Promise<T>,
  operationName: string,
): Promise<T> {
  const provider = getProvider();

  try {
    return await operation(provider);
  } catch (error) {
    // If using hcpt and it fails, fallback to Fetch API
    if (cachedProviderType === "hcpt") {
      console.warn(`${operationName} failed with hcpt, falling back to Fetch API:`, error);

      showToast({
        style: Toast.Style.Warning,
        title: "hcpt failed, using Fetch API",
        message: "Check hcpt installation or disable in preferences",
      }).catch(() => {
        // Ignore toast errors
      });

      // Switch to Fetch Provider
      cachedProvider = new FetchProvider();
      cachedProviderType = "fetch";

      // Retry with Fetch Provider
      return await operation(cachedProvider);
    }

    // If already using Fetch API or fallback failed, throw the error
    throw error;
  }
}

// Adapter functions for workspace operations

export async function getWorkspacesBasic(
  org: string,
  searchName?: string,
  pageNumber?: number,
  pageSize?: number,
): Promise<{
  workspaces: Workspace[];
  totalCount: number;
  hasNextPage: boolean;
}> {
  return executeWithFallback(
    (provider) => provider.getWorkspacesBasic(org, searchName, pageNumber, pageSize),
    "getWorkspacesBasic",
  );
}

export async function getWorkspacesWithDetails(
  org: string,
  searchName?: string,
  pageNumber?: number,
  pageSize?: number,
): Promise<{
  workspaces: WorkspaceWithDetails[];
  totalCount: number;
  hasNextPage: boolean;
}> {
  return executeWithFallback(
    (provider) => provider.getWorkspacesWithDetails(org, searchName, pageNumber, pageSize),
    "getWorkspacesWithDetails",
  );
}

export async function getAllWorkspacesBasic(org: string, searchName?: string): Promise<Workspace[]> {
  return executeWithFallback((provider) => provider.getAllWorkspacesBasic(org, searchName), "getAllWorkspacesBasic");
}

export async function getAllWorkspacesWithDetails(org: string, searchName?: string): Promise<WorkspaceWithDetails[]> {
  return executeWithFallback(
    (provider) => provider.getAllWorkspacesWithDetails(org, searchName),
    "getAllWorkspacesWithDetails",
  );
}

export async function getWorkspace(org: string, workspaceName: string): Promise<Workspace> {
  return executeWithFallback((provider) => provider.getWorkspace(org, workspaceName), "getWorkspace");
}

export async function getRuns(
  workspaceId: string,
  pageNumber?: number,
  pageSize?: number,
): Promise<{
  runs: Run[];
  totalCount: number;
  hasNextPage: boolean;
}> {
  return executeWithFallback((provider) => provider.getRuns(workspaceId, pageNumber, pageSize), "getRuns");
}

/**
 * Get provider information
 */
export function getProviderInfo(): { name: "hcpt" | "fetch"; version?: string } | null {
  if (!cachedProvider) {
    return null;
  }
  return cachedProvider.getProviderInfo();
}
