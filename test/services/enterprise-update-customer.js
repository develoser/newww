var Code = require('code'),
    Lab = require('lab'),
    lab = exports.lab = Lab.script(),
    describe = lab.experiment,
    before = lab.before,
    it = lab.test,
    expect = Code.expect;

var Hapi = require('hapi'),
    npme = require('../../services/npme'),
    nock = require('nock'),
    config = require('../../config'),
    existingUser = require('../fixtures/enterprise').existingUser;

var server;

config.license.api = 'https://billing.website.com';

before(function (done) {
  server = new Hapi.Server();
  server.connection({ host: 'localhost', port: '9133' });

  server.register(npme, function () {
    server.start(done);
  });
});

describe('updating a customer via hubspot', function () {
  it('returns the customer if it is successful', function (done) {

    var customerId = 12345;

    var mock = nock(config.license.api)
        .post('/customer/' + customerId, existingUser)
        .reply(200, existingUser);

    server.methods.npme.updateCustomer(customerId, existingUser, function (err, customer) {
      mock.done();
      expect(err).to.not.exist();
      expect(customer).to.be.an.object();
      expect(customer.id).to.equal(customerId);
      done();
    });
  });

  it('returns en error if something goes wrong at hubspot', function (done) {

    var customerId = 12345;

    var mock = nock(config.license.api)
        .post('/customer/' + customerId, existingUser)
        .reply(400);

    server.methods.npme.updateCustomer(customerId, existingUser, function (err, customer) {
      mock.done();
      expect(err).to.exist();
      expect(err.message).to.equal('unable to update customer ' + customerId);
      expect(customer).to.not.exist();
      done();
    });
  });

});