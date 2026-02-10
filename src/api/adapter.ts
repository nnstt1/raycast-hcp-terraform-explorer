import { showToast, Toast } from "@raycast/api";
import { detectHcpt } from "../utils/hcpt-detector";
import { HcptProvider } from "./hcpt-provider";
import { TerraformProvider } from "./types";
import { Workspace, WorkspaceWithDetails, Run } from "../types";

let cachedProvider: TerraformProvider | null = null;
let cachedProviderType: "hcpt" | null = null;
let providerInitializationAttempted = false;

/**
 * Get the hcpt provider (required)
 * Throws an error if hcpt is not available
 */
export function getProvider(): TerraformProvider {
  // Return cached provider if available
  if (cachedProvider) {
    return cachedProvider;
  }

  // Prevent multiple initialization attempts
  if (providerInitializationAttempted) {
    throw new Error("hcpt CLI is required but not available");
  }

  providerInitializationAttempted = true;

  const hcptInfo = detectHcpt();

  // hcpt is required
  if (!hcptInfo.available || !hcptInfo.path) {
    showToast({
      style: Toast.Style.Failure,
      title: "hcpt CLI not found",
      message: "Please install hcpt CLI to use this extension",
    }).catch(() => {
      // Ignore toast errors
    });
    throw new Error("hcpt CLI is required. Please install it from https://github.com/nnstt1/hcpt");
  }

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
    showToast({
      style: Toast.Style.Failure,
      title: "Failed to initialize hcpt",
      message: error instanceof Error ? error.message : "Unknown error",
    }).catch(() => {
      // Ignore toast errors
    });
    throw error;
  }
}

/**
 * Get the current provider type
 */
export function getProviderType(): "hcpt" | null {
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
 * Execute a provider operation
 */
async function executeOperation<T>(
  operation: (provider: TerraformProvider) => Promise<T>,
  operationName: string,
): Promise<T> {
  const provider = getProvider();

  try {
    return await operation(provider);
  } catch (error) {
    console.error(`${operationName} failed:`, error);
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
  return executeOperation(
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
  return executeOperation(
    (provider) => provider.getWorkspacesWithDetails(org, searchName, pageNumber, pageSize),
    "getWorkspacesWithDetails",
  );
}

export async function getAllWorkspacesBasic(org: string, searchName?: string): Promise<Workspace[]> {
  return executeOperation((provider) => provider.getAllWorkspacesBasic(org, searchName), "getAllWorkspacesBasic");
}

export async function getAllWorkspacesWithDetails(org: string, searchName?: string): Promise<WorkspaceWithDetails[]> {
  return executeOperation(
    (provider) => provider.getAllWorkspacesWithDetails(org, searchName),
    "getAllWorkspacesWithDetails",
  );
}

export async function getWorkspace(org: string, workspaceName: string): Promise<Workspace> {
  return executeOperation((provider) => provider.getWorkspace(org, workspaceName), "getWorkspace");
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
  return executeOperation((provider) => provider.getRuns(workspaceId, pageNumber, pageSize), "getRuns");
}

/**
 * Get provider information
 */
export function getProviderInfo(): { name: "hcpt"; version?: string } | null {
  if (!cachedProvider) {
    return null;
  }
  return cachedProvider.getProviderInfo();
}
