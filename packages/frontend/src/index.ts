import { Classic } from "@caido/primevue";
import PrimeVue from "primevue/config";
import { createApp } from "vue";
import { CommandContext } from "@caido/sdk-frontend/src/types/commands";
import App from "./views/App.vue";

import "./styles/index.css";

import { SDKPlugin } from "./plugins/sdk";
import type { FrontendSDK } from "./types";



// This is the entry point for the frontend plugin
export const init = (sdk: FrontendSDK) => {
  const app = createApp(App);

  // Load the PrimeVue component library
  app.use(PrimeVue, {
    unstyled: true,
    pt: Classic,
  });

  // Provide the FrontendSDK
  app.use(SDKPlugin, sdk);

  // Create the root element for the app
  const root = document.createElement("div");
  Object.assign(root.style, {
    height: "100%",
    width: "100%",
  });

  // Set the ID of the root element
  // Replace this with the value of the prefixWrap plugin in caido.config.ts 
  // This is necessary to prevent styling conflicts between plugins
  root.id = `plugin--frontend-vue`;

  // Mount the app to the root element
  app.mount(root);

  // Add the page to the navigation
  // Make sure to use a unique name for the page
  sdk.navigation.addPage("/rc", {
    body: root,
  });
  // Quando o comando for executado no Caido:
  // sdk.commands.register("race-paralela", {
  //   name: "Race Condition Caido Parallels",
  //   run: (context) => {
  //     return sdk.backend.reqParalela(context)
  //       .then((result) => {
  //         // lastRequestResult.value = result; // <-- Atualiza o estado global
  //         return result;
  //       });
  //   }
  // })

  // sdk.commands.register("race-single", {
  //   name: "Race Condition Caido Single Packets Attack",
  //   run: (context) => {
  //     return sdk.backend.raceSinglePacket(context)
  //       .then((result) => {
  //         // lastRequestResult.value = result; // <-- Atualiza o estado global
  //         return result;
  //       });
  //   }
  // })
  sdk.commands.register("race-single", {
    name: "Race Condition Caido Single Packets Attack",
    run: (context) => sdk.backend.raceSinglePacket(context)
  })

  sdk.menu.registerItem({
    type: "Request",
    commandId: "race-single",
    leadingIcon: "fas fa-hand",
  });
  sdk.menu.registerItem({
    type: "RequestRow",
    commandId: "race-single",
    leadingIcon: "fas fa-hand",
  });

  // Add a sidebar item
  // sdk.sidebar.registerItem("Race Condition", "/rc");
};
