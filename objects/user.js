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
  }
};

module.exports = User;
