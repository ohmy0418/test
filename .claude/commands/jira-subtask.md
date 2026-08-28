---
description: 지정한 Story를 기반으로 sub-task-creator 에이전트가 Sub-task 계획을 세우고, 승인 후 Jira에 생성합니다.
argument-hint: <STORY-KEY>
---

대상 Story: $ARGUMENTS

- `$ARGUMENTS`가 비어 있으면 중단하고, Story 키를 입력하라고 안내해줘.
- `sub-task-creator` 서브에이전트에게 위 Story 키를 전달해 Sub-task 계획(안)을 수립하도록 요청한다.
- 계획(안)을 사용자에게 그대로 보여주고 검토·승인을 요청한다. **승인 전에는 Jira를 변경하지 않는다.**
- 사용자가 명확히 승인한 경우에만 `sub-task-creator`가 실제 Jira Sub-task를 생성하도록 이어서 진행한다.
- 생성 결과(이슈 키 / Parent / Dependency)와 미반영 정보(Assignee, Sprint, Due Date 등 미지정 항목)를 사용자에게 보고한다.
- 필요하면 다음 단계로 `/jira-readiness <생성된 SUB-TASK-KEY>` 또는 `/jira-start <생성된 SUB-TASK-KEY>`를 안내한다.
