const { expect } = require('chai');
const { getCacheHit }= require('../../../lib/application/task-cache-hit')
const connexionString = 'postgresql://user@localhost:5432/database';

describe('#getCacheHit', ()=>{
  it('should return a positive percentage', async ()=>{
    // when
    const result = await getCacheHit(connexionString);

    // then
    expect(result).to.be.a('number');
    expect(result).to.be.at.least(0);
    expect(result).to.be.at.most(100);
  })
});
