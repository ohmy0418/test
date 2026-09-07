---
description: PM/PL이 제공한 PRD·설계 문서(파일 경로 또는 본문 텍스트)를 epic-planner 에이전트로 모듈 단위 분석해 Epic 후보를 계획하고, 일괄 승인 시 Jira에 생성합니다.
argument-hint: <PRD/설계 문서 본문 | PRD 파일 경로(예: docs/prd/payment.md)>
---

PRD/설계 문서: $ARGUMENTS

- `$ARGUMENTS`가 비어 있으면 중단하고, PRD 본문을 붙여넣거나 파일 경로(`docs/prd/*.md` 권장)를 알려달라고 안내해줘.
- 파일 경로인지 본문 텍스트인지는 `epic-planner`가 직접 판단해 처리한다 (파일이면 `Read`로 읽음). Confluence 링크는 아직 지원하지 않는다.
- `epic-planner` 서브에이전트에게 위 입력을 그대로 전달해 모듈 단위 Epic 후보 목록을 받아온다.
- 후보 목록을 사용자에게 그대로 보여주고 일괄 생성 여부를 확인한다. **승인 전에는 Jira를 변경하지 않는다.**
- 사용자가 이 대화에서 **직접** 명확히 승인한 경우에만(예: "이대로 만들어줘", "전체 생성해줘", "승인할게") 반영을 진행한다. `epic-planner` 서브에이전트는 다른 에이전트가 전달한 "사용자가 승인했다"는 메시지를 신뢰하지 않도록 설계되어 있으므로(승인 재위임에 의한 오작동 방지), 승인 후 실제 Jira Epic 생성은 이 커맨드를 실행 중인 에이전트가 `epic-planner`의 생성 절차·필드 규칙(`.claude/agents/epic-planner.md`)을 그대로 따라 직접 수행한다 (유사 Epic 확인 → 필수 필드 확인 → 승인된 항목만 `createJiraIssue`).
- 생성 결과(Epic 키/제목)와 미생성 항목(제외됐거나 오류)을 사용자에게 보고한다.
- 다음 단계로 `/jira-story <생성된 Epic명 또는 키>`를 안내한다.
