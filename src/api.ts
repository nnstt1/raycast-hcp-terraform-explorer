import { getPreferenceValues } from "@raycast/api";
import {
  Preferences,
  TerraformApiResponse,
  Organization,
  Workspace,
  WorkspaceWithDetails,
  Run,
  AssessmentResult,
} from "./types";

const API_BASE_URL = "https://app.terraform.io/api/v2";

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

export async function getWorkspaces(
  organizationName: string,
  searchName?: string,
  pageNumber = 1,
  pageSize = 100,
): Promise<{
  workspaces: WorkspaceWithDetails[];
  totalCount: number;
  hasNextPage: boolean;
}> {
  let endpoint = `/organizations/${organizationName}/workspaces?page[number]=${pageNumber}&page[size]=${pageSize}&include=latest-run,current-assessment-result`;

  if (searchName) {
    endpoint += `&search[name]=${encodeURIComponent(searchName)}`;
  }

  const response = await fetchApi<TerraformApiResponse<Workspace[], Run | AssessmentResult>>(endpoint);

  // Map included items by ID for quick lookup
  const runsById = new Map<string, Run>();
  const assessmentsById = new Map<string, AssessmentResult>();
  if (response.included) {
    for (const item of response.included) {
      if (item.type === "runs") {
        runsById.set(item.id, item as Run);
      } else if (item.type === "assessment-results") {
        assessmentsById.set(item.id, item as AssessmentResult);
      }
    }
  }

  // Attach latest run and assessment result to each workspace
  const workspacesWithDetails: WorkspaceWithDetails[] = response.data.map((workspace) => {
    const latestRunRef = workspace.relationships["latest-run"]?.data;
    const latestRun = latestRunRef ? runsById.get(latestRunRef.id) : undefined;

    const assessmentRef = workspace.relationships["current-assessment-result"]?.data;
    const currentAssessmentResult = assessmentRef ? assessmentsById.get(assessmentRef.id) : undefined;

    return {
      ...workspace,
      latestRun,
      currentAssessmentResult,
    };
  });

  return {
    workspaces: workspacesWithDetails,
    totalCount: response.meta?.pagination?.["total-count"] ?? response.data.length,
    hasNextPage: response.meta?.pagination?.["next-page"] !== null,
  };
}

export async function getWorkspace(organizationName: string, workspaceName: string): Promise<Workspace> {
  const response = await fetchApi<TerraformApiResponse<Workspace>>(
    `/organizations/${organizationName}/workspaces/${workspaceName}`,
  );
  return response.data;
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
  const endpoint = `/workspaces/${workspaceId}/runs?page[number]=${pageNumber}&page[size]=${pageSize}`;
  const response = await fetchApi<TerraformApiResponse<Run[]>>(endpoint);

  return {
    runs: response.data,
    totalCount: response.meta?.pagination?.["total-count"] ?? response.data.length,
    hasNextPage: response.meta?.pagination?.["next-page"] !== null,
  };
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
