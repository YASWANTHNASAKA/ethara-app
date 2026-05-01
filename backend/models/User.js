const bcrypt = require('bcryptjs');

const users = [];

const createUser = async (name, email, password) => {
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), name, email, password: hashed };
  users.push(user);
  return user;
};

const findUserByEmail = (email) => users.find(u => u.email === email);
const findUserById = (id) => users.find(u => u.id === id);

module.exports = { createUser, findUserByEmail, findUserById };