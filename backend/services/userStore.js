const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const USERS_FILE = path.join(__dirname, "..", "data", "users.json");

async function ensureStore() {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, "[]", "utf-8");
  }
}

async function readUsers() {
  await ensureStore();
  const raw = await fs.readFile(USERS_FILE, "utf-8");
  try {
    const users = JSON.parse(raw);
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

async function writeUsers(users) {
  await ensureStore();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    provider: user.provider,
    avatar: user.avatar || null,
    createdAt: user.createdAt,
  };
}

async function findUserByEmail(email) {
  const normalized = normalizeEmail(email);
  const users = await readUsers();
  return users.find((user) => user.email === normalized) || null;
}

async function findUserByGoogleId(googleId) {
  const users = await readUsers();
  return users.find((user) => user.googleId === googleId) || null;
}

async function findUserById(id) {
  const users = await readUsers();
  return users.find((user) => user.id === id) || null;
}

async function createLocalUser({ name, email, passwordHash }) {
  const users = await readUsers();
  const normalized = normalizeEmail(email);

  if (users.some((user) => user.email === normalized)) {
    const error = new Error("User already exists");
    error.code = "USER_EXISTS";
    throw error;
  }

  const user = {
    id: randomUUID(),
    name: String(name || "Traveler").trim() || "Traveler",
    email: normalized,
    passwordHash,
    provider: "local",
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);
  return user;
}

async function upsertGoogleUser({ googleId, email, name, avatar }) {
  const users = await readUsers();
  const normalized = normalizeEmail(email);

  let user = users.find((entry) => entry.googleId === googleId);

  if (!user && normalized) {
    user = users.find((entry) => entry.email === normalized);
  }

  if (user) {
    user.googleId = googleId;
    user.name = name || user.name;
    user.avatar = avatar || user.avatar || null;
    user.provider = user.passwordHash ? "local+google" : "google";
    await writeUsers(users);
    return user;
  }

  const newUser = {
    id: randomUUID(),
    name: String(name || "Google User").trim() || "Google User",
    email: normalized,
    googleId,
    provider: "google",
    avatar: avatar || null,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeUsers(users);
  return newUser;
}

module.exports = {
  publicUser,
  findUserByEmail,
  findUserByGoogleId,
  findUserById,
  createLocalUser,
  upsertGoogleUser,
};
