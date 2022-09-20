const path = require('path');
const config = require('config');
const replace = require('replace-in-file');

const GithubClient = require('./github/client.js');
const GitClient = require('./gitClient.js');
const FsClient = require('./fsClient.js');

function WorkflowCreator() {
	const fsClient = new FsClient();
	const gitClient = new GitClient(config.get('gl2gh.github.username'), config.get('gl2gh.github.email'), config.get('gl2gh.github.token'));
	const githubClient = new GithubClient(config.get('gl2gh.github.url'), config.get('gl2gh.github.username'), config.get('gl2gh.github.token'));

	this.createWorkflows = async function(githubOrgName) {
		try {
			let repoList = await githubClient.listOrgRepos(githubOrgName)
				.then(repoList => repoList);
			await _createWorkflows(this, repoList);
			return 0;
		} catch(error) {
			return 1;
		}
	};

	var _createWorkflows = async function(self, repoList) {
		const promises = repoList.map(repo => _createWorkflow(repo));

		return await Promise.all(promises)
			.catch((err) => console.error(err.message));
	};

	var _getPathToWorkflowDir = function(pathToCloneRepo) {
		return path.join(pathToCloneRepo, '.github', 'workflows');
	};

	var _getPathToTemplateWorkflowFile = function(workflowType) {
		console.log(workflowType);
		return path.join(process.cwd(), 'src', 'resources', 'sampleCallerWorkflowActions.yml');
	};

	var _getPathToRepoWorkflow = function(pathToWorkflowDir) {
		return path.join(pathToWorkflowDir, 'callerWorkflow.yml');
	};

	var _replaceRepoSpecificParameters = function(repo, pathToRepoWorkflow) {
		const options = {
			files: pathToRepoWorkflow,
			from: /APPLICATION_NAME/g,
			to: repo.name
		};
		return replace(options);
	};

	var _createWorkflow = async function(repo) {
		const workflowType = '';
		const pathToCloneRepo = path.join(process.cwd(), '/tmp', repo.name);
		const pathToWorkflowDir = _getPathToWorkflowDir(pathToCloneRepo);
		const pathToRepoWorkflow = _getPathToRepoWorkflow(pathToWorkflowDir);
		const repoRelativePathToWorkflow = path.join('.github','workflows', 'callerWorkflow.yml');
		const commitWorkflowMessage = 'Commit github workflow while migrating from Jenkins';
		const branchName = 'master';
		const remoteName = 'origin';
		return gitClient.clone(repo.clone_url, pathToCloneRepo, remoteName)
			.then(async function() {
				return await new Promise(function(resolve) {
					resolve(fsClient.mkdir(pathToWorkflowDir));
				});
			})
			.then(async function() {
				await fsClient.copyFile(_getPathToTemplateWorkflowFile(workflowType), pathToRepoWorkflow);
			})
			.then(() => _replaceRepoSpecificParameters(repo, pathToRepoWorkflow))
			.then(() => gitClient.add(pathToCloneRepo, repoRelativePathToWorkflow))
			.then(() => gitClient.commit(pathToCloneRepo, commitWorkflowMessage))
			.then(() => gitClient.push(pathToCloneRepo, remoteName, branchName));
	};

}
module.exports = WorkflowCreator;