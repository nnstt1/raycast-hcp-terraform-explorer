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
