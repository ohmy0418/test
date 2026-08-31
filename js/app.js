(function () {
  var TODOS_URL = "https://jsonplaceholder.typicode.com/todos";
  var USERS_URL = "https://jsonplaceholder.typicode.com/users";
  var PAGE_SIZE = 10;
  var LOCAL_TODOS_KEY = "localTodos";
  var TOGGLE_OVERRIDES_KEY = "todoToggleOverrides";
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
  var pendingRequestCount = 0;

  function beginLoading() {
    pendingRequestCount += 1;
    loadingEl.classList.remove("hidden");
  }

  function endLoading() {
    pendingRequestCount = Math.max(0, pendingRequestCount - 1);
    if (pendingRequestCount === 0) {
      loadingEl.classList.add("hidden");
    }
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
    li.setAttribute("role", "button");
    li.setAttribute("tabindex", "0");
    li.setAttribute("aria-pressed", String(todo.completed));
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

  function getToggleOverrides() {
    try {
      return JSON.parse(localStorage.getItem(TOGGLE_OVERRIDES_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveToggleOverrides(overrides) {
    localStorage.setItem(TOGGLE_OVERRIDES_KEY, JSON.stringify(overrides));
  }

  function applyToggleOverrides(todos) {
    var overrides = getToggleOverrides();
    todos.forEach(function (todo) {
      if (Object.prototype.hasOwnProperty.call(overrides, todo.id)) {
        todo.completed = overrides[todo.id];
      }
    });
    return todos;
  }

  function toggleTodo(id) {
    var todo = allTodos.find(function (t) {
      return t.id === id;
    });
    if (!todo) {
      return;
    }

    var previousCompleted = todo.completed;
    todo.completed = !previousCompleted;
    rerenderList();
    hideError();
    beginLoading();

    fetch(TODOS_URL + "/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: todo.completed })
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("완료 상태를 변경하지 못했습니다. (" + response.status + ")");
        }

        var localTodos = getLocalTodos();
        var localTodo = localTodos.find(function (t) {
          return t.id === id;
        });
        if (localTodo) {
          localTodo.completed = todo.completed;
          saveLocalTodos(localTodos);
        } else {
          var overrides = getToggleOverrides();
          overrides[id] = todo.completed;
          saveToggleOverrides(overrides);
        }
      })
      .catch(function (error) {
        todo.completed = previousCompleted;
        rerenderList();
        showError(error.message || "완료 상태를 변경하지 못했습니다.");
      })
      .finally(function () {
        endLoading();
      });
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
    beginLoading();

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
      })
      .finally(function () {
        endLoading();
      });
  }

  function loadUsers() {
    hideError();
    beginLoading();

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
      })
      .finally(function () {
        endLoading();
      });
  }

  function loadTodos() {
    hideError();
    beginLoading();

    fetch(TODOS_URL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("할 일 목록을 불러오지 못했습니다. (" + response.status + ")");
        }
        return response.json();
      })
      .then(function (data) {
        allTodos = applyToggleOverrides(getLocalTodos().concat(data));
        rerenderList();
      })
      .catch(function (error) {
        showError(error.message || "할 일 목록을 불러오지 못했습니다.");
      })
      .finally(function () {
        endLoading();
      });
  }

  loadMoreBtn.addEventListener("click", renderNextPage);

  todoListEl.addEventListener("click", function (event) {
    var li = event.target.closest(".todo-item");
    if (li) {
      toggleTodo(Number(li.dataset.id));
    }
  });

  todoListEl.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    var li = event.target.closest(".todo-item");
    if (li) {
      event.preventDefault();
      toggleTodo(Number(li.dataset.id));
    }
  });

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
