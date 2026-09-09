# Universal Project Master Template & Repository Blueprint

This document defines the canonical, language-agnostic **Universal Repository Blueprint**. It provides an architectural standard for structuring, documenting, and releasing software across any tech stack, followed by language-specific guidelines for **Java**, **Kotlin**, **TypeScript/JavaScript**, **Python**, **C++**, and **Static HTML/Web** projects.

---

## Table of Contents
- [1. Universal Repository Architecture](#1-universal-repository-architecture)
  - [1.1 Root-Level Artifacts](#11-root-level-artifacts)
  - [1.2 GitHub Standard Structure (`.github/`)](#12-github-standard-structure-github)
  - [1.3 Canonical Documentation Standard (`docs/`)](#13-canonical-documentation-standard-docs)
  - [1.4 Branching Strategy & Gitflow](#14-branching-strategy--gitflow)
  - [1.5 Conventional Commits Specification](#15-conventional-commits-specification)
  - [1.6 Semantic Versioning (SemVer 2.0.0)](#16-semantic-versioning-semver-200)
- [2. Language & Ecosystem Specific Blueprints](#2-language--ecosystem-specific-blueprints)
  - [2.1 TypeScript & JavaScript (Node.js, React, Next.js, Vue)](#21-typescript--javascript)
  - [2.2 Java (Spring Boot, Quarkus, Enterprise Libraries)](#22-java-spring-boot-quarkus-enterprise)
  - [2.3 Kotlin (Android, Multiplatform KMP, Ktor)](#23-kotlin-android-multiplatform-ktor)
  - [2.4 Python (FastAPI, Django, CLI, ML / Data)](#24-python-fastapi-django-cli-ml--data)
  - [2.5 C++ (Modern C++17/20/23, Systems, High-Performance)](#25-c-modern-c172023-systems)
  - [2.6 HTML / CSS / JS Static Projects (Vanilla, Jamstack, Docs)](#26-html--css--js-static-projects)
- [3. Universal Cross-Cutting Topics](#3-universal-cross-cutting-topics)
  - [3.1 Secrets Management & Security Hygiene](#31-secrets-management--security-hygiene)
  - [3.2 Production Containerization Standards](#32-production-containerization-standards)
  - [3.3 Dependency Automation (Dependabot / Renovate)](#33-dependency-automation-dependabot--renovate)
  - [3.4 Architecture Decision Records (ADRs)](#34-architecture-decision-records-adrs)

---

# 1. Universal Repository Architecture

Every production-grade repository should adhere to this standardized top-level layout:

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
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       ├── ci.yml                      # Build, lint, and test validation pipeline
│       └── release.yml                 # Automated release tagging and artifact publishing
├── docs/                               # Developer and operator documentation
│   ├── index.md                        # Documentation navigation index
│   ├── architecture.md                 # System architecture, data flow, component design
│   ├── setup.md                        # Developer onboarding, tooling setup, local execution
│   ├── usage.md                        # User workflows, operational manuals, or API reference
│   ├── coding-standards.md             # Code style, lint rules, patterns, anti-patterns
│   └── adr/                            # Architecture Decision Records directory
│       └── 0001-record-architecture-decisions.md
└── src/ (or app/, pkg/, cmd/)          # Source code root
```

---

## 1.1 Root-Level Artifacts

### `VERSION`
A single line text file containing only the SemVer string (e.g. `1.2.0`). This prevents duplicate version definitions and can be easily parsed by shell scripts, Dockerfiles, and CI jobs (`cat VERSION`).

### `README.md`
Must include:
1. **Title & Badges**: Project name, version badge, build status, license, language version.
2. **Elevator Pitch**: 1–2 sentence summary explaining *what* it does and *why* it exists.
3. **Key Features**: High-impact bulleted capability breakdown.
4. **Quickstart / Getting Started**: Prerequisites and commands to build and run in < 3 minutes.
5. **Documentation Map**: Direct links into `docs/`.
6. **Contribution & License**: Clear attribution and licensing terms.

### `CHANGELOG.md`
Based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/):
- Maintain an active `## [Unreleased]` header at the top for in-flight work.
- Categorize changes into: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

### `SECURITY.md`
Must declare:
- Supported versions that receive security patches.
- Designated private contact (email or security advisory link). **Never ask users to open public GitHub issues for security vulnerabilities.**
- SLA for initial response (e.g. within 48 hours).

### `.editorconfig`
Guarantees consistent whitespace across VS Code, IntelliJ, Vim, and GitHub Web:
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
```

---

## 1.2 GitHub Standard Structure (`.github/`)

### Pull Request Template (`.github/PULL_REQUEST_TEMPLATE.md`)
```markdown
## Summary of Changes
A brief summary of what was accomplished in this PR.

## Related Issues
Closes #(issue)

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Refactoring / Performance improvement
- [ ] Documentation update

## Verification Checklist
- [ ] Automated tests pass locally (`npm test` / `pytest` / `mvn test`)
- [ ] Linter passes with 0 warnings or errors
- [ ] Relevant documentation in `docs/` has been updated
- [ ] `CHANGELOG.md` updated under `[Unreleased]`
```

### Issue Templates (`.github/ISSUE_TEMPLATE/`)
Provide separate templates for **Bug Reports** (reproduction steps, expected vs actual behavior, environment logs) and **Feature Requests** (problem statement, proposed solution, alternative considerations).

---

## 1.3 Canonical Documentation Standard (`docs/`)

| Document | Target Audience | Primary Content |
| -------- | --------------- | --------------- |
| `docs/index.md` | All Readers | Central documentation index and tech stack overview. |
| `docs/architecture.md` | Engineers & Architects | System design, sequence diagrams, state loops, concurrency models. |
| `docs/setup.md` | Contributors | Local machine prerequisites, package managers, environment variables, troubleshooting. |
| `docs/usage.md` | Users & Operators | Operational user guide, command-line arguments, API endpoints, tutorials. |
| `docs/coding-standards.md` | Contributors | Style conventions, naming rules, testing patterns, banned idioms. |
| `docs/adr/*.md` | Engineers | Architecture Decision Records capturing irreversible technical choices. |

---

## 1.4 Branching Strategy & Gitflow

```text
                  v1.0.0 (Release Tag)         v1.1.0 (Release Tag)
                     ▲                             ▲
main / master ───────●─────────────────────────────●────────► (Production-Ready)
                     │ ◄── hotfix/*                │
develop       ───────┴────────●────────────────────┴────────► (Integration)
                              ▲
                       feature/*, fix/*
```

1. **`main` / `master`**: Production-ready branch. Protected against direct pushes. Only updated via PR merges from `develop` or emergency `hotfix/*` branches. Every merge is tagged with a Git release tag.
2. **`develop`**: Integration branch for upcoming releases.
3. **`feature/<name>`**: Branched from `develop`, merged back to `develop` via PR.
4. **`fix/<name>`**: Non-critical bug fixes targeting `develop`.
5. **`hotfix/<name>`**: Urgent production fixes branched from `main`/`master` and merged to both `main`/`master` and `develop`.

---

## 1.5 Conventional Commits Specification

Structure:
```text
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

- **`feat`**: A new feature for the user.
- **`fix`**: A bug fix for the user.
- **`docs`**: Changes to documentation only.
- **`style`**: Formatting, missing semicolons, whitespace (no code change).
- **`refactor`**: Refactoring production code without behavior changes.
- **`perf`**: Code change that improves execution speed or memory footprint.
- **`test`**: Adding missing tests or correcting existing tests.
- **`build`**: Changes affecting build systems or external dependencies.
- **`ci`**: Changes to CI configuration files and scripts.
- **`chore`**: Maintenance tasks, version bumps, or miscellaneous tooling.

---

## 1.6 Semantic Versioning (SemVer 2.0.0)

Given a version number **`MAJOR.MINOR.PATCH`** (e.g. `2.4.1`):
1. **`MAJOR`**: Incompatible API or architectural breaking changes.
2. **`MINOR`**: Backwards-compatible new functionality.
3. **`PATCH`**: Backwards-compatible bug fixes and security patches.

---

# 2. Language & Ecosystem Specific Blueprints

---

## 2.1 TypeScript & JavaScript

Applicable to: **Node.js, React, Next.js, Vue, Svelte, Express, NestJS**.

### Standard File Structure
```text
ts-project/
├── package.json
├── tsconfig.json                       # Strict TypeScript configuration
├── eslint.config.js                    # Flat ESLint configuration
├── .prettierrc                         # Code formatting rules
├── vitest.config.ts (or jest.config.js)# Test runner configuration
├── src/
│   ├── index.ts                        # Library or server entry point
│   ├── types.ts                        # Shared interfaces, types, enums
│   ├── services/
│   └── components/
└── tests/
```

### Essential Tooling & Commands
- **Compiler**: TypeScript 5.x with `"strict": true`, `"noImplicitAny": true`, `"isolatedModules": true`.
- **Package Managers**: `pnpm` (fast, space-efficient), `npm`, or `bun`.
- **Linter & Formatter**: ESLint 9+ with `typescript-eslint`, Prettier or Biome.
- **Testing**: `vitest` (fast Vite-native testing) or `jest`.

### Sample `package.json` Scripts
```json
{
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

### CI/CD Workflow (`.github/workflows/ci.yml`)
```yaml
name: CI
on: [push, pull_request]
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

## 2.2 Java (Spring Boot, Quarkus, Enterprise)

Applicable to: **Spring Boot 3.x, Quarkus, Micronaut, Maven/Gradle Libraries**.

### Standard File Structure
```text
java-project/
├── pom.xml (or build.gradle)           # Build and dependency descriptor
├── mvnw / mvnw.cmd (or gradlew)        # Executable Maven/Gradle wrapper
├── .mvn/wrapper/                       # Wrapper binaries and configs
├── checkstyle.xml                      # Code style rules (Google or Sun style)
├── src/
│   ├── main/
│   │   ├── java/com/company/project/
│   │   │   ├── Application.java        # Spring Boot main class
│   │   │   ├── domain/                 # Domain entities / records
│   │   │   ├── repository/             # Data access layer
│   │   │   ├── service/                # Business logic
│   │   │   └── web/                    # REST controllers / DTOs
│   │   └── resources/
│   │       ├── application.yml         # Base properties
│   │       ├── application-prod.yml    # Production overrides
│   │       └── db/migration/           # Flyway / Liquibase SQL migrations
│   └── test/
│       ├── java/com/company/project/   # Unit and integration tests
│       └── resources/
└── Dockerfile                          # Multi-stage Eclipse Temurin build
```

### Essential Tooling & Commands
- **JDK**: OpenJDK 17 or 21 LTS (Eclipse Temurin / Amazon Corretto).
- **Build System**: Maven (`pom.xml`) or Gradle (`build.gradle.kts`). Always commit the wrapper (`./mvnw` or `./gradlew`).
- **Code Quality**: `spotless-maven-plugin` or `checkstyle`, `spotbugs`, `jacoco` (minimum 80% line coverage).
- **Testing**: JUnit 5 (Jupiter), AssertJ, Mockito, Testcontainers for real database testing.

### Standard Build Commands
```bash
./mvnw clean verify          # Runs unit tests, integration tests, and checkstyle
./mvnw spring-boot:run       # Starts local development application
./mvnw spotless:apply        # Automatically formats code
```

### Multi-Stage Distroless Dockerfile
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

## 2.3 Kotlin (Android, Multiplatform, Ktor)

Applicable to: **Android Apps (Jetpack Compose), Kotlin Multiplatform (KMP), Server-side Ktor**.

### Standard File Structure
```text
kotlin-project/
├── build.gradle.kts                    # Root build script
├── settings.gradle.kts                 # Module inclusion and repository config
├── gradle.properties                   # JVM memory, AndroidX, Compose flags
├── gradlew / gradlew.bat               # Gradle wrapper
├── .editorconfig
├── detekt.yml                          # Static code analysis configuration
├── app/ (or shared/)
│   ├── build.gradle.kts
│   └── src/
│       ├── main/
│       │   ├── kotlin/com/company/app/
│       │   ├── AndroidManifest.xml     # (For Android projects)
│       │   └── res/                    # Drawables, layouts, values
│       └── test/
│           └── kotlin/com/company/app/ # Kotest / MockK test suites
```

### Essential Tooling & Standards
- **Kotlin Language**: Kotlin 2.0+ with modern K2 compiler.
- **Code Analysis**: `detekt` for code smells and complexity metrics; `ktlint` for style enforcement.
- **Async Concurrency**: Kotlin Coroutines and Flow. Avoid blocking calls on the main dispatcher.
- **Testing**: `kotest` for expressive specifications, `mockk` for idiomatic Kotlin mocking, and `turbine` for testing Kotlin StateFlow.

### Standard Gradle Commands
```bash
./gradlew check              # Runs lint, detekt, and tests across modules
./gradlew testDebugUnitTest  # Runs local unit test suites
./gradlew assembleRelease    # Builds release APK / AAB or fat JAR
```

---

## 2.4 Python (FastAPI, Django, CLI, ML & Data)

Applicable to: **FastAPI microservices, Django web platforms, CLI tools, PyTorch / ML pipelines**.

### Standard File Structure
```text
python-project/
├── pyproject.toml                      # Unified build, ruff, mypy, and pytest config (PEP 621)
├── .python-version                     # Supported Python version (e.g. 3.12)
├── src/ (or my_package/)
│   ├── __init__.py
│   ├── main.py                         # Application entrypoint
│   ├── core/                           # Configuration and database sessions
│   ├── api/                            # Route handlers
│   └── models/                         # Pydantic schemas or SQLAlchemy models
├── tests/
│   ├── conftest.py                     # Shared pytest fixtures
│   ├── test_api.py
│   └── test_services.py
└── Dockerfile                          # Multi-stage Python slim build
```

### Modern Tooling Standards
- **Package & Environment Manager**: `uv` (recommended, lightning-fast Rust-based package manager) or `poetry`.
- **Linter & Formatter**: `ruff` (replaces flake8, black, isort, bandit, pydocstyle in a single tool).
- **Type Checker**: `mypy` with `--strict` enabled.
- **Testing**: `pytest` with `pytest-cov`, `pytest-asyncio`, and `httpx`.

### Sample `pyproject.toml`
```toml
[project]
name = "my-service"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.110.0",
    "pydantic>=2.6.0",
    "uvicorn[standard]>=0.28.0",
]

[tool.ruff]
line-length = 88
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP", "B", "SIM"]

[tool.mypy]
strict = true
ignore_missing_imports = true

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
```

### Commands
```bash
uv run ruff check .          # Linting
uv run ruff format .         # Formatting
uv run mypy src/             # Type verification
uv run pytest --cov=src      # Testing with test coverage
```

---

## 2.5 C++ (Modern C++17/20/23, Systems)

Applicable to: **High-performance systems, game engines, embedded devices, trading engines, core CLI tools**.

### Standard File Structure
```text
cpp-project/
├── CMakeLists.txt                      # Root CMake build configuration
├── CMakePresets.json                   # Standardized build presets (Debug, Release, ASan)
├── conanfile.txt (or vcpkg.json)       # C++ package manager dependency manifest
├── .clang-format                       # LLVM/Google style code formatting rules
├── .clang-tidy                         # Static analysis and modernization checks
├── include/
│   └── my_project/
│       ├── core.hpp                    # Public header files
│       └── utils.hpp
├── src/
│   ├── core.cpp                        # Implementation files
│   └── main.cpp                        # Executable entrypoint
└── tests/
    ├── CMakeLists.txt
    └── test_core.cpp                   # Catch2 / GTest unit tests
```

### Essential Tooling & Standards
- **Standard**: Modern C++20 or C++23. Avoid raw pointers; use smart pointers (`std::unique_ptr`, `std::shared_ptr`) and RAII.
- **Build System**: `CMake` (3.25+) paired with `Ninja`.
- **Package Management**: `Conan 2.0` or `vcpkg`.
- **Sanitizers**: AddressSanitizer (`-fsanitize=address`), UndefinedBehaviorSanitizer (`-fsanitize=undefined`), and ThreadSanitizer (`-fsanitize=thread`).
- **Testing**: `Catch2 v3` or `GoogleTest`.

### Standard CMake Commands
```bash
# Configure build with Ninja
cmake -B build -S . -DCMAKE_BUILD_TYPE=Release -G Ninja
# Compile
cmake --build build -j
# Run unit test suite
ctest --test-dir build --output-on-failure
# Format codebase
find src include -name '*.cpp' -o -name '*.hpp' | xargs clang-format -i
```

---

## 2.6 HTML / CSS / JS Static Projects

Applicable to: **Landing pages, vanilla web applications, documentation sites, Jamstack**.

### Standard File Structure
```text
static-project/
├── index.html                          # Semantic HTML5 entry point
├── 404.html                            # Custom error fallback page
├── robots.txt                          # Search engine crawling rules
├── sitemap.xml                         # Search engine site index
├── .htmlhintrc                         # HTML validation configuration
├── assets/
│   ├── css/
│   │   └── style.css                   # Responsive styles / Tailwind CSS
│   ├── js/
│   │   └── main.js                     # Vanilla ES6+ modules
│   └── img/
│       ├── favicon.ico
│       ├── og-image.png                # Social media sharing preview (1200x630)
│       └── logo.svg                    # Scalable vector graphics
└── vercel.json (or netlify.toml)       # CDN edge headers, caching, rewrites
```

### Core Web Standards Checklist
1. **Semantic HTML5**: Use `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
2. **SEO & Social Meta Tags**:
   - `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
   - `<meta name="description" content="...">`
   - OpenGraph tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`.
   - Twitter Card tags: `twitter:card`, `twitter:title`, `twitter:image`.
3. **Accessibility (a11y)**:
   - Provide non-empty `alt` attributes for all images.
   - Maintain minimum WCAG AA color contrast (4.5:1 for normal text).
   - Ensure all interactive elements have visible `:focus-visible` styling.
4. **Performance Optimization**:
   - Modern image formats (WebP, AVIF, SVG) with explicit `width` and `height`.
   - Native lazy loading: `<img loading="lazy" ...>`.
   - Defer script execution: `<script type="module" src="...">` or `<script defer src="...">`.

---

# 3. Universal Cross-Cutting Topics

---

## 3.1 Secrets Management & Security Hygiene

1. **Strict Exclusion of Secrets**:
   - Secrets (`API_KEY`, passwords, private keys, database connection strings) must **NEVER** be committed to Git.
   - All repositories must include a `.env.example` documenting expected variable names with empty values.
2. **Automated Secret Scanning**:
   - Use tools like `gitleaks`, `trufflehog`, or GitHub Secret Scanning in CI pipelines to prevent accidental leakage.
3. **Run-Time Secret Injection**:
   - In development: Local `.env` files (strictly listed in `.gitignore`).
   - In production: Injected via cloud environment variables (AWS Secrets Manager, GCP Secret Manager, Vault, or Kubernetes Secrets).

---

## 3.2 Production Containerization Standards

Universal multi-stage Dockerfile best practices:
1. **Never run containers as root**: Always define and switch to a non-privileged user (e.g. `USER appuser`).
2. **Leverage Docker Layer Caching**: Copy dependency manifests (`package.json`, `pom.xml`, `pyproject.toml`) and download packages *before* copying application source code.
3. **Use Minimal Base Images**: Prefer `alpine`, `distroless`, or `-slim` Debian variants to minimize attack surface and reduce image transfer times.

---

## 3.3 Dependency Automation (Dependabot / Renovate)

Create `.github/dependabot.yml` to automatically detect outdated or vulnerable dependencies:

```yaml
version: 2
updates:
  - package-ecosystem: "npm" # (or "maven", "pip", "gradle", "github-actions")
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    commit-message:
      prefix: "chore(deps)"
```

---

## 3.4 Architecture Decision Records (ADRs)

Document significant architectural choices in `docs/adr/`. Each ADR follows this format:

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
