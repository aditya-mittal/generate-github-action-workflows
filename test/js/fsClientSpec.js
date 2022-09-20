const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;
const expect = chai.expect;
const should = require('chai').should();

const sinon = require('sinon');
const path = require('path');
const fs = require('fs');

const FsClient = require('../../src/fsClient.js');

describe('FsClient', function() {
	const fsClient = new FsClient();
	describe('mkdir', function() {
		let mkdirStub;
		before(() => {
			mkdirStub = sinon.stub(fs, 'mkdirSync');
		});
		after(() => {
			mkdirStub.restore();
		});
		it('should create a directory', async function() {
			//given
			const pathToCreateDirectory = path.join(process.cwd(), '/tmp','.github', 'workflows');

			mkdirStub.withArgs(pathToCreateDirectory, {recursive: true}).returns(Promise.resolve());
			//when
			await fsClient.mkdir(pathToCreateDirectory);
			//then
			sinon.assert.calledWith(mkdirStub, pathToCreateDirectory, { recursive: true });
			expect(mkdirStub.called).to.equal(true);
		});
		it.skip('should handle error when creating the directory', async function() {
			//given

			const pathToCreateDirectory = path.join(process.cwd(), 'tmp','.github', 'workflows');
			const errorMessage = 'Error occurred while creating the directory';
			mkdirStub.withArgs(pathToCreateDirectory, {recursive: true}).returns(Promise.reject(new Error(errorMessage)));
			//when & then
			assert.isRejected(
				fsClient.mkdir(pathToCreateDirectory, {recursive: true}),
				Error,
				errorMessage
			);
			sinon.assert.calledWith(mkdirStub, pathToCreateDirectory, { recursive: true });
		});
	});
	describe('copyCallerWorkflow', function() {
		let copyFileStub;
		before(() => {
			copyFileStub = sinon.stub(fs, 'copyFile');
		});
		after(() => {
			copyFileStub.restore();
		});
		it('should copy caller workflow action file', async function() {
			//given
			const pathToSourceFile = 'test/resources/sampleCallerWorkflowActions.yml';
			const pathToDestinationFile = path.join(process.cwd(), 'callerWorkflow.yml');

			copyFileStub.withArgs(pathToSourceFile, pathToDestinationFile).returns(Promise.resolve());
			//when
			await fsClient.copyFile(pathToSourceFile, pathToDestinationFile);
			//then
			sinon.assert.calledWith(copyFileStub, pathToSourceFile, pathToDestinationFile);
			expect(copyFileStub.called).to.equal(true);
		});
		it('should handle error when copying the file', async function() {
			//given
			const pathToSourceFile = 'test/resources/sampleCallerWorkflowActions.yml';
			const pathToDestinationFile = path.join(process.cwd(), '/tmp','.github', 'workflows', 'callerWorkflow.yml');
			const errorMessage = 'Error occurred while creating the directory';
			copyFileStub.withArgs(pathToSourceFile, pathToDestinationFile).returns(Promise.reject(new Error(errorMessage)));
			//when & then
			assert.isRejected(
				fsClient.copyFile(pathToSourceFile, pathToDestinationFile),
				Error,
				errorMessage
			);
			sinon.assert.calledWith(copyFileStub, pathToSourceFile, pathToDestinationFile);
		});
	});
});