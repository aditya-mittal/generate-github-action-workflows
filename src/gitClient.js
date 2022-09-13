const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');

function GitClient(githubToken) {
	this.githubToken = githubToken;

	this.clone = function(httpsRemoteUrl, pathToCloneRepo, remoteName) {
		return git.clone({ fs, http, dir: pathToCloneRepo, url: httpsRemoteUrl, remote: remoteName,
			onAuth: () => ({ username: this.githubToken }),
			onAuthFailure: () => {console.error('Cant authenticate with GitHub');}
		});
	};

	this.push = function(repoPathOnLocal, remoteName, branchName) {
		return git.push({fs, http, dir: repoPathOnLocal, remote: remoteName,
			ref: branchName, onAuth: () => ({ username: this.githubToken }),
			onAuthFailure: () => {console.error('Cant authenticate with GitHub');}
		});
	};
}

module.exports = GitClient;