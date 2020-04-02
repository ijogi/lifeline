/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { OrderContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logging = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('OrderContract', () => {

    let contract: OrderContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new OrderContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"order 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"order 1002 value"}'));
    });

    describe('#orderExists', () => {

        it('should return true for a order', async () => {
            await contract.orderExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a order that does not exist', async () => {
            await contract.orderExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createOrder', () => {

        it('should create a order', async () => {
            await contract.createOrder(ctx, '1003', 'order 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"order 1003 value"}'));
        });

        it('should throw an error for a order that already exists', async () => {
            await contract.createOrder(ctx, '1001', 'myvalue').should.be.rejectedWith(/The order 1001 already exists/);
        });

    });

    describe('#readOrder', () => {

        it('should return a order', async () => {
            await contract.readOrder(ctx, '1001').should.eventually.deep.equal({ value: 'order 1001 value' });
        });

        it('should throw an error for a order that does not exist', async () => {
            await contract.readOrder(ctx, '1003').should.be.rejectedWith(/The order 1003 does not exist/);
        });

    });

    describe('#updateOrder', () => {

        it('should update a order', async () => {
            await contract.updateOrder(ctx, '1001', 'order 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"order 1001 new value"}'));
        });

        it('should throw an error for a order that does not exist', async () => {
            await contract.updateOrder(ctx, '1003', 'order 1003 new value').should.be.rejectedWith(/The order 1003 does not exist/);
        });

    });

    describe('#deleteOrder', () => {

        it('should delete a order', async () => {
            await contract.deleteOrder(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a order that does not exist', async () => {
            await contract.deleteOrder(ctx, '1003').should.be.rejectedWith(/The order 1003 does not exist/);
        });

    });

});
