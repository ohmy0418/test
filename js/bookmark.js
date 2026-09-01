(function () {
  var BOOKMARKS_KEY = "bookmarks";

  var formEl = document.getElementById("bookmark-form");
  var urlEl = document.getElementById("bookmark-url");
  var titleEl = document.getElementById("bookmark-title");
  var tagsEl = document.getElementById("bookmark-tags");
  var errorEl = document.getElementById("bookmark-form-error");

  function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }

  function hideError() {
    errorEl.classList.add("hidden");
    errorEl.textContent = "";
  }

  function parseTags(rawTags) {
    return rawTags
      .split(",")
      .map(function (tag) {
        return tag.trim();
      })
      .filter(function (tag) {
        return tag.length > 0;
      });
  }

  function getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveBookmarks(bookmarks) {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }

  function createBookmarkId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return String(Date.now());
  }

  function addBookmark(url, title, tags) {
    var bookmarks = getBookmarks();
    bookmarks.unshift({
      id: createBookmarkId(),
      url: url,
      title: title,
      tags: tags,
      createdAt: new Date().toISOString()
    });
    saveBookmarks(bookmarks);
  }

  formEl.addEventListener("submit", function (event) {
    event.preventDefault();

    var url = urlEl.value.trim();
    var title = titleEl.value.trim();
    var tags = parseTags(tagsEl.value.trim());

    if (!url) {
      showError("URL을 입력해 주세요.");
      return;
    }
    if (!title) {
      showError("제목을 입력해 주세요.");
      return;
    }
    if (tags.length === 0) {
      showError("태그를 1개 이상 입력해 주세요.");
      return;
    }

    hideError();
    addBookmark(url, title, tags);
    formEl.reset();
  });
})();
