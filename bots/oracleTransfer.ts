import { ApiPagedResponse, WhaleApiClient } from '@defichain/whale-api-client'
import { MainNet } from '@defichain/jellyfish-network'
import { BigNumber } from '@defichain/jellyfish-api-core'
import { Web3 } from 'web3'
const HDWalletProvider = require('@truffle/hdwallet-provider')

async function getAll<T>(ocean: WhaleApiClient, call: () => Promise<ApiPagedResponse<T>>): Promise<T[]> {
  const pages = [await call()]
  while (pages[pages.length - 1].hasNext) {
    try {
      pages.push(await ocean.paginate(pages[pages.length - 1]))
    } catch (e) {
      break
    }
  }

  return pages.flatMap((page) => page as T[])
}

const contractABI = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'symbol',
        type: 'string',
      },
    ],
    name: 'getPrice',
    outputs: [
      {
        internalType: 'uint256',
        name: 'price',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'symbol',
            type: 'string',
          },
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
        ],
        internalType: 'struct Oracle.OraclePrice[]',
        name: '_prices',
        type: 'tuple[]',
      },
    ],
    name: 'setOraclePrices',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

async function transferOracle(privKey: string): Promise<void> {
  const ocean = new WhaleApiClient({
    url: 'https://ocean.defichain.com',
    version: 'v0',
    network: MainNet.name,
  })

  const oraclePrices = await getAll(ocean, () => ocean.prices.list(200))

  const provider = new HDWalletProvider({
    //mnemonic: mnemonic,
    privateKeys: [privKey],
    providerOrUrl: 'https://testnet-dmc.mydefichain.com:20551',
  })

  const w3: Web3 = new Web3(provider)

  const contract = new w3.eth.Contract(contractABI, '0xeb8b38aa5d5c244e600901bf4E1C51402c83C3Eb')
  const usedAcc = provider.getAddress()
  console.log('running on address ' + usedAcc +" at block "+w3.eth.getBlockNumber())
  w3.eth.defaultAccount = usedAcc

  const priceArg = oraclePrices.map((p) => {
    return { symbol: p.price.token, price: new BigNumber(p.price.aggregated.amount).times(10 ** 18).toFixed(0) }
  })
  console.log('sending oracles to DMC')
  const receipt = await contract.methods.setOraclePrices(priceArg).send({
    from: usedAcc,
  })
  console.log('done: ' + receipt.transactionHash)
}

const myArgs = process.argv.slice(2)
transferOracle(myArgs[0])
