import SSM from 'aws-sdk/clients/ssm'
import { doWinnerTakesItAll } from './winnerTakesItAll'

async function readPrivKey(ssm: SSM): Promise<string> {
  let decryptedSeed
  try {
    decryptedSeed = await ssm
      .getParameter({
        Name: '/metachain-bot/privateKey',
        WithDecryption: true,
      })
      .promise()
  } catch (e) {
    console.error('private key Parameter not found!')
    decryptedSeed = undefined
  }
  return decryptedSeed?.Parameter?.Value?.trim() ?? ''
}

export async function main(event: any, context: any): Promise<Object> {
  const ssm = new SSM()
  const privKey = await readPrivKey(ssm)
  if (privKey.length == 0) {
    console.error('no private key found')
    return { statusCode: 500 }
  }

  doWinnerTakesItAll(privKey, 'https://testnet-dmc.mydefichain.com:20551')

  return { statusCode: 200 }
}
