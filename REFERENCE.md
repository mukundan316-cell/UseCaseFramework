# REFERENCE.md
# RSA AI Framework Microsite – Project Reference Guide: Principles & Best Practices

## 📑 Table of Contents
- [Overview](#overview)
- [Core Architecture Principles](#core-architecture-principles)
- [Coding Standards](#coding-standards)
- [Security Guidelines](#security-guidelines)
- [Dependency & Version Control](#dependency--version-control)
- [Testing & Refactoring](#testing--refactoring)
- [User Experience (UX) Rules](#user-experience-ux-rules)
- [Prompting Guidelines for AI Agents](#prompting-guidelines-for-ai-agents)
- [Contributing & Review Process](#contributing--review-process)

## 🧭 Overview
This guide defines how to build, maintain, and extend the RSA GenAI Use Case Prioritization Microsite.
It supports consistent practices across contributors, agents, and code environments.

**Use this guide before every commit, code proposal, or structural change.**

## 🧱 Core Architecture Principles

### Modularity (LEGO-style):
Every feature (e.g., Use Case Form, Matrix View, Explorer, Admin Panel) must be in its own isolated component with defined data contracts.

### Metadata-Driven Design:
Dropdown filters and taxonomies must be driven by editable JSON or database with no hardcoded lists.

### Database-First Persistence:
**All data must be persisted to the database before being used across the application.** No hardcoded arrays, localStorage, or client-side storage should be used as primary data sources. Every data operation must follow the pattern: Database → API → Frontend. This ensures data consistency, enables multi-user scenarios, and maintains enterprise-grade reliability.

### Quadrant Logic Built-In:
Use cases must be classified dynamically using scoring logic:

```javascript
impact_score = avg(revenue_impact, cost_savings, risk_reduction, strategic_fit);
effort_score = avg(data_readiness, technical_complexity, change_impact, adoption_readiness);

if (impact_score >= 4 && effort_score <= 2.5) quadrant = "Quick Win"
else if (impact_score >= 4) quadrant = "Strategic Bet"
else if (effort_score <= 2.5) quadrant = "Experimental"
else quadrant = "Watchlist"
```

### Extensibility Without Regression:
New tabs (e.g., Maturity Scorecard, ROI Dashboard) must plug into the same store and schema without breaking current functionality.

### Clarity & Simplicity:
Keep logic intuitive and minimal. Write as if the next developer will maintain it tomorrow.

## ✍️ Coding Standards

### Naming:
- Use `camelCase` for variables and props
- Use `PascalCase` for components
- Use `kebab-case` for file names

### Short Functions, Single Responsibility:
Break complex logic into small, composable helpers.

### Comments:
- Always document quadrant logic, matrix transforms, and config loads
- Avoid stating the obvious

### Global State via Store:
Use React Context or Zustand. Avoid prop drilling or global variables.

### File Structure:
```
/components/UseCaseForm
/components/MatrixPlot
/components/Explorer
/components/AdminPanel
/data/usecases.json
/data/filters.json
/services/useCaseStore.js
```

## 🔐 Security Guidelines

### Never Hardcode Secrets:
All credentials (if added) must be stored using Replit's Secrets Manager.

### No PII or Live Data:
All use case data should be anonymized or synthetic.

### Dependencies Must Be:
- Actively maintained
- Auditable (via npm or GitHub)
- Used intentionally (no bloat)

## 🔄 Dependency & Version Control

### Version Control:
Always use Git, and commit frequently with meaningful messages.

### Branching Strategy:
Use feature branches for additions (e.g., `feat/admin-import-export`) and merge after review.

### Lock Versions:
Use exact versions in package.json. Revisit dependencies quarterly.

### Document Decisions:
If you change quadrant logic, scoring formula, or filtering behavior—log it in the changelog or this file.

## 🧪 Testing & Refactoring

### Manual UX Test Checklist:
- [ ] Can I submit a use case and see it in the matrix?
- [ ] Do quadrant colors and labels match logic?
- [ ] Do all filters and LOVs behave as expected?

### Refactor Often:
If something is too long, repeated, or fragile—refactor before extending.

### Error Handling:
Gracefully handle:
- Empty filter lists
- Invalid scoring inputs
- JSON import/export errors

## 🎨 User Experience (UX) Rules

### Minimalist, Modern, and Consistent:
Use Tailwind with RSA's theme:
- **Blue**: `#005DAA`
- **Background**: `#F7F8F9`
- **Cards**: White with soft shadow and rounded corners

### Filter-First Design:
Explorer and Admin views should be immediately usable without scrolling or confusion.

### Inline Help:
Use info icons (ℹ️) to explain sliders or quadrant meaning.

### Responsive:
Must work on tablet and desktop screens (minimum width: 768px).

## 🧠 Prompting Guidelines for AI Agents

Before submitting any generated code, the agent must:

1. **Read this REFERENCE.md fully**
2. **Break the task into modular components**
3. **Use database and metadata config as sources—no hardcoded values**
4. **Implement scoring and quadrant logic explicitly**
5. **Store all scoring, quadrant, and metadata in a central data store**
6. **Export sample use cases with correct quadrant assignment**
7. **Ensure all data is database-persisted before use—no localStorage or hardcoded fallbacks**

## 🔁 Contributing & Review Process

### Contribution Flow:
1. Review REFERENCE.md
2. Make changes in a dedicated branch
3. Run matrix tests and filter tests
4. Document any changes to config or logic
5. Submit for review with checklist filled

### Review Checklist:
- [ ] Are the filters editable from Admin Panel?
- [ ] Does scoring follow quadrant rules?
- [ ] Are UI components modular and scoped?
- [ ] Are design and UX consistent?
- [ ] Are secrets and config files secure?
- [ ] Is all data properly persisted to database (no hardcoding or localStorage)?
- [ ] Do all components fetch data via API endpoints?

## 🚀 Final Note
**Build like it will be scaled. Design like it will be demoed.**
**Keep it modular, metadata-driven, and matrix-smart.**