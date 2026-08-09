import { CommandPermissionLevel } from "@minecraft/server";
const MuteEveryoneCmd = {
    name: "envirovoice:mute_all",
    description: "Mute all the players in the server.",
    cheatsRequired: false,
    permissionLevel: CommandPermissionLevel.Admin
};
export default MuteEveryoneCmd;
