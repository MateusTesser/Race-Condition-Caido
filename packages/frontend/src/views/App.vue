<script setup lang="ts">
import { useSDK } from "@/plugins/sdk";
import { ref, onMounted } from "vue";

// Retrieve the SDK instance to interact with the backend
const sdk = useSDK();

const results = ref<string[]>([]);

// onMounted(async () => {
//   // Envia 20 requisições em paralelo
//   const promises = Array.from({ length: 20 }, () =>
//     sdk.backend.generateCPNJ(10)
//   );
//   results.value = await Promise.all(promises);
// });


  // sdk.commands.register("race", {
  //   name: "Race Condition Caido",
  //   run: (context) => {
  //     return sdk.backend.generateCPNJ(context)
  //       .then((result) => {
  //         // lastRequestResult.value = result; // <-- Atualiza o estado global
  //         return result;
  //       });
  //   }
  // });
</script>

<template>
  <div class="h-full flex justify-center items-center">
    <div class="flex flex-col gap-1">
      <div v-for="(result, idx) in results" :key="idx">
        {{ result }}
      </div>
    </div>
  </div>
</template>