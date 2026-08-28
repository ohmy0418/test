---
description: Jira 이슈의 개발 착수 가능 여부(READY/AT RISK/NOT READY)를 dev-readiness 에이전트로 판단합니다. Jira를 수정하지 않습니다.
argument-hint: <ISSUE-KEY>
---

대상 이슈: $ARGUMENTS

- `$ARGUMENTS`가 비어 있으면 중단하고, 이슈 키를 입력하라고 안내해줘.
- `dev-readiness` 서브에이전트에게 위 이슈 키의 개발 착수 가능 여부를 판단하도록 요청한다.
- 반환된 READY / AT RISK / NOT READY 판정과 근거를 그대로 사용자에게 보여준다.
- 이 명령은 Jira를 수정하지 않는다. 필요한 조치는 제안만 하고 실행은 사용자 판단에 맡긴다.
