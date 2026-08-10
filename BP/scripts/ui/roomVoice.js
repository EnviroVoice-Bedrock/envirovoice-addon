import { ModalFormData } from "@minecraft/server-ui";
import { EnviroVoice } from "../utils/EnviroVoice";
export default function roomVoiceForm(player) {
    const ui = new ModalFormData();
    ui.title("Server URL");
    ui.textField("Server URL", "https://...")
        .show(player)
        .then((data) => {
        if (data.canceled || !data.formValues)
            return;
        const serverURL = data.formValues[0];
        EnviroVoice.setRoomUrl(serverURL);
    });
}
