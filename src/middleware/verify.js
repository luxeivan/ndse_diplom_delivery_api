const User = require("../model/user");

const verify = async (email, password, done) => {
  const user = await User.findByEmail(email);
  console.log('-----------------')
  console.log(user)
  console.log('-----------------')
  if (!user) {
    return done(null, false);
  } else if (user.passwordHash !== password) {
    return done(null, false);
  } else {
    return done(null, user)
  }
};

module.exports = verify;
