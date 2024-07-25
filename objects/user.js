const bcrypt = require('bcryptjs'); // bcryptjs 라이브러리 추가

const User = {
  findOne: async (db, query) => {
    try {
      return await db.collection('user').findOne(query);
    } catch (err) {
      console.error('Error finding user:', err);
      throw err;
    }
  },
  verifyPassword: async (user, inputPassword) => {
    try {
      return await bcrypt.compare(inputPassword, user.password); // 비밀번호 해시 비교
    } catch (err) {
      console.error('Error verifying password:', err);
      throw err;
    }
  },
  createUser: async (db, username, password) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해싱
      const newUser = { username, password: hashedPassword };
      await db.collection('user').insertOne(newUser);
      return newUser;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }
};

module.exports = User;
