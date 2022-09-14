const path = require('path');
const fs = require('fs');
const config = require('config');
const replace = require('replace');

const FsClient = require('../../src/fsClient.js');
const GitClient = require('../../src/gitClient.js');

describe('End2EndTest', function() {
	const gitClient = new GitClient(config.get('gl2gh.github.username'), config.get('gl2gh.github.email'), config.get('gl2gh.github.token'));
	const fsClient = new FsClient();
	it.skip('should test E2E', async function() {
		//clone
		const httpsRemoteUrl = 'https://github.com/aditya-mittal/some-repo.git';
		const repoName = 'some-repo';
		const pathToCloneRepo = path.join(process.cwd(), '/tmp', repoName);
		const remoteName = 'origin';
		await gitClient.clone(httpsRemoteUrl, pathToCloneRepo, remoteName);

		setTimeout(()=>{},5000);

		// create workflow Directory
		const pathToCreateDirectory = path.join(process.cwd(), '/tmp','some-repo', '.github', 'workflows');
		await fsClient.mkdir(pathToCreateDirectory);
		setTimeout(()=>{}, 50000);

		// copy workflow actions file
		const pathToSourceFile = 'test/resources/sampleCallerWorkflowActions.yml';
		const pathToDestinationFile = path.join(process.cwd(), '/tmp','some-repo', '.github', 'workflows', 'callerWorkflow.yml');
		const copyMode = fs.constants.COPYFILE_EXCL;
		await fsClient.copyFile(pathToSourceFile, pathToDestinationFile, copyMode);
		setTimeout(()=>{},50000);
		//replace app parameters
		replace({
			regex: 'test',
			replacement: 'bar',
			paths: [pathToDestinationFile],
			recursive: false
		});
		// stage a file
		const filepath = path.join('.github', 'workflows', 'callerWorkflow.yml');
		await gitClient.add(pathToCloneRepo, filepath);
		setTimeout(()=>{},50000);
		//commit a file
		const commitMessage = 'My first programmatic commit';
		//when
		await gitClient.commit(pathToCloneRepo, commitMessage);
		setTimeout(()=>{},5000);
		//push a file
		const branchName = 'master';
		await gitClient.push(pathToCloneRepo, remoteName, branchName);
	});
});
