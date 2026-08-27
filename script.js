function parseOperand(rawValue) {
  const trimmed = rawValue.trim();
  if (trimmed === "" || Number.isNaN(Number(trimmed))) {
    return null;
  }
  return Number(trimmed);
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
