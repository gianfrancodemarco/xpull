# Sprint Status - GitHub Dashboard

<critical>The workflow execution engine is governed by: {project-root}/_bmad/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: {project-root}/_bmad/bmm/workflows/4-implementation/sprint-status/workflow.yaml</critical>
<critical>Modes: interactive (default), validate, data</critical>
<critical>⚠️ ABSOLUTELY NO TIME ESTIMATES. Do NOT mention hours, days, weeks, or timelines.</critical>
<critical>🐙 ALL DATA COMES FROM GITHUB — read issues, labels, milestones from {github_owner}/{github_repo}</critical>

<workflow>

<step n="0" goal="Determine execution mode">
  <action>Set mode = {{mode}} if provided by caller; otherwise mode = "interactive"</action>

  <check if="mode == data">
    <action>Jump to Step 20</action>
  </check>

  <check if="mode == validate">
    <action>Jump to Step 30</action>
  </check>

  <check if="mode == interactive">
    <action>Continue to Step 1</action>
  </check>
</step>

<step n="1" goal="Fetch sprint data from GitHub">
  <action>Load {project_context} for project-wide patterns (if exists)</action>

  <action>Fetch all issues from {github_owner}/{github_repo}:</action>

  **Epic issues:** Search for issues with label `epic`
  **Story issues:** Search for issues with label `story`

  <action>For each story issue, determine status:</action>
  - If issue is closed → `done`
  - If issue has label `review` → `review`
  - If issue has label `in-progress` → `in-progress`
  - If issue has label `ready-for-dev` → `ready-for-dev`
  - If issue has label `backlog` → `backlog`
  - If none of the above → `backlog` (default)

  <action>For each epic issue, determine status:</action>
  - If issue is closed → `done`
  - If any sub-issue is `in-progress`, `review`, or `ready-for-dev` → `in-progress`
  - If all sub-issues are closed → `done`
  - Otherwise → `backlog`

  <action>Count story statuses: backlog, ready-for-dev, in-progress, review, done</action>
  <action>Count epic statuses: backlog, in-progress, done</action>

  <action>Check for active milestone and its progress</action>
</step>

<step n="2" goal="Detect risks and anomalies">
  <action>Detect risks:</action>

  - IF any story has label `review`: suggest `code-review` workflow
  - IF any story has label `in-progress` AND no stories have `ready-for-dev`: recommend staying focused
  - IF all stories are `backlog`: prompt `create-story` to enrich next story
  - IF any story issue has no parent epic (not a sub-issue): warn "orphaned story detected"
  - IF any epic is open but all its sub-issues are closed: suggest closing the epic
  - IF any story has multiple status labels: warn "conflicting status labels"
</step>

<step n="3" goal="Select next action recommendation">
  <action>Pick the next recommended workflow using priority:</action>
  <note>When selecting "first" story: sort by issue number ascending</note>
  1. If any story status == in-progress → recommend `dev-story` for that story (issue #{number})
  2. Else if any story status == review → recommend `code-review` for that story
  3. Else if any story status == ready-for-dev → recommend `dev-story` for that story
  4. Else if any story status == backlog → recommend `create-story` for that story
  5. Else → All implementation items done; congratulate the user!
  <action>Store: next_issue_number, next_workflow_id</action>
</step>

<step n="4" goal="Display summary">
  <output>
## 📊 Sprint Status

- **Project:** {project_name}
- **Repository:** {github_owner}/{github_repo}
- **Tracking:** GitHub Issues + Milestones

**Stories:** backlog {{count_backlog}}, ready-for-dev {{count_ready}}, in-progress {{count_in_progress}}, review {{count_review}}, done {{count_done}}

**Epics:** backlog {{epic_backlog}}, in-progress {{epic_in_progress}}, done {{epic_done}}

{{#if active_milestone}}
**Active Milestone:** {{milestone_title}} — {{milestone_open_issues}} open, {{milestone_closed_issues}} closed
{{/if}}

**Next Recommendation:** `{{next_workflow_id}}` → Issue #{{next_issue_number}}

{{#if risks}}
**Risks:**
{{#each risks}}
- {{this}}
{{/each}}
{{/if}}

  </output>
</step>

<step n="5" goal="Offer actions">
  <ask>Pick an option:
1) Run recommended workflow now
2) Show all stories grouped by status
3) Show all stories grouped by epic
4) Open GitHub issues page in browser
5) Exit
Choice:</ask>

  <check if="choice == 1">
    <output>Run `{{next_workflow_id}}` targeting issue #{{next_issue_number}}.</output>
  </check>

  <check if="choice == 2">
    <output>
### Stories by Status
- **In Progress:** {{stories_in_progress_with_issue_numbers}}
- **Review:** {{stories_in_review_with_issue_numbers}}
- **Ready for Dev:** {{stories_ready_with_issue_numbers}}
- **Backlog:** {{stories_backlog_with_issue_numbers}}
- **Done:** {{stories_done_with_issue_numbers}}
    </output>
  </check>

  <check if="choice == 3">
    <action>Display stories grouped by their parent epic issue</action>
  </check>

  <check if="choice == 4">
    <output>Open: https://github.com/{github_owner}/{github_repo}/issues</output>
  </check>

  <check if="choice == 5">
    <action>Exit workflow</action>
  </check>
</step>

<!-- ========================= -->
<!-- Data mode for other flows -->
<!-- ========================= -->

<step n="20" goal="Data mode output">
  <action>Fetch and parse GitHub issues same as Step 1-2</action>
  <action>Compute recommendation same as Step 3</action>
  <template-output>next_workflow_id = {{next_workflow_id}}</template-output>
  <template-output>next_issue_number = {{next_issue_number}}</template-output>
  <template-output>count_backlog = {{count_backlog}}</template-output>
  <template-output>count_ready = {{count_ready}}</template-output>
  <template-output>count_in_progress = {{count_in_progress}}</template-output>
  <template-output>count_review = {{count_review}}</template-output>
  <template-output>count_done = {{count_done}}</template-output>
  <template-output>epic_backlog = {{epic_backlog}}</template-output>
  <template-output>epic_in_progress = {{epic_in_progress}}</template-output>
  <template-output>epic_done = {{epic_done}}</template-output>
  <template-output>risks = {{risks}}</template-output>
  <action>Return to caller</action>
</step>

<!-- ========================= -->
<!-- Validate mode -->
<!-- ========================= -->

<step n="30" goal="Validate GitHub tracking setup">
  <action>Check that required labels exist on {github_owner}/{github_repo}: epic, story, backlog, ready-for-dev, in-progress, review</action>
  <check if="any label missing">
    <template-output>is_valid = false</template-output>
    <template-output>error = "Missing required labels: {{missing_labels}}"</template-output>
    <template-output>suggestion = "Run create-epics-and-stories workflow which auto-creates labels"</template-output>
    <action>Return</action>
  </check>

  <action>Check that at least one epic issue exists</action>
  <check if="no epic issues">
    <template-output>is_valid = false</template-output>
    <template-output>error = "No epic issues found"</template-output>
    <template-output>suggestion = "Run create-epics-and-stories workflow to create epics and stories"</template-output>
    <action>Return</action>
  </check>

  <action>Check that story issues exist and are linked as sub-issues of epics</action>
  <check if="no story issues">
    <template-output>is_valid = false</template-output>
    <template-output>error = "No story issues found"</template-output>
    <template-output>suggestion = "Run create-epics-and-stories workflow"</template-output>
    <action>Return</action>
  </check>

  <template-output>is_valid = true</template-output>
  <template-output>message = "GitHub tracking valid: labels present, epics and stories exist"</template-output>
</step>

</workflow>
