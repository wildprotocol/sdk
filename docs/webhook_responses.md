# Webhook Event Reference

This page describes the JSON payloads your application will receive when subscribed events fire.

---

## Common Payload Structure

Every webhook request is a JSON object with:

| Field             | Type   | Description                                              |
| ----------------- | ------ | -------------------------------------------------------- |
| `event`           | string | Name of the emitted event                                |
| `data.args`       | object | Event-specific arguments (see each section below)        |
| `data.logIndex`   | hex    | On-chain log index for ordering                          |
| `data.transactionIndex` | hex    | Transaction’s index within the block                   |
| `data.transactionHash`  | hex    | Hash of the transaction                                  |
| `data.address`    | address| Contract address that emitted the event                  |
| `data.blockHash`  | hex    | Block hash                                                |
| `data.blockNumber`| hex    | Block number                                              |

---

## 1. `TokenLaunched`

Emitted when a new token is initialized.

### Example

```json
{
  "event": "TokenLaunched",
  "data": {
    "args": {
      "token": "0x159bB7B5142783A26C04664a1af5187Df6f1C897",
      "config": {
        "creator": "0xb0EA919BE835321dD77dad241E698eF81F044C18",
        "baseToken": "0x0000000000000000000000000000000000000000",
        "name": "Test Token",
        "symbol": "TEST",
        "image": "https://example.com/token.png",
        "appIdentifier": "test_org",
        "teamSupply": 100000000000000000000000,
        "vestingStartTime": 0,
        "vestingDuration": 0,
        "vestingWallet": "0x0000000000000000000000000000000000000000",
        "bondingCurveSupply": 1000000000000000000000000,
        "liquidityPoolSupply": 1000000000000000000000000,
        "totalSupply": 2100000000000000000000000,
        "bondingCurveBuyFee": 100,
        "bondingCurveSellFee": 100,
        "bondingCurveFeeSplits": [
          { "recipient": "0x1234…7890", "bps": 500 },
          { "recipient": "0x174C…6284", "bps": 9500 }
        ],
        "bondingCurveParams": {
          "prices": [ /* array of BigNumber strings */ ],
          "numSteps": 1000,
          "stepSize": 1000000000000000000000
        },
        "allowForcedGraduation": false,
        "graduationFeeBps": 100,
        "graduationFeeSplits": [
          { "recipient": "0x1234…7890", "bps": 500 },
          { "recipient": "0x174C…6284", "bps": 9500 }
        ],
        "poolFees": 20000,
        "poolFeeSplits": [ /* same shape as above */ ],
        "surgeFeeStartingTime": 1750410481,
        "surgeFeeDuration": 86400,
        "maxSurgeFeeBps": 1000
      }
    },
    "event": "TokenLaunched",
    "logIndex": "0x20d",
    "transactionIndex": "0x98",
    "transactionHash": "0xa0775f4cd6451f3b…7124",
    "address": "0x8485ad848439659b0dcabcb60009edc65094c066",
    "blockHash": "0x43c8baf59d8a21b8d5…671d8",
    "blockNumber": "0x1e56412"
  }
}
```

## 2. `OwnershipTransferred`

Fired when contract ownership changes.

### Example

```json
{
  "event": "OwnershipTransferred",
  "data": {
    "args": {
      "previousOwner": "0x0000000000000000000000000000000000000000",
      "newOwner":      "0x174CBCbf3aBE823a279DccBa0Fc4433b0E1f6284"
    },
    "event": "OwnershipTransferred",
    "logIndex": "0x187",
    "transactionIndex": "0xA9",
    "transactionHash": "0x71e13a7eff4aad1d…54d7",
    "address": "0x8485ad848439659b0dcabcb60009edc65094c066",
    "blockHash": "0x1e98cb298766e05a…944bd",
    "blockNumber": "0x1e56411"
  }
}
```

## 3. `BondingCurveSwap`

Emitted on every buy or sell through the bonding curve.

### Example


```json
{
  "event": "BondingCurveSwap",
  "data": {
    "args": {
      "token":     "0x159bB7B5142783A26C04664a1af5187Df6f1C897",
      "isBuy":     true,
      "to":        "0x174C…6284",
      "from":      "0x174C…6284",
      "amountIn":  8899999999,
      "amountOut": 20595238095238095238095,
      "feeAmount": 1099999999
    },
    "event": "BondingCurveSwap",
    "logIndex": "0x20f",
    "transactionIndex": "0x99",
    "transactionHash": "0x1c827768dd7f203d…6cbf",
    "address": "0x8485ad848439659b0dcabcb60009edc65094c066",
    "blockHash": "0x43c8baf59d8a21b8d5…671d8",
    "blockNumber": "0x1e56412"
  }
}
```
