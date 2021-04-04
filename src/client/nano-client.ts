import axios, { AxiosResponse } from 'axios';
import * as RPC from '../types/rpc-response';

/**
 * @class NanoClient
 * @description An RPC Client for NANO. The official RPC API is here:
 *              https://github.com/clemahieu/raiblocks/wiki/RPC-protocol
 */
export class NanoClient {
    /* URL of data source */
    nodeAddress: string;
    /* Custom HTTP headers for all requests */
    requestHeaders: Object;
    /* HTTP header defaults. */
    defaultHeaders = {
        'content-type': 'application/json',
    };

    /**
     * @function constructor
     * @description Build an instance of `NanoClient`
     * @param {Object} options - The options with either the node URL & custom request headers.
     */
    constructor(options: { url?: string; requestHeaders?: Object }) {
        this.nodeAddress = options?.url;
        this.requestHeaders = options?.requestHeaders || {};
    }

    /**
     * @function _buildRPCBody
     * @private
     * @description Create an RPC request body to be later used by `#_send`.
     * @param {string} action - A given RPC action.
     * @param {Object|Array} params - Parameters to be passed to the RPC daemon
     * @return {Object} Returns an object containing the request (url, body).
     */
    private _buildRPCBody(action: string, params: Object = {}): string {
        try {
            return JSON.stringify({
                action: action,
                ...params,
            });
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * @function _send
     * @private
     * @description Send the request to the daemon
     * @param {string} method - the name of the RPC method
     * @param {Object} params - Parameters to be passed to the RPC method
     * @return {Promise} - A Promise which is resolved if the request successfully
     *                      fetch the data, and rejected otherwise. Failure can happen
     *                      either because of a problem of the request, or before the
     *                      request happen, when `JSON.stringify` fails
     */
    private _send(method: string, params?: Object): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            axios
                .request({
                    method: 'POST',
                    url: this.nodeAddress,
                    data: this._buildRPCBody(method, params),
                    headers: Object.assign(this.defaultHeaders, this.requestHeaders),
                })
                .then((response: AxiosResponse) => {
                    if (response.data.error) {
                        reject(response.data);
                    } else {
                        resolve(typeof response.data === 'string' ? JSON.parse(response.data) : response.data);
                    }
                })
                .catch(reject);
        });
    }

    /**
     * Returns how many RAW is owned and how many have not yet been received by account.
     * @param {string} account - The NANO account address.
     */
    account_balance(account: string): Promise<RPC.AccountBalanceResponse> {
        return this._send('account_balance', {
            account,
        });
    }

    /**
     * Get number of blocks for a specific account
     * @param {string} account - The NANO account address.
     */
    account_block_count(account: string): Promise<RPC.AccountBlockCountResponse> {
        return this._send('account_block_count', {
            account,
        });
    }

    /**
     * Get account number for the public key
     * @param {string} key - A NANO public key.
     */
    account_get(key: string): Promise<RPC.AccountGetResponse> {
        return this._send('account_get', {
            key,
        });
    }

    /**
     * Reports send/receive information for a account
     * @param {string} account - The NANO account address.
     * @param {number} count - Response length (default 1)
     * @param {boolean} params.raw - Output all parameters of the block itself as seen in block_create or other APIs returning blocks
     * @param {string} params.head - Use this block as the head of the account instead.
     * @param {number} params.offset - Skips a number of blocks starting from head (if given). Not often used. (v11.0+)
     * @param {boolean} params.reverse - Response starts from head and lists blocks up to the frontier. (v19.0+)
     * @param {string[]} params.account_filter - Filter results to only show sends/receives connected to the provided account(s). (v19.0+)
     */
    account_history(
        account: string,
        count = 1,
        params?: {
            raw?: boolean;
            head?: string;
            offset?: number;
            reverse?: boolean;
            account_filter?: string[];
        }
    ): Promise<RPC.AccountHistoryResponse> {
        return this._send('account_history', {
            account,
            count,
            ...params,
        });
    }

    /**
     * Returns frontier, open block, change representative block, balance,
     * last modified timestamp from local database & block count for account
     * @param {string} account - The NANO account address.
     * @param {boolean} params.representative - Additionally returns representative for account (v9.0+)
     * @param {boolean} params.weight - Additionally returns voting weight for account (v9.0+)
     * @param {boolean} params.pending - Additionally returns pending balance for account (v9.0+)
     */
    account_info(
        account: string,
        params: {
            representative?: boolean;
            weight?: boolean;
            pending?: boolean;
        }
    ): Promise<RPC.AccountInfoResponse> {
        return this._send('account_info', {
            account,
            ...params,
        });
    }

    /**
     * Get the public key for account
     * @param {string} account - A NANO account.
     */
    account_key(account: string): Promise<RPC.AccountKeyResponse> {
        return this._send('account_key', {
            account,
        });
    }

    /**
     * Returns the representative for account
     * @param {string} account - The NANO account address.
     */
    account_representative(account: string): Promise<RPC.AccountRepresentativeResponse> {
        return this._send('account_representative', {
            account,
        });
    }

    /**
     * Returns the voting weight for account
     * @param {string} account - The NANO account address.
     */
    account_weight(account: string): Promise<RPC.AccountWeightResponse> {
        return this._send('account_weight', {
            account,
        });
    }

    // TODO: account_balances, accounts_frontiers, accounts_pending, active_difficulty

    /**
     * Returns how many rai are in the public supply
     */
    available_supply(): Promise<RPC.AvailableSupplyResponse> {
        return this._send('available_supply');
    }

    /**
     * Retrieves a json representation of block
     * @param {string} hash - A block hash.
     */
    block(hash: string) {
        return this._send('block', {
            hash,
        });
    }

    /**
     * Retrieves a json representations of blocks
     * @param {Array<string>} hashes - A list of block hashes.
     */
    blocks(hashes: string[]) {
        return this._send('blocks', {
            hashes,
        });
    }

    /**
     * Returns the account containing block
     * @param {string} hash - A block hash.
     */
    block_account(hash: string) {
        return this._send('block_account', {
            hash,
        });
    }

    // TODO: block_confirm

    /**
     * Reports the number of blocks in the ledger and unchecked synchronizing blocks
     */
    block_count() {
        return this._send('block_count');
    }

    // TODO: block_create, block_hash

    /**
     * Retrieves a json representations of blocks with transaction amount & block account
     * @param {Array<string>} hashes - A list of block hashes.
     */
    blocks_info(hashes: string, source = false, pending = false) {
        return this._send('blocks_info', {
            hashes,
            source,
            pending,
        });
    }

    /**
     * Reports the number of blocks in the ledger by type (send, receive, open, change)
     */
    block_count_type() {
        return this._send('block_count_type');
    }

    /**
     * Returns a list of block hashes in the account chain starting at block up to count
     * @param {string} block - A block hash.
     * @param {Number} count - Max count of items to return.
     */
    chain(block: string, count = 1) {
        return this._send('chain', {
            block,
            count,
        });
    }

    /**
     * Returns a list of pairs of account and block hash representing the head block starting at account up to count
     * @param {string} account - The NANO account address.
     * @param {Number} count - How much items to get from the list. (defaults to 1)
     */
    frontiers(account: string, count = 1) {
        return this._send('frontiers', {
            account,
            count,
        });
    }

    /**
     * Reports the number of accounts in the ledger
     */
    frontiers_count() {
        return this._send('frontiers_count');
    }

    /**
     * Reports send/receive information for a chain of blocks
     * @param {string} hash - A block hash.
     * @param {Number} count - How much items to get from the list. (defaults to 1)
     */
    history(hash: string, count = 1) {
        return this._send('history', {
            hash,
            count,
        });
    }

    /**
     * Divide a raw amount down by the Mrai ratio.
     * @param {string} amount - An amount to be converted.
     */
    mrai_from_raw(amount: string | number) {
        return this._send('mrai_from_raw', {
            amount,
        });
    }

    /**
     * Multiply an Mrai amount by the Mrai ratio.
     * @param {string | number} amount - An amount to be converted.
     */
    mrai_to_raw(amount: string | number) {
        return this._send('mrai_to_raw', {
            amount,
        });
    }

    /**
     * Divide a raw amount down by the krai ratio.
     * @param {string | number} amount - An amount to be converted.
     */
    krai_from_raw(amount: string | number) {
        return this._send('krai_from_raw', {
            amount,
        });
    }

    /**
     * Multiply an krai amount by the krai ratio.
     * @param {string | number} amount - An amount to be converted.
     */
    krai_to_raw(amount: string | number) {
        return this._send('krai_to_raw', {
            amount,
        });
    }

    /**
     * Divide a raw amount down by the rai ratio.
     * @param {string | number} amount - An amount to be converted.
     */
    rai_from_raw(amount: string | number) {
        return this._send('rai_from_raw', {
            amount,
        });
    }

    /**
     * Multiply an rai amount by the rai ratio.
     * @param {string | number} amount - An amount to be converted.
     */
    rai_to_raw(amount: string | number) {
        return this._send('rai_to_raw', {
            amount,
        });
    }

    /**
     * Returns frontier, open block, change representative block, balance,
     * last modified timestamp from local database & block count starting at account up to count
     * @enable_control required, version 8.1+
     *
     * @param {string} account - The NANO account address.
     * @param {Number} count - Defines from where results are returned.
     * @param {boolean} representative - Additionally returns representative for each account.
     * @param {boolean} weight - Additionally returns voting weight for each account.
     * @param {boolean} pending - Additionally returns pending balance for each account.
     * @param {boolean} sorting - Sort the results by DESC.
     */
    ledger(account: string, count = 1, representative = false, weight = false, pending = false, sorting = false) {
        return this._send('ledger', {
            account,
            count,
            representative,
            weight,
            pending,
            sorting,
        });
    }

    /**
     * Creates a json representations of new block based on input data & signed with private key or account in wallet
     * @enable_control required, version 8.1+
     *
     * @param {string} type - The block type.
     * @param {string} key - The block signing key.
     * @param {string} account - A NANO account.
     * @param {string} representative - A NANO representative account.
     * @param {string} source - A block source.
     */
    block_create(type: string, key: string, account: string, representative: string, source: string) {
        return this._send('block_create', {
            type,
            key,
            account,
            representative,
            source,
        });
    }

    /**
     * Publish block to the network.
     * @param {Object} block - A block to process. Format:
     * https://github.com/clemahieu/raiblocks/wiki/RPC-protocol#process-block
     */
    process(block: string) {
        return this._send('process', {
            block,
        });
    }

    /**
     * Returns a list of pairs of representative and its voting weight
     * @param {Number} count - Count of items to return. (Defaults to 1)
     * @param {boolean} sorting - Sort the returned results by DESC.
     */
    representatives(count = 1, sorting = false) {
        return this._send('representatives');
    }
}