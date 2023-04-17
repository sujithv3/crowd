const bcrypt = require("bcrypt");
module.exports = {
  genPass(pass: string) {
    return bcrypt.hashSync(pass, Number(10));
  },
  verifyPass(hash: string, pass: string) {
    return bcrypt.compareSync(pass, hash);
  },
};
