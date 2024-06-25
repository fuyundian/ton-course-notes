
import { Address } from "ton-core";
async function main() {
    let address = new Address(0, Buffer.from("a3935861f79daf59a13d6d182e1640210c02f98e3df18fda74b8f5ab141abf18", "hex"));
    console.log(address)
}
main();