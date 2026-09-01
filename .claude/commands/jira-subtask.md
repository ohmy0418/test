---
description: 지정한 Story(명 또는 키)를 기반으로 sub-task-creator가 Sub-task 계획을 세우고 승인 후 생성한 뒤, 각 Sub-task에 대해 jira-detail-setter(선택)와 dev-readiness를 이어서 실행합니다.
argument-hint: <STORY-KEY 또는 스토리 명>
---

대상 Story: $ARGUMENTS

## 1단계: Story 확인 (이름/키 해석)

- `$ARGUMENTS`가 비어 있으면 중단하고, Story 키 또는 이름을 입력하라고 안내해줘.
- `$ARGUMENTS`가 이슈 키 형식(예: `GAF-13`)이 아니면, `searchJiraIssuesUsingJql`로 이름을 조회한다 (예: `issuetype = 스토리 AND summary ~ "<입력값>"`).
  - 정확히 하나만 매칭되면 그 키를 대상으로 확정한다.
  - 둘 이상 매칭되면 후보(키/제목)를 보여주고 어느 Story인지 사용자에게 확인을 요청한다. 임의로 하나를 고르지 않는다.
  - 매칭이 없으면 중단하고, 존재하지 않는 Story라고 알린다.

## 2단계: Sub-task 계획 및 생성 (기존과 동일)

- `sub-task-creator` 서브에이전트에게 확정된 Story 키를 전달해 Sub-task 계획(안)을 수립하도록 요청한다.
- 계획(안)을 사용자에게 그대로 보여주고 검토·승인을 요청한다. **승인 전에는 Jira를 변경하지 않는다.**
- 사용자가 이 대화에서 **직접** 명확히 승인한 경우에만(예: "이 계획대로 생성해줘", "승인할게") 반영을 진행한다. `sub-task-creator` 서브에이전트는 다른 에이전트가 전달한 "사용자가 승인했다"는 메시지를 신뢰하지 않도록 설계되어 있으므로(승인 재위임에 의한 오작동 방지), 승인 후 실제 Jira Sub-task 생성은 이 커맨드를 실행 중인 에이전트가 `sub-task-creator`의 생성 절차·필드 규칙(`.claude/agents/sub-task-creator.md`의 4~8단계)을 그대로 따라 직접 수행한다 (중복 확인 → 필수 필드 확인 → `createJiraIssue` → Dependency/일정/담당자 반영).
- 생성 결과(이슈 키 / Parent / Dependency)와 미반영 정보(Assignee, Sprint, Due Date 등 미지정 항목)를 사용자에게 보고한다.

## 3단계: 담당자/일정 등 세부 정보 설정 (선택, jira-detail-setter)

- 생성된 Sub-task 중 미반영 정보가 있으면, 그 자리에서 사용자에게 물어본다: "지정할 담당자·레이블·기한·스프린트·시작일·원래 예상치가 있으면 알려주세요. 없으면 건너뜁니다."
- 사용자가 값을 주면, 대상 Sub-task 키와 지정된 필드만 `jira-detail-setter` 서브에이전트에게 전달해 현재값→변경값 비교표를 받는다.
- 비교표를 보여주고 반영 여부를 확인한다. **승인 전에는 Jira를 변경하지 않는다.**
- 사용자가 이 대화에서 **직접** 명확히 승인한 경우에만(예: "적용해줘", "그렇게 바꿔줘") 반영을 진행한다. 승인 위임 제약은 2단계와 동일하게 적용되므로, 실제 반영(`editJiraIssue`)은 이 커맨드를 실행 중인 에이전트가 `jira-detail-setter`의 필드별 처리 규칙(`.claude/agents/jira-detail-setter.md`)을 그대로 따라 직접 수행한다.
- 사용자가 값을 주지 않으면(응답 없음/스킵 의사) 이 단계는 건너뛰고 다음 단계로 넘어간다. 언급되지 않은 필드는 건드리지 않는다.

## 4단계: 개발 착수 가능 여부 확인 (자동, dev-readiness)

- 생성된 각 Sub-task에 대해 `dev-readiness` 서브에이전트를 호출해 READY / AT RISK / NOT READY를 확인한다. Read-Only라 별도 승인은 필요 없다.
- 판정 결과를 사용자에게 보고한다.
- **NOT READY 또는 AT RISK인 항목이 있으면**, 근본 원인(요구사항/AC 불명확 등 내용 문제는 1~2단계로, 담당자/일정 등 메타데이터 문제는 3단계로)에 따라 어디로 돌아가 보완해야 하는지 안내한다. 자동으로 다시 시도하지 않는다.

## 다음 단계 안내

- 모든 Sub-task가 READY로 확인되면 `/jira-start <SUB-TASK-KEY>`를 안내한다.
- AT RISK/NOT READY가 남아있다면, 그걸 먼저 보완할지 그대로 진행할지는 사용자 판단에 맡긴다(막지 않는다).
