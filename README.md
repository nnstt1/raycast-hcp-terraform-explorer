# HCP Terraform

Manage your HCP Terraform workspaces and monitor infrastructure drift from Raycast.

## Features

- **Search Workspaces**: Quickly find workspaces by name across your organizations
- **Organization Switching**: Switch between organizations using the dropdown menu
- **Latest Run Status**: View the current status of each workspace's latest run
- **Drift Detection**: Monitor infrastructure drift using Health Assessments (requires Standard/Premium plan)
- **Quick Actions**: Open workspaces directly in HCP Terraform web UI

## Setup

### Getting an API Token

1. Go to [HCP Terraform](https://app.terraform.io/)
2. Click your profile icon in the top right corner
3. Select **Account Settings**
4. Navigate to **Tokens** in the left sidebar
5. Click **Create an API token**
6. Give it a description (e.g., "Raycast Extension")
7. Copy the generated token

### Configuration

When you first run the extension, Raycast will prompt you to configure:

| Setting | Description | Required |
|---------|-------------|----------|
| API Token | Your HCP Terraform API token | Yes |
| Default Organization | Pre-select an organization on launch | No |
| hcpt CLI Path | Custom path to hcpt CLI binary (leave empty for automatic detection) | No |
| Enable Plan Trigger | Enable Terraform Plan trigger action (requires hcpt v1.1+) | No (default: disabled) |

## Requirements

This extension requires the `hcpt` CLI tool to be installed:

### Installation

**Using Homebrew (macOS/Linux):**
```bash
brew install nnstt1/tap/hcpt
```

**Using Go:**
```bash
go install github.com/nnstt1/hcpt@latest
```

**Manual Download:**

Download the latest release from [GitHub Releases](https://github.com/nnstt1/hcpt/releases)

### Features

- **Faster queries**: 2-3x faster workspace operations
- **Reduced API usage**: Built-in caching reduces API rate limit consumption
- **High-speed drift detection**: Uses Explorer API instead of Assessment API for significantly faster drift detection on large workspaces
- **Future features**: Plan trigger, variables management (coming soon)

> **Note**: Drift detection with hcpt requires the `drift list` command, which uses the Explorer API. This is much faster than the standard Assessment API, especially for organizations with many workspaces.

### Troubleshooting

**If hcpt is installed but not detected:**
1. Find the hcpt path: `which hcpt`
2. Set the path in Raycast Preferences → Extensions → HCP Terraform → "hcpt CLI Path"
3. Example: `/Users/your-username/Workspace/go/bin/hcpt`
4. Try restarting Raycast

**If hcpt is not working:**
- Check your API token is set correctly in Preferences
- Check hcpt logs: `hcpt workspace list --org <your-org> --json`
- Verify hcpt can access the HCP Terraform API: `hcpt workspace list --org <your-org>`

**Common PATH locations checked:**
- `/usr/local/bin/hcpt` (Homebrew Intel Mac)
- `/opt/homebrew/bin/hcpt` (Homebrew Apple Silicon Mac)
- `~/go/bin/hcpt` (Go install)
- Any location in your `$PATH`

## Commands

### Search Workspaces

Search and browse workspaces in your HCP Terraform organizations.

**Displayed Information:**
- Workspace name and description
- Latest run status (Applied, Errored, Planning, etc.)
- Last changed timestamp
- Drift detection status

**Actions:**
- `Enter` - Open workspace in browser
- `Cmd + C` - Copy workspace name
- `Cmd + Shift + C` - Copy workspace URL

**Detail Panel:**
- Terraform version
- Working directory
- Execution mode
- Auto apply setting
- Resource count
- Lock status
- VCS repository information
- Tags

## Drift Detection

This extension uses HCP Terraform's Health Assessments API to detect infrastructure drift.

| Icon | Status | Description |
|------|--------|-------------|
| Green checkmark | No Drift | Infrastructure matches configuration |
| Orange warning | Drifted | Infrastructure has drifted from configuration |
| Gray question mark | N/A | Drift detection unavailable (Free plan or not configured) |

> **Note**: Health Assessments require HCP Terraform Standard or Premium plan.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Lint code
npm run lint

# Fix lint issues
npm run fix-lint

# Build for production
npm run build
```

## API Reference

This extension uses the [HCP Terraform API](https://developer.hashicorp.com/terraform/cloud-docs/api-docs).

## License

MIT License - see [LICENSE](LICENSE) for details.
