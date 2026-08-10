import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { EnviroVoice } from "../utils/EnviroVoice";

export default function roomVoiceForm(player: Player) {
    const ui = new ModalFormData();
    ui.title("Server URL");
    ui.textField("Server URL", "https://...")
    .show(player)
    .then((data) => {
        if (data.canceled || !data.formValues) return;
        const serverURL = data.formValues[0] as string;
        EnviroVoice.setRoomUrl(serverURL);
    });
}