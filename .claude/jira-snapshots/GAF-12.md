# GAF-12 스냅샷

- 조회 시각: 2026-08-27 (/jira-start GAF-12 실행 시점)
- Web URL: https://mobigen.atlassian.net/browse/GAF-12

## 기본 정보
- 타입: 작업(Task)
- 요약: 사칙연산 로직 및 결과 처리 구현
- 상태: 진행 중
- Priority: Medium
- 담당자: 오민영
- Start: 2026-08-27 / Due: 2026-08-28
- Sprint: GAF 1 스프린트

## Parent Story: GAF-10 (사칙연산이 가능한 간단 계산기 기능 구현)
- GAF-11 스냅샷과 동일 (`.claude/jira-snapshots/GAF-11.md` 참고)

## 이슈 설명 (GAF-12)
목적: 입력된 두 수에 대해 사칙연산을 수행하고 제약사항에 맞게 결과를 처리합니다.

주요 작업:
- 더하기, 빼기, 곱하기, 나누기 연산 로직 구현
- 모든 연산 결과를 정수로 변환(소수점 이하 버림)하는 처리 추가
- 나누기 연산 시 분모가 0인 경우에 대한 예외 처리 및 에러 메시지 정의

## Acceptance Criteria (이슈 자체)
- 사칙연산 결과가 정확하게 계산된다.
- 결과값이 항상 정수로 표시된다.
- 0으로 나눌 경우 정의된 에러 메시지가 출력된다.

## Dependency
- Blocks / Is blocked by: 명시적 링크 없음
- 연결된 작업(형제 이슈): GAF-11 (계산기 UI 및 입력 검증 구현) — 상위 스토리 GAF-10에 함께 연결됨, 공식 Blocks 링크는 없음

## 구현 상태 (스냅샷 시점)
- `calculator.js`의 `calculate(a, b, operator)` 함수로 구현 완료 (GAF-11 진행 중 임시 구현된 로직을 GAF-12 산출물로 정식화)
- Node 단위 테스트로 +,-,*,/ / 음수 / 소수 truncate / 0 나누기 케이스 검증 완료
