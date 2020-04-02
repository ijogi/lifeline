/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Order } from './order';

@Info({title: 'OrderContract', description: 'My Smart Contract' })
export class OrderContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async orderExists(ctx: Context, orderId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(orderId);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createOrder(ctx: Context, orderId: string, code: string, initiator: string, products: string, recipient: string, shipments: string, status: string): Promise<void> {
        const exists = await this.orderExists(ctx, orderId);
        if (exists) {
            throw new Error(`The order ${orderId} already exists`);
        }
        const order: Order = {
            code,
            initiator,
            products,
            recipient,
            shipments,
            status,
        };
        const buffer = Buffer.from(JSON.stringify(order));
        await ctx.stub.putState(orderId, buffer);
    }

    @Transaction(false)
    @Returns('Order')
    public async readOrder(ctx: Context, orderId: string): Promise<Order> {
        const exists = await this.orderExists(ctx, orderId);
        if (!exists) {
            throw new Error(`The order ${orderId} does not exist`);
        }
        const buffer = await ctx.stub.getState(orderId);
        const order = JSON.parse(buffer.toString()) as Order;
        return order;
    }

    @Transaction()
    public async updateOrder(ctx: Context, orderId: string, code: string, initiator: string, products: string, recipient: string, shipments: string, status: string): Promise<void> {
        const exists = await this.orderExists(ctx, orderId);
        if (!exists) {
            throw new Error(`The order ${orderId} does not exist`);
        }
        const order: Order = {
            code,
            initiator,
            products,
            recipient,
            shipments,
            status,
        };
        const buffer = Buffer.from(JSON.stringify(order));
        await ctx.stub.putState(orderId, buffer);
    }

    @Transaction()
    public async deleteOrder(ctx: Context, orderId: string): Promise<void> {
        const exists = await this.orderExists(ctx, orderId);
        if (!exists) {
            throw new Error(`The order ${orderId} does not exist`);
        }
        await ctx.stub.deleteState(orderId);
    }

    @Transaction()
    public async createShipment(ctx: Context, orderId: string, shipmentId: string, products: string): Promise<void> {
        const exists = await this.orderExists(ctx, orderId);
        if (!exists) {
            throw new Error(`The order ${orderId} does not exist`);
        }

        const buffer = await ctx.stub.getState(orderId);
        const order = JSON.parse(buffer.toString()) as Order;

        order.status  = 'SHIPMENT_CREATED';
        order.shipments = [
            {
                code: shipmentId,
                initiator: order.initiator,
                orderCode: order.code,
                products: JSON.parse(products),
                recipient: order.recipient,
                status: 'CREATED',
            },
        ];

        await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(order)));
    }

    @Transaction()
    public async receiveOrder(ctx: Context, orderId: string): Promise<void> {
        const exists = await this.orderExists(ctx, orderId);
        if (!exists) {
            throw new Error(`The order ${orderId} does not exist`);
        }
        const buffer = await ctx.stub.getState(orderId);
        const order = JSON.parse(buffer.toString()) as Order;
        order.status  = 'RECEIVED';

        await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(order)));
    }

    @Transaction()
    public async markAsCompleted(ctx: Context, orderId: string): Promise<void> {
        const exists = await this.orderExists(ctx, orderId);
        if (!exists) {
            throw new Error(`The order ${orderId} does not exist`);
        }
        const buffer = await ctx.stub.getState(orderId);
        const order = JSON.parse(buffer.toString()) as Order;
        order.status  = 'COMPLETED';

        await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(order)));
    }

}
