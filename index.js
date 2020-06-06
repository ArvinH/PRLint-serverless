const fetch = require('node-fetch');
const getJWT = require('./utils/get-jwt');
const GITHUB_API_URL = 'https://api.github.com';
// ref: https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional

const prStatus = ['opened', 'edited', 'ready_for_review'];

const validatePullReqeustTitle = function (pullRequestTitle) {
  const pattern = /^(build|ci|chore|docs|feat|fix|perf|refactor|revert|style|test)(\(.+\))?:\s.+\b/;
  const match = pullRequestTitle.match(pattern);
  return !!match;
};

const getAccessToken = async function (installationId = '') {
  try {
    // Get a JWT every time
    let JWT = getJWT();
    const response = await fetch(`${GITHUB_API_URL}/installations/${installationId}/access_tokens`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.machine-man-preview+json',
        Authorization: `Bearer ${JWT}`,
      },
    });
    const result = await response.json();
    return result.token;
  } catch (exception) {
    // eslint-disable-next-line no-console
    console.log({ exception });
  }
};

exports.prLint = async (req, res) => {
  if (req.url === '/webhook' && req.method === 'POST') {
    const { pull_request: pullRequest = {}, action, installation = {} } = req.body;
    const { statuses_url: statusesUrl, title } = pullRequest;
    const accessTokens = await getAccessToken(installation.id);
    if (prStatus.indexOf(action) !== -1) {
      // check pr title
      const isValid = validatePullReqeustTitle(title);

      // call status api
      const body = {
        state: isValid ? 'success' : 'error',
        description: isValid ? 'pass pr lint' : 'please check your pr title',
        context: 'pr-lint',
      };
      const headers = {
        Authorization: `Token ${accessTokens}`,
        Accept: 'application/vnd.github.machine-man-preview+json',
      };

      try {
        const stream = await fetch(statusesUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          json: true,
        });
        await stream.json();
        return res.status(200);
      } catch (err) {
        return res.status(400).json({
          message: 'PR lint error',
        });
      }
    }
    return res.status(200);
  } else {
    // Redirect since we don't need anyone visiting our service
    // if they happen to stumble upon our URL
    res.writeHead(301, { Location: 'https://github.com/arvinhv/prlint-serverless' });
    res.end();
  }
};
