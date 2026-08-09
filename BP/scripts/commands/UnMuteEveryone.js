import { CommandPermissionLevel } from "@minecraft/server";
export const UnmuteEveryoneCmd = {
    name: "envirovoice:unmute_all",
    description: "Unmute all the players in the server.",
    cheatsRequired: false,
    permissionLevel: CommandPermissionLevel.Admin
};
export default UnmuteEveryoneCmd;
