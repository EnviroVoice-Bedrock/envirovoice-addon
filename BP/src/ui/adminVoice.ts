import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { EnviroVoice } from "../utils/EnviroVoice";
import Icons from "../utils/Icons";

function userVoiceForm(player: Player) {
    const { isMuted, isDeafen, microphoneVolume } = EnviroVoice.getPlayerSettings(player);
    const { maxDistance, roomCode, caveSound, underwaterSound, mountainSound, buriedSound } = EnviroVoice.getServerSettings();
    const ui = new ModalFormData();
    const players = world.getPlayers({ excludeNames: [player.name] });
    ui.title("Voice Settings");
    ui.slider("Microphone Volume", 0, 100, { defaultValue: microphoneVolume });
    ui.toggle("Mute", { defaultValue: isMuted });
    ui.toggle("Deafen", { defaultValue: isDeafen });
    ui.label("Block Distance");
    ui.slider("Distance", 10, 50, { defaultValue: maxDistance });
    ui.label("Voice Effect Sounds");
    ui.toggle("Cave Sound " + Icons.Cave, { defaultValue: caveSound });
    ui.toggle("Underwater Sound " + Icons.Raindrop, { defaultValue: underwaterSound });
    ui.toggle("Mountain Sound " + Icons.Cloud, { defaultValue: mountainSound });
    ui.toggle("Buried Sound " + Icons.Buried, { defaultValue: buriedSound });
    ui.label("Players Settings");
    for (const p of players) {
        const volume = EnviroVoice.getPlayerVolume(player, p.id);
        ui.slider(`${p.name} Volume`, 0, 100, { defaultValue: volume });
    }
    ui.submitButton("Apply");
    return ui;
  }