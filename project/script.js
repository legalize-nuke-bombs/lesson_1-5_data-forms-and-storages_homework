"use strict";

const CARD_KEY = "game-card";
const DRAFT_KEY = "game-card-draft";

const panels = document.querySelectorAll("[data-state-panel]");
const statusText = document.querySelector(".workspace__status");
const form = document.querySelector(".card-form");

const createButton = document.querySelector('[data-action="create"]');
const cancelButton = document.querySelector('[data-action="cancel"]');
const editButton = document.querySelector('[data-action="edit"]');
const deleteButton = document.querySelector('[data-action="delete"]');

const cardTitle = document.querySelector('[data-field="title"]');
const cardGenre = document.querySelector('[data-field="genre"]');
const cardYear = document.querySelector('[data-field="year"]');
const cardFinished = document.querySelector('[data-field="finished"]');
const cardNote = document.querySelector('[data-field="note"]');

function showState(name, text) {
  panels.forEach((panel) => {
    panel.hidden = panel.dataset.statePanel !== name;
  });
  statusText.textContent = text;
}

function readCard(storage, key) {
  const json = storage.getItem(key);
  if (json === null) {
    return null;
  }
  return JSON.parse(json);
}

function buildCard(data) {
  return {
    title: data.get("title"),
    genre: data.get("genre"),
    year: data.get("year"),
    finished: data.get("finished") === "on",
    note: data.get("note")
  };
}

function fillForm(card) {
  form.elements.title.value = card.title;
  form.elements.genre.value = card.genre;
  form.elements.year.value = card.year;
  form.elements.finished.checked = card.finished;
  form.elements.note.value = card.note;
}

function showCard(card) {
  cardTitle.textContent = card.title;
  cardGenre.textContent = card.genre;
  cardYear.textContent = card.year;
  cardFinished.textContent = card.finished ? "Да" : "Нет";
  cardNote.textContent = card.note || "—";
  showState("viewer", "Карточка сохранена");
}

function showSaved() {
  const card = readCard(localStorage, CARD_KEY);
  if (card === null) {
    showState("empty", "Карточки нет");
  }
  else {
    showCard(card);
  }
}

function openEditor() {
  form.reset();
  const draft = readCard(sessionStorage, DRAFT_KEY);
  const card = readCard(localStorage, CARD_KEY);
  if (draft !== null) {
    fillForm(draft);
    showState("editor", "Восстановлен черновик");
  }
  else if (card !== null) {
    fillForm(card);
    showState("editor", "Редактирование");
  }
  else {
    showState("editor", "Новая карточка");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const card = buildCard(data);
  localStorage.setItem(CARD_KEY, JSON.stringify(card));
  sessionStorage.removeItem(DRAFT_KEY);
  showCard(card);
});

form.addEventListener("input", () => {
  const data = new FormData(form);
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(buildCard(data)));
});

createButton.addEventListener("click", openEditor);
editButton.addEventListener("click", openEditor);

cancelButton.addEventListener("click", () => {
  sessionStorage.removeItem(DRAFT_KEY);
  showSaved();
});

deleteButton.addEventListener("click", () => {
  localStorage.removeItem(CARD_KEY);
  sessionStorage.removeItem(DRAFT_KEY);
  showState("empty", "Карточка удалена");
});

showSaved();
