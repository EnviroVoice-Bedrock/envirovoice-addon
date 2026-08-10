import { CustomCommand, CommandPermissionLevel } from "@minecraft/server";

export const RoomUrlCmd: CustomCommand = {
  name: "envirovoice:room_url",
  description: "Set the room url.",
  cheatsRequired: false,
  permissionLevel: CommandPermissionLevel.Admin
}

export default RoomUrlCmd;