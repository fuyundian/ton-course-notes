import { Address, beginCell, Cell, Contract, ContractABI, contractAddress, ContractProvider, Sender, SendMode, StateInit } from "@ton/core";
import { Maybe } from "@ton/core/dist/utils/maybe";

// export interface Contract {
//     readonly address: Address;
//     readonly init?: { code: Cell; data: Cell }
// }


export class MainContract implements Contract {
    constructor(
        // readonly address: Address,
        // readonly init?: { code: Cell; data: Cell }
        readonly address: Address,
        readonly init?: Maybe<StateInit>,
        readonly abi?: Maybe<ContractABI>,
    ) {

    }
    static createFromConfig(config: any, code: Cell, wordChain = 0) {
        const data = beginCell().endCell();
        const init = { code, data };
        const address = contractAddress(wordChain, init);
        return new MainContract(address, init);
    }
    async sendInternalMessage(
        provider: ContractProvider,
        sender: Sender,
        value: bigint
    ) {
        await provider.internal(sender, { value, sendMode: SendMode.PAY_GAS_SEPARATELY, body: beginCell().endCell() })
    }

    async getData(provide: ContractProvider) {
        const stack = await provide.get("get_the_latest_sender", []);
        return {
            recent_sender: stack.stack.readAddress(),
        };
    }
}