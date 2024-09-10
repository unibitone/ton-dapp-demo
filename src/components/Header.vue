<template>
  <div v-if="wallet">
    <div>Device: {{ wallet.device.appName }}</div>
    <div>User-friendly address: {{ userFriendlyAddress }}</div>
    <div>Raw address: {{ rawAddress }}</div>
    <div>wallet publicKey: {{ wallet.account.publicKey }}</div>
    <div>mnemonic publicKey: {{ publicKey }}</div>

    <div>
      <textarea v-model="mnemonics" cols="30" rows="10"></textarea>
    </div>
    <div>
      <button @click="getPublicKey">getPublicKey</button>
    </div>
    <div>
      <button @click="signMsg">signMsg</button>
    </div>
    <div>
      <button @click="signData">signData</button>
    </div>
    <div>
      <button @click="sendTon">sendTon</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, Ref, ref } from "vue";
import {
  TonConnectUI,
  useTonWallet,
  useTonAddress,
  Wallet,
  WalletInfoWithOpenMethod
} from "@townsquarelabs/ui-vue";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { WalletContractV4, beginCell } from "@ton/ton";

const mnemonics = ref("");
const publicKey = ref("");

async function getPublicKey() {
  // const mnemonics = "exclude cream liar dream cancel faint casual pet claim discover book food advice major fortune weasel october inquiry female beauty worry exist material vacant";
  console.warn("mnemonics", mnemonics.value);

  const keyPair = await mnemonicToPrivateKey(mnemonics.value.split(" "));
  const workchain = 0;
  console.warn("mnemonicToPrivateKey-publicKey", keyPair.publicKey.toString("hex"));
  publicKey.value = keyPair.publicKey.toString("hex");
  const wallet = WalletContractV4.create({
    workchain,
    publicKey: keyPair.publicKey,
  });
  console.warn("mnemonicToPrivateKey-wallet", wallet.address.toString({ testOnly: false }));
  console.warn("mnemonicToPrivateKey-wallet", wallet.address.toString({ testOnly: true }));
}

const tonConnectUI = inject<TonConnectUI | null>("tonConnectUI", null);
/**
 * address
 */
const userFriendlyAddress = useTonAddress();
const rawAddress = useTonAddress(false);
const wallet = useTonWallet() as unknown as Ref<
  Wallet | (Wallet & WalletInfoWithOpenMethod) | null
>;

onMounted(async () => {
  console.log("wallet", wallet);
  console.log("tonConnectUI", tonConnectUI);
  console.log("tonConnectUI", tonConnectUI?.wallet);

  tonConnectUI?.onStatusChange(async w => {
    console.log("onStatusChange", w);
  })
});

function signMsg() {
  console.log("tonConnectUI", tonConnectUI);

  tonConnectUI?.setConnectRequestParameters({ state: 'loading' });

  const payload = new TextEncoder().encode('hello');
  console.log("payload", payload);

  tonConnectUI?.setConnectRequestParameters({
    state: 'ready',
    value: {
      tonProof: payload.toString()
    }
  });

  console.log("tonConnectUI", tonConnectUI);
  console.log("wallet", wallet.value?.connectItems?.tonProof?.name);
  console.log("wallet", wallet.value?.connectItems?.tonProof?.proof);
  console.log("wallet", wallet.value?.connectItems?.tonProof?.proof.signature);
}


function sendTon() {
  const body = beginCell()
    .storeUint(0, 32) // 写入32个零位以表示后面将跟随文本评论
    .storeStringTail("Hello, TON!") // 写下我们的文本评论
    .endCell();

  const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 360,
    messages: [
      {
        address: "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F", // 目的地址
        amount: "20000000", // 以nanotons计的Toncoin
        payload: body.toBoc().toString("base64"),
      }
    ]

  }
  tonConnectUI?.sendTransaction(transaction)
}
</script>