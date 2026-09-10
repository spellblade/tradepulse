# Universal Project Master Template & Repository Blueprint (v3.0)

This document defines the canonical, language-agnostic **Universal Repository Blueprint**. It serves as the single authoritative architectural standard for organizing, documenting, protecting, and releasing software across any tech stack.

New projects MUST follow this template. Existing repositories or projects with documented technical constraints may retain the legacy standards defined in `00_General_Master_Template.md` for backward compatibility, but any new repository should follow this modern blueprint unless a deviation is explicitly approved and documented via an Architecture Decision Record (ADR).

---

## Table of Contents
1. [1. Universal Repository Architecture](#1-universal-repository-architecture)
    * [1.1 Root-Level Artifacts](#11-root-level-artifacts)
    * [1.2 GitHub Standard Structure (.github/)](#12-github-standard-structure-github)
    * [1.3 Canonical Documentation Standard (docs/)](#13-canonical-documentation-standard-docs)
2. [2. Branching, Merging, and Promotion Workflow](#2-branching-merging-and-promotion-workflow)
    * [2.1 Branching Strategy (Gitflow)](#21-branching-strategy-gitflow)
    * [2.2 GitHub Branch Rulesets (Branch Protection)](#22-github-branch-rulesets-branch-protection)
    * [2.3 Merge and Promotion Rules](#23-merge-and-promotion-rules)
    * [2.4 Conflict Resolution Workflow for Branch Promotions](#24-conflict-resolution-workflow-for-branch-promotions)
    * [2.5 Issue Closing and Release Management](#25-issue-closing-and-release-management)
3. [3. Language & Ecosystem Specific Blueprints](#3-language--ecosystem-specific-blueprints)
    * [3.1 Python (FastAPI, Django, CLI, ML & Data)](#31-python-fastapi-django-cli-ml--data)
    * [3.2 TypeScript & JavaScript (Node.js, React, Next.js, Vue, Express, NestJS)](#32-typescript--javascript-nodejs-react-nextjs-vue-express-nestjs)
    * [3.3 Java (Spring Boot, Quarkus, Enterprise Libraries)](#33-java-spring-boot-quarkus-enterprise-libraries)
    * [3.4 Kotlin (Android, Multiplatform KMP, Ktor)](#34-kotlin-android-multiplatform-kmp-ktor)
    * [3.5 C++ (Modern C++17/20/23, Systems, High-Performance)](#35-c-modern-c172023-systems-high-performance)
    * [3.6 HTML / CSS / JS Static Projects (Vanilla, Jamstack, Docs)](#36-html--css--js-static-projects-vanilla-jamstack-docs)
4. [4. Universal Cross-Cutting Topics](#4-universal-cross-cutting-topics)
    * [4.1 Secrets Management & Security Hygiene](#41-secrets-management--security-hygiene)
    * [4.2 Production Containerization Standards](#42-production-containerization-standards)
    * [4.3 Dependency Automation (Dependabot)](#43-dependency-automation-dependabot)
    * [4.4 Third-Party & Unofficial APIs Integration](#44-third-party--unofficial-apis-integration)
5. [5. Universal Bootstrapping & Retrofitting Checklist](#5-universal-bootstrapping--retrofitting-checklist)
6. [6. Backward Compatibility & Legacy Notes](#6-backward-compatibility--legacy-notes)

---

## 1. Universal Repository Architecture

Every production-grade repository MUST adhere to this standardized top-level layout:

```text
<repository-root>/
├── .editorconfig                       # Cross-editor indentation, charset, newline standard
├── .env.example                        # Template for required environment variables (NO SECRETS)
├── .gitignore                          # Language/toolchain-specific artifact ignore rules
├── CHANGELOG.md                        # Human-readable release history (Keep a Changelog)
├── CONTRIBUTING.md                     # Community contribution guidelines & workflow
├── LICENSE                             # Open source or proprietary software license
├── README.md                           # Primary entry point: elevator pitch, badges, quickstart
├── SECURITY.md                         # Security policy and private vulnerability reporting SLA
├── VERSION                             # Single source of truth for semantic version (e.g. 1.0.0)
├── .github/                            # GitHub orchestration, templates, and CI/CD
│   ├── CODEOWNERS                      # Code ownership definition for automated PR reviews
│   ├── dependabot.yml                  # Automated dependency security scanning config
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md               # Standard bug report template
│   │   └── feature_request.md          # Standard feature request template
│   ├── PULL_REQUEST_TEMPLATE.md        # Pull request template with verification checklist
│   └── workflows/
│       ├── ci.yml                      # Build, lint, and test validation pipeline (with explicit permissions)
│       └── release.yml                 # Automated release tagging and artifact publishing
├── docs/                               # Developer and operator documentation
│   ├── index.md                        # Documentation navigation index
│   ├── architecture.md                 # System architecture, data flow, component design
│   ├── setup.md                        # Developer onboarding, tooling setup, local execution
│   ├── usage.md                        # User workflows, operational manuals, or API reference
│   ├── coding-standards.md             # Code style, lint rules, patterns, anti-patterns
│   ├── security.md                     # Local token handling, private disclosure SLA, & security boundaries
│   └── adr/                            # Architecture Decision Records directory
│       └── 0001-record-architecture-decisions.md
└── src/ (or app/, pkg/, cmd/)          # Source code root
```

---

### 1.1 Root-Level Artifacts

#### VERSION
The `VERSION` file MUST be a single-line text file containing only the SemVer string (e.g., `1.2.0`). This serves as the absolute single source of truth for the project version, preventing duplicate version definitions and allowing easy, programmatic parsing by shell scripts, Dockerfiles, and CI pipelines (e.g., `cat VERSION`).

#### README.md
The `README.md` is the primary entry point for human developers and AIs. It MUST include:
1. **Title & Badges**: Project name, version badge, build status, license, and primary language version.
2. **Elevator Pitch**: A concise 1–2 sentence summary explaining *what* the project does and *why* it exists.
3. **Problem Statement**: 2-3 sentences explaining the core problem the project solves and its target audience.
4. **Key Features**: A bulleted breakdown of high-impact features and capabilities.
5. **Quickstart / Getting Started**: Prerequisites and a copy-pasteable set of commands to build and run the project locally in under 3 minutes.
6. **Documentation Map**: Direct links to files within the `docs/` directory.
7. **Contribution & License**: Clear links to `CONTRIBUTING.md` and `LICENSE`.

##### Standard README.md Template:
```markdown
# Project Name

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](VERSION)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://github.com/OWNER/REPO/workflows/CI/badge.svg)](.github/workflows/ci.yml)

> One-sentence elevator pitch describing what this project does.

A concise 2-3 sentence paragraph explaining the business problem or technical need this project resolves, who the primary users are, and why this solution is superior.

## Features
- **Feature Title**: High-impact bulleted capability breakdown.
- **Feature Title**: High-impact bulleted capability breakdown.
- **Feature Title**: High-impact bulleted capability breakdown.

## Quick Start
### Prerequisites
- List required tools and minimum versions (e.g., Node.js v22+, Docker, etc.)

### Installation
```bash
git clone https://github.com/OWNER/REPO.git
cd REPO
# Copy template env file and configure local credentials
cp .env.example .env
# Project installation command (language-specific)
```

### Usage
```bash
# Basic run command to start the application
```

## Documentation Map
*   [Developer Setup Guide](docs/setup.md) — Tooling, package managers, and local execution troubleshooting.
*   [Architecture Design](docs/architecture.md) — System data flows, sequence diagrams, and design trade-offs.
*   [Usage Manual](docs/usage.md) — User workflows, CLI arguments, or API endpoint specifications.
*   [Coding Standards](docs/coding-standards.md) — Style guides, testing patterns, and prohibited idioms.
*   [Architecture Decisions (ADRs)](docs/adr/) — Records of major architectural selections.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for our branch model, branch protection rules, and commit style guidelines.

## License
MIT — see [LICENSE](LICENSE) for details.
```

#### CHANGELOG.md
The `CHANGELOG.md` MUST follow the **Keep a Changelog** and **Semantic Versioning (SemVer 2.0.0)** formats:
* **Unreleased Section**: Maintain an active, empty `## [Unreleased]` header at the top of the file to capture in-flight developments. Under it, provide empty placeholders for `### Added`, `### Changed`, and `### Fixed` so developers can easily log their changes before release.
* **Standard Headings**: Categorize changes strictly under: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`. Every version block SHOULD include these headings even if some remain empty under the active release.
* **Legacy/Docs-only Parking**: Do not let historical docs-only bullets clutter the `[Unreleased]` section indefinitely. If documentation-only changes accumulate, park them in a historic `0.0.1` (or similar bootstrap) section at the bottom of the changelog, right above the footer links.
* **Unified Version Bumps**: Version bumps MUST be synchronized across all core files during release preparation: the `VERSION` file, package descriptors (`package.json`, `pyproject.toml`, etc.), internal code variables (such as package `__version__`), and README badges.
* **Tagging Timing**: Release tags MUST be applied to the git commit *after* the version change has been promoted and merged to the production branch (`main`/`master`), never on an unmerged feature or staging branch.

##### Standard CHANGELOG.md Template:
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
-

### Changed
-

### Fixed
-

## [0.1.0] - YYYY-MM-DD

### Added
- Initial project release including universal structure and boilerplate code.
```

#### SECURITY.md
The `SECURITY.md` file MUST clearly define the security support scope and private disclosure protocols. It MUST contain:
1. **Supported Versions**: A table or list outlining which active versions currently receive security patches.
2. **Private Reporting Protocol**: A designated, secure private channel (such as a secure email address or GitHub Security Advisory link) for reporting vulnerabilities privately. **MUST NOT** ask users to report vulnerabilities by opening public GitHub issues.
3. **Response SLA**: A clear Service Level Agreement (SLA) specifying the timeline for the initial response (e.g., "Initial response within 48 hours").

#### .editorconfig
To maintain strict formatting and whitespace consistency across VS Code, JetBrains IDEs, Vim, and GitHub Web, the following `.editorconfig` file MUST be placed at the repository root:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.py]
indent_size = 4

[*.{java,kt,kts}]
indent_size = 4

[*.{yml,yaml}]
indent_size = 2
```

---

### 1.2 GitHub Standard Structure (.github/)

All orchestration template files under the `.github/` folder are mandatory.

#### Pull Request Template (`.github/PULL_REQUEST_TEMPLATE.md`)
```markdown
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
1. Run command: `pytest -v` or `npm test` or `./mvnw clean test`
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
```

#### Issue Templates (`.github/ISSUE_TEMPLATE/`)
Repositories MUST provide structured, YAML-based GitHub Issue Forms rather than plaintext markdown files. This enforces structured data collection, complete environment details, and complete reproduction steps.

##### Bug Report YAML Form (`.github/ISSUE_TEMPLATE/bug_report.yml`):
```yaml
name: Bug Report
description: Report something that is broken or behaving unexpectedly
title: "[Bug] "
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        ## Bug Report
        Thank you for reporting. Please fill out the fields below to help us isolate and fix the issue.
  - type: textarea
    id: description
    attributes:
      label: Description
      description: A clear description of what the bug is vs what you expected.
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: List the exact steps to reproduce the bug.
      placeholder: |
        1. Run `python -m package_name --flag`
        2. Enter invalid string when prompted
        3. See traceback
    validations:
      required: true
  - type: input
    id: version
    attributes:
      label: Project Version
      placeholder: "e.g., 0.1.0"
    validations:
      required: true
  - type: dropdown
    id: os
    attributes:
      label: Operating System
      options:
        - Windows
        - macOS
        - Linux
        - Other
    validations:
      required: true
```

##### Feature Request YAML Form (`.github/ISSUE_TEMPLATE/feature_request.yml`):
```yaml
name: Feature Request
description: Propose a new feature or enhancement for this project
title: "[Feature] "
labels: ["enhancement"]
body:
  - type: markdown
    attributes:
      value: |
        ## Feature Request
        Thank you for suggesting an improvement! Please describe your request clearly below.
  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: A clear and concise description of what the problem is.
      placeholder: I'm always frustrated when...
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: A clear and concise description of what you want to happen.
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Alternative Solutions
      description: A description of any alternative solutions or features you've considered.
  - type: textarea
    id: context
    attributes:
      label: Additional Context
      description: Add any other context, screenshots, or examples about the feature request here.
```

#### Code Ownership (`.github/CODEOWNERS`)
Define owners of key directories to enforce automatic PR reviewer assignment. At a minimum, assign administrators to the entire repository:
```text
*       @org-admin-group
/docs/  @doc-review-team
```

---

### 1.3 Canonical Documentation Standard (docs/)

Technical documentation MUST reside in the `docs/` directory and use Markdown.

| Document | Target Audience | Primary Content |
| :--- | :--- | :--- |
| `docs/index.md` | All Readers | Central documentation index and tech stack overview. |
| `docs/architecture.md` | Engineers & Architects | System design, sequence diagrams, state loops, concurrency models. |
| `docs/setup.md` | Contributors | Local machine prerequisites, package managers, environment variables, troubleshooting. |
| `docs/usage.md` | Users & Operators | Operational user guide, command-line arguments, API endpoints, tutorials. |
| `docs/coding-standards.md` | Contributors | Style conventions, naming rules, testing patterns, banned idioms. |
| `docs/security.md` | Developers & Operators | Local token handling, security boundaries, private disclosure SLA, and vulnerability disclosure protocols. |
| `docs/adr/*.md` | Engineers | Architecture Decision Records capturing irreversible technical choices. |

#### Architecture Decision Records (ADRs)
Irreversible technical decisions MUST be recorded sequentially in `docs/adr/` using the following format:

```markdown
# ADR-0001: Selection of Vite over Webpack

## Status
Accepted

## Context
We require sub-second development server startup and optimized bundle production for a single-page TypeScript application.

## Decision
We chose Vite with esbuild and Rollup because of native ES modules in development and superior build speed.

## Consequences
- Positive: Dev server starts instantaneously; bundle sizes are smaller.
- Negative: Requires ESM compliance across all third-party dependencies.
```

---

## 2. Branching, Merging, and Promotion Workflow

To ensure high software quality and prevent continuous integration bottlenecks, repositories MUST enforce a strict branching and promotion protocol.

### 2.1 Branching Strategy (Gitflow)

```text
                  v1.0.0 (Release Tag)         v1.1.0 (Release Tag)
                     ▲                             ▲
main ────────────────●─────────────────────────────●────────► (Production-Ready)
                     │ ◄── hotfix/*                │
staging       ───────┼────────●────────────────────┼────────► (Pre-production testing)
                     │        ▲                    │
develop       ───────┴────────┼───●────────────────┴────────► (Integration)
                              │   ▲
                              │   │ feature/*, fix/*
                              └───┴─── (Promotion Merge)
```

1. **`main`**: The production-ready branch. Standardized to the name `main` (though legacy setups referring to `master` are tolerated for backward compatibility). Protected against direct pushes. This branch represents stable releases, and every merge is tagged with a Git release tag.
2. **`staging`**: The mandatory pre-production branch. Serves as a staging ground for upcoming releases to run automated end-to-end regression tests and user acceptance testing (UAT). Directly promotions to `main` must come from `staging` (or emergency `hotfix/*` branches).
3. **`develop`**: The integration branch for current sprint cycle developments.
4. **`feature/<name>`**: Feature branches. MUST be cut from `develop` and merged back into `develop` via Pull Request.
5. **`fix/<name>`**: Regular bug fix branches. Cut from `develop` and merged back to `develop` via Pull Request.
6. **`hotfix/<name>`**: Urgent production hotfixes. Cut from `main` (or `master`) and MUST be merged into both `main` and `develop` (as well as `staging` if active).

#### Small Project Exception (Two-Branch Model):
For small-scale projects (e.g., static web landing pages, single documentation sites, or tiny independent utility packages), a simplified **two-branch model** (`develop` → `main`) MAY be used to minimize pipeline overhead. In this case, `staging` is omitted, and promotions merge directly from `develop` into `main`.

---

### 2.2 GitHub Branch Rulesets (Branch Protection)

GitHub applies merge restrictions based on the **target branch** of a Pull Request. Applying a single "squash-only" rule across all branches will block clean promotion merges into `staging` and `main`/`master`.

To resolve this, you MUST configure **two distinct GitHub Rulesets** (or Branch Protection rules) for the repository:

#### Ruleset 1: Protect main/master and staging (Merge Commits Only)
* **Target Branches**: `refs/heads/main` (or `refs/heads/master`) and `refs/heads/staging`
* **Enforcement**: Active
* **Allowed Merge Methods**: **Merge Commit** (`allowed_merge_methods: ["merge"]`). *Squash and rebase methods MUST NOT be allowed.*
* **Rules**:
  - Require a Pull Request before merging.
  - Block deletion of target branches.
  - Block force-pushes (`non_fast_forward` enabled).
  - Require status checks (such as successful CI execution) before merging.

##### GitHub CLI API Creation Payload:
```bash
gh api --method POST repos/OWNER/REPO/rulesets --input - <<'EOF'
{
  "name": "Protect main and staging (merge commits)",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main", "refs/heads/master", "refs/heads/staging"],
      "exclude": []
    }
  },
  "rules": [
    {"type": "deletion"},
    {"type": "non_fast_forward"},
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "required_reviewers": [],
        "require_code_owner_review": true,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true,
        "require_extra_approval_for_unattributed_changes": true,
        "allowed_merge_methods": ["merge"]
      }
    }
  ]
}
EOF
```

#### Ruleset 2: Protect develop (Squash Merges Only)
* **Target Branch**: `refs/heads/develop`
* **Enforcement**: Active
* **Allowed Merge Methods**: **Squash** (`allowed_merge_methods: ["squash"]`). *Standard merge commits and rebase merges MUST NOT be allowed.*
* **Rules**:
  - Require a Pull Request before merging.
  - Block deletion.
  - Block force-pushes.

##### GitHub CLI API Creation Payload:
```bash
gh api --method POST repos/OWNER/REPO/rulesets --input - <<'EOF'
{
  "name": "Protect develop (squash)",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/develop"],
      "exclude": []
    }
  },
  "rules": [
    {"type": "deletion"},
    {"type": "non_fast_forward"},
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": true,
        "required_reviewers": [],
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "require_extra_approval_for_unattributed_changes": true,
        "allowed_merge_methods": ["squash"]
      }
    }
  ]
}
EOF
```

---

### 2.3 Merge and Promotion Rules

You MUST merge Pull Requests strictly according to the following mapping:

| PR Route | Allowed Merge Method | Rationale |
| :--- | :--- | :--- |
| `feat/*` or `fix/*` → `develop` | **Squash and Merge** | Keeps the integration branch history clean, collapsing numerous micro-commits on short-lived feature branches into single cohesive changesets. |
| `develop` → `staging` | **Create a Merge Commit** | Preserves the exact commit history and branch ancestry between integration and pre-production. Prevents divergence and conflict on version metadata files. |
| `staging` → `main` (or `master`) | **Create a Merge Commit** | Retains identical histories between staging and production. Guarantees release stability and allows seamless tracking of commit ancestry. |

**CRITICAL RULE**: Under no circumstances should you squash-merge the promotion PRs (`develop` → `staging` or `staging` → `main`). Doing so rewrites the commit SHAs of files like `CHANGELOG.md` or `VERSION` on the target branch. Consequently, subsequent promotions will fail due to massive manual merge conflicts because the parent commit history has been severed.

---

### 2.4 Conflict Resolution Workflow for Branch Promotions

If a promotion Pull Request (e.g., `develop` → `staging`) indicates a merge conflict, resolving it directly through GitHub’s interface is usually impossible, and pushing fixes directly to protected branches is blocked. You MUST resolve the conflicts locally on an ephemeral side branch using Git's strategy options.

#### Ephemeral Branch Merge Resolution Method:

1. **Cut a branch from the target branch** (e.g., staging).
2. **Merge the incoming branch** (e.g., develop) into it, using the `-X theirs` strategy to prioritize incoming changes on overlapping segments.
3. **Verify and restore files** if needed, push the branch, and open a new Pull Request.

```bash
# 1. Fetch latest references and check out staging
git fetch origin develop staging
git checkout -B chore/staging-take-develop origin/staging

# 2. Merge develop into the side branch, prioritizing develop files on overlap
git merge -X theirs origin/develop -m "Merge branch 'develop' into staging - Keep develop's files."
```

#### Meaning of `-X ours` vs `-X theirs` in Git Strategy:
Strategy arguments are relative to the branch you have **checked out** at the moment of merging:

| Checked out Branch | Incoming Branch (Merging in) | Strategy to Keep Incoming (Promotion) Files |
| :--- | :--- | :--- |
| `develop` | `staging` (rare sync-back) | `-X ours` (Keep develop files) |
| `staging` | `develop` (standard promotion) | `-X theirs` (Keep develop files) |
| `main`/`master` | `staging` (standard release) | `-X theirs` (Keep staging files) |

*Important*: The `-X` (recursive strategy option) only resolves **overlapping hunks** automatically. If there are extra lines or files that exist only on one side, they will still land. This is why files like `CHANGELOG.md` occasionally require explicit file restoration.

##### Restoring CHANGELOG.md during conflict resolution:
If the merge picks up extra, non-overlapping historical entries from the staging branch that shouldn't be there, manually restore the file to match the source branch (`develop`):
```bash
# Force CHANGELOG.md to match the state of develop
git checkout origin/develop -- CHANGELOG.md
git add CHANGELOG.md
git commit -m "Keep develop CHANGELOG after merging staging."
```

Once the diff matches your source branch exactly, push and open the PR:
```bash
git branch --unset-upstream
git push -u origin chore/staging-take-develop
```
Open a PR on GitHub with **head** `chore/staging-take-develop` and **base** `staging`. Select **Create a Merge Commit** to complete the promotion.

#### Previewing Merge Conflicts:
Before opening promotion PRs, you can inspect potential conflicts locally using `git merge-tree`:
```bash
git fetch origin
git merge-tree $(git merge-base origin/staging origin/develop) origin/staging origin/develop | rg 'changed in both'
```
If no output is returned, the promotion PR will merge cleanly without conflicts.

---

### 2.5 Issue Closing and Release Management

#### GitHub Issue Closing Behavior:
* GitHub will **only** close an issue automatically if a closing keyword (e.g., `Fixes #N`, `Closes #N`, `Resolves #N`) is present in a commit or PR description that is merged into the **default branch** (usually `main`).
* Merging a feature PR into `develop` or `staging` with the keyword will only **link** the issue, leaving it open.
* **Prohibited Idiom**: Conventional-commit titles like `fix: widget (#5)` will NOT close issues. Developers MUST place the closing keyword (e.g., `Fixes #5`) in the **body** of the PR that eventually lands on the default branch (the staging-to-main promotion is the ultimate closing trigger, though adding it to the feature-to-develop PR body is recommended for tracing).
* If a release has shipped and issues were not closed automatically, administrators must close them manually and include a comment pointing to the release tag.

#### Tagging and Release Execution:
Once the promotion is cleanly merged into production (`main`), execute the following commands to tag and create the official release:

```bash
# Ensure local tracking of production is clean
git fetch origin main
git log -1 --format='%H %s' origin/main
git show origin/main:VERSION

# Tag the release commit
git tag -a v1.2.0 origin/main -m "Release version 1.2.0"
git push origin v1.2.0

# Create a formal GitHub Release
gh release create v1.2.0 --repo OWNER/REPO --title "1.2.0" --notes "Release version 1.2.0. Copy changelog notes here."
```

---

## 3. Language & Ecosystem Specific Blueprints

---

### 3.1 Python (FastAPI, Django, CLI, ML & Data)

For Python services, CLI utilities, and data science projects:

#### Standard File Structure:
```text
python-project/
├── pyproject.toml                      # Canonical configuration (PEP 621, Ruff, mypy, pytest)
├── .python-version                     # Target Python version (e.g. 3.12)
├── src/
│   └── my_app/
│       ├── __init__.py
│       ├── main.py                     # Entry point
│       ├── core/                       # Base configuration, database adapters
│       ├── api/                        # Route controllers
│       └── models/                     # Data schemas (Pydantic, SQLAlchemy)
├── tests/
│   ├── conftest.py                     # Pytest fixtures and test overrides
│   ├── test_api.py
│   └── test_services.py
└── Dockerfile                          # Multi-stage optimized slim container build
```

#### Modern Tooling Standards:
* **Dependency Manager**: **`uv`** is the preferred dependency and package manager. It is a lightning-fast, Rust-based package manager that handles virtual environments, packaging, and locking cleanly.
* **Project Configuration**: **`pyproject.toml`** is the absolute, canonical file for project dependencies and tool configurations (following PEP 621).
* **Requirements Files**: Legacy dependency formats (`requirements.txt`, `requirements-dev.txt`) are **deprecated**. They MUST only be maintained when required by specialized deployment environments (such as Serverless runtimes or specific enterprise hosts) or external compatibility constraints.
* **Linter & Formatter**: **Ruff** replaces flake8, black, isort, bandit, and pydocstyle in a single tool.
* **Type Checking**: Strict type checking using **mypy** with `--strict` enabled is mandatory.
* **Testing Engine**: **pytest** with `pytest-cov`, `pytest-asyncio`, and `httpx`.

#### Sample pyproject.toml:
```toml
[project]
name = "my-service"
version = "0.1.0"
description = "A production-ready Python service following the universal master template."
readme = "README.md"
requires-python = ">=3.11"
authors = [
    { name = "Gemini Notebook Developer Team" }
]
classifiers = [
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]
dependencies = [
    "fastapi>=0.110.0",
    "pydantic>=2.6.0",
    "uvicorn[standard]>=0.28.0",
]

[tool.ruff]
line-length = 88
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP", "B", "SIM", "TRY"]
ignore = []

[tool.mypy]
strict = true
ignore_missing_imports = true
warn_unused_configs = true

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
```

#### Python-Specific Best Practices & Style Rules:
* **Modern Type Annotation**: Use modern union syntax `X | None` instead of `Optional[X]`. Always import generic structures like `Callable` from `collections.abc` instead of `typing`.
* **Union Verification**: Write `isinstance(x, A | B)` instead of the legacy `isinstance(x, (A, B))` tuple format (supported on Python 3.10+).
* **Ruff TRY004 Rule Exception**: Ruff flag `TRY004` flags raise checks following type checks. If an external API explicitly relies on or returns an **integer error code**, keep the `RuntimeError` and append `# noqa: TRY004` accompanied by a clear, one-line comment explaining the technical necessity.
* **Pytest CI Invocations**: In continuous integration environments, pytest MUST be executed as `python -m pytest` instead of bare `pytest`. This explicitly places the active project package directory on `sys.path`, preventing common import failures in CI runner containers.
* **Datetime Precision**: The standard `datetime.utcnow()` is deprecated. Applications MUST use timezone-aware conversions such as `datetime.now(timezone.utc)` or `datetime.now(UTC)`.
* **Virtual Environments**: Virtual environments (`.venv`) MUST NOT be shared across differing operating systems (such as Windows to Linux/WSL). The venv directory must always be deleted and recreated fresh per platform.

#### Execution Commands:
```bash
# Style & Quality checks
uv run ruff check .          # Linting and style analysis
uv run ruff format .         # Format files automatically
uv run mypy src/             # Verify strict types

# Executing tests
uv run python -m pytest --cov=src --cov-report=term-missing
```

---

### 3.2 TypeScript & JavaScript (Node.js, React, Next.js, Vue, Express, NestJS)

For single-page applications, backend runtimes, and static web apps.

#### Standard File Structure:
```text
ts-project/
├── package.json                        # Project dependencies and script declarations
├── tsconfig.json                       # Strict TypeScript configuration
├── eslint.config.js                    # Flat ESLint configuration
├── .prettierrc                         # Code formatting definitions
├── vitest.config.ts (or jest.config.js)# Testing runner configurations
├── src/
│   ├── index.ts                        # Module entrance or web server setup
│   ├── types.ts                        # Domain interfaces and enums
│   ├── services/
│   └── components/
└── tests/
```

#### Modern Tooling Standards:
* **Package Managers**: Standardize on **`pnpm`** (recommended for speed and storage efficiency), `npm`, or `bun`.
* **Compiler Settings**: TypeScript 5.x with `"strict": true`, `"noImplicitAny": true`, and `"isolatedModules": true` is required.
* **Formatting & Linting**: ESLint 9+ (Flat Config) combined with `typescript-eslint`, or Biome. Prettier is standard for formatting.
* **Testing Runner**: Vitest (for Vite integration) or Jest.
* **Package Scripts Rule**: `package.json` scripts must be tailored to the specific tooling:
  - **Vite Applications**: MUST provide `dev` (launches dev server) and `build` (compiles and bundles) scripts.
  - **Start Script Policy**: A production `"start"` script is **not** globally mandatory. It is strictly required only if the project operates a runtime server (like an Express or NestJS app) that needs execution in production environments.

#### Essential package.json Scripts:
```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --max-warnings 0",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

#### TypeScript / JS CI/CD Actions Workflow (`.github/workflows/ci.yml`):
```yaml
name: CI
on: [push, pull_request]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

---

### 3.3 Java (Spring Boot, Quarkus, Enterprise Libraries)

For microservices, APIs, and shared frameworks.

#### Standard File Structure:
```text
java-project/
├── pom.xml (or build.gradle)           # Build and dependency descriptor
├── mvnw / mvnw.cmd (or gradlew)        # Executable Maven/Gradle wrapper
├── .mvn/wrapper/                       # Wrapper binaries and configs
├── checkstyle.xml                      # Code style rules (Google style)
├── src/
│   ├── main/
│   │   ├── java/com/company/project/
│   │   │   ├── Application.java        # Spring Boot entry point
│   │   │   ├── domain/                 # Database records and domain objects
│   │   │   ├── repository/             # Persistence adapters
│   │   │   ├── service/                # Transaction boundaries
│   │   │   └── web/                    # Controller REST mapping
│   │   └── resources/
│   │       ├── application.yml         # Base configuration values
│   │       ├── application-prod.yml    # Production override environment profile
│   │       └── db/migration/           # SQL Schema migrations (Flyway / Liquibase)
│   └── test/
│       ├── java/com/company/project/   # Test classes (Unit and Integration)
│       └── resources/
└── Dockerfile                          # Multi-stage Eclipse Temurin distroless build
```

#### Modern Tooling Standards:
* **Runtime JDK**: OpenJDK 17 or 21 LTS (Temurin or Corretto).
* **Builders**: Maven (`pom.xml`) or Gradle (`build.gradle.kts`). All repositories **MUST** commit the execution wrapper (e.g., `./mvnw` or `./gradlew`) to avoid local environment mismatch.
* **Quality Gates**: Static styling verified via `spotless-maven-plugin` or Checkstyle. Minimum code test coverage threshold is set to **80%** (via JaCoCo).
* **Testing Library**: JUnit 5, AssertJ, Mockito, and Testcontainers for automated database testing.

#### Execution Commands:
```bash
./mvnw clean verify          # Execute unit and integration tests and check styles
./mvnw spring-boot:run       # Spin up local development profile
./mvnw spotless:apply        # Automatically correct code styles
```

#### Multi-Stage Distroless Dockerfile:
```dockerfile
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM gcr.io/distroless/java21-debian12
COPY --from=builder /app/target/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

---

### 3.4 Kotlin (Android, Multiplatform KMP, Ktor)

For Android clients, Kotlin multi-platform projects, and Ktor microservices.

#### Standard File Structure:
```text
kotlin-project/
├── build.gradle.kts                    # Main project dependencies configuration
├── settings.gradle.kts                 # Multi-module loading setup
├── gradle.properties                   # Compilation tuning parameters
├── gradlew / gradlew.bat               # Gradle wrapper executable binaries
├── detekt.yml                          # Static analysis rules for detekt
├── app/ (or shared/)
│   ├── build.gradle.kts
│   └── src/
│       ├── main/
│       │   ├── kotlin/com/company/app/
│       │   ├── AndroidManifest.xml     # Client app context
│       │   └── res/                    # Asset declarations
│       └── test/
│           └── kotlin/com/company/app/ # Kotest execution suites
```

#### Modern Tooling Standards:
* **Compiler**: Kotlin 2.0+ utilizing the K2 compiler engine.
* **Style and Detekt**: Ktlint is mandatory for style enforcement; Detekt is utilized to monitor code smell indices.
* **Concurrency**: Mandatory utilization of Coroutines and Kotlin Flow. Direct blocking executions on the main dispatcher are strictly prohibited.
* **Testing Spec**: Kotest specifications, MockK for mocking, and Turbine for reactive Flow evaluation.

#### Execution Commands:
```bash
./gradlew check              # Execute analysis suite, detekt, and tests
./gradlew testDebugUnitTest  # Execute debug tests locally
./gradlew assembleRelease    # Compile production executable artifacts
```

---

### 3.5 C++ (Modern C++17/20/23, Systems, High-Performance)

For high-concurrency architectures, engine systems, and desktop tooling.

#### Standard File Structure:
```text
cpp-project/
├── CMakeLists.txt                      # Main build specifications
├── CMakePresets.json                   # Presets for compiler configuration (Debug, Release, ASan)
├── conanfile.txt (or vcpkg.json)       # Modern package manager dependency listing
├── .clang-format                       # Formatting definitions
├── .clang-tidy                         # Static analysis engine rules
├── include/
│   └── my_project/
│       ├── core.hpp                    # Public interfaces
│       └── utils.hpp
├── src/
│   ├── core.cpp                        # System components logic
│   └── main.cpp                        # Main executable entry point
└── tests/
    ├── CMakeLists.txt
    └── test_core.cpp                   # Catch2 test frameworks
```

#### Modern Tooling Standards:
* **Standard**: C++20 or C++23. Standard raw pointer creations are prohibited; memory management MUST be governed through RAII and smart pointers (`std::unique_ptr`, `std::shared_ptr`).
* **Generation**: CMake 3.25+ with Ninja as the generation backend.
* **Package Managers**: Conan 2.0 or vcpkg.
* **Sanitization Checks**: Continuous pipeline executions MUST compile with AddressSanitizer (`-fsanitize=address`), UndefinedBehaviorSanitizer (`-fsanitize=undefined`), and ThreadSanitizer (`-fsanitize=thread`).
* **Unit Testing**: Catch2 v3 or GoogleTest.

#### Execution Commands:
```bash
# Project preparation
cmake -B build -S . -DCMAKE_BUILD_TYPE=Release -G Ninja
# Compiling
cmake --build build -j
# Test execution
ctest --test-dir build --output-on-failure
# Quality alignment
find src include -name '*.cpp' -o -name '*.hpp' | xargs clang-format -i
```

---

### 3.6 HTML / CSS / JS Static Projects (Vanilla, Jamstack, Docs)

For static pages, documentation structures, or simple templates.

#### Standard File Structure:
```text
static-project/
├── index.html                          # HTML5 root file
├── 404.html                            # Ephemeral fallback page
├── robots.txt                          # Crawler rules configuration
├── sitemap.xml                         # Search engine mapping indexing
├── .htmlhintrc                         # Automated HTML code checks
├── assets/
│   ├── css/
│   │   └── style.css                   # Layout design
│   ├── js/
│   │   └── main.js                     # Modular JavaScript
│   └── img/
│       ├── favicon.ico
│       ├── og-image.png                # OpenGraph preview asset (1200x630px)
│       └── logo.svg                    # Vector brand mark
└── vercel.json (or netlify.toml)       # Edge runtime and caching definitions
```

#### Core Web Standards Checklist:
1. **Semantic Structure**: Layouts must leverage `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, and `<footer>` elements.
2. **SEO & Metadata**: Must include viewport declarations, meta description tags, and social OpenGraph previews (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) along with corresponding Twitter Card details.
3. **Accessibility (A11y)**: Focus states (`:focus-visible`) must be visible, non-empty text descriptions (`alt` attributes) must be provided on images, and WCAG AA color contrast (minimum of 4.5:1 for standard text) must be strictly maintained.
4. **Loading & Performance**: Use modern media formats (WebP, AVIF, SVG) with explicit dimensional values, employ native lazy loading (`<img loading="lazy" ...>`), and ensure script executions do not block parsing (via `type="module"` or `defer`).

---

## 4. Universal Cross-Cutting Topics

---

### 4.1 Secrets Management & Security Hygiene

1. **Strict Exclusion of Secrets**:
    * Under no circumstances may sensitive values (including API tokens, passwords, security keys, or database access paths) be committed to the repository.
    * Every repository **MUST** provide a `.env.example` showing all expected key names with blank values.
2. **Automated Scanning**:
    * Pipeline integration must leverage automated scan engines like Gitleaks or Trufflehog to detect and reject commits with accidental exposures.
3. **Run-Time Secret Injection**:
    * Local execution: Read from `.env` files (which must reside in `.gitignore`).
    * Production execution: Sensitive parameters must be injected via runtime environment layers (e.g., Kubernetes Secrets, Vault, GCP Secret Manager, or AWS Secrets Manager).
4. **Logging Restrictions**:
    * Application logs **MUST NOT** write secrets, TOTP seeds, security access parameters, or transient upload keys to output files or telemetry systems.

---

### 4.2 Production Containerization Standards

When writing Dockerfiles, engineers MUST adhere to these multi-stage patterns:
1. **Unprivileged Execution**: Standard executions must run under unprivileged system accounts (e.g., adding `USER appuser`). Containers MUST NOT execute as the root user.
2. **Optimal Caching**: Copy packaging parameters (like `pyproject.toml`, `package.json`, or `pom.xml`) and compile system layers *prior* to injecting the core codebase files.
3. **Base Minimization**: Choose minimal secure base images (like Distroless, Alpine, or Debian-slim builds) to optimize performance and reduce security vulnerability exposure vectors.

---

### 4.3 Dependency Automation (Dependabot)

Outdated dependency chains represent primary security vulnerability vectors. To mitigate this risk, every project repository MUST contain `.github/dependabot.yml` configured for weekly security scans:

```yaml
version: 2
updates:
  - package-ecosystem: "npm" # Adapt to tech stack (e.g. "maven", "pip", "gradle", "github-actions")
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    commit-message:
      prefix: "chore(deps)"
```

---

### 4.4 Third-Party & Unofficial APIs Integration

When developing services that interface with uncertified or third-party HTTP endpoints, apply these strict protocols to ensure resilience:
1. **Error Code Translation**: Translate cryptic numeric vendor errors or transient error codes into explicit user-facing statuses (e.g., quota limits exceeded, MFA authorization needed) so that transient API issues are not flagged as application crashes.
2. **Transient Failures (SSL EOF/Short Reads)**: Remote content distribution networks occasionally throw transient failures, such as EOF warnings or short-read socket disruptions. The system **MUST** implement structured retries and backoff logic prior to returning final failures.
3. **Duplicate Naming Handling**: Third-party duplicate or naming conflict behaviors (e.g., automatic suffix additions like "(1)") must be resolved gracefully through programmatically handling next-available names or restoring expected names, rather than assuming request names remained unchanged.

---

### 4.5 Code Commenting & Inline Documentation Standards

Every repository MUST enforce clear, structured code commenting standards documented in `docs/coding-standards.md` and verified during pull request code reviews:

1. **Function & Public API Headers (Docstrings / JSDoc / Comment-Help)**:
    * All public functions, classes, methods, and exported APIs **MUST** include structured documentation blocks.
    * **Python**: Use Google-style docstrings (`"""..."""`) with `Args:`, `Returns:`, and `Raises:` blocks.
    * **TypeScript / JavaScript**: Use JSDoc blocks (`/** ... */`) with `@param`, `@returns`, and `@throws` annotations.
    * **PowerShell / Shell**: Use formal comment-based help blocks (`<# .SYNOPSIS ... .DESCRIPTION ... .PARAMETER ... .OUTPUTS #>`).
    * **Java / Kotlin / C++**: Use Javadoc or Doxygen (`/** ... */` / `/// ...`) header comments.
2. **Block Comments for Complex Logic**:
    * Multi-step workflows, non-trivial mathematical formulas, state-machine transitions, and regex patterns **MUST** be preceded by a block comment (`/* ... */` or multi-line `# ...`) explaining the **WHY** and high-level architectural intent behind the implementation.
3. **Inline Comments for Non-Obvious Code**:
    * Use inline comments (`// ...` or `# ...`) sparingly to explain non-obvious line-level operations, edge-case workarounds, or platform-specific quirks (e.g., OS file descriptor limits or CDN retry delays).
    * **Linter Suppressions**: Any linter or compiler rule suppression (such as `# noqa: TRY004` or `// eslint-disable-next-line`) **MUST** include an explanatory inline comment on the same line detailing the specific technical necessity.
4. **Prohibited Comment Anti-Patterns**:
    * **No Commented-Out Dead Code**: Obsolete code MUST be removed entirely rather than commented out; rely on Git version history for code retrieval.
    * **No Redundant Echo Comments**: Comments MUST NOT simply restate what the code clearly expresses (e.g., avoid `i = i + 1  # Increment i by 1`).
    * **No Stale Comments**: When updating functional code, developers MUST synchronously update or remove associated comments to prevent documentation drift.

---

## 5. Universal Bootstrapping & Retrofitting Checklist

When creating a new repository or correcting an unorganized "code dump," follow this structured bootstrapping timeline:

### Phase 1 — Repository & Git Hygiene
*   [ ] Verify your active head is on `main` (if not, rename or migrate the default branch).
*   [ ] Create the integration branch: `git checkout -b develop` and push it to origin.
*   [ ] Create and configure standard `.gitignore` and `.editorconfig` files.
*   [ ] Commit progress: `git commit -am "chore: add .gitignore and .editorconfig"`

### Phase 2 — Core Metadata Setup
*   [ ] Create root meta documents: `VERSION`, `LICENSE`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `.env.example`.
*   [ ] Configure version tracker values (`VERSION` to start at `0.1.0` or custom start string).
*   [ ] Commit progress: `git commit -am "docs: add project metadata files"`

### Phase 3 — Repository Orchestration Templates
*   [ ] Setup `.github/PULL_REQUEST_TEMPLATE.md` to match standard formats.
*   [ ] Establish separate templates for bugs and features in `.github/ISSUE_TEMPLATE/`.
*   [ ] Place `.github/workflows/ci.yml` in position to govern pull checks.
*   [ ] Add `.github/CODEOWNERS` and `.github/dependabot.yml`.
*   [ ] Commit progress: `git commit -am "ci: add GitHub templates and CI workflow"`

### Phase 4 — Documentation Structure
*   [ ] Initialize the `docs/` folder.
*   [ ] Provide minimum document suite: `index.md`, `setup.md`, `usage.md`, `architecture.md`, `coding-standards.md`, and `adr/0001-record-architecture-decisions.md`.
*   [ ] Commit progress: `git commit -am "docs: add initial documentation structures"`

### Phase 5 — Package Reorganization
*   [ ] Group your active application codebase inside the `src/` directory.
*   [ ] Establish the test harness suite within `tests/` and write a baseline smoke test.
*   [ ] Align configuration parameters to standard package guidelines (`pyproject.toml`, `package.json`, etc.).
*   [ ] Commit progress: `git commit -am "refactor: reorganize codebase and initialize tests"`

### Phase 6 — Ruleset Enforcement & First Release
*   [ ] Execute the GitHub CLI API commands (or use the web dashboard) to enforce the branch rulesets defined in [Section 2.2](#22-github-branch-rulesets-branch-protection).
*   [ ] Open a Pull Request from `develop` targeting `staging`. Verify the CI pipeline runs cleanly, and merge it with a **Merge Commit**.
*   [ ] Open a Pull Request from `staging` targeting `main`. Verify and merge using a **Merge Commit**.
*   [ ] Run tag and release procedures:
    ```bash
    git checkout main && git pull
    git tag -a v0.1.0 -m "Release version 0.1.0"
    git push origin v0.1.0
    gh release create v0.1.0 --title "0.1.0" --notes "Initial repository boostrap release."
    ```

---

## 6. Backward Compatibility & Legacy Notes

This section outlines compatibility rules and translation paths for maintaining legacy repositories created under older guidelines:

### 1. The Two-Branch Naming Convention
* **Legacy Format**: Older repositories constructed under the `BRANCH-RULESET-NOTES.md` or original `00_General_Master_Template.md` standards use the production branch name `master` and omit a `staging` layer entirely.
* **Bridge Rules**: When managing legacy environments, do not perform aggressive renames of `master` to `main` unless requested by project owners. Maintain the promotion route as `develop` → `master` using standard **Merge Commit** setups. Add the ruleset target to `refs/heads/master`.

### 2. Global Indentation Standard
* **Legacy Format**: Legacy projects used a global 4-space indentation layout for all files.
* **Bridge Rules**: To prevent massive commit history pollutions (noise in git blame), legacy repositories are allowed to maintain their 4-space indent rules. Do not apply a global 2-space lint correction to old repositories unless undergoing active rewrite cycles.

### 3. Python Package Managers and Requirements Files
* **Legacy Format**: Traditional structures defined packages in `requirements.txt` and developer requirements in `requirements-dev.txt`, managing layouts through standard virtualenv environments.
* **Bridge Rules**: When maintaining legacy setups, you may continue updating traditional requirements text sheets. However, any active modernization should prioritize migration to `pyproject.toml` and utilize the modern, rust-based installer tool `uv` for local dependency alignment.
