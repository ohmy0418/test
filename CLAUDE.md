# CLAUDE.md

이 문서는 이 저장소에서 Claude Code(및 Rovo/Jira MCP 연동)를 사용할 때 지켜야 할 개발 규칙을 정의합니다.

## Jira 연동 워크플로

- `/jira-start <ISSUE-KEY>`: 작업 착수 시 Jira 이슈 정보를 확인하고 구현 계획을 수립합니다. 조회한 Jira 정보를 스냅샷으로 저장합니다.
- `/jira-sync <ISSUE-KEY>`: 개발 도중 Jira 요구사항이 바뀌었는지 확인하고, 변경 영향과 추가 구현 범위를 분석합니다.
- `/jira-story <업무 초안>`: `story-planner` 에이전트가 업무 초안을 Jira Story(목적/요구사항/AC/확인 필요)로 정리하고, 승인 시 Jira에 Story를 생성합니다.
- `/jira-subtask <STORY-KEY>`: `sub-task-creator` 에이전트가 Story를 기반으로 Sub-task 계획(안)을 수립하고, 승인 시 Jira에 Sub-task를 생성합니다.
- `/jira-readiness <ISSUE-KEY>`: `dev-readiness` 에이전트가 개발 착수 가능 여부(READY/AT RISK/NOT READY)를 판단합니다. Read-Only이며 Jira를 수정하지 않습니다. `/jira-start`의 준비 상태 판정도 내부적으로 이 에이전트를 사용합니다.

### 기획 에이전트 (Story → Sub-task → Readiness)

- 에이전트 정의는 `.claude/agents/story-planner.md`, `sub-task-creator.md`, `dev-readiness.md`에 있으며, 원본 설계 문서는 `agent-prompt/*.md`입니다. 원본 문서를 수정하면 `.claude/agents/*.md`에도 동일하게 반영해야 합니다.
- 기본 흐름: Story Planner(Story 정리·생성) → Sub-task Creator(Story 기반 계획 수립·생성) → Dev Readiness(착수 가능 여부 확인) → `/jira-start`(구현 착수).
- 각 단계는 사용자의 명확한 승인 없이 Jira를 생성·수정하지 않습니다. 이 흐름은 Jira 기획 단계이며, 브랜치/커밋 규칙은 실제 구현 착수(`/jira-start` 이후)부터 적용됩니다.

## 브랜치 규칙

- `/jira-start <ISSUE-KEY>`를 실행할 때마다 이슈 키와 동일한 이름의 브랜치(`<ISSUE-KEY>`)에서 작업한다.
  - 브랜치가 없으면 기본 브랜치(main) 기준으로 새로 생성한다.
  - 이미 있으면 해당 브랜치로 전환해 이어서 작업한다.
- 해당 이슈와 관련된 구현/커밋은 모두 이 브랜치 위에서 진행한다.
- **이슈-브랜치 1:1 정합성 검사**: `/jira-sync <ISSUE-KEY>` 실행 시, 그리고 해당 이슈 관련 커밋을 만들기 전에 현재 브랜치명이 `<ISSUE-KEY>`와 일치하는지 확인한다. 일치하지 않으면 다른 이슈 작업 중 실수로 커밋/동기화하는 것을 방지하기 위해 먼저 사용자에게 알리고 진행 여부를 확인한다.

## 커밋 컨벤션

- Jira 이슈 기반 작업의 커밋 메시지는 `[<ISSUE-KEY>] <설명>` 형식을 사용한다. 예: `[GAF-11] 계산기 UI 및 입력 검증 구현`
- 이렇게 하면 커밋 히스토리에서 Jira 이슈 이력을 바로 추적할 수 있다.

## PR 규칙

- 이 저장소에서 PR을 생성할 때는 본문에 관련 Jira 이슈 링크(`https://mobigen.atlassian.net/browse/<ISSUE-KEY>`)를 포함한다. `<ISSUE-KEY>`는 현재 작업 브랜치명에서 가져온다.
- PR 생성은 사용자 승인이 필요한 작업이므로(원격 저장소에 반영되는 행위), 링크 포함 여부와 최종 PR 내용을 사용자에게 확인받은 뒤 생성한다.

## 9. 요구사항 변경 처리 원칙

1. **개발 중 Jira 요구사항이 변경되어도 코드를 자동으로 수정하지 않는다.**
2. 변경 영향 분석은 Rovo(Jira MCP)가 수행하고, 개발자가 필요하다고 판단할 때 명시적으로 `/jira-sync <ISSUE-KEY>`를 실행해 동기화한다.
3. `/jira-sync` 실행 시 Claude Code는 다음 세 가지를 비교한다.
   - 기존 Jira 정보 (직전 스냅샷 — `.claude/jira-snapshots/<ISSUE-KEY>.md`)
   - 현재 Jira 정보 (Jira MCP로 실시간 조회)
   - 현재 Source Code (실제 구현 상태)
4. 비교를 통해 **변경 영향(기존 구현 중 무효화·수정이 필요한 부분)** 과 **추가 구현 범위**를 먼저 사용자에게 보여준다.
5. 개발자가 내용을 확인하고 진행을 명시적으로 승인한 뒤에만 코드 수정을 시작한다. 승인 없이 임의로 코드를 고치지 않는다.
6. 동기화 진행 후에는 스냅샷을 현재 Jira 정보로 갱신하여 다음 `/jira-sync`의 비교 기준점으로 삼는다.

## Jira 스냅샷

- 위치: `.claude/jira-snapshots/<ISSUE-KEY>.md`
- `/jira-start`, `/jira-sync` 실행 시마다 조회 시점의 Jira 정보(요약, 설명, AC, 일정, 링크)로 덮어써 최신 상태를 유지한다.
- 이 스냅샷이 없는 이슈에 대해 `/jira-sync`를 실행하면, 비교 기준이 없다는 점을 먼저 알리고 `/jira-start`로 스냅샷을 먼저 생성하도록 안내한다.
