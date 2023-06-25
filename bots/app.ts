import { doWinnerTakesItAll } from './winnerTakesItAll'

const myArgs = process.argv.slice(2)
const dmcRPC = 'https://testnet-dmc.mydefichain.com:20551'
//const dmcRPC = 'http://127.0.0.1:20551'

doWinnerTakesItAll(myArgs[0], dmcRPC)
