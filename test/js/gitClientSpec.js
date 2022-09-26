const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;
const expect = chai.expect;
const should = require('chai').should();

const sinon = require('sinon');
const path = require('path');
const fs = require('fs');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const config = require('config');

const GitClient = require('../../src/gitClient.js');

describe('Git', function() {
	const gitClient = new GitClient(config.get('j2ga.github.username'), config.get('j2ga.github.email'), config.get('j2ga.github.token'));
	describe('Clone', function() {
		let cloneStub;
		before(() => {
			cloneStub = sinon.stub(git, 'clone');
		});
		after(() => {
			cloneStub.restore();
		});
		it('should clone the repo', async function() {
			//given
			const httpsRemoteUrl = 'https://github.com/some-repo.git';
			const repoName = 'some-repo';
			const pathToCloneRepo = path.join(process.cwd(), '/tmp','migrate', repoName);
			const remoteName = 'gitlab';
			cloneStub.returns(Promise.resolve());
			//when
			await gitClient.clone(httpsRemoteUrl, pathToCloneRepo, remoteName);
			//then
			sinon.assert.calledWith(cloneStub, {fs, http, dir: pathToCloneRepo, url: httpsRemoteUrl, remote: remoteName,
				onAuth: sinon.match.func, onAuthFailure: sinon.match.func});
			expect(cloneStub.called).to.equal(true);
		});
		it('should handle error when cloning the repo', async function() {
			//given
			const httpsRemoteUrl = 'https://github.com/some-repo.git';
			const repoName = 'some-repo';
			const pathToCloneRepo = path.join(process.cwd(), '/tmp','migrate', repoName);
			const remoteName = 'gitlab';
			const errorMessage = 'Error occurred while cloning the repo';
			cloneStub.withArgs({fs, http, dir: pathToCloneRepo, url: httpsRemoteUrl, remote: remoteName,
				onAuth: sinon.match.func, onAuthFailure: sinon.match.func}).returns(Promise.reject(new Error(errorMessage)));
			//when & then
			assert.isRejected(
				gitClient.clone(httpsRemoteUrl, pathToCloneRepo, remoteName),
				Error,
				errorMessage
			);
			sinon.assert.calledWith(cloneStub, { fs, http, dir: pathToCloneRepo, url: httpsRemoteUrl, remote: remoteName,
				onAuth: sinon.match.func, onAuthFailure: sinon.match.func });
		});
	});
	describe('Add', function() {
		let addStub;
		before(() => {
			addStub = sinon.stub(git, 'add');
		});
		after(() => {
			addStub.restore();
		});
		it('should add(stage) the file', async function() {
			//given
			const repoName = 'some-repo';
			const repoPathOnLocal = path.join(process.cwd(), repoName);
			const fileName = 'test.txt';
			const relativeFilePathInRepo = path.join('.github', 'workflows', fileName);
			addStub.returns(Promise.resolve());
			//when
			await gitClient.add(repoPathOnLocal, relativeFilePathInRepo);
			//then
			sinon.assert.calledWith(addStub, {fs, dir: repoPathOnLocal, filepath: relativeFilePathInRepo});
			expect(addStub.called).to.equal(true);
		});
		it('should handle error when staging the repo', async function() {
			//given
			const repoName = 'some-repo';
			const repoPathOnLocal = path.join(process.cwd(), repoName);
			const fileName = 'test.txt';
			const relativeFilePathInRepo = path.join('.github', 'workflows', fileName);
			const errorMessage = 'Error occurred while staging the file';
			addStub.returns(Promise.reject(new Error(errorMessage)));
			//when & then
			assert.isRejected(
				gitClient.add(repoPathOnLocal, relativeFilePathInRepo),
				Error,
				errorMessage
			);
			sinon.assert.calledWith(addStub, {fs, dir: repoPathOnLocal, filepath: relativeFilePathInRepo});
		});
	});
	describe('Commit', function() {
		let commitStub;
		before(() => {
			commitStub = sinon.stub(git, 'commit');
		});
		after(() => {
			commitStub.restore();
		});
		it('should commit the staged files', async function() {
			//given
			const repoName = 'some-repo';
			const repoPathOnLocal = path.join(process.cwd(), '/tmp', repoName);
			const commitMessage = 'My first programmatic commit';

			commitStub.withArgs({fs, dir: repoPathOnLocal, message: commitMessage, author: {name: config.get('j2ga.github.username'), email: config.get('j2ga.github.email')}}).returns(Promise.resolve());
			//when
			await gitClient.commit(repoPathOnLocal, commitMessage);
			//then
			sinon.assert.calledWith(commitStub, {fs, dir: repoPathOnLocal, message: commitMessage, author: {name: config.get('j2ga.github.username'), email: config.get('j2ga.github.email')}});
			expect(commitStub.called).to.equal(true);
		});
	});
	describe('#push()', function() {
		let pushStub;
		before(() => {
			pushStub = sinon.stub(git, 'push');
		});
		after(() => {
			pushStub.restore();
		});
		it('should push to the remote for repo', async function() {
			//given
			const remoteName = 'new_origin';
			const branchName = 'master';
			const repoPathOnLocal = path.join(process.cwd(), 'tmp','migrate', 'some_repo');
			pushStub.withArgs({ fs, http, dir: repoPathOnLocal, remote: remoteName, ref: branchName,
				onAuth: sinon.match.func, onAuthFailure: sinon.match.func
			})
				.returns(Promise.resolve());
			//when
			await gitClient.push(repoPathOnLocal, remoteName, branchName);
			//then
			sinon.assert.calledWith(pushStub, {fs, http, dir: repoPathOnLocal, remote: remoteName, ref: branchName,
				onAuth: sinon.match.func, onAuthFailure: sinon.match.func });
		});
		it('should handle error when pushing to remote', async function() {
			//given
			const remote_name = 'new_origin';
			const branch_name = 'master';
			const repo_path_on_local = path.join(process.cwd(), 'tmp','migrate', 'some_repo');
			const errorMessage = 'Error occurred while pushing to remote';
			pushStub.withArgs({fs, http, dir: repo_path_on_local, remote: remote_name, ref: branch_name,
				onAuth: sinon.match.func, onAuthFailure: sinon.match.func}).returns(Promise.reject(new Error(errorMessage)));
			//when & then
			assert.isRejected(
				gitClient.push(repo_path_on_local, remote_name, branch_name),
				Error,
				errorMessage
			);
			sinon.assert.calledWith(pushStub, {fs, http, dir: repo_path_on_local, remote: remote_name, ref: branch_name,
				onAuth: sinon.match.func, onAuthFailure: sinon.match.func});
		});
	});

});