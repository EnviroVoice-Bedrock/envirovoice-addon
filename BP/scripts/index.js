import { world, system } from "@minecraft/server";
import { adminVoiceForm, userVoiceForm } from "./ui/ui";
import { EnviroVoice } from "./utils/EnviroVoice";
import * as Commands from "./commands/commands";
import "./utils/PlayerPrototypes";
import { HivemindAPI } from "./HiveMindApi";
// =================================================
// COMMANDS REGISTER
// =================================================
system.beforeEvents.startup.subscribe(e => {
    e.customCommandRegistry.registerCommand(Commands.EnviroVoiceSettingsCmd, cmd => {
        if (!cmd.sourceEntity)
            return;
        const player = cmd.sourceEntity;
        const isAdmin = player.playerPermissionLevel === 2;
        if (isAdmin)
            adminVoiceForm(player);
        else
            userVoiceForm(player);
    });
    e.customCommandRegistry.registerCommand(Commands.MuteEveryoneCmd, () => {
        EnviroVoice.setMuteAll(true);
    });
    e.customCommandRegistry.registerCommand(Commands.UnmuteEveryoneCmd, () => {
        EnviroVoice.setMuteAll(false);
    });
});
// =================================================
// INITIALIZE
// =================================================
let api = new HivemindAPI("envirovoice:addon", { scriptEvent: false, namespace: "envirovoice" });
world.afterEvents.worldLoad.subscribe(() => {
});
// =================================================
// INTERVAL
// =================================================
system.runInterval(async () => {
    for (const player of world.getPlayers()) {
        player.playAnimation('animation.envirovoice.speak', { blendOutTime: 1 });
    }
}, 10);
world.afterEvents.itemUse.subscribe(async ({ itemStack }) => {
    if (itemStack.typeId !== "minecraft:gold_ingot")
        return;
    const uri = `https://envirovoice-test-default-rtdb.europe-west1.firebasedatabase.app/server.json`;
    const data = EnviroVoice.getEnviroVoiceData();
    const response = await api.sendHttpRequest(uri, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    world.sendMessage(`§aFirebase: ${response.data}`);
});
