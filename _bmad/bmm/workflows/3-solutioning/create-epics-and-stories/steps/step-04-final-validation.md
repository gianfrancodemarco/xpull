---
name: 'step-04-final-validation'
description: 'Validate complete coverage of all requirements by checking GitHub issues'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/3-solutioning/create-epics-and-stories'

# File References
thisStepFile: './step-04-final-validation.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{planning_artifacts}/epics.md'

# GitHub Configuration (from config.yaml)
github_owner: '{config_source}:github_owner'
github_repo: '{config_source}:github_repo'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'
---

# Step 4: Final Validation

## STEP GOAL:

To validate complete coverage of all requirements by verifying GitHub issues exist and are properly structured on `{github_owner}/{github_repo}`.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: Process validation sequentially without skipping
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a product strategist and technical specifications writer
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring validation expertise and quality assurance
- ✅ User brings their implementation priorities and final review

### Step-Specific Rules:

- 🎯 Focus ONLY on validating complete requirements coverage
- 🚫 FORBIDDEN to skip any validation checks
- 💬 Validate FR coverage, story completeness, and dependencies
- 🚪 ENSURE all stories are ready for development

## EXECUTION PROTOCOLS:

- 🎯 Validate every requirement has story coverage
- 💾 Check story dependencies and flow
- 📖 Verify architecture compliance
- 🐙 **Validate GitHub issues** — all epics and stories must exist as issues
- 🚫 FORBIDDEN to approve incomplete coverage

## VALIDATION PROCESS:

### 1. GitHub Issues Inventory

Fetch all issues from `{github_owner}/{github_repo}`:

- List all issues with label `epic` → these are the epic issues
- List all issues with label `story` → these are the story issues
- Verify each epic issue has sub-issues (the stories)
- Verify all story issues have labels `story` + `backlog`

**Present inventory:**
- Total epic issues: {{epic_count}}
- Total story issues: {{story_count}}
- Any orphan stories (not linked to an epic): {{orphan_list}}

### 2. FR Coverage Validation

Cross-reference the requirements from the planning documents with the GitHub story issues:

**CRITICAL CHECK:**

- Go through each FR from the Requirements Inventory
- Verify it is addressed by at least one story issue
- Check that the story's acceptance criteria (in the issue body) fully address the FR
- No FRs should be left uncovered

### 3. Architecture Implementation Validation

**Check for Starter Template Setup:**

- Does Architecture document specify a starter template?
- If YES: The first story in Epic 1 must set up the initial project from the starter template

**Database/Entity Creation Validation:**

- Are database tables/entities created ONLY when needed by stories?
- ❌ WRONG: First story creates all tables upfront
- ✅ RIGHT: Tables created as part of the first story that needs them

### 4. Story Quality Validation

**Each story issue must:**

- Be completable by a single dev agent
- Have clear acceptance criteria in the issue body
- Reference specific FRs it implements
- **Not have forward dependencies** (can only depend on PREVIOUS stories)
- Be implementable without waiting for future stories

### 5. Dependency Validation (CRITICAL)

**Epic Independence Check:**

- Does each epic deliver COMPLETE functionality for its domain?
- Can Epic 2 function without Epic 3 being implemented?
- ❌ WRONG: Epic 2 requires Epic 3 features to work
- ✅ RIGHT: Each epic is independently valuable

**Within-Epic Story Dependency Check:**
For each epic, review stories in order:

- Can Story N.1 be completed without Stories N.2, N.3, etc.?
- Can Story N.2 be completed using only Story N.1 output?
- ❌ WRONG: Story references features not yet implemented
- ✅ RIGHT: Each story builds only on previous stories

### 6. Present Validation Results

Display a summary:

```
## Validation Results

### GitHub Issues
- Epic issues: {count} ✅/❌
- Story issues: {count} ✅/❌
- All stories linked as sub-issues: ✅/❌
- All stories labeled correctly: ✅/❌

### FR Coverage
- FRs covered: {covered}/{total}
- Missing coverage: {list_of_uncovered_FRs}

### Story Quality
- Forward dependencies found: {count}
- Stories too large: {count}
- Missing acceptance criteria: {count}

### Overall: PASS / NEEDS FIXES
```

If validation fails, work with user to fix issues (create missing issues, update bodies, fix dependencies).

### 7. Complete

**Present Final Menu:**
**All validations complete!** [C] Complete Workflow

When C is selected, the workflow is complete. All epics and stories are tracked as GitHub Issues on `{github_owner}/{github_repo}`.

Epics and Stories complete. Read fully and follow: `_bmad/core/tasks/help.md` with argument `Create Epics and Stories`.

Upon Completion of task output: offer to answer any questions about the Epics and Stories.
