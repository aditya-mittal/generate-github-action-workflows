const path = require('path');
const config = require('config');
const replace = require('replace-in-file');

const log4js = require('./logger.js');
const GithubClient = require('./github/client.js');
const GitClient = require('./gitClient.js');
const FsClient = require('./fsClient.js');
const WorkflowTypeIdentifier = require('./workflowTypeIdentifier.js');
const logger = log4js.getLogger('WorkflowCreator');

function WorkflowCreator() {
	const fsClient = new FsClient();
	const gitClient = new GitClient(config.get('j2ga.github.username'), config.get('j2ga.github.email'), config.get('j2ga.github.token'));
	const githubClient = new GithubClient(config.get('j2ga.github.url'), config.get('j2ga.github.username'), config.get('j2ga.github.token'));
	const workflowTypeIdentifier = new WorkflowTypeIdentifier(config.get('j2ga.jenkins2githubWorkflowsMap'));

	this.createWorkflows = async function(githubOrgName) {
		try {
			logger.info(`Migrating repos under org: ${githubOrgName} from Jenkins to Github Actions`);
			let repoList = await githubClient.listOrgRepos(githubOrgName)
				.then(repoList => repoList)
				.catch((err) => {
					logger.error(`Unable to get list of repo for org: ${githubOrgName}, error: ${err.message}`);
				});
			logger.info(`Migrating total ${repoList.length} repos under org: ${githubOrgName}`);
			await _createWorkflows(this, repoList);
			return 0;
		} catch(error) {
			return 1;
		}
	};

	this.getWorkflowsStatus = async function(githubOrgName) {
		try {
			logger.info(`Getting workflow status for repos under org: ${githubOrgName}`);
			let repoList = await githubClient.listOrgRepos(githubOrgName)
				.then(repoList => repoList)
				.catch((err) => {
					logger.error(`Unable to get list of repo for org: ${githubOrgName}, error: ${err.message}`);
				});
			logger.info(`Getting workflow status for total ${repoList.length} repos under org: ${githubOrgName}`);
			await _getWorkflowsStatus(this, githubOrgName, repoList);
			return 0;
		} catch(error) {
			return 1;
		}
	};

	var _createWorkflows = async function(self, repoList) {
		const promises = repoList.map(repo => _createWorkflow(repo));

		return await Promise.all(promises)
			.catch((err) => logger.error(err.message));
	};

	var _getWorkflowsStatus = async function(self, githubOrgName, repoList) {
		const promises = repoList.map(repo => _getWorkflowStatus(githubOrgName, repo));

		return await Promise.all(promises)
			.catch((err) => logger.error(err.message));
	};

	var _getPathToWorkflowDir = function(pathToCloneRepo) {
		return path.join(pathToCloneRepo, '.github', 'workflows');
	};

	var _getPathToTemplateWorkflowFile = function(workflowType) {
		return path.join(process.cwd(), 'src', 'resources', `${workflowType}.yml`);
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
		const pathToCloneRepo = path.join(process.cwd(), '/tmp', repo.name);
		const pathToJenkinsFile = path.join(process.cwd(), '/tmp', repo.name, 'Jenkinsfile');
		const pathToWorkflowDir = _getPathToWorkflowDir(pathToCloneRepo);
		const pathToRepoWorkflow = _getPathToRepoWorkflow(pathToWorkflowDir);
		const repoRelativePathToWorkflow = path.join('.github','workflows', 'callerWorkflow.yml');
		const commitWorkflowMessage = 'Add github workflow while migrating from Jenkins';
		const remoteName = 'origin';
		return gitClient.clone(repo.clone_url, pathToCloneRepo, remoteName)
			.then(() => fsClient.mkdir(pathToWorkflowDir))
			.then(() => workflowTypeIdentifier.getWorkflowType(pathToJenkinsFile, repo.name))
			.then((workflowType) => fsClient.copyFile(_getPathToTemplateWorkflowFile(workflowType), pathToRepoWorkflow))
			.then(() => _replaceRepoSpecificParameters(repo, pathToRepoWorkflow))
			.then(() => gitClient.add(pathToCloneRepo, repoRelativePathToWorkflow))
			.then(() => gitClient.commit(pathToCloneRepo, commitWorkflowMessage))
			.then(() => gitClient.push(pathToCloneRepo, remoteName, repo.default_branch))
			.then(() => fsClient.rm(pathToCloneRepo))
			.then(() => logger.info(`Migrated repo: ${repo.name} successfully`))
			.catch((err) => {
				logger.error(`Unable to migrate repo: ${repo.name}, error: ${err.message}`);
			});
	};

	var _getWorkflowStatus = async function(githubOrgName, repo) {
		return githubClient.listRepoWorkflowRuns(githubOrgName, repo.name)
			.then((workflowRuns) => workflowRuns[0].conclusion)
			.then((workflowStatus) => {
				if(workflowStatus === 'success') {
					logger.info(`Workflow completed successfully for repo: ${repo.name}`);
				} else {
					logger.warn(`Workflow did not complete successfully for repo: ${repo.name}`);
				}
			})
			.catch((err) => {
				logger.error(`Unable to get status of workflow for repo: ${repo.name}, error: ${err.message}`);
			});
	};
}
module.exports = WorkflowCreator;