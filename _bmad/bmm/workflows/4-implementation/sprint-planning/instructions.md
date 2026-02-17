# Sprint Planning - GitHub Milestone Manager

<critical>The workflow execution engine is governed by: {project-root}/_bmad/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: {project-root}/_bmad/bmm/workflows/4-implementation/sprint-planning/workflow.yaml</critical>
<critical>🐙 ALL TRACKING IS ON GITHUB — epics are issues with label `epic`, stories are issues with label `story`</critical>
<critical>⚠️ ABSOLUTELY NO TIME ESTIMATES. Do NOT mention hours, days, weeks, or timelines.</critical>

<workflow>

<step n="1" goal="Discover all epics and stories from GitHub">
<action>Load {project_context} for project-wide patterns and conventions (if exists)</action>
<action>Communicate in {communication_language} with {user_name}</action>

<action>Fetch all issues from {github_owner}/{github_repo}:</action>

1. **Epic issues:** Search for issues with label `epic`, state: open
2. **Story issues:** Search for issues with label `story`, state: open

<action>For each epic issue, identify its sub-issues (stories)</action>
<action>Build complete inventory:
  - Epic → list of story issues (sub-issues)
  - For each story, note its current status label: `backlog`, `ready-for-dev`, `in-progress`, `review`
  - Closed story issues = `done`
</action>

<action>Present inventory to {user_name}:</action>

```
## Current GitHub Issues Inventory

### Epic 1: {title} (#{issue_number})
- Story 1.1: {title} (#{number}) — {status_label}
- Story 1.2: {title} (#{number}) — {status_label}
...

### Epic 2: {title} (#{issue_number})
- Story 2.1: {title} (#{number}) — {status_label}
...
```
</step>

<step n="2" goal="Create or select GitHub Milestone for sprint">
<action>List existing milestones on {github_owner}/{github_repo}</action>

<check if="user wants to create a new milestone">
  <ask>What should the sprint milestone be named? (e.g., "Sprint 1", "MVP Sprint")</ask>
  <action>Create a new milestone on {github_owner}/{github_repo}:
    - **Title:** {user_provided_name}
    - **Description:** Sprint planning for {project_name}
  </action>
  <action>Store {{milestone_number}}</action>
</check>

<check if="user wants to use an existing milestone">
  <action>Use the selected milestone</action>
  <action>Store {{milestone_number}}</action>
</check>

<output>📌 Using milestone: {{milestone_title}} (#{milestone_number})</output>
</step>

<step n="3" goal="Select stories for the sprint">
<action>Present all unassigned story issues (not in any milestone) to {user_name}</action>
<action>Group by epic for clarity</action>

<ask>Which stories should be included in this sprint? You can:
1. Select specific story issue numbers (e.g., #12, #15, #18)
2. Select entire epics (e.g., "all of Epic 1")
3. Select by status (e.g., "all backlog stories")
4. Select all stories</ask>

<action>Based on user selection, collect the list of story issue numbers for the sprint</action>
</step>

<step n="4" goal="Assign stories to milestone">
<action>For each selected story issue:</action>

1. Assign it to milestone {{milestone_number}} on {github_owner}/{github_repo}
2. Report: "Assigned #{issue_number} ({story_title}) to milestone {{milestone_title}}"

<action>Count totals after assignment</action>
</step>

<step n="5" goal="Validate and report">
<action>Perform validation:</action>

- [ ] All selected stories are assigned to the milestone
- [ ] No duplicate assignments
- [ ] Milestone is accessible and visible

<action>Display completion summary:</action>

```
## 📋 Sprint Planning Complete

- **Milestone:** {{milestone_title}}
- **Stories assigned:** {{story_count}}
- **Status breakdown:**
  - backlog: {{count_backlog}}
  - ready-for-dev: {{count_ready}}
  - in-progress: {{count_in_progress}}
  - review: {{count_review}}
  - done: {{count_done}}

**Next Steps:**
1. Run `create-story` to enrich backlog stories with dev context
2. Run `dev-story` to start implementing ready-for-dev stories
3. Run `sprint-status` to check progress at any time
```
</step>

</workflow>
