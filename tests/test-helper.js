const sinon = require('sinon');

const chai = require('chai');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
const expect = chai.expect;

const nock = require('nock');
nock.disableNetConnect();

// eslint-disable-next-line mocha/no-top-level-hooks
afterEach(function () {
  sinon.restore();
  nock.cleanAll();
});

// eslint-disable-next-line mocha/no-exports
module.exports = {
  chai,
  expect,
  nock,
  sinon,
};
