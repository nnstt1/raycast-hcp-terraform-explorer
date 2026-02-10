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
| Use hcpt CLI | Use hcpt CLI if available for improved performance | No (default: enabled) |
| Enable Plan Trigger | Enable Terraform Plan trigger action (requires hcpt v1.1+) | No (default: disabled) |

## Performance Optimization (Optional)

For faster performance and additional features, you can optionally install the `hcpt` CLI tool:

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

### Benefits of using hcpt

- **Faster queries**: 2-3x faster workspace operations
- **Reduced API usage**: Built-in caching reduces API rate limit consumption
- **Future features**: Plan trigger, variables management, and improved drift detection (coming soon)

The extension will automatically detect and use `hcpt` if available. You can disable this behavior in Preferences if needed.

### Troubleshooting

**If hcpt is installed but not detected:**
1. Ensure hcpt is in your PATH: `which hcpt`
2. Verify the installation: `hcpt version`
3. Try restarting Raycast

**If hcpt is not working:**
- The extension will automatically fall back to direct API access
- Check your API token is set correctly in Preferences
- Check hcpt logs: `hcpt workspace list --org <your-org> --json`
- Disable "Use hcpt CLI" in Preferences to force using direct API access

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
