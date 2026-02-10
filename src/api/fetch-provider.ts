import { getPreferenceValues } from "@raycast/api";
import { Preferences, TerraformApiResponse, Workspace, WorkspaceWithDetails, Run, AssessmentResult } from "../types";
import { TerraformProvider } from "./types";

const API_BASE_URL = "https://app.terraform.io/api/v2";

/**
 * FetchProvider implements TerraformProvider using direct HTTP API calls
 * This is the default provider and works without any external dependencies
 */
export class FetchProvider implements TerraformProvider {
  private getHeaders(): HeadersInit {
    const preferences = getPreferenceValues<Preferences>();
    return {
      Authorization: `Bearer ${preferences.apiToken}`,
      "Content-Type": "application/vnd.api+json",
    };
  }

  private async fetchApi<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  async getWorkspacesBasic(
    organizationName: string,
    searchName?: string,
    pageNumber = 1,
    pageSize = 100,
  ): Promise<{
    workspaces: Workspace[];
    totalCount: number;
    hasNextPage: boolean;
  }> {
    let endpoint = `/organizations/${organizationName}/workspaces?page[number]=${pageNumber}&page[size]=${pageSize}`;

    if (searchName) {
      endpoint += `&search[name]=${encodeURIComponent(searchName)}`;
    }

    const response = await this.fetchApi<TerraformApiResponse<Workspace[]>>(endpoint);

    return {
      workspaces: response.data,
      totalCount: response.meta?.pagination?.["total-count"] ?? response.data.length,
      hasNextPage: response.meta?.pagination?.["next-page"] !== null,
    };
  }

  async getWorkspacesWithDetails(
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

    const response = await this.fetchApi<TerraformApiResponse<Workspace[], Run | AssessmentResult>>(endpoint);

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

  async getAllWorkspacesBasic(organizationName: string, searchName?: string): Promise<Workspace[]> {
    const allWorkspaces: Workspace[] = [];
    let pageNumber = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await this.getWorkspacesBasic(organizationName, searchName, pageNumber);
      allWorkspaces.push(...result.workspaces);
      hasMore = result.hasNextPage;
      pageNumber++;
    }

    return allWorkspaces;
  }

  async getAllWorkspacesWithDetails(organizationName: string, searchName?: string): Promise<WorkspaceWithDetails[]> {
    const allWorkspaces: WorkspaceWithDetails[] = [];
    let pageNumber = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await this.getWorkspacesWithDetails(organizationName, searchName, pageNumber);
      allWorkspaces.push(...result.workspaces);
      hasMore = result.hasNextPage;
      pageNumber++;
    }

    return allWorkspaces;
  }

  async getWorkspace(organizationName: string, workspaceName: string): Promise<Workspace> {
    const response = await this.fetchApi<TerraformApiResponse<Workspace>>(
      `/organizations/${organizationName}/workspaces/${workspaceName}`,
    );
    return response.data;
  }

  async getRuns(
    workspaceId: string,
    pageNumber = 1,
    pageSize = 10,
  ): Promise<{
    runs: Run[];
    totalCount: number;
    hasNextPage: boolean;
  }> {
    const endpoint = `/workspaces/${workspaceId}/runs?page[number]=${pageNumber}&page[size]=${pageSize}`;
    const response = await this.fetchApi<TerraformApiResponse<Run[]>>(endpoint);

    return {
      runs: response.data,
      totalCount: response.meta?.pagination?.["total-count"] ?? response.data.length,
      hasNextPage: response.meta?.pagination?.["next-page"] !== null,
    };
  }

  getProviderInfo() {
    return { name: "fetch" as const };
  }
}
