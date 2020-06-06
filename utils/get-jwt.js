const fs = require('fs');
const jsonwebtoken = require('jsonwebtoken');

module.exports = function getJWT() {
  // https://developer.github.com/apps/building-integrations/setting-up-and-registering-github-apps/about-authentication-options-for-github-apps/#authenticating-as-a-github-app
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 10 * 60,
    iss: 67603, // https://github.com/settings/apps/prlint-serverless
  };
  let privateKey;
  try {
    privateKey = fs.readFileSync(__dirname + '/../key/prlint-serverless.private-key.pem');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log({ e });
  }
  return jsonwebtoken.sign(payload, privateKey, { algorithm: 'RS256' });
};
