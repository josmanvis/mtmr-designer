# Changelog

## [Unreleased: 0.0.1] — 2026-10-25

### Repository history security
- Redact exposed credential values from reachable history on maintained branches and tags.
- Exact-value verification passed locally before publication; remote refs/protection restoration are recorded in the private audit. Provider revocation and GitHub-owned cached/PR refs are tracked separately.


### Fixed
- Clear bundled API keys from weather preset JSON files, including copied upstream presets.
- Weather presets require users to configure their own API key before use.

### Verification
- Originally valid JSON remains parseable; nonstandard upstream preset syntax is preserved by literal substitution. No Swift/macOS application build or Linux runtime check was performed.
- Provider-side revocation/rotation and historical removal remain pending.

Current package version: `0.0.0`. No past releases have been reconstructed.
