import { Preferences } from "@capacitor/preferences";

/* --------------------------------------------------------------------------
   HELPER: Ensure Nested Object
   -------------------------------------------------------------------------- */
function ensureNestedObject(obj, ...keys) {
  let current = obj;
  for (const key of keys) {
    if (typeof current[key] !== "object" || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  return current;
}

/* --------------------------------------------------------------------------
   WRONG ANSWERS
   -------------------------------------------------------------------------- */
const WRONG_ANSWERS_KEY = "wrongAnswers";

async function loadAllWrongAnswers() {
  const { value } = await Preferences.get({ key: WRONG_ANSWERS_KEY });
  return value ? JSON.parse(value) : {};
}

async function saveAllWrongAnswers(allWrongAnswers) {
  await Preferences.set({
    key: WRONG_ANSWERS_KEY,
    value: JSON.stringify(allWrongAnswers),
  });
}

/**
 * Load the wrong answer counts for a *single quiz* (qType, type, quizNumber).
 * Returns an object mapping questionIndex (as a string) to count.
 * e.g. { "0": 2, "3": 1 }
 */
export async function loadQuizWrongAnswers(qType, type, quizNumber) {
  const all = await loadAllWrongAnswers();
  return all[qType]?.[type]?.[quizNumber] ?? {};
}

/**
 * Record a wrong answer for one quiz.
 * Increases the count for the given questionIndex.
 */
export async function recordWrongAnswerTypeLevel(
  qType,
  type,
  quizNumber,
  questionIndex
) {
  const all = await loadAllWrongAnswers();
  ensureNestedObject(all, qType, type);
  if (
    typeof all[qType][type][quizNumber] !== "object" ||
    all[qType][type][quizNumber] === null
  ) {
    all[qType][type][quizNumber] = {};
  }
  const quizWrongAnswers = all[qType][type][quizNumber];
  const qKey = String(questionIndex);
  if (quizWrongAnswers[qKey] === undefined) {
    quizWrongAnswers[qKey] = 1;
  } else {
    quizWrongAnswers[qKey] += 1;
  }
  await saveAllWrongAnswers(all);
}

/**
 * Remove a wrong answer for one quiz.
 * Decrements the count for the given questionIndex. If the count reaches 0, the key is removed.
 */
export async function removeWrongAnswerTypeLevel(
  qType,
  type,
  quizNumber,
  questionIndex
) {
  const all = await loadAllWrongAnswers();
  const quizWrongAnswers = all[qType]?.[type]?.[quizNumber];
  if (typeof quizWrongAnswers === "object" && quizWrongAnswers !== null) {
    const qKey = String(questionIndex);
    if (quizWrongAnswers[qKey] !== undefined) {
      quizWrongAnswers[qKey] -= 1;
      if (quizWrongAnswers[qKey] <= 0) {
        delete quizWrongAnswers[qKey];
      }
      await saveAllWrongAnswers(all);
    }
  }
}

/**
 * Load **all** wrong answers for qType + type.
 * Returns an object: { "quizNumber": { "questionIndex": count, ... }, ... }
 */
export async function loadAllTypeWrongAnswers(qType, type) {
  const all = await loadAllWrongAnswers();
  return all[qType]?.[type] ?? {};
}

/* --------------------------------------------------------------------------
   BOOKMARKS
   -------------------------------------------------------------------------- */
const BOOKMARKS_KEY = "bookmarks";

async function loadAllBookmarks() {
  const { value } = await Preferences.get({ key: BOOKMARKS_KEY });
  return value ? JSON.parse(value) : {};
}

async function saveAllBookmarks(allBookmarks) {
  await Preferences.set({
    key: BOOKMARKS_KEY,
    value: JSON.stringify(allBookmarks),
  });
}

/**
 * Load bookmarks for a *single quiz* (qType, type, quizNumber).
 * Returns an array of question indices.
 */
export async function loadQuizBookmarks(qType, type, quizNumber) {
  const all = await loadAllBookmarks();
  return all[qType]?.[type]?.[quizNumber] ?? [];
}

/**
 * Save bookmarks for a single quiz (qType, type, quizNumber).
 */
export async function saveQuizBookmarks(
  qType,
  type,
  quizNumber,
  bookmarksArray
) {
  const all = await loadAllBookmarks();
  ensureNestedObject(all, qType, type);
  all[qType][type][quizNumber] = bookmarksArray;
  await saveAllBookmarks(all);
}

/**
 * Add a bookmark for a single quiz if not already present.
 */
export async function bookmarkQuestionTypeLevel(
  qType,
  type,
  quizNumber,
  questionIndex
) {
  const all = await loadAllBookmarks();
  ensureNestedObject(all, qType, type);
  if (!Array.isArray(all[qType][type][quizNumber])) {
    all[qType][type][quizNumber] = [];
  }
  const arr = all[qType][type][quizNumber];
  if (!arr.includes(questionIndex)) {
    arr.push(questionIndex);
  }
  await saveAllBookmarks(all);
}

/**
 * Remove a bookmark from a single quiz.
 */
export async function unbookmarkQuestionTypeLevel(
  qType,
  type,
  quizNumber,
  questionIndex
) {
  const all = await loadAllBookmarks();
  const arr = all[qType]?.[type]?.[quizNumber];
  if (Array.isArray(arr)) {
    all[qType][type][quizNumber] = arr.filter((idx) => idx !== questionIndex);
    await saveAllBookmarks(all);
  }
}

/**
 * Load **all** bookmarks for qType + type.
 * Returns an object like: { "quizNumber": [questionIndices], ... }
 */
export async function loadAllTypeBookmarks(qType, type) {
  const all = await loadAllBookmarks();
  return all[qType]?.[type] ?? {};
}

/* --------------------------------------------------------------------------
   LAST SCORES
   -------------------------------------------------------------------------- */
const LAST_SCORES_KEY = "lastScores";

async function loadAllScores() {
  const { value } = await Preferences.get({ key: LAST_SCORES_KEY });
  return value ? JSON.parse(value) : {};
}

async function saveAllScores(allScores) {
  await Preferences.set({
    key: LAST_SCORES_KEY,
    value: JSON.stringify(allScores),
  });
}

/**
 * Load the last score for a *single quiz* (qType, type, quizNumber).
 */
export async function loadQuizScore(qType, type, quizNumber) {
  const all = await loadAllScores();
  return all[qType]?.[type]?.[quizNumber] ?? null;
}

/**
 * Record the last score for a single quiz (qType, type, quizNumber).
 */
export async function recordLastScore(
  qType,
  type,
  quizNumber,
  grade,
  total,
  time
) {
  const nowISO = new Date().toISOString();
  const finalTime = time || nowISO;
  const scoreData = { grade, total, time: finalTime };

  const all = await loadAllScores();
  ensureNestedObject(all, qType, type);

  all[qType][type][quizNumber] = scoreData;
  await saveAllScores(all);
}

/**
 * Load **all** scores for qType + type.
 * Returns an object like: { "quizNumber": { grade, total, time }, ... }
 */
export async function loadAllTypeScores(qType, type) {
  const all = await loadAllScores();
  return all[qType]?.[type] ?? {};
}

/* --------------------------------------------------------------------------
   CONVENIENCE METHODS: COUNT BOOKMARKS & WRONG ANSWERS
   -------------------------------------------------------------------------- */

/**
 * Returns the total number of bookmarked questions for (qType, type).
 */
export async function countAllBookmarks(qType, type) {
  const allBookmarks = await loadAllTypeBookmarks(qType, type);
  return Object.values(allBookmarks).reduce((sum, arr) => sum + arr.length, 0);
}

/**
 * Returns the total number of wrong answers for (qType, type).
 * Sums all counts across all quizzes.
 */
export async function countAllWrongAnswers(qType, type) {
  const allWrongs = await loadAllTypeWrongAnswers(qType, type);
  let total = 0;
  for (const quiz in allWrongs) {
    // Count each question only once regardless of the number of mistakes
    total += Object.keys(allWrongs[quiz]).length;
  }
  return total;
}

/* --------------------------------------------------------------------------
   ALIASES FOR LOADING ALL QUIZZES (Instead of single quiz)
   -------------------------------------------------------------------------- */
export const loadTypeWrongAnswers = loadAllTypeWrongAnswers;
export const loadTypeBookmarks = loadAllTypeBookmarks;
export const loadTypeScores = loadAllTypeScores;
