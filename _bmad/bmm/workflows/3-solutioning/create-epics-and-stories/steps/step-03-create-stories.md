---
name: 'step-03-create-stories'
description: 'Generate stories for each epic and create GitHub issues as sub-issues of their parent epic'

# Path Definitions
workflow_path: '{project-root}/_bmad/bmm/workflows/3-solutioning/create-epics-and-stories'

# File References
thisStepFile: './step-03-create-stories.md'
nextStepFile: './step-04-final-validation.md'
workflowFile: '{workflow_path}/workflow.md'
outputFile: '{planning_artifacts}/epics.md'

# GitHub Configuration (from config.yaml)
github_owner: '{config_source}:github_owner'
github_repo: '{config_source}:github_repo'

# Issue Template Reference
storyTemplate: '{project-root}/.github/ISSUE_TEMPLATE/story.md'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

# Template References
epicsTemplate: '{workflow_path}/templates/epics-template.md'
---

# Step 3: Generate Stories and Create GitHub Issues

## STEP GOAL:

To generate stories for each epic collaboratively, then create GitHub issues for each story as sub-issues of their parent epic on `{github_owner}/{github_repo}`.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: Process epics sequentially
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are a product strategist and technical specifications writer
- ✅ If you already have been given communication or persona patterns, continue to use those while playing this new role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring story creation and acceptance criteria expertise
- ✅ User brings their implementation priorities and constraints

### Step-Specific Rules:

- 🎯 Generate stories for each epic following the template exactly
- 🚫 FORBIDDEN to deviate from template structure
- 💬 Each story must have clear acceptance criteria
- 🚪 ENSURE each story is completable by a single dev agent
- 🔗 **CRITICAL: Stories MUST NOT depend on future stories within the same epic**

## EXECUTION PROTOCOLS:

- 🎯 Generate stories collaboratively with user input
- 📖 Process epics one at a time in sequence
- 🚫 FORBIDDEN to skip any epic or rush through stories
- 🐙 **PRIMARY OUTPUT: GitHub Issues** — each approved story becomes a GitHub Issue linked as sub-issue of its epic

## STORY GENERATION PROCESS:

### 1. Load Context from Step 2

You should have the following from step-02:

- Approved epics_list with FR coverage
- **Epic-to-GitHub-Issue mapping:** `Epic {N} → Issue #{number} (ID: {id})`
- Requirements coverage map
- All requirements (FRs, NFRs, additional)

If the epic-to-issue mapping is not in context, search GitHub issues on `{github_owner}/{github_repo}` with label `epic` to recover the mapping.

### 2. Explain Story Creation Approach

**STORY CREATION GUIDELINES:**

For each epic, create stories that:

- Have clear user value
- Are sized for single dev agent completion
- Include specific acceptance criteria (Given/When/Then)
- Reference requirements being fulfilled

**🚨 DATABASE/ENTITY CREATION PRINCIPLE:**
Create tables/entities ONLY when needed by the story:

- ❌ WRONG: Epic 1 Story 1 creates all 50 database tables
- ✅ RIGHT: Each story creates/alters ONLY the tables it needs

**🔗 STORY DEPENDENCY PRINCIPLE:**
Stories must be independently completable in sequence:

- ❌ WRONG: Story 1.2 requires Story 1.3 to be completed first
- ✅ RIGHT: Each story can be completed based only on previous stories

**STORY FORMAT:**

```
### Story {N}.{M}: {story_title}

As a {user_type},
I want {capability},
So that {value_benefit}.

**Acceptance Criteria:**

**Given** {precondition}
**When** {action}
**Then** {expected_outcome}
**And** {additional_criteria}
```

**✅ GOOD STORY EXAMPLES:**

_Epic 1: User Authentication_

- Story 1.1: User Registration with Email
- Story 1.2: User Login with Password
- Story 1.3: Password Reset via Email

**❌ BAD STORY EXAMPLES:**

- Story: "Set up database" (no user value)
- Story: "Create all models" (too large, no user value)
- Story: "Login UI (depends on Story 1.3 API endpoint)" (future dependency!)

### 3. Process Epics Sequentially

For each epic in the approved epics_list:

#### A. Epic Overview

Display:

- Epic number and title
- Epic goal statement
- FRs covered by this epic
- GitHub Issue reference: `#{epic_issue_number}`

#### B. Story Breakdown

Work with user to break down the epic into stories:

- Identify distinct user capabilities
- Ensure logical flow within the epic
- Size stories appropriately

#### C. Generate Each Story

For each story in the epic:

1. **Story Title**: Clear, action-oriented
2. **User Story**: Complete the As a/I want/So that format
3. **Acceptance Criteria**: Write specific, testable criteria

**AC Writing Guidelines:**

- Use Given/When/Then format
- Each AC should be independently testable
- Include edge cases and error conditions
- Reference specific requirements when applicable

#### D. Collaborative Review

After writing each story:

- Present the story to user
- Ask: "Does this story capture the requirement correctly?"
- "Is the scope appropriate for a single dev session?"
- "Are the acceptance criteria complete and testable?"

#### E. Create GitHub Issue for the Story

When story is approved, create a GitHub Issue on `{github_owner}/{github_repo}`:

1. **Create the issue** following the story template at `{storyTemplate}`:
   - **Title:** `Story {N}.{M}: {story_title}`
   - **Body:**
     ```
     ## Story

     As a **{user_type}**,
     I want **{action}**,
     so that **{benefit}**.

     ## Acceptance Criteria

     **Given** {precondition}
     **When** {action}
     **Then** {expected_outcome}
     **And** {additional_criteria}

     <!-- Repeat for all ACs -->

     ## Tasks / Subtasks

     <!-- Will be populated by create-story workflow -->

     ## Dev Notes

     <!-- Will be populated by create-story workflow with full technical context -->
     ```
   - **Labels:** `story`, `backlog`

2. **Add as sub-issue** of the parent epic issue using the epic's issue ID from step-02 mapping.

3. **Record:** `Story {N}.{M} → Issue #{issue_number} (ID: {issue_id})`

4. **Report:** "Created GitHub Issue #{number} for Story {N}.{M}: {title} (sub-issue of Epic #{epic_issue_number})"

### 4. Epic Completion

After all stories for an epic are complete:

- Display epic summary
- Show count of stories created as GitHub issues
- Verify all FRs for the epic are covered
- Show all issue numbers created
- Get user confirmation to proceed to next epic

### 5. Repeat for All Epics

Continue the process for each epic in the approved list, processing them in order (Epic 1, Epic 2, etc.).

### 6. Final Summary

After all epics and stories are created as GitHub issues:

- Total epic issues created
- Total story issues created
- All stories linked as sub-issues of their epics
- All stories labeled with `story` and `backlog`
- FR coverage verified

### 7. Present FINAL MENU OPTIONS

After all epics and stories are complete:

Display: "**Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue"

#### Menu Handling Logic:

- IF A: Read fully and follow: {advancedElicitationTask}
- IF P: Read fully and follow: {partyModeWorkflow}
- IF C: Update frontmatter, then read fully and follow: {nextStepFile}
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#7-present-final-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu
- User can chat or ask questions - always respond and then end with display again of the menu options

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C continue option] is selected and [all stories are created as GitHub issues and linked as sub-issues], will you then read fully and follow: `{nextStepFile}` to begin final validation phase.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All epics processed in sequence
- Stories created for each epic
- All FRs covered by stories
- Stories appropriately sized
- Acceptance criteria are specific and testable
- **GitHub Issues created for ALL stories with `story` + `backlog` labels**
- **ALL story issues linked as sub-issues of their parent epic issue**

### ❌ SYSTEM FAILURE:

- Missing epics or stories
- Stories too large or unclear
- Missing acceptance criteria
- **GitHub Issues NOT created for stories**
- **Stories NOT linked as sub-issues of epics**

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
