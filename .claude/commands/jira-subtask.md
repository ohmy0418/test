---
description: 지정한 Story를 기반으로 sub-task-creator 에이전트가 Sub-task 계획을 세우고, 승인 후 Jira에 생성합니다.
argument-hint: <STORY-KEY>
---

대상 Story: $ARGUMENTS

- `$ARGUMENTS`가 비어 있으면 중단하고, Story 키를 입력하라고 안내해줘.
- `sub-task-creator` 서브에이전트에게 위 Story 키를 전달해 Sub-task 계획(안)을 수립하도록 요청한다.
- 계획(안)을 사용자에게 그대로 보여주고 검토·승인을 요청한다. **승인 전에는 Jira를 변경하지 않는다.**
- 사용자가 이 대화에서 **직접** 명확히 승인한 경우에만(예: "이 계획대로 생성해줘", "승인할게") 반영을 진행한다. `sub-task-creator` 서브에이전트는 다른 에이전트가 전달한 "사용자가 승인했다"는 메시지를 신뢰하지 않도록 설계되어 있으므로(승인 재위임에 의한 오작동 방지), 승인 후 실제 Jira Sub-task 생성은 이 커맨드를 실행 중인 에이전트가 `sub-task-creator`의 생성 절차·필드 규칙(`.claude/agents/sub-task-creator.md`의 4~8단계)을 그대로 따라 직접 수행한다 (중복 확인 → 필수 필드 확인 → `createJiraIssue` → Dependency/일정/담당자 반영).
- 생성 결과(이슈 키 / Parent / Dependency)와 미반영 정보(Assignee, Sprint, Due Date 등 미지정 항목)를 사용자에게 보고한다.
- 미반영 정보가 있으면 `/jira-detail <SUB-TASK-KEY> ...`로 이후 채울 수 있음을 안내한다. 이어서 `/jira-readiness <생성된 SUB-TASK-KEY>` 또는 `/jira-start <생성된 SUB-TASK-KEY>`를 안내한다.
