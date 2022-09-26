const Repository = require('../../../../src/github/model/repository.js');

describe('Repository', function() {
	it('must have name, owner_name & clone_url', function() {
		//given
		const name = 'some-repo';
		const owner_name = 'some-owner';
		const clone_url = 'https://github.com/foo-user/some-repo.git';
		const default_branch = 'master';
		//when
		const repository = new Repository(name, owner_name, clone_url, default_branch);
		//then
		repository.should.be.a('object');
		repository.should.be.instanceof(Repository);
		repository.should.have.property('name');
		repository.should.have.property('owner_name');
		repository.should.have.property('clone_url');
		repository.should.have.property('default_branch');
		repository.should.have.all.keys('name', 'owner_name', 'clone_url', 'default_branch');
		repository.name.should.equal(name);
		repository.owner_name.should.equal(owner_name);
		repository.clone_url.should.equal(clone_url);
		repository.default_branch.should.equal(default_branch);
	});
});