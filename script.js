"use strict";

const STORAGE_KEY = "inkAndQuill.posts.v1";
const AUTHOR_KEY = "inkAndQuill.author.v1";

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const page = location.pathname.split("/").pop() || "index.html";

let posts = loadPosts();
let toastTimer;

// ---------- Six default articles ----------

function makeDefaults() {
  const now = new Date().toISOString();

  const stories = [
    {
      title: "The Art of Slowing Down",
      subtitle: "Finding beauty in life's quieter moments.",
      category: "Lifestyle",
      content: `We live in a world that celebrates speed. We hurry through our mornings, rush through our work, and often find ourselves planning tomorrow before today has even ended.\n\nBut there is something quietly wonderful about slowing down.\n\nIt might be the first cup of coffee in the morning, the sound of rain against a window, or the few minutes spent watching the evening sky change its colours. These moments ask nothing from us except our attention.\n\nSlowing down does not mean giving up on our ambitions. It means remembering that life is not merely a list of tasks waiting to be completed.\n\nPerhaps the secret to a richer life is not finding more time, but learning to appreciate the time we already have.\n\nToday, try doing one ordinary thing without rushing. You may discover that the moments you were hurrying past were the very moments worth keeping.`
    },
    {
      title: "Finding Your Own Voice",
      subtitle: "Why the best writing begins with honesty.",
      category: "Creativity",
      content: `Every writer begins somewhere. Often, that beginning involves trying to sound like someone else.\n\nWe borrow phrases, imitate styles, and compare our first attempts with the polished work of people who have spent years practising their craft.\n\nYour own voice develops when you pay attention to what matters to you, what surprises you, and what you cannot stop thinking about.\n\nWrite about a small experience that stayed with you. Describe a place you remember clearly. Explain an idea you have never quite been able to share.\n\nDo not worry about making every sentence perfect. Honesty often reaches readers in ways that impressive vocabulary never can.\n\nThe goal is not to sound like the greatest writer in the world. It is to become more clearly yourself on the page.`
    },
    {
      title: "A Notebook Full of Possibilities",
      subtitle: "The simple habit that makes room for ideas.",
      category: "Personal",
      content: `A blank notebook can feel like an invitation and a challenge at the same time.\n\nReal ideas rarely arrive in perfect sentences. They appear while walking, waiting for a bus, or just before falling asleep. Some are brilliant. Others are questions that lead nowhere.\n\nKeeping a notebook gives these thoughts somewhere to live.\n\nYou do not need an elaborate system. Write down an observation, a question, a sentence you like, or something you want to remember. Let the pages be messy if they need to be.\n\nOver time, the notebook becomes a record of how you think. Connections appear between ideas you thought were unrelated.\n\nA notebook does not promise that every thought will become extraordinary. It offers a place where the next possibility can begin.`
    },
    {
      title: "The Books That Stay With Us",
      subtitle: "Some stories end long before we stop thinking about them.",
      category: "Books",
      content: `Some books are remembered for their plots. Others stay with us because of a character, a sentence, or a feeling we cannot quite explain.\n\nWe may forget the order of events. Yet years later, a particular passage brings back the person we were when we first read it.\n\nBooks have a remarkable way of meeting us at different stages of life. A story that once seemed ordinary may become meaningful after a difficult experience.\n\nPerhaps this is why rereading can feel like discovering a new book. The pages remain the same, but the reader has changed.\n\nThe most valuable reading list is not simply a collection of titles. It is a record of the ideas, emotions, and discoveries that helped shape the person you are becoming.`
    },
    {
      title: "Learning to Begin Again",
      subtitle: "There is no perfect moment to start something meaningful.",
      category: "Personal",
      content: `Beginning again can be uncomfortable.\n\nPerhaps a plan did not work. Perhaps a project took longer than expected, or a goal that once felt important no longer fits the person you have become.\n\nBut a fresh beginning is not necessarily a return to the starting line. We carry experience with us. We know a little more about our habits, our limits, and the things that genuinely matter.\n\nProgress rarely follows a perfectly straight path. There will be unfinished work, unexpected delays, and days when enthusiasm disappears.\n\nYou do not have to solve everything today. Choose one useful action and take it. Let tomorrow build upon that small beginning.\n\nSometimes courage is not the determination to keep going exactly as before. Sometimes it is the willingness to begin again, a little wiser than last time.`
    },
    {
      title: "Technology and the Human Imagination",
      subtitle: "Tools can change how we create, but curiosity remains essential.",
      category: "Technology",
      content: `Every generation encounters tools that change the way people work, communicate, and express themselves.\n\nNew technology can make difficult tasks easier and open doors that once seemed inaccessible. A person with an idea can now experiment with digital art, build an application, publish an essay, or share a creative project with the world.\n\nYet tools alone do not guarantee meaningful work. A powerful application cannot decide what is worth saying. A faster computer cannot replace the patience required to understand a difficult problem.\n\nTechnology is most useful when it expands what we are able to explore.\n\nLearn the tools. Experiment without fear of making mistakes. Use automation where it helps, and make room for careful thinking.\n\nThe most interesting question is not simply what our tools can create. It is what we will choose to create with them.`
    }
  ];

  return stories.map((story, index) => ({
    id: "default-" + (index + 1),
    ...story,
    author: "The Editor",
    cover: "",
    published: true,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
    isDefault: true
  }));
}

// ---------- Local storage ----------

function loadPosts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const data = JSON.parse(saved);
      return Array.isArray(data) ? data : makeDefaults();
    }

    const defaults = makeDefaults();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  } catch (error) {
    console.error("Loading posts failed:", error);
    return makeDefaults();
  }
}

function savePosts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return true;
  } catch (error) {
    console.error("Saving posts failed:", error);
    showToast("Could not save. Browser storage may be full.");
    return false;
  }
}

function getAuthor() {
  try {
    return localStorage.getItem(AUTHOR_KEY) || "The Editor";
  } catch {
    return "The Editor";
  }
}

// ---------- Utilities ----------

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function safeImageURL(value = "") {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function excerpt(text, length = 135) {
  const clean = String(text || "").trim().replace(/\s+/g, " ");
  return clean.length > length ? clean.slice(0, length).trimEnd() + "…" : clean;
}

function findPost(id) {
  return posts.find(post => post.id === id);
}

function showToast(message) {
  let toast = $("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function updateStats() {
  if ($("publishedCount")) {
    $("publishedCount").textContent =
      posts.filter(post => post.published).length;
  }

  if ($("draftCount")) {
    $("draftCount").textContent =
      posts.filter(post => !post.published).length;
  }
}

// ---------- Mobile navigation ----------

function setupNavigation() {
  const toggle = $("menuToggle");
  const nav = $("navLinks");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "✕" : "☰";
  });
}

// ---------- Blog cards ----------

function createCard(post) {
  const card = document.createElement("article");
  card.className = "blog-card";

  const imageURL = safeImageURL(post.cover);
  const imageHTML = imageURL
    ? `<img class="card-image" src="${escapeHTML(imageURL)}" alt="Cover image" loading="lazy">`
    : `<div class="card-placeholder" aria-hidden="true">❧</div>`;

  card.innerHTML = `
    ${imageHTML}
    <div class="card-body">
      <div class="card-meta">
        <span class="category-tag">${escapeHTML(post.category)}</span>
        ${post.published ? "" : '<span class="category-tag">Draft</span>'}
      </div>
      <span class="card-date">${escapeHTML(formatDate(
        post.published ? post.publishedAt : post.updatedAt
      ))}</span>
      <h3 class="card-title">${escapeHTML(post.title)}</h3>
      ${post.subtitle
        ? `<p class="card-subtitle">${escapeHTML(post.subtitle)}</p>` : ""}
      <p class="card-excerpt">${escapeHTML(excerpt(post.content))}</p>
      <div class="card-bottom">
        <span class="card-author">By ${escapeHTML(post.author || "The Editor")}</span>
        <div class="card-actions">
          <a class="small-action" href="article.html?id=${encodeURIComponent(post.id)}">
            ${post.published ? "Read" : "Preview"}
          </a>
          <a class="small-action" href="editor.html?id=${encodeURIComponent(post.id)}">Edit</a>
          <button class="small-action" data-delete="${escapeHTML(post.id)}">Delete</button>
        </div>
      </div>
    </div>`;

  const image = card.querySelector(".card-image");
  if (image) {
    image.addEventListener("error", () => {
      const placeholder = document.createElement("div");
      placeholder.className = "card-placeholder";
      placeholder.textContent = "❧";
      image.replaceWith(placeholder);
    }, { once: true });
  }

  return card;
}

function attachDeleteHandler(container) {
  if (!container) return;

  container.addEventListener("click", event => {
    const button = event.target.closest("[data-delete]");
    if (!button) return;

    const post = findPost(button.dataset.delete);
    if (!post) return;

    if (!confirm(`Delete "${post.title}" permanently?`)) return;

    const previous = posts;
    posts = posts.filter(item => item.id !== post.id);

    if (!savePosts()) {
      posts = previous;
      return;
    }

    renderAll();
    showToast("Story deleted.");
  });
}

// ---------- Explore page ----------

function renderExplore() {
  const grid = $("blogGrid");
  if (!grid) return;

  const query = ($("searchInput")?.value || "").trim().toLowerCase();
  const category = $("categoryFilter")?.value || "all";
  const sort = $("sortFilter")?.value || "newest";

  let visible = posts.filter(post => {
    if (!post.published) return false;
    if (category !== "all" && post.category !== category) return false;

    const text = [
      post.title, post.subtitle, post.content, post.author, post.category
    ].join(" ").toLowerCase();

    return text.includes(query);
  });

  visible.sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);

    const da = new Date(a.publishedAt || a.createdAt).getTime();
    const db = new Date(b.publishedAt || b.createdAt).getTime();

    return sort === "oldest" ? da - db : db - da;
  });

  grid.replaceChildren(...visible.map(createCard));

  if ($("emptyState")) $("emptyState").hidden = visible.length > 0;

  updateStats();
  attachDeleteHandler(grid);
}

// ---------- Homepage ----------

function renderHome() {
  const grid = $("homeBlogGrid");
  if (!grid) return;

  const visible = posts
    .filter(post => post.published)
    .sort((a, b) =>
      new Date(b.publishedAt || b.createdAt) -
      new Date(a.publishedAt || a.createdAt)
    )
    .slice(0, 3);

  grid.replaceChildren(...visible.map(createCard));

  if ($("homeEmptyState")) {
    $("homeEmptyState").hidden = visible.length > 0;
  }

  updateStats();
  attachDeleteHandler(grid);
}

// ---------- Editor page ----------

function initEditor() {
  const form = $("blogForm");
  if (!form) return;

  const id = params.get("id");
  const editing = id ? findPost(id) : null;

  if (id && !editing) {
    showToast("That story could not be found.");
  }

  if (editing) {
    $("blogId").value = editing.id;
    $("blogTitle").value = editing.title;
    $("blogSubtitle").value = editing.subtitle || "";
    $("blogCategory").value = editing.category || "Personal";
    $("blogAuthor").value = editing.author || getAuthor();
    $("blogCover").value = editing.cover || "";
    $("blogContent").value = editing.content;
    $("editorHeading").textContent = "Edit your story.";
    $("publishBtn").textContent = editing.published
      ? "Update story ↗" : "Publish story ↗";
  } else if (params.get("view") === "drafts") {
    document.querySelector(".draft-section")?.scrollIntoView();
  } else {
    $("blogAuthor").value = getAuthor();
  }

  function submitPost(published) {
    if (!form.reportValidity()) return;

    const title = $("blogTitle").value.trim();
    const content = $("blogContent").value.trim();
    const coverInput = $("blogCover").value.trim();

    if (!title || !content) {
      showToast("Please add a title and story.");
      return;
    }

    if (coverInput && !safeImageURL(coverInput)) {
      showToast("Enter a valid HTTP or HTTPS cover image URL.");
      return;
    }

    const existingId = $("blogId").value;
    const existing = existingId ? findPost(existingId) : null;
    const now = new Date().toISOString();

    const post = {
      id: existing ? existing.id : (
        crypto.randomUUID ? crypto.randomUUID() :
        Date.now().toString(36) + Math.random().toString(36).slice(2)
      ),
      title,
      subtitle: $("blogSubtitle").value.trim(),
      category: $("blogCategory").value,
      author: $("blogAuthor").value.trim() || "The Editor",
      cover: safeImageURL(coverInput),
      content,
      published,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      publishedAt: published
        ? (existing?.published && existing.publishedAt ? existing.publishedAt : now)
        : (existing?.publishedAt || null),
      isDefault: false
    };

    const previous = posts;

    posts = existing
      ? posts.map(item => item.id === existing.id ? post : item)
      : [post, ...posts];

    if (!savePosts()) {
      posts = previous;
      return;
    }

    try {
      localStorage.setItem(AUTHOR_KEY, post.author);
    } catch {}

    showToast(published ? "Story published!" : "Draft saved!");

    location.href = published
      ? `article.html?id=${encodeURIComponent(post.id)}`
      : "editor.html?view=drafts";
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    submitPost(true);
  });

  $("saveDraftBtn")?.addEventListener("click", () => submitPost(false));

  renderDrafts();
}

function renderDrafts() {
  const grid = $("draftGrid");
  if (!grid) return;

  const drafts = posts.filter(post => !post.published);

  grid.replaceChildren(...drafts.map(createCard));

  if ($("draftEmptyState")) $("draftEmptyState").hidden = drafts.length > 0;

  attachDeleteHandler(grid);
}

// ---------- Article reading page ----------

function renderArticle() {
  const container = $("articleContent");
  if (!container) return;

  const id = params.get("id");
  const post = id ? findPost(id) : null;

  if (!post) {
    container.innerHTML = `
      <h1 class="reader-heading">Story not found.</h1>
      <p>This story may have been deleted or the link is incorrect.</p>
      <a href="blogs.html" class="button button-dark">Back to the journal</a>`;
    return;
  }

  // Drafts can be previewed locally; only published stories appear in Explore.
  const imageURL = safeImageURL(post.cover);

  container.innerHTML = `
    ${imageURL ? `<img class="reader-cover" src="${escapeHTML(imageURL)}" alt="Story cover">` : ""}
    <span class="category-tag">${escapeHTML(post.category)}</span>
    <h1 class="reader-heading">${escapeHTML(post.title)}</h1>
    ${post.subtitle ? `<p class="reader-subtitle">${escapeHTML(post.subtitle)}</p>` : ""}
    <div class="reader-byline">
      By ${escapeHTML(post.author || "The Editor")} ·
      ${escapeHTML(formatDate(post.published ? post.publishedAt : post.updatedAt))}
      ${post.published ? "" : " · Draft preview"}
    </div>
    <div class="reader-body">${escapeHTML(post.content)}</div>
    <div class="reader-actions">
      <a href="blogs.html" class="button button-outline">← All stories</a>
      <a href="editor.html?id=${encodeURIComponent(post.id)}" class="button button-dark">Edit story</a>
    </div>`;

  const image = container.querySelector(".reader-cover");
  image?.addEventListener("error", () => image.remove(), { once: true });

  document.title = post.title + " | The Ink & Quill";
}

// ---------- Search and initialization ----------

function renderAll() {
  renderHome();
  renderExplore();
  renderDrafts();
  updateStats();
}

function init() {
  setupNavigation();

  $("searchInput")?.addEventListener("input", renderExplore);
  $("categoryFilter")?.addEventListener("change", renderExplore);
  $("sortFilter")?.addEventListener("change", renderExplore);

  renderHome();
  renderExplore();
  initEditor();
  renderArticle();
  updateStats();
}

init();