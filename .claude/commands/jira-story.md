---
description: 업무 초안을 Story Planner 에이전트로 분석해 Jira Story로 정리하고, 승인 시 Jira에 생성합니다.
argument-hint: <업무 초안 또는 요구사항 설명>
---

사용자가 제공한 아래 업무 초안을 `story-planner` 서브에이전트에게 전달해 Jira Story로 정리해줘.

업무 초안: $ARGUMENTS

- `$ARGUMENTS`가 비어 있으면 중단하고, 정리할 업무 초안이나 요구사항을 입력하라고 안내해줘.
- `story-planner` 서브에이전트를 호출해 목적 / 요구사항 / Acceptance Criteria / 확인 필요 항목으로 정리된 Story(안)를 받아온다.
- 정리된 Story(안)을 사용자에게 그대로 보여주고 Jira 생성 여부를 확인한다. **승인 전에는 Jira를 변경하지 않는다.**
- 사용자가 명확히 승인하면(예: "이대로 만들어줘", "생성해줘", "승인할게") `story-planner` 서브에이전트가 이어서 Jira에 실제 Story를 생성하도록 진행한다.
- Story가 생성되면 이슈 키를 사용자에게 알려주고, 다음 단계로 `/jira-subtask <생성된 STORY-KEY>`를 안내한다.
