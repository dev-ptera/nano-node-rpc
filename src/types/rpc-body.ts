import { Subtype } from './rpc-response';

export type ProcessBody = {
    json_block?: boolean;
    subtype?: Subtype;
    force?: boolean;
    async?: boolean;
    block: {
        type: string;
        account: string;
        previous: string;
        representative: string;
        balance: string;
        link: string;
        link_as_account?: string;
        signature: string;
        work: string;
    };
};
