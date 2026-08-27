/**
 * 두 숫자에 대해 사칙연산을 수행한다.
 * - 결과는 정수로 변환한다(소수점 이하 버림).
 * - 나누기 연산에서 분모가 0이면 에러를 반환한다.
 * @param {number} a
 * @param {number} b
 * @param {"+"|"-"|"*"|"/"} operator
 * @returns {{value: number} | {error: string}}
 */
function calculate(a, b, operator) {
  switch (operator) {
    case "+":
      return { value: Math.trunc(a + b) };
    case "-":
      return { value: Math.trunc(a - b) };
    case "*":
      return { value: Math.trunc(a * b) };
    case "/":
      if (b === 0) {
        return { error: "0으로 나눌 수 없습니다." };
      }
      return { value: Math.trunc(a / b) };
    default:
      return { error: "지원하지 않는 연산자입니다." };
  }
}
