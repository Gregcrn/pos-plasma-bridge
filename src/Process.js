const WebSocket = require("ws");
const Web3 = require("web3");

// For Mumbai
const ws = new WebSocket("wss://ws-mumbai.matic.today/");
// For Polygon mainnet: wss://ws-mainnet.matic.network/
const web3 = new Web3();
const abiCoder = web3.eth.abi;

async function checkDepositStatus(
    userAccount,
    rootToken,
    depositAmount,
    childChainManagerProxy
) {
    return new Promise((resolve, reject) => {
        ws.on("open", () => {
            ws.send(
                `{"id": 1, "method": "eth_subscribe", "params": ["newDeposits", {"Contract": "${childChainManagerProxy}"}]}`
            );

            ws.on("message", (msg) => {
                const parsedMsg = JSON.parse(msg);
                if (
                    parsedMsg &&
                    parsedMsg.params &&
                    parsedMsg.params.result &&
                    parsedMsg.params.result.Data
                ) {
                    const fullData = parsedMsg.params.result.Data;
                    const { 0: syncType, 1: syncData } = abiCoder.decodeParameters(
                        ["bytes32", "bytes"],
                        fullData
                    );

                    // check if sync is of deposit type (keccak256("DEPOSIT"))
                    const depositType =
                        "0x87a7811f4bfedea3d341ad165680ae306b01aaeacc205d227629cf157dd9f821";
                    if (syncType.toLowerCase() === depositType.toLowerCase()) {
                        const {
                            0: userAddress,
                            1: rootTokenAddress,
                            2: depositData,
                        } = abiCoder.decodeParameters(
                            ["address", "address", "bytes"],
                            syncData
                        );

                        // depositData can be further decoded to get amount, tokenId etc. based on token type
                        // For ERC20 tokens
                        const { 0: amount } = abiCoder.decodeParameters(
                            ["uint256"],
                            depositData
                        );
                        if (
                            userAddress.toLowerCase() === userAccount.toLowerCase() &&
                            rootToken.toLowerCase() === rootTokenAddress.toLowerCase() &&
                            depositAmount === amount
                        ) {
                            resolve(true);
                        }
                    }
                }
            });

            ws.on("error", () => {
                reject(false);
            });

            ws.on("close", () => {
                reject(false);
            });
        });
    });
}

// Param1 - user address
// Param2 - contract address on main chain
// Param3 - amount deposited on main chain
// Param4 - child chain manager proxy address (0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa for mainnet)
checkDepositStatus(
    "0xcFc409c6FC65467d34Da7700600794aA6cC8a5E1",
    "0xf28eAbE8f7Dc81ac2716084206ae4C8c85D05b83",
    "1000000000000000000",
    "0x435576645B9b829bC47a9D701938e2b6aAE86189"
)
    .then((res) => {
        console.log(res);
    })
    .catch((err) => {
        console.log(err);
    });