import { execSync, exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
import { getPreferenceValues } from "@raycast/api";
import { Preferences, Workspace, WorkspaceWithDetails, Run } from "../types";
import {
  transformHcptWorkspacesToApi,
  transformHcptWorkspacesWithDetailsToApi,
  HcptWorkspace,
  HcptDriftResult,
} from "../utils/hcpt-json";
import { TerraformProvider } from "./types";

/**
 * HcptProvider implements TerraformProvider using hcpt CLI tool
 * This provider offers improved performance and additional features
 * when hcpt is installed on the system
 */
export class HcptProvider implements TerraformProvider {
  private hcptPath: string;

  constructor(hcptPath: string) {
    this.hcptPath = hcptPath;
  }

  private getEnv(): NodeJS.ProcessEnv {
    const preferences = getPreferenceValues<Preferences>();
    return {
      ...process.env,
      TFE_TOKEN: preferences.apiToken,
    };
  }

  private executeHcpt(command: string): string {
    try {
      return execSync(`${this.hcptPath} ${command}`, {
        encoding: "utf-8",
        timeout: 30000,
        env: this.getEnv(),
        stdio: ["ignore", "pipe", "pipe"], // Capture both stdout and stderr
      });
    } catch (error) {
      const err = error as { stderr?: Buffer; message?: string };
      const stderrMessage = err.stderr ? err.stderr.toString() : "";
      throw new Error(`hcpt command failed: ${stderrMessage || err.message || "Unknown error"}`);
    }
  }

  private async executeHcptAsync(command: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(`${this.hcptPath} ${command}`, {
        encoding: "utf-8",
        timeout: 30000,
        env: this.getEnv(),
      });
      if (stderr) {
        console.warn(`[hcpt] stderr: ${stderr}`);
      }
      return stdout;
    } catch (error) {
      const err = error as { stderr?: string; message?: string };
      const stderrMessage = err.stderr || "";
      throw new Error(`hcpt command failed: ${stderrMessage || err.message || "Unknown error"}`);
    }
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
    let command = `workspace list --org ${organizationName} --json`;

    if (searchName) {
      command += ` --search "${searchName}"`;
    }

    const output = await this.executeHcptAsync(command);
    const hcptData: HcptWorkspace[] = JSON.parse(output);

    // hcpt returns all results at once, so we need to implement pagination manually
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = hcptData.slice(startIndex, endIndex);

    const workspaces = transformHcptWorkspacesToApi(paginatedData);

    return {
      workspaces,
      totalCount: hcptData.length,
      hasNextPage: endIndex < hcptData.length,
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
    // Execute workspace list and drift list in parallel
    let command = `workspace list --org ${organizationName} --json`;
    if (searchName) {
      command += ` --search "${searchName}"`;
    }
    const driftCommand = `drift list --org ${organizationName} --all --json`;

    const [workspaceResult, driftResult] = await Promise.allSettled([
      this.executeHcptAsync(command),
      this.executeHcptAsync(driftCommand),
    ]);

    // Process workspace list result
    if (workspaceResult.status === "rejected") {
      throw new Error(`workspace list failed: ${workspaceResult.reason}`);
    }
    const hcptData: HcptWorkspace[] = JSON.parse(workspaceResult.value);

    // Process drift list result
    let driftMap: Map<string, HcptDriftResult> | undefined;
    if (driftResult.status === "fulfilled") {
      try {
        const driftData: HcptDriftResult[] = JSON.parse(driftResult.value);
        driftMap = new Map();
        for (const drift of driftData) {
          driftMap.set(drift.workspace, drift);
        }
      } catch (error) {
        console.warn("Failed to parse drift data:", error);
      }
    } else {
      console.warn("Failed to fetch drift information:", driftResult.reason);
    }

    // Manual pagination
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = hcptData.slice(startIndex, endIndex);

    const workspaces = transformHcptWorkspacesWithDetailsToApi(paginatedData, driftMap);

    return {
      workspaces,
      totalCount: hcptData.length,
      hasNextPage: endIndex < hcptData.length,
    };
  }

  async getAllWorkspacesBasic(organizationName: string, searchName?: string): Promise<Workspace[]> {
    let command = `workspace list --org ${organizationName} --json`;

    if (searchName) {
      command += ` --search "${searchName}"`;
    }

    const output = await this.executeHcptAsync(command);
    const hcptData: HcptWorkspace[] = JSON.parse(output);

    return transformHcptWorkspacesToApi(hcptData);
  }

  async getAllWorkspacesWithDetails(organizationName: string, searchName?: string): Promise<WorkspaceWithDetails[]> {
    // Execute workspace list and drift list in parallel for better performance
    let command = `workspace list --org ${organizationName} --json`;
    if (searchName) {
      command += ` --search "${searchName}"`;
    }
    const driftCommand = `drift list --org ${organizationName} --all --json`;

    // Execute both commands in parallel using async exec
    const [workspaceResult, driftResult] = await Promise.allSettled([
      this.executeHcptAsync(command),
      this.executeHcptAsync(driftCommand),
    ]);

    // Process workspace list result
    if (workspaceResult.status === "rejected") {
      throw new Error(`workspace list failed: ${workspaceResult.reason}`);
    }
    const hcptData: HcptWorkspace[] = JSON.parse(workspaceResult.value);

    // Process drift list result
    let driftMap: Map<string, HcptDriftResult> | undefined;
    if (driftResult.status === "fulfilled") {
      try {
        const driftData: HcptDriftResult[] = JSON.parse(driftResult.value);

        // Create a map for quick lookup by workspace name
        driftMap = new Map();
        for (const drift of driftData) {
          driftMap.set(drift.workspace, drift);
        }
      } catch (error) {
        console.warn("[hcpt-provider] Failed to parse drift data:", error);
      }
    } else {
      console.warn("[hcpt-provider] Failed to fetch drift information:", driftResult.reason);
    }

    return transformHcptWorkspacesWithDetailsToApi(hcptData, driftMap);
  }

  async getWorkspace(organizationName: string, workspaceName: string): Promise<Workspace> {
    // Use workspace list with search to find a specific workspace
    const command = `workspace list --org ${organizationName} --search "${workspaceName}" --json`;

    const output = await this.executeHcptAsync(command);
    const hcptData: HcptWorkspace[] = JSON.parse(output);

    // Find exact match
    const workspace = hcptData.find((ws) => ws.name === workspaceName);

    if (!workspace) {
      throw new Error(`Workspace not found: ${workspaceName}`);
    }

    const [transformedWorkspace] = transformHcptWorkspacesToApi([workspace]);
    return transformedWorkspace;
  }

  async getRuns(
    workspaceId: string,
    pageNumber?: number,
    pageSize?: number,
  ): Promise<{
    runs: Run[];
    totalCount: number;
    hasNextPage: boolean;
  }> {
    // Suppress unused variable warnings for unimplemented method
    void workspaceId;
    void pageNumber;
    void pageSize;

    // hcpt currently doesn't support workspace ID-based run queries
    // This would require additional API implementation in hcpt
    // For now, throw an error indicating this is not supported
    throw new Error(
      "getRuns is not yet supported by hcpt provider. " +
        "Please use the Fetch API provider for this operation. " +
        "You can disable 'Use hcpt CLI' in preferences to use the Fetch API provider.",
    );
  }

  getProviderInfo() {
    try {
      const version = this.executeHcpt("--version").trim();
      return { name: "hcpt" as const, version };
    } catch {
      return { name: "hcpt" as const };
    }
  }
}
