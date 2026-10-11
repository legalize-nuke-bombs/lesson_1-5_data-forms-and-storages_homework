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
const confirmDeleteButton = document.querySelector('[data-action="confirm-delete"]');
const keepButton = document.querySelector('[data-action="keep"]');

const cardActions = document.querySelector(".saved-card__actions");
const deleteConfirm = document.querySelector(".saved-card__confirm");

const cardTitle = document.querySelector('[data-field="title"]');
const cardGenre = document.querySelector('[data-field="genre"]');
const cardYear = document.querySelector('[data-field="year"]');
const cardFinished = document.querySelector('[data-field="finished"]');
const cardNote = document.querySelector('[data-field="note"]');

const noteError = document.querySelector('[data-error="note"]');

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

function isNoteMissing(card) {
  return card.finished && card.note.trim() === "";
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

function askDelete(asking) {
  cardActions.hidden = asking;
  deleteConfirm.hidden = !asking;
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
  noteError.hidden = true;
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
  if (isNoteMissing(card)) {
    noteError.hidden = false;
    return;
  }
  localStorage.setItem(CARD_KEY, JSON.stringify(card));
  sessionStorage.removeItem(DRAFT_KEY);
  showCard(card);
});

form.addEventListener("input", () => {
  const data = new FormData(form);
  const card = buildCard(data);
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(card));
  if (!isNoteMissing(card)) {
    noteError.hidden = true;
  }
});

createButton.addEventListener("click", openEditor);
editButton.addEventListener("click", openEditor);

cancelButton.addEventListener("click", () => {
  sessionStorage.removeItem(DRAFT_KEY);
  showSaved();
});

deleteButton.addEventListener("click", () => {
  askDelete(true);
});

keepButton.addEventListener("click", () => {
  askDelete(false);
});

confirmDeleteButton.addEventListener("click", () => {
  localStorage.removeItem(CARD_KEY);
  sessionStorage.removeItem(DRAFT_KEY);
  askDelete(false);
  showState("empty", "Карточка удалена");
});

showSaved();
