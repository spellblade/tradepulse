## Summary
<!-- Provide a clear, one-sentence description of the change and its context -->

## Related Issues
Closes #N (or Fixes #N, Resolves #N)

## Type of Change
- [ ] Bug fix (non-breaking change resolving an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature that alters existing behaviors)
- [ ] Documentation update
- [ ] Refactoring (internal restructures with no interface modifications)

## Changes
| File Path | Description of Change |
| :--- | :--- |
| `src/...` | |
| `tests/...` | |

## Verification & Testing
<!-- Describe the tests you ran and output verification. Provide instructions to reproduce -->
1. Run command: `npm run lint` && `npm test` && `npm run build`
2. Expected output:

## Checklist
- [ ] Code follows the repository's coding and style guidelines (linter passes with 0 warnings or errors).
- [ ] Self-review completed — verified no debugging code, temporary logs, or print statements are left.
- [ ] Comprehensive comment-based help / JSDoc / Docstring blocks added for all new public functions.
- [ ] Unit and/or integration tests added for new logic.
- [ ] All automated tests pass cleanly in the local environment (e.g., `npm test` / `pytest` / `mvn test` / `cargo test`).
- [ ] No hardcoded configuration, file system paths, or secret credentials.
- [ ] Relevant documentation in `docs/` (such as `index.md`, `setup.md`, `architecture.md`, `usage.md`, `coding-standards.md`, or `security.md`) has been updated.
- [ ] `CHANGELOG.md` updated under `[Unreleased]` with relevant changes.
- [ ] `VERSION` bumped if preparing for a new release commit.
- [ ] Feature branch is fully rebased and up to date with `develop`.
