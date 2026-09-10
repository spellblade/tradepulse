# Contributing to TradePulse

Thank you for your interest in contributing to **TradePulse**! We welcome bug fixes, documentation improvements, and new feature contributions.

Please review the following guidelines before submitting your changes.

---

## 1. Branching Strategy

We follow a strict Gitflow-inspired branching model across three core branches:

- `main` / `master`: Production-ready releases only. Every merge to this primary release branch is tagged with a SemVer release version (e.g. `v0.1.0`). Merges MUST come exclusively as promotions from `staging` (or emergency `hotfix/*`).
- `staging`: Mandatory pre-production branch for staging upcoming releases and end-to-end regression validation. Merges MUST come as promotions from `develop`.
- `develop`: Primary integration branch for active development.
- `feature/<feature-name>`: Feature branches branched from and merged into `develop`.
- `fix/<bug-name>`: Bug fix branches branched from and merged into `develop`.
- `hotfix/<issue-name>`: Critical emergency fixes branched directly from `main` (or `master`) and merged into `main`, `staging`, and `develop`.

### Merge & Promotion Rules (Branch Protection)

Pull requests MUST be merged strictly following these methods:

| Route | Allowed Merge Method | Rationale |
| :--- | :--- | :--- |
| `feature/*` or `fix/*` → `develop` | **Squash and Merge** | Keeps the integration branch history clean, collapsing micro-commits into single cohesive changesets. |
| `develop` → `staging` | **Create a Merge Commit** | Preserves exact commit history and branch ancestry between integration and pre-production. |
| `staging` → `main` | **Create a Merge Commit** | Retains identical histories between staging and production, ensuring release stability. |

---

## 2. Commit Message Conventions

We adhere strictly to [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Allowed Types
- `feat`: A new user-facing feature or enhancement.
- `fix`: A bug fix.
- `docs`: Documentation-only changes.
- `style`: Formatting, missing semicolons, whitespace (no code logic changes).
- `refactor`: Code restructuring without changing functional behavior.
- `perf`: Code changes that improve runtime performance or rendering speed.
- `test`: Adding or correcting tests.
- `chore`: Build scripts, CI workflow, or dependency updates.

### Examples
- `feat(chart): add EMA-50 and SMA-20 technical overlays`
- `fix(screener): decouple exchange filter counts from active market selection`
- `docs: update setup and architecture guides`

---

## 3. Development Workflow

1. **Fork or Clone the Repository**:
   ```bash
   git clone https://github.com/spellblade/tradepulse.git
   cd tradepulse
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Create a Topic Branch**:
   ```bash
   git checkout develop
   git checkout -b feature/your-feature-name
   ```

4. **Develop & Verify**:
   - Verify code formatting and linting:
     ```bash
     npm run lint
     ```
   - Run automated test suite:
     ```bash
     npm test
     ```
   - Verify production application build:
     ```bash
     npm run build
     ```

5. **Update Documentation & Changelog**:
   - If introducing behavior changes, document them in `CHANGELOG.md` under `[Unreleased]`.
   - Update relevant files in `docs/` if architectural changes were introduced.

6. **Submit a Pull Request**:
   - Open a PR targeting `develop`.
   - Use the provided PR template to explain your changes and test steps.

---

## 4. Coding Standards

- Written in TypeScript with strict type checking.
- Do not use `any`; use typed models from `src/types.ts`.
- Tailwind CSS utility classes for all styling.
- Lucide React icons for all visual glyphs.
- For detailed coding guidelines, see [Coding Standards](docs/coding-standards.md).
