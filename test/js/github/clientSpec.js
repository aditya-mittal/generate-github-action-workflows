const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;
const expect = chai.expect;
const should = require('chai').should();
const nock = require('nock');
const config = require('config');

const GithubClient = require('../../../src/github/client.js');
const Repository = require('../../../src/github/model/repository.js');

describe('Github client', function() {
	const GITHUB_API_URL = config.get('gl2gh.github.url');
	const GITHUB_PRIVATE_TOKEN = config.get('gl2gh.github.token');
	const GITHUB_USERNAME = config.get('gl2gh.github.username');
	const githubClient = new GithubClient(GITHUB_API_URL, GITHUB_USERNAME, GITHUB_PRIVATE_TOKEN);
	let api;
	beforeEach(() => {
		api = nock(
			'https://' + GITHUB_API_URL, {
				reqHeaders: {
					'Content-Type': 'application/json',
					'User-Agent': 'gl2h',
					'Authorization': 'token ' + GITHUB_PRIVATE_TOKEN
				}
			}
		);
	});
	afterEach(() => {
		nock.cleanAll();
	});
});