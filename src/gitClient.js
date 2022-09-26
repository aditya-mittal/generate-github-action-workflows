const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');

const log4js = require('./logger.js');
const logger = log4js.getLogger('GitClient');

function GitClient(githubUserName, githubUserEmail, githubToken) {
	this.githubUserName = githubUserName;
	this.githubUserEmail = githubUserEmail;
	this.githubToken = githubToken;

	this.clone = function(httpsRemoteUrl, pathToCloneRepo, remoteName) {
		return git.clone({ fs, http, dir: pathToCloneRepo, url: httpsRemoteUrl, remote: remoteName,
			onAuth: () => ({ username: this.githubToken }),
			onAuthFailure: () => {logger.error('Cant authenticate with GitHub while cloning');}
		}).catch((err) => {
			logger.error(`Error occurred while cloning repo: ${httpsRemoteUrl}, error: ${err}`);
			throw new Error(`Error occurred while cloning repo: ${httpsRemoteUrl}, error: ${err}`);
		});
	};

	this.add = function(repoPathOnLocal, relativeFilePathInRepo) {
		return git.add({ fs, dir: repoPathOnLocal, filepath: relativeFilePathInRepo})
			.catch((err) => {
				logger.error(`Error occurred while staging the file: ${relativeFilePathInRepo} for repo: ${repoPathOnLocal}, error: ${err}`);
				throw new Error(`Error occurred while staging the file: ${relativeFilePathInRepo} for repo: ${repoPathOnLocal}, error: ${err}`);
			});
	};

	this.commit = function(repoPathOnLocal, commitMessage) {
		return git.commit({ fs, dir: repoPathOnLocal, message: commitMessage,
			author: {
				name: this.githubUserName,
				email: this.githubUserEmail,
			}
		}).catch((err) => {
			logger.error(`Error occurred while committing for repo: ${repoPathOnLocal}, error: ${err}`);
			throw new Error(`Error occurred while committing for repo: ${repoPathOnLocal}, error: ${err}`);
		});
	};

	this.push = function(repoPathOnLocal, remoteName, branchName) {
		return git.push({fs, http, dir: repoPathOnLocal, remote: remoteName,
			ref: branchName, onAuth: () => ({ username: this.githubToken }),
			onAuthFailure: () => {logger.error('Cant authenticate with GitHub while pushing');}
		}).catch((err) => {
			logger.error(`Error occurred while pushing to remote: ${remoteName} for repo: ${repoPathOnLocal} on branch: ${branchName}, error: ${err}`);
			throw new Error(`Error occurred while pushing to remote ${remoteName} for repo ${repoPathOnLocal} on branch ${branchName}, error: ${err}`);
		});
	};
}

module.exports = GitClient;