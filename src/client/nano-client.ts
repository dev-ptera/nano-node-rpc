import axios, { AxiosResponse } from 'axios';
import * as RPC from '../types/rpc-response';
import { ProcessBody } from '../types/rpc-body';

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
     * @constructor
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
     * @param {params} params - Optional params for RPC request
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
     * @param {params} params - Optional params for RPC request
     * @returns A Promise which is resolved if the request successfully
     * fetches the data without error, and rejected otherwise.
     * Failure can happen either because of a mis-configured request,
     * server connectivity, or if `JSON.parse` fails
     */
    private _send<T = any>(method: string, params?: Object): Promise<any> {
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
                        resolve(response.data);
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
     * @param {params} params - Optional params for RPC request
     */
    account_history(
        account: string,
        count = 1,
        params?: {
            raw?: boolean;
            head?: string;
            offset?: number;
            reverse?: boolean;
            account_filter?: Array<string>;
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
     * @param {params} params - Optional params for RPC request
     */
    account_info(
        account: string,
        params?: {
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

    /**
     * Returns how many RAW is owned and how many have not yet been received by accounts list
     * @param {string[]} accounts - Array of NANO account addresses.
     */
    accounts_balances(accounts: string[]): Promise<RPC.AccountsBalancesResponse> {
        return this._send('accounts_balances', {
            accounts,
        });
    }

    /**
     * Returns a list of pairs of account and block hash representing the head block for accounts list
     * @param {string[]} accounts - Array of NANO account addresses.
     */
    accounts_frontiers(accounts: string[]): Promise<RPC.AccountsFrontiersResponse> {
        return this._send('accounts_frontiers', {
            accounts,
        });
    }

    /**
     * Returns a list of block hashes which have not yet been received by these accounts
     * @param {string[]} accounts - Array of NANO account addresses
     * @param {number} count - Max count of block hashes to return
     * @param {params} params - Optional params for RPC request
     */
    accounts_pending(
        accounts: string[],
        count = 1,
        params?: {
            threshold?: string;
            source?: boolean;
            include_active?: boolean;
            sorting?: boolean;
            include_only_confirmed?: boolean;
        }
    ): Promise<RPC.AccountsPendingResponse> {
        return this._send('accounts_pending', {
            accounts,
            count,
            ...params,
        });
    }

    /**
     * Returns the difficulty values
     * @param {boolean} include_trend - Include the trend of difficulty seen on the network
     */
    active_difficulty(include_trend = false): Promise<RPC.ActiveDifficultyResponse> {
        return this._send('active_difficulty', {
            include_trend,
        });
    }

    /**
     * Returns how many rai are in the public supply
     */
    available_supply(): Promise<RPC.AvailableSupplyResponse> {
        return this._send('available_supply');
    }

    /**
     * Retrieves a json representation of block
     * @param {string} hash - A block hash.
     * @param {boolean} json_block - Response will contain a JSON subtree instead of a JSON string.
     */
    block(hash: string, json_block = true): Promise<RPC.BlockResponse> {
        return this._send('block', {
            hash,
            json_block,
        });
    }

    /**
     * Returns the account containing block
     * @param {string} hash - A block hash.
     */
    block_account(hash: string): Promise<RPC.BlockAccountResponse> {
        return this._send('block_account', {
            hash,
        });
    }

    /**
     * Request confirmation for block from known online representative nodes.
     * @param {string} hash - A block hash.
     */
    block_confirm(hash: string): Promise<RPC.BlockConfirmResponse> {
        return this._send('block_confirm', {
            hash,
        });
    }

    /**
     * Reports the number of blocks in the ledger and unchecked synchronizing blocks
     */
    block_count(): Promise<RPC.BlockCountResponse> {
        return this._send('block_count');
    }

    /**
     * Retrieves a json representations of blocks
     * @param {string[]} hashes - A list of block hashes.
     * @param {boolean} json_block - Response will contain a JSON subtree instead of a JSON string.
     */
    blocks(hashes: string[], json_block = true): Promise<RPC.BlocksResponse> {
        return this._send('blocks', {
            hashes,
            json_block,
        });
    }

    /**
     * Retrieves a json representations of block with more data than in `blocks`
     * @param {string[]} hashes - A list of block hashes.
     * @param {params} params - Optional params for RPC request
     */
    blocks_info(
        hashes: string[],
        params?: {
            json_block?: boolean;
            pending?: boolean;
            source?: boolean;
            balance?: boolean;
            include_not_found?: boolean;
        }
    ): Promise<RPC.BlocksInfoResponse> {
        return this._send<RPC.BlocksInfoResponse>('blocks_info', {
            hashes,
            ...params,
        });
    }

    /**
     * Returns a list of block hashes in the account chain starting at block up to count
     * @param {string} block - A block hash.
     * @param {number} count - Max count of items to return.
     * @param {params} params - Optional params for RPC request
     */
    chain(
        block: string,
        count = 1,
        params?: {
            offset: boolean;
            reverse: boolean;
        }
    ): Promise<RPC.ChainResponse> {
        return this._send('chain', {
            block,
            count,
            ...params,
        });
    }

    /**
     * Returns information about node elections.
     * @param {boolean} peer_details - Add peer details included in summation of peers_stake_total.
     */
    confirmation_quorum(peer_details?: boolean): Promise<RPC.ConfirmationQuorumResponse> {
        return this._send('confirmation_quorum', {
            peer_details,
        });
    }

    /**
     * Returns a list of pairs of delegator names given account a representative and its balance
     * @param {string} account - The NANO account address.
     */
    delegators(account: string): Promise<RPC.DelegatorsResponse> {
        return this._send('delegators', {
            account,
        });
    }

    /**
     * Get number of delegators for a specific representative account
     * @param {string} account - The NANO account address.
     */
    delegators_count(account: string): Promise<RPC.DelegatorsCountResponse> {
        return this._send('delegators_count', {
            account,
        });
    }

    /**
     * Returns a list of pairs of account and block hash representing the head block starting at account up to count
     * @param {string} account - The NANO account address.
     * @param {number} count - How much items to get from the list. (defaults to 1)
     */
    frontiers(account: string, count = 1): Promise<RPC.FrontiersResponse> {
        return this._send('frontiers', {
            account,
            count,
        });
    }

    /**
     * Reports the number of accounts in the ledger
     */
    frontier_count(): Promise<RPC.FrontierCountResponse> {
        return this._send('frontier_count');
    }

    /**
     * Divide a raw amount down by the krai ratio.
     * @param {string} amount - An amount to be converted.
     */
    krai_from_raw(amount: string): Promise<RPC.UnitConversionResponse> {
        return this._send('krai_from_raw', {
            amount,
        });
    }

    /**
     * Multiply an krai amount by the krai ratio.
     * @param {string} amount - An amount to be converted.
     */
    krai_to_raw(amount: string): Promise<RPC.UnitConversionResponse> {
        return this._send('krai_to_raw', {
            amount,
        });
    }

    /**
     * Divide a raw amount down by the Mrai ratio.
     * @param {string} amount - An amount to be converted.
     */
    mrai_from_raw(amount: string): Promise<RPC.UnitConversionResponse> {
        return this._send('mrai_from_raw', {
            amount,
        });
    }

    /**
     * Multiply an Mrai amount by the Mrai ratio.
     * @param {string} amount - An amount to be converted.
     */
    mrai_to_raw(amount: string): Promise<RPC.UnitConversionResponse> {
        return this._send('mrai_to_raw', {
            amount,
        });
    }

    /**
     * Returns a list of pairs of online peer IPv6:port and its node protocol network version
     * @param {boolean} peer_details - Include network version and node ID
     */
    peers<T extends RPC.PeersResponseDetails | undefined>(peer_details = true): Promise<RPC.PeersResponse<T>> {
        return this._send('peers', {
            peer_details,
        });
    }

    /**
     * Publish block to the network
     * @param {body} ProcessBody - Transaction details.
     */
    process(body: ProcessBody): Promise<RPC.ProcessResponse> {
        return this._send('process', body);
    }

    /**
     * Divide a raw amount down by the rai ratio.
     * @param {string} amount - An amount to be converted.
     */
    rai_from_raw(amount: string): Promise<RPC.UnitConversionResponse> {
        return this._send('rai_from_raw', {
            amount,
        });
    }

    /**
     * Multiply an rai amount by the rai ratio.
     * @param {string} amount - An amount to be converted.
     */
    rai_to_raw(amount: string): Promise<RPC.UnitConversionResponse> {
        return this._send('rai_to_raw', {
            amount,
        });
    }

    /**
     * Returns a list of pairs of representative and its voting weight
     * @param {number} count - Count of items to return. (Defaults to 1)
     * @param {boolean} sorting - Sort the returned results by DESC.
     */
    representatives(count = 1, sorting = false): Promise<RPC.RepresentativesResponse> {
        return this._send('representatives', {
            count,
            sorting,
        });
    }

    /**
     * Returns a list of online representative accounts that have voted recently
     * @param {boolean} weight - Return voting weight for each representative.
     */
    representatives_online(
        weight = false
    ): Promise<RPC.RepresentativesOnlineResponse | RPC.RepresentativesOnlineWeightResponse> {
        return this._send('representatives_online', {
            weight,
        });
    }

    /**
     * Check whether account is a valid account number using checksum.
     * @param {string} account - The NANO account address.
     */
    validate_account_number(account: string): Promise<RPC.ValidateAccountNumberResponse> {
        return this._send('validate_account_number', {
            account,
        });
    }

    /**
     * Returns version information for RPC, Store, Protocol (network),
     */
    version(): Promise<RPC.VersionResponse> {
        return this._send('version');
    }

    /**
     * Return node uptime in seconds.
     */
    uptime(): Promise<RPC.UptimeResponse> {
        return this._send('uptime');
    }

    /**
     * Stop generating work for block.
     * @param {string} hash - Hash supplied in a previous work generate request.
     */
    work_cancel(hash: string): Promise<RPC.WorkCancelResponse> {
        return this._send('work_cancel', { hash });
    }

    /**
     * Generates work for block.
     * @param {string} hash - The frontier of the account or in the case of an open block, the public key representation of the account which can be found with account_key.
     */
    work_generate(hash: string): Promise<RPC.WorkGenerateResponse> {
        return this._send('work_generate', { hash });
    }
}
