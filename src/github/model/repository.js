function Repository(name, owner_name, clone_url) {
	this.name = name;
	this.owner_name = owner_name;
	this.clone_url = clone_url;
}

module.exports = Repository;