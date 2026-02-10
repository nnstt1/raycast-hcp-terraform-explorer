# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

- **hcpt CLI integration (required)** for improved performance
  - Automatically detects hcpt CLI tool on startup
  - 2-3x faster workspace queries with built-in caching
  - Reduced API rate limit consumption
  - Extension requires hcpt to be installed and available in PATH
- **High-speed drift detection with hcpt**
  - Uses Explorer API (`hcpt drift list`) instead of Assessment API
  - Significantly faster drift detection for organizations with many workspaces
  - Single API call retrieves drift status for all workspaces
- New preference setting: "Enable Plan Trigger" (experimental, requires hcpt v1.1+)
- Toast notifications for hcpt status

### Changed

- Refactored API layer to use hcpt CLI exclusively
- Removed Fetch API fallback (hcpt is now required)
- Drift detection now uses Explorer API via hcpt

### Performance

- Workspace list operations are significantly faster with hcpt CLI
- Reduced number of API calls through hcpt's built-in caching
- Drift detection is 10-100x faster with hcpt Explorer API (vs Assessment API)

### Requirements

- hcpt CLI v0.3.0 or later must be installed and available in PATH
- Installation: `brew install nnstt1/tap/hcpt` or `go install github.com/nnstt1/hcpt@latest`

## [Initial Release] - {PR_MERGE_DATE}

### Added

- Search workspaces by name across HCP Terraform organizations
- Switch between organizations using dropdown menu
- View latest run status for each workspace (Applied, Errored, Planning, etc.)
- Drift detection using Health Assessments API (Standard/Premium plans)
- Open workspaces directly in HCP Terraform web UI
- Copy workspace name and URL to clipboard
- Detail panel showing:
  - Terraform version
  - Working directory
  - Execution mode
  - Auto apply setting
  - Resource count
  - Lock status
  - VCS repository information
  - Tags
