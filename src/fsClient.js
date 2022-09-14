const fs = require('fs');

function FsClient() {

	this.mkdir = function(path) {
		return fs.mkdir(path, { recursive: true }, (err) => {
			if (err) {
				throw err;
			}
			console.error('Error occurred while creating the directory');
		}
		);
	};

	this.copyFile = function(src, dest, mode) {
		return fs.copyFile(src, dest, mode, (err) => {
			if (err) {
				throw err;
			}
			console.error('Error occurred while copying the file');
		}
		);
	};
}

module.exports = FsClient;