const chai = require('chai');
const expect = chai.expect;

const path = require('path');
const config = require('config');
const replace = require('replace-in-file');
const FsClient = require('../../src/fsClient.js');
const GitClient = require('../../src/gitClient.js');
const WorkflowCreator = require('../../src/workflowCreator.js');

describe('End2EndTest', function() {
	const gitClient = new GitClient(config.get('j2ga.github.username'), config.get('j2ga.github.email'), config.get('j2ga.github.token'));
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
		const pathToSourceFile = 'test/resources/caller-java-gradle-workflow.yml';
		const pathToDestinationFile = path.join(process.cwd(), '/tmp','some-repo', '.github', 'workflows', 'callerWorkflow.yml');
		await fsClient.copyFile(pathToSourceFile, pathToDestinationFile);
		setTimeout(()=>{},50000);
		//replace app parameters
		const options = {
			files: pathToDestinationFile,
			from: [
				/APPLICATION_NAME/g,
				/YOUR_WORKFLOW_FILE/g,
				/DOCKER_REGISTRY/g,
				/HELM_REPO_URL/g,
				/OCTOPUS_DOCKER_IMAGE/g
			],
			to: [
				'some-repo',
				'java-gradle-wf.yml',
				'https://mydocker.io/docker-registry',
				'https://myhelmregistry.io',
				'my_octopus_image'

			]
		};
		await replace(options);
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

	it.skip('should generate workflows for all repos under the specified github org', async function(done) {
		//given
		this.timeout(20000);
		const workflowCreator = new WorkflowCreator();
		const githubOrgName = 'test-migration-org-1-gh';
		//when
		const result = await workflowCreator.createWorkflows(githubOrgName);
		//then
		expect(result).to.equal(0);
		done;
	});
});
