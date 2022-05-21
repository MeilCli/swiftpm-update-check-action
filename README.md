# swiftpm-update-check-action
[![CI-Master](https://github.com/MeilCli/swiftpm-update-check-action/actions/workflows/ci-master.yml/badge.svg)](https://github.com/MeilCli/swiftpm-update-check-action/actions/workflows/ci-master.yml)  
SwiftPM new package version check action for GitHub Actions.

## Required
This action must execute on macOS.

## Example
Slack notification example, using [8398a7/action-slack](https://github.com/8398a7/action-slack):

```yaml
name: Check Package

on: 
  schedule:
    - cron: '0 8 * * 5' # every friday AM 8:00
jobs:
  swiftpm:
    runs-on: macOS-latest
    steps:
    - uses: actions/checkout@v1
    - uses: MeilCli/swiftpm-update-check-action@v3
      id: outdated
    - uses: 8398a7/action-slack@v2
      if: steps.outdated.outputs.has_swiftpm_update != 'false'
      with:
        status: ${{ job.status }}
        text: ${{ steps.outdated.outputs.swiftpm_update_text }}
        author_name: GitHub Actions
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```
You can also pin to a [specific release](https://github.com/MeilCli/swiftpm-update-check-action/releases) version in the format `@v3.x.x`

## input
- `execute_directories`
  - optional
  - execute directories of npm outdated command
  - if multiple directories, write multiline

## output
- `has_swiftpm_update`
  - has new package version information
  - value: `true` or `false`
- `swiftpm_update_text`
  - new package version information text
- `swiftpm_update_json`
  - new package version information json

## Contributing
see [Contributing.md](./.github/CONTRIBUTING.md)

## License
[MIT License](LICENSE).
