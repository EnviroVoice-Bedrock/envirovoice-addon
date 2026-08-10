import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { EnviroVoice } from "../utils/EnviroVoice";
import Icons from "../utils/Icons";

export default function adminVoiceForm(player: Player) {
    const { isMuted, isDeafen, microphoneVolume } = EnviroVoice.getPlayerSettings(player);
    const { maxDistance, caveSound, underwaterSound, mountainSound, buriedSound } = EnviroVoice.getServerSettings();

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

    return ui.show(player).then(res => {
        if (res.canceled || !res.formValues) return;

        const [
            microphoneVolume,
            mute,
            deafen,,
            blockDistance,,
            caveSound,
            underwaterSound,
            mountainSound,
            buriedSound,,
        ] = res.formValues;

        EnviroVoice.setMicrophoneVolume(player, microphoneVolume as number);
        EnviroVoice.setDeafen(player, deafen as boolean);
        EnviroVoice.setMute(player, deafen ? true : mute as boolean);

        EnviroVoice.setMaxDistance(blockDistance as number);
        EnviroVoice.setCaveSound(caveSound as boolean);
        EnviroVoice.setUnderwaterSound(underwaterSound as boolean);
        EnviroVoice.setMountainSound(mountainSound as boolean);
        EnviroVoice.setBuriedSound(buriedSound as boolean);

        for (const p of players) {
            const volume = res.formValues[11 + players.indexOf(p)] as number;
            EnviroVoice.setPlayerVolume(player, p.id, volume);
        }
    });
}