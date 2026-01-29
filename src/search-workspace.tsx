import { Action, ActionPanel, Color, getPreferenceValues, Icon, List, showToast, Toast } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useState } from "react";
import { getOrganizations, getWorkspaces, getWorkspaceUrl } from "./api";
import { Preferences, WorkspaceWithDetails, RunStatus } from "./types";

function getRunStatusColor(status?: RunStatus): Color {
  if (!status) return Color.SecondaryText;

  switch (status) {
    case "applied":
    case "planned_and_finished":
      return Color.Green;
    case "planning":
    case "applying":
    case "pending":
    case "queuing":
    case "plan_queued":
    case "apply_queued":
      return Color.Blue;
    case "errored":
    case "force_canceled":
      return Color.Red;
    case "canceled":
    case "discarded":
      return Color.Orange;
    case "planned":
    case "planned_and_saved":
    case "policy_checked":
    case "cost_estimated":
      return Color.Yellow;
    default:
      return Color.SecondaryText;
  }
}

function getRunStatusIcon(status?: RunStatus): Icon {
  if (!status) return Icon.Circle;

  switch (status) {
    case "applied":
    case "planned_and_finished":
      return Icon.CheckCircle;
    case "planning":
    case "applying":
    case "pending":
    case "queuing":
    case "plan_queued":
    case "apply_queued":
      return Icon.CircleProgress;
    case "errored":
    case "force_canceled":
      return Icon.XMarkCircle;
    case "canceled":
    case "discarded":
      return Icon.MinusCircle;
    case "planned":
    case "planned_and_saved":
    case "policy_checked":
    case "cost_estimated":
      return Icon.ExclamationMark;
    default:
      return Icon.Circle;
  }
}

function getRunStatusLabel(status?: RunStatus): string {
  if (!status) return "No runs";

  const labels: Record<RunStatus, string> = {
    pending: "Pending",
    fetching: "Fetching",
    fetching_completed: "Fetching Completed",
    pre_plan_running: "Pre-plan Running",
    pre_plan_completed: "Pre-plan Completed",
    queuing: "Queuing",
    plan_queued: "Plan Queued",
    planning: "Planning",
    planned: "Planned",
    cost_estimating: "Cost Estimating",
    cost_estimated: "Cost Estimated",
    policy_checking: "Policy Checking",
    policy_override: "Policy Override",
    policy_soft_failed: "Policy Soft Failed",
    policy_checked: "Policy Checked",
    confirmed: "Confirmed",
    post_plan_running: "Post-plan Running",
    post_plan_completed: "Post-plan Completed",
    apply_queued: "Apply Queued",
    applying: "Applying",
    applied: "Applied",
    discarded: "Discarded",
    errored: "Errored",
    canceled: "Canceled",
    force_canceled: "Force Canceled",
    planned_and_finished: "Planned and Finished",
    planned_and_saved: "Planned and Saved",
  };

  return labels[status] || status;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type DriftStatus = "drifted" | "no-drift" | "unavailable";

function getDriftStatus(workspace: WorkspaceWithDetails): DriftStatus {
  // Use Health Assessments API to detect drift
  const assessment = workspace.currentAssessmentResult;

  // No assessment result means Health Assessments is not available (Free plan)
  if (!assessment) return "unavailable";

  // Assessment failed
  if (!assessment.attributes.succeeded) return "unavailable";

  return assessment.attributes.drifted ? "drifted" : "no-drift";
}

type DriftFilter = "all" | "drifted";

export default function SearchWorkspace() {
  const preferences = getPreferenceValues<Preferences>();
  const [searchText, setSearchText] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<string>(preferences.organization || "");
  const [driftFilter, setDriftFilter] = useState<DriftFilter>("all");

  const {
    data: organizations,
    isLoading: isLoadingOrgs,
    error: orgsError,
  } = useCachedPromise(async () => {
    return await getOrganizations();
  });

  const {
    data: workspacesData,
    isLoading: isLoadingWorkspaces,
    error: workspacesError,
  } = useCachedPromise(
    async (org: string, search: string) => {
      if (!org) return { workspaces: [], totalCount: 0, hasNextPage: false };
      return await getWorkspaces(org, search || undefined);
    },
    [selectedOrg, searchText],
    {
      keepPreviousData: true,
    },
  );

  if (orgsError || workspacesError) {
    const error = orgsError || workspacesError;
    showToast({
      style: Toast.Style.Failure,
      title: "Error",
      message: error?.message || "Failed to fetch data",
    });
  }

  // Set default organization when organizations are loaded
  if (organizations && organizations.length > 0 && !selectedOrg) {
    setSelectedOrg(organizations[0].attributes.name);
  }

  // Filter workspaces by drift status
  const filteredWorkspaces = workspacesData?.workspaces.filter((workspace) => {
    if (driftFilter === "all") return true;
    return getDriftStatus(workspace) === "drifted";
  });

  return (
    <List
      isLoading={isLoadingOrgs || isLoadingWorkspaces}
      searchBarPlaceholder="Search workspaces by name..."
      onSearchTextChange={setSearchText}
      throttle
      navigationTitle={driftFilter === "drifted" ? "Drifted Workspaces" : undefined}
      searchBarAccessory={
        <List.Dropdown tooltip="Select Organization" value={selectedOrg} onChange={setSelectedOrg}>
          {organizations?.map((org) => (
            <List.Dropdown.Item key={org.id} title={org.attributes.name} value={org.attributes.name} />
          ))}
        </List.Dropdown>
      }
    >
      {filteredWorkspaces?.map((workspace) => {
        const latestRunStatus = workspace.latestRun?.attributes.status;
        const driftStatus = getDriftStatus(workspace);

        const getDriftAccessory = () => {
          switch (driftStatus) {
            case "drifted":
              return {
                icon: { source: Icon.Warning, tintColor: Color.Orange },
                tooltip: "Drift Detected",
              };
            case "no-drift":
              return {
                icon: { source: Icon.CheckCircle, tintColor: Color.Green },
                tooltip: "No Drift",
              };
            case "unavailable":
              return {
                icon: { source: Icon.QuestionMarkCircle, tintColor: Color.SecondaryText },
                tooltip: "Drift Detection Unavailable (requires Standard/Premium plan)",
              };
          }
        };

        return (
          <List.Item
            key={workspace.id}
            title={workspace.attributes.name}
            subtitle={workspace.attributes.description || undefined}
            accessories={[
              {
                icon: {
                  source: getRunStatusIcon(latestRunStatus),
                  tintColor: getRunStatusColor(latestRunStatus),
                },
                text: getRunStatusLabel(latestRunStatus),
                tooltip: "Latest Run Status",
              },
              {
                text: formatDate(workspace.attributes["latest-change-at"]),
                tooltip: "Last Changed",
              },
              getDriftAccessory(),
            ]}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action.OpenInBrowser
                    title="Open in Browser"
                    url={getWorkspaceUrl(selectedOrg, workspace.attributes.name)}
                    icon={Icon.Globe}
                  />
                  <Action.CopyToClipboard
                    title="Copy Workspace Name"
                    content={workspace.attributes.name}
                    icon={Icon.Clipboard}
                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                  />
                  <Action.CopyToClipboard
                    title="Copy Workspace URL"
                    content={getWorkspaceUrl(selectedOrg, workspace.attributes.name)}
                    icon={Icon.Link}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                  />
                </ActionPanel.Section>
                <ActionPanel.Section title="Filter">
                  {driftFilter === "all" ? (
                    <Action
                      title="Show Drifted Only"
                      icon={Icon.Filter}
                      shortcut={{ modifiers: ["cmd", "shift"], key: "f" }}
                      onAction={() => setDriftFilter("drifted")}
                    />
                  ) : (
                    <Action
                      title="Show All Workspaces"
                      icon={Icon.List}
                      shortcut={{ modifiers: ["cmd", "shift"], key: "f" }}
                      onAction={() => setDriftFilter("all")}
                    />
                  )}
                </ActionPanel.Section>
              </ActionPanel>
            }
            detail={
              <List.Item.Detail
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="Name" text={workspace.attributes.name} />
                    <List.Item.Detail.Metadata.Label
                      title="Description"
                      text={workspace.attributes.description || "No description"}
                    />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label
                      title="Latest Run Status"
                      text={getRunStatusLabel(latestRunStatus)}
                      icon={{
                        source: getRunStatusIcon(latestRunStatus),
                        tintColor: getRunStatusColor(latestRunStatus),
                      }}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="Drift"
                      text={driftStatus === "drifted" ? "Detected" : driftStatus === "no-drift" ? "No Drift" : "N/A"}
                      icon={
                        driftStatus === "drifted"
                          ? { source: Icon.Warning, tintColor: Color.Orange }
                          : driftStatus === "no-drift"
                            ? { source: Icon.CheckCircle, tintColor: Color.Green }
                            : { source: Icon.QuestionMarkCircle, tintColor: Color.SecondaryText }
                      }
                    />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label
                      title="Terraform Version"
                      text={workspace.attributes["terraform-version"]}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="Working Directory"
                      text={workspace.attributes["working-directory"] || "/"}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="Execution Mode"
                      text={workspace.attributes["execution-mode"]}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="Auto Apply"
                      text={workspace.attributes["auto-apply"] ? "Yes" : "No"}
                    />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label
                      title="Resource Count"
                      text={String(workspace.attributes["resource-count"])}
                    />
                    <List.Item.Detail.Metadata.Label title="Locked" text={workspace.attributes.locked ? "Yes" : "No"} />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label
                      title="Created"
                      text={formatDate(workspace.attributes["created-at"])}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="Last Changed"
                      text={formatDate(workspace.attributes["latest-change-at"])}
                    />
                    {workspace.attributes["vcs-repo"] && (
                      <>
                        <List.Item.Detail.Metadata.Separator />
                        <List.Item.Detail.Metadata.Label
                          title="VCS Repository"
                          text={workspace.attributes["vcs-repo"]["display-identifier"]}
                        />
                        <List.Item.Detail.Metadata.Label
                          title="VCS Branch"
                          text={workspace.attributes["vcs-repo"].branch}
                        />
                      </>
                    )}
                    {workspace.attributes["tag-names"].length > 0 && (
                      <>
                        <List.Item.Detail.Metadata.Separator />
                        <List.Item.Detail.Metadata.TagList title="Tags">
                          {workspace.attributes["tag-names"].map((tag) => (
                            <List.Item.Detail.Metadata.TagList.Item key={tag} text={tag} color={Color.Blue} />
                          ))}
                        </List.Item.Detail.Metadata.TagList>
                      </>
                    )}
                  </List.Item.Detail.Metadata>
                }
              />
            }
          />
        );
      })}
      {filteredWorkspaces?.length === 0 && !isLoadingWorkspaces && (
        <List.EmptyView
          title={driftFilter === "drifted" ? "No Drifted Workspaces" : "No Workspaces Found"}
          description={
            driftFilter === "drifted"
              ? "No workspaces with drift detected. Press Cmd+Shift+F to show all."
              : searchText
                ? `No workspaces matching "${searchText}"`
                : "No workspaces in this organization. Check your organization name in preferences."
          }
          icon={driftFilter === "drifted" ? Icon.CheckCircle : Icon.MagnifyingGlass}
          actions={
            driftFilter === "drifted" ? (
              <ActionPanel>
                <Action
                  title="Show All Workspaces"
                  icon={Icon.List}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "f" }}
                  onAction={() => setDriftFilter("all")}
                />
              </ActionPanel>
            ) : undefined
          }
        />
      )}
    </List>
  );
}
