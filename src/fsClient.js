const fs = require('fs');

function FsClient() {

	this.mkdir = function(path) {
		return fs.promises.mkdir(path, { recursive: true }, (err) => {
			if(err) {
				console.error(`Error occurred while creating directory, ${path}`);
			}
		});
	};

	this.rmdir = function(path) {
		return fs.promises.rmdir(path, { recursive: true }, (err) => {
			if (err) {
				console.error(`Error occurred while deleting directory, ${path}`);
				throw new Error(`Error occurred while deleting directory, ${path}`);
			}
		});
	};

	this.copyFile = function(src, dest) {
		return fs.promises.copyFile(src, dest, (err) => {
			if(err) {
				console.error(`Error occurred while copying the src file, ${src} to destination ${dest}`);
			}
		});
	};

	this.readFile = function(pathToFile) {
		return fs.promises.readFile(pathToFile, (err) => {
			if (err) {
				console.error(`Error occured while reading the file ${pathToFile}`);
				throw new Error(`Error occured while reading the file ${pathToFile}`);
			}
		});
	};
}

module.exports = FsClient;