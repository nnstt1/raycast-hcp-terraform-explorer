# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

- **Optional hcpt CLI integration** for improved performance
  - Automatically detects and uses hcpt CLI tool if available
  - 2-3x faster workspace queries with built-in caching
  - Reduced API rate limit consumption
  - Automatic fallback to direct API access if hcpt fails or is unavailable
- New preference setting: "Use hcpt CLI" (enabled by default)
- New preference setting: "Enable Plan Trigger" (experimental, requires hcpt v1.1+)
- Toast notifications for provider status (hcpt detected, fallback to API, etc.)

### Changed

- Refactored API layer to support multiple providers (hcpt CLI and direct API)
- Improved error handling with automatic fallback mechanism

### Performance

- Workspace list operations are significantly faster when using hcpt CLI
- Reduced number of API calls through hcpt's built-in caching

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
