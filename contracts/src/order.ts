/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Order {

    @Property()
    public code: string;
    @Property()
    public initiator: string;
    @Property()
    public recipient: string;
    @Property()
    public products: string;
    @Property()
    public shipments: any[] | string;
    @Property()
    public status: string;

}
