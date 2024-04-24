import sinon from 'sinon';
import * as chai from 'chai';
import nock from 'nock';
import sinonChai from 'sinon-chai';
import promised from 'chai-as-promised';

chai.use(sinonChai);
chai.use(promised);

const expect = chai.expect;

nock.disableNetConnect();

// eslint-disable-next-line mocha/no-top-level-hooks
afterEach(function () {
  sinon.restore();
  nock.cleanAll();
});

// eslint-disable-next-line mocha/no-exports
export { chai, expect, nock, sinon };
