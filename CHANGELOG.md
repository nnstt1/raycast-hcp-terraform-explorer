# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
