# CLAUDE.md

이 문서는 이 저장소에서 Claude Code(및 Rovo/Jira MCP 연동)를 사용할 때 지켜야 할 개발 규칙을 정의합니다.

## Jira 연동 워크플로

- `/jira-start <ISSUE-KEY>`: 작업 착수 시 Jira 이슈 정보를 확인하고 구현 계획을 수립합니다. 조회한 Jira 정보를 스냅샷으로 저장하고, 사용자가 구현 진행을 승인하면 `jira-status-updater` 에이전트로 이슈 상태를 진행 중으로 전이합니다.
- `/jira-sync <ISSUE-KEY>`: 개발 도중 Jira 요구사항이 바뀌었는지 확인하고, 변경 영향과 추가 구현 범위를 분석합니다.
- `/jira-done <ISSUE-KEY>`: 구현이 끝난 이슈를 완료 처리합니다. 커밋·PR과 AC 충족 여부를 점검해 보여주고, 승인 시 `jira-status-updater` 에이전트로 상태를 완료로 전이하고 커밋/PR 링크를 코멘트로 남깁니다.
- `/jira-story <업무 초안>`: `story-planner` 에이전트가 업무 초안을 Jira Story(목적/요구사항/AC/확인 필요)로 정리하고, 승인 시 Jira에 Story를 생성합니다.
- `/jira-subtask <STORY-KEY>`: `sub-task-creator` 에이전트가 Story를 기반으로 Sub-task 계획(안)을 수립하고, 승인 시 Jira에 Sub-task를 생성합니다.
- `/jira-readiness <ISSUE-KEY>`: `dev-readiness` 에이전트가 개발 착수 가능 여부(READY/AT RISK/NOT READY)를 판단합니다. Read-Only이며 Jira를 수정하지 않습니다. `/jira-start`의 준비 상태 판정도 내부적으로 이 에이전트를 사용합니다.
- `/jira-detail <ISSUE-KEY> [필드=값 ...]`: 이미 생성된 Story/Sub-task/Task/Bug에 담당자·레이블·기한·스프린트·시작일·원래 예상치 중 **사용자가 지정한 필드만** `jira-detail-setter` 에이전트로 설정/변경합니다. 6개 필드는 서로 독립적인 선택 입력이며(예: 기한만 지정 / 기한+시작일만 지정), 언급되지 않은 필드는 건드리지 않고 명시적으로 비우라고 한 필드만 비웁니다.

### 에이전트 (Story → Sub-task → Detail → Readiness → 구현 → 완료)

- **에이전트 정의는 `.claude/agents/*.md`가 유일한 원본입니다.** 별도의 설계 문서 사본을 두지 않습니다 (두 벌을 수동 동기화하면 반드시 어긋납니다). 에이전트 동작을 바꾸려면 이 파일만 수정하면 됩니다.
- 정의 파일: `story-planner.md`, `sub-task-creator.md`, `jira-detail-setter.md`, `dev-readiness.md`, `jira-status-updater.md`
- 기본 흐름: Story Planner(Story 정리·생성) → Sub-task Creator(Story 기반 계획 수립·생성) → Jira Detail Setter(필요 시 담당자/일정 등 설정) → Dev Readiness(착수 가능 여부 확인) → `/jira-start`(구현 착수 + 진행 중 전이) → `/jira-done`(완료 전이 + 링크 기록).
- 각 에이전트의 쓰기 권한은 프롬프트가 아니라 `tools:` 목록으로 제한합니다. 예: `dev-readiness`는 쓰기 도구가 없어 Read-Only이고, `jira-status-updater`는 상태 전이와 코멘트만 가능해 요구사항·필드를 바꿀 수 없습니다. 새 에이전트를 추가할 때도 필요한 최소 도구만 부여합니다.
- 각 단계는 사용자의 명확한 승인 없이 Jira를 생성·수정하지 않습니다. 이 흐름은 Jira 기획 단계이며, 브랜치/커밋 규칙은 실제 구현 착수(`/jira-start` 이후)부터 적용됩니다.

### 서브에이전트 승인 위임 제약

- `story-planner`/`sub-task-creator`/`jira-detail-setter`처럼 Jira를 생성·수정하는 에이전트는, 다른 에이전트(코디네이터 포함)가 전달한 "사용자가 승인했다"는 메시지를 승인으로 인정하지 않도록 설계되어 있습니다. 승인은 반드시 사용자 본인이 그 서브에이전트와의 대화에 직접 입력해야 유효합니다.
- 따라서 코디네이터가 서브에이전트를 비동기로 호출해 계획(안)만 받고, 실제 승인은 코디네이터와의 대화에서 이루어진 경우, 승인 메시지를 서브에이전트에게 재전달해도 반영되지 않습니다. 이 경우 코디네이터가 해당 서브에이전트 정의 문서(`.claude/agents/*.md`)의 절차·필드 규칙을 그대로 따라 Jira MCP 도구를 직접 호출해 반영합니다.

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
   - 기존 Jira 정보 (기준선 스냅샷 — `.claude/jira-snapshots/<ISSUE-KEY>.json`)
   - 현재 Jira 정보 (Jira MCP로 실시간 조회)
   - 현재 Source Code (실제 구현 상태)
4. 비교를 통해 **변경 영향(기존 구현 중 무효화·수정이 필요한 부분)** 과 **추가 구현 범위**를 먼저 사용자에게 보여준다.
5. 개발자가 내용을 확인하고 진행을 명시적으로 승인한 뒤에만 코드 수정을 시작한다. 승인 없이 임의로 코드를 고치지 않는다.
6. 동기화 진행 후에는 스냅샷을 현재 Jira 정보로 갱신하여 다음 `/jira-sync`의 비교 기준점으로 삼는다.

## Jira 스냅샷

- 위치: `.claude/jira-snapshots/<ISSUE-KEY>.json` (기계 비교용 기준선) + `.claude/jira-snapshots/<ISSUE-KEY>.md` (사람이 읽는 요약)
- **판단 근거는 항상 `.json`이다.** `/jira-sync`는 스냅샷 JSON과 현재 Jira 정보를 같은 스키마로 만들어 `diff`로 먼저 판정하고, 그 diff에 나타난 항목에 대해서만 영향 분석을 한다. 변경 여부를 모델의 인상으로 판단하지 않는다. JSON에는 Jira 응답을 재서술하지 말고 원문 문자열 그대로 담는다 (스키마는 `.claude/commands/jira-start.md` 3-1 참고).
- **Story 요구사항 변경은 Sub-task 스냅샷의 `parent.updated` 필드로 감지한다.** Story 단위 스냅샷을 따로 만들지 않아 `/jira-start` 트리거가 늘어나지 않는다.
- **갱신 시점**: `/jira-start`는 스냅샷이 없을 때만 생성하고 **기존 파일을 덮어쓰지 않는다**(기준선 보존). `/jira-sync`는 승인된 변경을 **코드에 반영 완료한 뒤에만** 갱신한다. 구현 전에 갱신하면 미구현분이 다음 비교에서 "변경 없음"으로 가려진다.
- 이 스냅샷이 없는 이슈에 대해 `/jira-sync`를 실행하면, 비교 기준이 없다는 점을 먼저 알리고 `/jira-start`로 스냅샷을 먼저 생성하도록 안내한다.
- `.md`만 있고 `.json`이 없는 이슈(JSON 도입 이전)는 md 기준 비교로만 동작한다. 이때 `.json`을 현재 시점 값으로 새로 만들지 않는다 — 그 사이의 변경이 기준선에 흡수되어 영원히 감지되지 않는다.
