import { world, system, Player } from "@minecraft/server";
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
        if (!cmd.sourceEntity) return;
        const player = cmd.sourceEntity as Player;
        const isAdmin = player.playerPermissionLevel === 2;
        system.run(() => {
            if (isAdmin) adminVoiceForm(player);
            else userVoiceForm(player);
        })
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
let api = new HivemindAPI("envirovoice:addon", { scriptEvent: false, namespace: "envirovoice", logFailures: false });

// =================================================
// INTERVAL
// =================================================
system.runInterval(async() => {
    const DATABASE = 'https://envirovoice-test-default-rtdb.europe-west1.firebasedatabase.app/';
    const uri = `minecraft.json`;
    const data = EnviroVoice.getEnviroVoiceData();

    const response = await api.sendHttpRequest(DATABASE + uri, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    for (const player of world.getPlayers()) {
        player.playAnimation('animation.envirovoice.speak', { blendOutTime: 0.5 });
    }
}, 20);