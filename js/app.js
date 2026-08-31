(function () {
  var TODOS_URL = "https://jsonplaceholder.typicode.com/todos";
  var PAGE_SIZE = 10;

  var todoListEl = document.getElementById("todo-list");
  var loadMoreBtn = document.getElementById("load-more-btn");
  var loadingEl = document.getElementById("loading-indicator");
  var errorEl = document.getElementById("error-message");

  var allTodos = [];
  var renderedCount = 0;

  function setLoading(isLoading) {
    loadingEl.classList.toggle("hidden", !isLoading);
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }

  function hideError() {
    errorEl.classList.add("hidden");
    errorEl.textContent = "";
  }

  function createTodoItem(todo) {
    var li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;
    li.dataset.userId = todo.userId;
    li.dataset.completed = todo.completed;
    li.textContent = todo.title;
    return li;
  }

  function updateLoadMoreVisibility() {
    var hasMore = renderedCount < allTodos.length;
    loadMoreBtn.classList.toggle("hidden", !hasMore);
  }

  function renderNextPage() {
    var nextItems = allTodos.slice(renderedCount, renderedCount + PAGE_SIZE);
    nextItems.forEach(function (todo) {
      todoListEl.appendChild(createTodoItem(todo));
    });
    renderedCount += nextItems.length;
    updateLoadMoreVisibility();
  }

  function loadTodos() {
    hideError();
    setLoading(true);

    fetch(TODOS_URL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("할 일 목록을 불러오지 못했습니다. (" + response.status + ")");
        }
        return response.json();
      })
      .then(function (data) {
        allTodos = data;
        renderedCount = 0;
        todoListEl.innerHTML = "";
        renderNextPage();
      })
      .catch(function (error) {
        showError(error.message || "할 일 목록을 불러오지 못했습니다.");
      })
      .finally(function () {
        setLoading(false);
      });
  }

  loadMoreBtn.addEventListener("click", renderNextPage);

  loadTodos();
})();
