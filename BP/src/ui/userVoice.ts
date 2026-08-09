import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { EnviroVoice } from "../utils/EnviroVoice";

function userVoiceForm(player: Player) {
    const { isMuted, isDeafen, microphoneVolume } = EnviroVoice.getPlayerSettings(player);
    const ui = new ModalFormData();
    const players = world.getPlayers({ excludeNames: [player.name] });
    ui.title("Voice Settings");
    ui.slider("Microphone Volume", 0, 100, { defaultValue: microphoneVolume });
    ui.toggle("Mute", { defaultValue: isMuted });
    ui.toggle("Deafen", { defaultValue: isDeafen });
    ui.label("Players Settings");
    for (const p of players) {
      const volume = EnviroVoice.getPlayerVolume(player, p.id);
      ui.slider(`${p.name} Volume`, 0, 100, { defaultValue: volume });
    }
    ui.submitButton("Apply");
    return ui;
  }