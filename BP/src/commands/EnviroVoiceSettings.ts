import { CustomCommand, CommandPermissionLevel } from "@minecraft/server";

export const EnviroVoiceSettingsCmd: CustomCommand = {
  name: "envirovoice:settings",
  description: "EnviroVoice Settings",
  cheatsRequired: false,
  permissionLevel: CommandPermissionLevel.Any
}

export default EnviroVoiceSettingsCmd;