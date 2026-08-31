(function () {
  var TODOS_URL = "https://jsonplaceholder.typicode.com/todos";
  var USERS_URL = "https://jsonplaceholder.typicode.com/users";
  var PAGE_SIZE = 10;
  var LOCAL_TODOS_KEY = "localTodos";
  var DEFAULT_USER_ID = "1";

  var todoListEl = document.getElementById("todo-list");
  var loadMoreBtn = document.getElementById("load-more-btn");
  var loadingEl = document.getElementById("loading-indicator");
  var errorEl = document.getElementById("error-message");
  var statusFilterEl = document.getElementById("status-filter");
  var filterBtns = statusFilterEl.querySelectorAll(".filter-btn");
  var userFilterEl = document.getElementById("user-filter");
  var todoFormEl = document.getElementById("todo-form");
  var todoTitleEl = document.getElementById("todo-title");

  var allTodos = [];
  var renderedCount = 0;
  var currentStatusFilter = "all";
  var currentUserFilter = "all";

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

  function getVisibleTodos() {
    return allTodos.filter(function (todo) {
      if (currentStatusFilter === "completed" && !todo.completed) {
        return false;
      }
      if (currentStatusFilter === "incomplete" && todo.completed) {
        return false;
      }
      if (currentUserFilter !== "all" && String(todo.userId) !== currentUserFilter) {
        return false;
      }
      return true;
    });
  }

  function updateLoadMoreVisibility() {
    var hasMore = renderedCount < getVisibleTodos().length;
    loadMoreBtn.classList.toggle("hidden", !hasMore);
  }

  function renderNextPage() {
    var nextItems = getVisibleTodos().slice(renderedCount, renderedCount + PAGE_SIZE);
    nextItems.forEach(function (todo) {
      todoListEl.appendChild(createTodoItem(todo));
    });
    renderedCount += nextItems.length;
    updateLoadMoreVisibility();
  }

  function rerenderList() {
    renderedCount = 0;
    todoListEl.innerHTML = "";
    renderNextPage();
  }

  function getLocalTodos() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_TODOS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalTodos(localTodos) {
    localStorage.setItem(LOCAL_TODOS_KEY, JSON.stringify(localTodos));
  }

  function applyStatusFilter(status) {
    currentStatusFilter = status;
    filterBtns.forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.status === status));
    });
    rerenderList();
  }

  function applyUserFilter(userId) {
    currentUserFilter = userId;
    rerenderList();
  }

  function addTodo(title) {
    var userId = currentUserFilter !== "all" ? currentUserFilter : DEFAULT_USER_ID;

    hideError();

    fetch(TODOS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        completed: false,
        userId: Number(userId)
      })
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("할 일을 추가하지 못했습니다. (" + response.status + ")");
        }
        return response.json();
      })
      .then(function () {
        var newTodo = {
          id: Date.now(),
          userId: Number(userId),
          title: title,
          completed: false
        };
        var localTodos = getLocalTodos();
        localTodos.unshift(newTodo);
        saveLocalTodos(localTodos);

        allTodos.unshift(newTodo);
        rerenderList();
      })
      .catch(function (error) {
        showError(error.message || "할 일을 추가하지 못했습니다.");
      });
  }

  function loadUsers() {
    fetch(USERS_URL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("사용자 목록을 불러오지 못했습니다. (" + response.status + ")");
        }
        return response.json();
      })
      .then(function (users) {
        users.forEach(function (user) {
          var option = document.createElement("option");
          option.value = String(user.id);
          option.textContent = user.name;
          userFilterEl.appendChild(option);
        });
      })
      .catch(function (error) {
        showError(error.message || "사용자 목록을 불러오지 못했습니다.");
      });
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
        allTodos = getLocalTodos().concat(data);
        rerenderList();
      })
      .catch(function (error) {
        showError(error.message || "할 일 목록을 불러오지 못했습니다.");
      })
      .finally(function () {
        setLoading(false);
      });
  }

  loadMoreBtn.addEventListener("click", renderNextPage);

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyStatusFilter(btn.dataset.status);
    });
  });

  userFilterEl.addEventListener("change", function () {
    applyUserFilter(userFilterEl.value);
  });

  todoFormEl.addEventListener("submit", function (event) {
    event.preventDefault();
    var title = todoTitleEl.value.trim();
    if (!title) {
      return;
    }
    addTodo(title);
    todoTitleEl.value = "";
  });

  loadTodos();
  loadUsers();
})();
