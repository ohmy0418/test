function parseOperand(rawValue) {
  const trimmed = rawValue.trim();
  if (trimmed === "" || Number.isNaN(Number(trimmed))) {
    return null;
  }
  return Number(trimmed);
}

// 임시 구현. GAF-12(사칙연산 로직 및 결과 처리 구현) 완료 후 해당 결과물로 교체/통합 예정.
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

function showResult(message, isError) {
  const resultArea = document.getElementById("result-area");
  resultArea.textContent = message;
  resultArea.classList.remove("success", "error");
  resultArea.classList.add(isError ? "error" : "success");
}

function handleCalculate() {
  const rawA = document.getElementById("operand-a").value;
  const rawB = document.getElementById("operand-b").value;
  const operator = document.getElementById("operator").value;

  const a = parseOperand(rawA);
  const b = parseOperand(rawB);

  if (a === null || b === null) {
    showResult("숫자만 입력해 주세요.", true);
    return;
  }

  const result = calculate(a, b, operator);
  if (result.error) {
    showResult(result.error, true);
    return;
  }

  showResult(`결과: ${result.value}`, false);
}

document.getElementById("calculate-btn").addEventListener("click", handleCalculate);
