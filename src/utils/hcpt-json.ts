import { Workspace, WorkspaceWithDetails, Run, RunStatus } from "../types";

/**
 * hcpt CLI JSON output format (snake_case, flat structure)
 */
export interface HcptWorkspace {
  name: string;
  id: string;
  terraform_version: string;
  current_run_status?: string;
  latest_run_status?: string;
  project_name?: string;
  updated_at: string;
  created_at?: string;
  locked?: boolean;
  auto_apply?: boolean;
  execution_mode?: string;
  working_directory?: string | null;
  resource_count?: number;
  description?: string | null;
  tag_names?: string[];
  vcs_repo_identifier?: string | null;
  vcs_repo_branch?: string | null;
  vcs_repo_display_identifier?: string | null;
}

export interface HcptRun {
  id: string;
  created_at: string;
  status: string;
  message?: string;
  source?: string;
  trigger_reason?: string;
  has_changes?: boolean;
  is_destroy?: boolean;
  plan_resource_additions?: number;
  plan_resource_changes?: number;
  plan_resource_destructions?: number;
}

/**
 * Convert hcpt workspace JSON to HCP Terraform API format
 */
export function transformHcptWorkspacesToApi(hcptData: HcptWorkspace[]): Workspace[] {
  return hcptData.map((ws) => ({
    id: ws.id,
    type: "workspaces" as const,
    attributes: {
      name: ws.name,
      "terraform-version": ws.terraform_version,
      "updated-at": ws.updated_at,
      "created-at": ws.created_at || ws.updated_at,
      description: ws.description || null,
      "auto-apply": ws.auto_apply || false,
      environment: "default",
      locked: ws.locked || false,
      "resource-count": ws.resource_count || 0,
      "working-directory": ws.working_directory || null,
      "vcs-repo": ws.vcs_repo_identifier
        ? {
            branch: ws.vcs_repo_branch || "main",
            "ingress-submodules": false,
            identifier: ws.vcs_repo_identifier,
            "display-identifier": ws.vcs_repo_display_identifier || ws.vcs_repo_identifier,
            "oauth-token-id": "",
            "webhook-url": "",
            "repository-http-url": "",
            "service-provider": "github",
          }
        : null,
      permissions: {
        "can-update": false,
        "can-destroy": false,
        "can-queue-run": false,
        "can-read-variable": false,
        "can-update-variable": false,
        "can-read-state-versions": false,
        "can-read-state-outputs": false,
        "can-create-state-versions": false,
        "can-queue-apply": false,
        "can-lock": false,
        "can-unlock": false,
        "can-force-unlock": false,
        "can-read-settings": false,
        "can-manage-tags": false,
        "can-manage-run-tasks": false,
        "can-manage-assessments": false,
        "can-read-assessment-results": false,
        "can-queue-destroy": false,
      },
      "execution-mode": (ws.execution_mode as "remote" | "local" | "agent") || "remote",
      source: "",
      "source-name": null,
      "source-url": null,
      "tag-names": ws.tag_names || [],
      "latest-change-at": ws.updated_at,
    },
    relationships: {
      organization: {
        data: { id: "", type: "organizations" },
      },
      "current-run": ws.current_run_status
        ? {
            data: { id: "", type: "runs" },
          }
        : undefined,
      "latest-run": ws.latest_run_status
        ? {
            data: { id: "", type: "runs" },
          }
        : undefined,
    },
    links: {
      self: "",
      "self-html": `https://app.terraform.io/app/${ws.project_name || "unknown"}/workspaces/${ws.name}`,
    },
  }));
}

/**
 * Convert hcpt workspace JSON with details to HCP Terraform API format
 */
export function transformHcptWorkspacesWithDetailsToApi(hcptData: HcptWorkspace[]): WorkspaceWithDetails[] {
  const workspaces = transformHcptWorkspacesToApi(hcptData);

  return workspaces.map((ws, index) => {
    const hcptWs = hcptData[index];

    // Create a Run object if latest run status is available
    let latestRun: Run | undefined;
    if (hcptWs.latest_run_status) {
      latestRun = {
        id: "",
        type: "runs",
        attributes: {
          "created-at": hcptWs.updated_at,
          "has-changes": false,
          "is-destroy": false,
          message: "",
          source: "",
          status: normalizeRunStatus(hcptWs.latest_run_status),
          "status-timestamps": {},
          "trigger-reason": "unknown",
        },
        relationships: {
          workspace: {
            data: { id: ws.id, type: "workspaces" },
          },
        },
        links: {
          self: "",
        },
      };
    }

    return {
      ...ws,
      latestRun,
      currentAssessmentResult: undefined, // hcpt doesn't provide this yet
    };
  });
}

/**
 * Convert hcpt run JSON to HCP Terraform API format
 */
export function transformHcptRunsToApi(hcptData: HcptRun[]): Run[] {
  return hcptData.map((run) => ({
    id: run.id,
    type: "runs" as const,
    attributes: {
      "created-at": run.created_at,
      "has-changes": run.has_changes || false,
      "is-destroy": run.is_destroy || false,
      message: run.message || "",
      source: run.source || "",
      status: normalizeRunStatus(run.status),
      "status-timestamps": {},
      "trigger-reason": run.trigger_reason || "unknown",
      "plan-resource-additions": run.plan_resource_additions,
      "plan-resource-changes": run.plan_resource_changes,
      "plan-resource-destructions": run.plan_resource_destructions,
    },
    relationships: {
      workspace: {
        data: { id: "", type: "workspaces" },
      },
    },
    links: {
      self: "",
    },
  }));
}

/**
 * Normalize run status from hcpt to HCP Terraform API format
 */
function normalizeRunStatus(status: string): RunStatus {
  const statusMap: Record<string, RunStatus> = {
    pending: "pending",
    fetching: "fetching",
    fetching_completed: "fetching_completed",
    pre_plan_running: "pre_plan_running",
    pre_plan_completed: "pre_plan_completed",
    queuing: "queuing",
    plan_queued: "plan_queued",
    planning: "planning",
    planned: "planned",
    cost_estimating: "cost_estimating",
    cost_estimated: "cost_estimated",
    policy_checking: "policy_checking",
    policy_override: "policy_override",
    policy_soft_failed: "policy_soft_failed",
    policy_checked: "policy_checked",
    confirmed: "confirmed",
    post_plan_running: "post_plan_running",
    post_plan_completed: "post_plan_completed",
    apply_queued: "apply_queued",
    applying: "applying",
    applied: "applied",
    discarded: "discarded",
    errored: "errored",
    canceled: "canceled",
    force_canceled: "force_canceled",
    planned_and_finished: "planned_and_finished",
    planned_and_saved: "planned_and_saved",
  };

  return statusMap[status] || ("errored" as RunStatus);
}
