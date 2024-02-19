import sinon from 'sinon';

import chai from 'chai';
import sinonChai from 'sinon-chai';
import promised from 'chai-as-promised';
import nock from 'nock';

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
