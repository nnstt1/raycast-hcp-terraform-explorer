import { getPreferenceValues } from "@raycast/api";
import { Preferences, TerraformApiResponse, Organization, Workspace, WorkspaceWithDetails, Run } from "./types";
import { FetchProvider } from "./api/fetch-provider";

const API_BASE_URL = "https://app.terraform.io/api/v2";

// Create a singleton instance of FetchProvider for backward compatibility
const fetchProvider = new FetchProvider();

function getHeaders(): HeadersInit {
  const preferences = getPreferenceValues<Preferences>();
  return {
    Authorization: `Bearer ${preferences.apiToken}`,
    "Content-Type": "application/vnd.api+json",
  };
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json() as Promise<T>;
}

export async function getOrganizations(): Promise<Organization[]> {
  const response = await fetchApi<TerraformApiResponse<Organization[]>>("/organizations");
  return response.data;
}

// Delegate to FetchProvider for workspace-related operations
export async function getWorkspacesBasic(
  organizationName: string,
  searchName?: string,
  pageNumber = 1,
  pageSize = 100,
): Promise<{
  workspaces: Workspace[];
  totalCount: number;
  hasNextPage: boolean;
}> {
  return fetchProvider.getWorkspacesBasic(organizationName, searchName, pageNumber, pageSize);
}

export async function getWorkspacesWithDetails(
  organizationName: string,
  searchName?: string,
  pageNumber = 1,
  pageSize = 100,
): Promise<{
  workspaces: WorkspaceWithDetails[];
  totalCount: number;
  hasNextPage: boolean;
}> {
  return fetchProvider.getWorkspacesWithDetails(organizationName, searchName, pageNumber, pageSize);
}

export async function getAllWorkspacesBasic(organizationName: string, searchName?: string): Promise<Workspace[]> {
  return fetchProvider.getAllWorkspacesBasic(organizationName, searchName);
}

export async function getAllWorkspacesWithDetails(
  organizationName: string,
  searchName?: string,
): Promise<WorkspaceWithDetails[]> {
  return fetchProvider.getAllWorkspacesWithDetails(organizationName, searchName);
}

export async function getWorkspace(organizationName: string, workspaceName: string): Promise<Workspace> {
  return fetchProvider.getWorkspace(organizationName, workspaceName);
}

export async function getRuns(
  workspaceId: string,
  pageNumber = 1,
  pageSize = 10,
): Promise<{
  runs: Run[];
  totalCount: number;
  hasNextPage: boolean;
}> {
  return fetchProvider.getRuns(workspaceId, pageNumber, pageSize);
}

export async function getRun(runId: string): Promise<Run> {
  const response = await fetchApi<TerraformApiResponse<Run>>(`/runs/${runId}`);
  return response.data;
}

export function getWorkspaceUrl(organizationName: string, workspaceName: string): string {
  return `https://app.terraform.io/app/${organizationName}/workspaces/${workspaceName}`;
}

export function getRunUrl(organizationName: string, workspaceName: string, runId: string): string {
  return `https://app.terraform.io/app/${organizationName}/workspaces/${workspaceName}/runs/${runId}`;
}

export function getOrganizationUrl(organizationName: string): string {
  return `https://app.terraform.io/app/${organizationName}`;
}
