import { Address, beginCell, Cell, ContractABI, contractAddress, ContractProvider, Sender, SendMode, StateInit } from "@ton/core";
import { send } from "process";
// import { Maybe } from "@ton/core/dist/utils/maybe";

export interface Contract {
    readonly address: Address;
    readonly init?: { code: Cell; data: Cell }
}

export type MainContractConfig = {
    number: number;
    address: Address;
    owner_address: Address;
};

export function mainContractConfigToCell(config: MainContractConfig): Cell {
    return beginCell()
        .storeUint(config.number, 32)
        .storeAddress(config.address)
        .storeAddress(config.owner_address)
        .endCell();
}

export class MainContract implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
        // readonly address: Address,
        // readonly init?: Maybe<StateInit>,
        // readonly abi?: Maybe<ContractABI>,
    ) {

    }
    // static createFromConfig(config: any, code: Cell, wordChain = 0) {
    //     const data = beginCell().endCell();
    //     const init = { code, data };
    //     const address = contractAddress(wordChain, init);
    //     return new MainContract(address, init);
    // }

    static createFromConfig(
        config: MainContractConfig,
        code: Cell,
        workchain = 0
    ) {
        const data = mainContractConfigToCell(config);
        const init = { code, data };
        const address = contractAddress(workchain, init);

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
        const { stack } = await provide.get("get_contract_storage_data", []);
        console.log(stack, "stack")
        return {
            number: stack.readNumber(),
            recent_sender: stack.readAddress(),
            owner_address: stack.readAddress()
        };
    }

    async sendIncrement(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        increment_by: number
    ) {

        const msg_body = beginCell()
            .storeUint(1, 32) // 操作码
            .storeUint(increment_by, 32) // 计数器值
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        });
    }

    async getBalance(provide: ContractProvider,) {
        const { stack } = await provide.get("balance", []);
        return { number: stack.readNumber() };
    }

    async sendDeposit(provider: ContractProvider, sender: Sender, value: bigint) {
        const msg_body = beginCell()
            .storeUint(2, 32)
            .endCell();
        await provider.internal(sender, { value, sendMode: SendMode.PAY_GAS_SEPARATELY, body: msg_body });
    }

    async sendNoCodeDeposit(
        provide: ContractProvider,
        sender: Sender,
        value: bigint
    ) {
        const msg_body = beginCell().endCell();
        await provide.internal(sender, { value, sendMode: SendMode.PAY_GAS_SEPARATELY, body: msg_body })
    }

    async sendWithdrawalRequest(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        amount: bigint
    ) {
        const msg_body = beginCell()
            .storeUint(3, 32) // OP code
            .storeCoins(amount)
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        });
    }
    async sendDeploy(provider: ContractProvider, sender: Sender, value: bigint, amount: bigint) {
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(2, 32).storeCoins(amount).endCell(),
        });
    }
}