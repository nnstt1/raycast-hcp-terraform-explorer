// HCP Terraform API Types

export interface Preferences {
  apiToken: string;
  organization?: string;
  preferHcpt?: boolean;
  enablePlanTrigger?: boolean;
}

export type RunStatus =
  | "pending"
  | "fetching"
  | "fetching_completed"
  | "pre_plan_running"
  | "pre_plan_completed"
  | "queuing"
  | "plan_queued"
  | "planning"
  | "planned"
  | "cost_estimating"
  | "cost_estimated"
  | "policy_checking"
  | "policy_override"
  | "policy_soft_failed"
  | "policy_checked"
  | "confirmed"
  | "post_plan_running"
  | "post_plan_completed"
  | "apply_queued"
  | "applying"
  | "applied"
  | "discarded"
  | "errored"
  | "canceled"
  | "force_canceled"
  | "planned_and_finished"
  | "planned_and_saved";

export interface TerraformApiResponse<T, I = unknown> {
  data: T;
  included?: I[];
  links?: {
    self?: string;
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  };
  meta?: {
    pagination?: {
      "current-page": number;
      "page-size": number;
      "prev-page": number | null;
      "next-page": number | null;
      "total-pages": number;
      "total-count": number;
    };
  };
}

export interface Organization {
  id: string;
  type: "organizations";
  attributes: {
    name: string;
    "external-id": string;
    "created-at": string;
    email: string;
    "collaborator-auth-policy": string;
    "cost-estimation-enabled": boolean;
    "plan-expired": boolean;
    "plan-expires-at": string | null;
    permissions: {
      "can-update": boolean;
      "can-destroy": boolean;
      "can-access-via-teams": boolean;
      "can-create-module": boolean;
      "can-create-team": boolean;
      "can-create-workspace": boolean;
      "can-manage-users": boolean;
      "can-manage-subscription": boolean;
      "can-manage-sso": boolean;
      "can-update-oauth": boolean;
      "can-update-sentinel": boolean;
      "can-update-ssh-keys": boolean;
      "can-update-api-token": boolean;
      "can-traverse": boolean;
      "can-start-trial": boolean;
      "can-update-agent-pools": boolean;
      "can-manage-tags": boolean;
      "can-manage-varsets": boolean;
      "can-read-varsets": boolean;
      "can-manage-public-providers": boolean;
      "can-create-provider": boolean;
      "can-manage-public-modules": boolean;
      "can-manage-custom-providers": boolean;
      "can-manage-run-tasks": boolean;
      "can-read-run-tasks": boolean;
    };
  };
  links: {
    self: string;
  };
}

export interface Workspace {
  id: string;
  type: "workspaces";
  attributes: {
    name: string;
    description: string | null;
    "auto-apply": boolean;
    "created-at": string;
    "updated-at": string;
    environment: string;
    locked: boolean;
    "resource-count": number;
    "terraform-version": string;
    "working-directory": string | null;
    "vcs-repo": {
      branch: string;
      "ingress-submodules": boolean;
      identifier: string;
      "display-identifier": string;
      "oauth-token-id": string;
      "webhook-url": string;
      "repository-http-url": string;
      "service-provider": string;
    } | null;
    permissions: {
      "can-update": boolean;
      "can-destroy": boolean;
      "can-queue-run": boolean;
      "can-read-variable": boolean;
      "can-update-variable": boolean;
      "can-read-state-versions": boolean;
      "can-read-state-outputs": boolean;
      "can-create-state-versions": boolean;
      "can-queue-apply": boolean;
      "can-lock": boolean;
      "can-unlock": boolean;
      "can-force-unlock": boolean;
      "can-read-settings": boolean;
      "can-manage-tags": boolean;
      "can-manage-run-tasks": boolean;
      "can-manage-assessments": boolean;
      "can-read-assessment-results": boolean;
      "can-queue-destroy": boolean;
    };
    "execution-mode": "remote" | "local" | "agent";
    source: string;
    "source-name": string | null;
    "source-url": string | null;
    "tag-names": string[];
    "latest-change-at": string;
  };
  relationships: {
    organization: {
      data: {
        id: string;
        type: "organizations";
      };
    };
    "current-run"?: {
      data: {
        id: string;
        type: "runs";
      } | null;
    };
    "latest-run"?: {
      data: {
        id: string;
        type: "runs";
      } | null;
    };
    "current-assessment-result"?: {
      data: {
        id: string;
        type: "assessment-results";
      } | null;
    };
  };
  links: {
    self: string;
    "self-html": string;
  };
}

export interface Run {
  id: string;
  type: "runs";
  attributes: {
    "created-at": string;
    "has-changes": boolean;
    "is-destroy": boolean;
    message: string;
    source: string;
    status: RunStatus;
    "status-timestamps": {
      "plan-queueable-at"?: string;
      "plan-queued-at"?: string;
      "planning-at"?: string;
      "planned-at"?: string;
      "apply-queued-at"?: string;
      "applying-at"?: string;
      "applied-at"?: string;
      "errored-at"?: string;
      "canceled-at"?: string;
      "discarded-at"?: string;
    };
    "trigger-reason": string;
    "plan-resource-additions"?: number;
    "plan-resource-changes"?: number;
    "plan-resource-destructions"?: number;
  };
  relationships: {
    workspace: {
      data: {
        id: string;
        type: "workspaces";
      };
    };
    "created-by"?: {
      data: {
        id: string;
        type: "users";
      } | null;
    };
  };
  links: {
    self: string;
  };
}

export interface AssessmentResult {
  id: string;
  type: "assessment-results";
  attributes: {
    drifted: boolean;
    succeeded: boolean;
    "error-msg": string | null;
    "created-at": string;
  };
}

// Extended Workspace with latest run and assessment data
export interface WorkspaceWithDetails extends Workspace {
  latestRun?: Run;
  currentAssessmentResult?: AssessmentResult;
}
