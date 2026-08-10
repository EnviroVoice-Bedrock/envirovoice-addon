import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { EnviroVoice } from "../utils/EnviroVoice";
export default function userVoiceForm(player) {
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
    ui.show(player).then((res) => {
        if (res.canceled || !res.formValues)
            return;
        const [microphoneVolume, mute, deafen, ,] = res.formValues;
        EnviroVoice.setMicrophoneVolume(player, microphoneVolume);
        EnviroVoice.setDeafen(player, deafen);
        EnviroVoice.setMute(player, deafen ? true : mute);
        for (const p of players) {
            const volume = res.formValues[4 + players.indexOf(p)];
            EnviroVoice.setPlayerVolume(player, p.id, volume);
        }
    });
}
