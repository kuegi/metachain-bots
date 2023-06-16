import { Web3 } from 'web3'
const HDWalletProvider = require('@truffle/hdwallet-provider')

const dmcAddress = '0x67488912788Bf6C634909f4411047aE0136C801A'

const contractABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'CantClaimEarly',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotEnoughValue',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WrongClaimer',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WAIT_TIME_BLOCKS',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'balance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'gamble',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastInput',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastInputBlock',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextMinAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

async function interact(privKey: string): Promise<void> {
  const dmcRPC = 'https://testnet-dmc.mydefichain.com:20551'
  //const dmcRPC = 'http://127.0.0.1:20551'

  const provider = new HDWalletProvider({
    //mnemonic: mnemonic,
    privateKeys: [privKey],
    providerOrUrl: dmcRPC,
  })

  const w3: Web3 = new Web3(provider)

  const contract = new w3.eth.Contract(contractABI, dmcAddress)
  const usedAcc = provider.getAddress()
  console.log('running on address ' + usedAcc)
  w3.eth.defaultAccount = usedAcc

  const currentBlock = await w3.eth.getBlockNumber()

  const lastInputBlock: bigint = await contract.methods.lastInputBlock().call()
  const lastSender = await contract.methods.lastInput().call()
  const waitTime: bigint = await contract.methods.WAIT_TIME_BLOCKS().call()
  console.log('got data: ' + currentBlock + ' ' + lastSender + ' ' + lastInputBlock + ' ' + waitTime)

  if (currentBlock - lastInputBlock > waitTime && lastSender.toLowerCase() == usedAcc.toLowerCase()) {
    //call claim
    console.log('claiming')
    const receipt = await contract.methods.claim().send({
      from: usedAcc,
      gas: w3.utils.toHex((await contract.methods.claim().estimateGas()) * 4n),
    })
    console.log('done: ' + receipt.transactionHash)
  } else if (lastSender.toLowerCase() != usedAcc.toLowerCase()) {
    //gamble
    console.log('gambling')
    const receipt = await contract.methods.gamble().send({
      from: usedAcc,
      value: w3.utils.toHex(await contract.methods.nextMinAmount().call()),
    })
    console.log('done: ' + receipt.transactionHash)
  } else {
    console.log('nothing to do, just wait ' + (waitTime - (currentBlock - lastInputBlock)) + ' blocks')
  }
}

const myArgs = process.argv.slice(2)
interact(myArgs[0])
