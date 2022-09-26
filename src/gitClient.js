const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');

function GitClient(githubUserName, githubUserEmail, githubToken) {
	this.githubUserName = githubUserName;
	this.githubUserEmail = githubUserEmail;
	this.githubToken = githubToken;

	this.clone = function(httpsRemoteUrl, pathToCloneRepo, remoteName) {
		return git.clone({ fs, http, dir: pathToCloneRepo, url: httpsRemoteUrl, remote: remoteName,
			onAuth: () => ({ username: this.githubToken }),
			onAuthFailure: () => {console.error('Cant authenticate with GitHub while cloning');}
		});
	};

	this.add = function(repoPathOnLocal, relativeFilePathInRepo) {
		return git.add({ fs, dir: repoPathOnLocal, filepath: relativeFilePathInRepo});
	};

	this.commit = function(repoPathOnLocal, commitMessage) {
		return git.commit({ fs, dir: repoPathOnLocal, message: commitMessage,
			author: {
				name: this.githubUserName,
				email: this.githubUserEmail,
			}
		});
	};

	this.push = function(repoPathOnLocal, remoteName, branchName) {
		return git.push({fs, http, dir: repoPathOnLocal, remote: remoteName,
			ref: branchName, onAuth: () => ({ username: this.githubToken }),
			onAuthFailure: () => {console.error('Cant authenticate with GitHub while pushing');}
		});
	};
}

module.exports = GitClient;
