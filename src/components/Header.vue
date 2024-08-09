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
import { WalletContractV4 } from "@ton/ton";

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
  await getPublicKey();

  console.log("wallet", wallet);
  console.log("tonConnectUI", tonConnectUI?.wallet);
});
</script>