import { Workspace, WorkspaceWithDetails, Run } from "../types";

/**
 * Provider interface for HCP Terraform API access
 * Implementations: HcptProvider (CLI-based), FetchProvider (direct API)
 */
export interface TerraformProvider {
  /**
   * Get workspaces without details (fast, for initial display)
   * @param org Organization name
   * @param searchName Optional search term for workspace name
   * @param pageNumber Page number (default: 1)
   * @param pageSize Page size (default: 100)
   */
  getWorkspacesBasic(
    org: string,
    searchName?: string,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<{
    workspaces: Workspace[];
    totalCount: number;
    hasNextPage: boolean;
  }>;

  /**
   * Get workspaces with details (slower, includes run status and drift info)
   * @param org Organization name
   * @param searchName Optional search term for workspace name
   * @param pageNumber Page number (default: 1)
   * @param pageSize Page size (default: 100)
   */
  getWorkspacesWithDetails(
    org: string,
    searchName?: string,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<{
    workspaces: WorkspaceWithDetails[];
    totalCount: number;
    hasNextPage: boolean;
  }>;

  /**
   * Get all workspaces without details (fetches all pages)
   * @param org Organization name
   * @param searchName Optional search term for workspace name
   */
  getAllWorkspacesBasic(org: string, searchName?: string): Promise<Workspace[]>;

  /**
   * Get all workspaces with details (fetches all pages)
   * @param org Organization name
   * @param searchName Optional search term for workspace name
   */
  getAllWorkspacesWithDetails(org: string, searchName?: string): Promise<WorkspaceWithDetails[]>;

  /**
   * Get a single workspace by name
   * @param org Organization name
   * @param workspaceName Workspace name
   */
  getWorkspace(org: string, workspaceName: string): Promise<Workspace>;

  /**
   * Get runs for a workspace
   * @param workspaceId Workspace ID
   * @param pageNumber Page number (default: 1)
   * @param pageSize Page size (default: 10)
   */
  getRuns(
    workspaceId: string,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<{
    runs: Run[];
    totalCount: number;
    hasNextPage: boolean;
  }>;

  /**
   * Get provider information
   * @returns Provider name and version
   */
  getProviderInfo(): { name: "hcpt" | "fetch"; version?: string };
}
