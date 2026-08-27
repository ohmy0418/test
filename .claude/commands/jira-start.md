---
description: Jira Issue를 기준으로 개발 준비 정보를 확인하고 구현 계획을 수립합니다.
---

너는 개발자가 작업을 시작하도록 돕는 개발 어시스턴트야.
아래 Jira 이슈를 기준으로 개발 준비 상태를 확인해줘.

대상 이슈: $ARGUMENTS

## 0단계: 작업 브랜치 준비
- `git status`로 현재 uncommitted 변경사항이 있는지 확인해줘.
  - 다른 이슈 작업 중이던 변경사항이 남아있다면(현재 브랜치명이 `$ARGUMENTS`가 아니고 uncommitted 변경이 있다면), 임의로 버리지 말고 사용자에게 알려줘 (커밋할지, stash 할지 확인).
- 브랜치명은 이슈 키를 그대로 사용한다: `$ARGUMENTS`
  - 로컬에 `$ARGUMENTS` 브랜치가 이미 있으면 그 브랜치로 `checkout`만 해줘 (재작업/이어서 작업하는 경우).
  - 없으면 현재 기본 브랜치(main) 기준으로 `git checkout -b $ARGUMENTS`로 새로 생성해줘.
  - 브랜치 생성/전환은 로컬 작업이라 별도 확인 없이 진행하되, 실행한 git 명령과 결과를 사용자에게 보여줘.
- 이후 모든 구현 작업은 이 브랜치에서 진행한다.

## 1단계: Jira 정보 확인
연결된 Atlassian(Jira) MCP로 `$ARGUMENTS` 이슈를 조회하고 다음을 확인해줘.
- Parent Story (상위 Story의 목적/요구사항)
- 현재 Sub-task (이 이슈의 제목/설명/작업 범위)
- Acceptance Criteria (완료 조건)
- 일정 / Dependency (Start/Due, Blocks / Is blocked by)

## 2단계: 코드베이스 확인
- 현재 Repository 구조를 파악하고 이 작업과 관련된 파일/모듈을 찾아줘.

## 3단계: 구현 계획 수립
- 구현 범위를 정리하고
- Acceptance Criteria를 만족시키기 위한 단계별 구현 계획을 제시하고
- 정보가 부족한 부분(AC 누락, 미해결 Dependency 등)이 있으면 먼저 짚어줘.

아직 코드는 작성하지 말고, 계획을 먼저 보여줘.

## 4단계: 스냅샷 저장
- 1단계에서 조회한 Jira 정보(요약, 설명, Acceptance Criteria, 일정, Blocks/Is blocked by 등 링크)를 `.claude/jira-snapshots/$ARGUMENTS.md`에 저장해줘. 기존 파일이 있으면 덮어써.
- 이 스냅샷은 이후 `/jira-sync $ARGUMENTS` 실행 시 "기존 Jira 정보" 비교 기준으로 사용돼.