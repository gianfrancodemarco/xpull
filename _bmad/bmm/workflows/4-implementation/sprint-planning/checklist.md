# Sprint Planning Validation Checklist

## Core Validation

### Complete Coverage Check

- [ ] Every epic found in epic\*.md files is represented as a GitHub epic and tracked on GitHub (use `gh` CLI)
- [ ] Every story found in epic\*.md files exists as a GitHub issue linked to its epic (use `gh` CLI)
- [ ] Every epic has a corresponding retrospective entry
- [ ] No items in GitHub epics that don't exist in epic files

### Parsing Verification

Compare epic files against GitHub epics (use `gh` CLI to list epics/issues):

```
Epic Files Contains:                GitHub Epics Contains:
✓ Epic 1                            ✓ epic-1: [issue #]
  ✓ Story 1.1: User Auth              ✓ 1-1-user-auth: [issue #]
  ✓ Story 1.2: Account Mgmt           ✓ 1-2-account-mgmt: [issue #]
  ✓ Story 1.3: Plant Naming           ✓ 1-3-plant-naming: [issue #]
                                      ✓ epic-1-retrospective: [issue #]
✓ Epic 2                            ✓ epic-2: [issue #]
  ✓ Story 2.1: Personality Model      ✓ 2-1-personality-model: [issue #]
  ✓ Story 2.2: Chat Interface         ✓ 2-2-chat-interface: [issue #]
                                      ✓ epic-2-retrospective: [issue #]
```

### Final Check

- [ ] Total count of epics matches
- [ ] Total count of stories matches
- [ ] All items are in the expected order (epic, stories, retrospective)
