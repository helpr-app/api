const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const joi = require('joi');
const models = require('../../database/models');
const { validateRequest, regexes } = require('../../utils/validation');
const keys = require('../../utils/keys.json');

async function login(req, res) {
  const schema = {
    body: {
      email: joi
        .string()
        .regex(regexes.email)
        .required(),
      password: joi
        .string()
        .regex(regexes.password)
        .required(),
    },
  };

  const error = validateRequest({ body: req.body }, schema);
  if (error !== null) {
    return res.status(400).json({ message: 'validation fail', data: null });
  }

  const { email, password } = req.body;

  const user = await models.User.findOne({ email });

  if (user !== null) {
    if (await bcrypt.compareSync(password, user.password)) {
      const token = await jwt.sign(user.email, keys.jwt);
      return res.status(200).json({
        message: 'sucess',
        data: {
          name: user.name,
          token,
        },
      });
    }
    return res.status(400).json({ message: 'invalid password', data: null });
  }

  return res.status(400).json({ message: 'user doesnt exist', data: null });
}

module.exports = { login };
