# Changelog

## [Unreleased: 0.0.1] — 2026-10-25

### Fixed
- Clear bundled API keys from weather preset JSON files, including copied upstream presets.
- Weather presets require users to configure their own API key before use.

### Verification
- Originally valid JSON remains parseable; nonstandard upstream preset syntax is preserved by literal substitution. No Swift/macOS application build or Linux runtime check was performed.
- Provider-side revocation/rotation and historical removal remain pending.

Current package version: `0.0.0`. No past releases have been reconstructed.
