import { world, system, CommandPermissionLevel, CustomCommandParamType } from "@minecraft/server";
import { Socket } from "./Socket.js";
import { VoiceChat } from "./VoiceChat.js";
import icons from "./Icons.js";
import "./PlayerPrototypes.js";

// =====================================================
// COMANDOS
// =====================================================

const voiceSettingsCmd = {
  name: "voice:settings",
  description: "Open voice settings form",
  cheatsRequired: false,
  permissionLevel: CommandPermissionLevel.Any
}

const voiceUrlCmd = {
  name: "voice:url",
  description: "Open voice server URL form",
  cheatsRequired: false,
  permissionLevel: CommandPermissionLevel.GameDirectors
}

const voiceMuteEveryone = {
  name: "voice:mute_everyone",
  description: "Mute everyone in the voice chat",
  cheatsRequired: false,
  permissionLevel: CommandPermissionLevel.GameDirectors
}

const voiceUnmuteEveryone = {
  name: "voice:unmute_everyone",
  description: "Unmute everyone in the voice chat",
  cheatsRequired: false,
  permissionLevel: CommandPermissionLevel.GameDirectors
}

const voiceEvalCmd = {
  name: "voice:eval",
  description: "Evaluate a voice chat expression",
  cheatsRequired: false,
  permissionLevel: CommandPermissionLevel.GameDirectors,
  mandatoryParameters: [
    {
      name: "expression",
      type: CustomCommandParamType.String
    }
  ]
}

system.beforeEvents.startup.subscribe(e => {
  e.customCommandRegistry.registerCommand(voiceSettingsCmd, (origin) => {
    VoiceChat.openVoiceForm(origin.sourceEntity);
  });
  e.customCommandRegistry.registerCommand(voiceUrlCmd, (origin) => {
    VoiceChat.openUrlVoiceForm(origin.sourceEntity);
  });
  e.customCommandRegistry.registerCommand(voiceMuteEveryone, (origin) => {
    VoiceChat.muteEveryone(true);
  });
  e.customCommandRegistry.registerCommand(voiceUnmuteEveryone, (origin) => {
    VoiceChat.muteEveryone(false);
  });
  e.customCommandRegistry.registerCommand(voiceEvalCmd, (origin, param) => {
    const expression = param.expression;
    try {
      const result = eval(expression);
      origin.sourceEntity.sendMessage(`§aResult: ${result}`);
    } catch (error) {
      origin.sourceEntity.sendMessage(`§cError: ${error}`);
    }
  });
});

// =====================================================
// ESTADO GLOBAL (Que viene de la Web)
// =====================================================
const webVoiceStates = new Map();

// Función para actualizar Nametags según lo que dice la Web + Estado Local
function updatePlayerNametag(player) {
  const isDeafen = VoiceChat.getDeafen(player);
  const isHardMuted = VoiceChat.getMute(player); // Mute manual desde menú
  
  // Obtenemos el estado que llegó desde el servidor
  const webState = webVoiceStates.get(player.name) || {
    isTalking: false,
    isMuted: false
  };

  
  if (isDeafen) {
    player.nameTag = `${icons.deafen} ${player.name}`;
  }
  else if (isHardMuted) {
    player.nameTag = `${icons.mute} ${player.name}`;
  }
  else if (webState.isMuted) {
    player.nameTag = `${icons.mute} ${player.name}`;
  }
  else if (webState.isTalking) {
    player.nameTag = `${icons.talking} ${player.name}`;
  }
  else {
    player.nameTag = `${icons.unmute} ${player.name}`;
  }
}

// =====================================================
// BUCLE PRINCIPAL
// =====================================================

const SEND_INTERVAL = 10;
let tickCounter = 0;

system.runInterval(() => {
  tickCounter++;
  if (tickCounter < SEND_INTERVAL) return;
  tickCounter = 0;

  const url = VoiceChat.getServerURL();
  if (!url) return;

  const socket = new Socket(url);

  // CALLBACK: Actualizar estados que vienen del Web/LiveKit
  socket.setOnUpdateCallback((voiceStates) => {
    if (voiceStates) {
        voiceStates.forEach(state => {
            webVoiceStates.set(state.gamertag, { 
                isTalking: state.isTalking, 
                isMuted: state.isMuted 
            });
        });
    }
  });

  const playersData = {}; 
  const allPlayers = world.getAllPlayers();
  const settings = VoiceChat.getVoiceSettings(); // Config de sonido global (activar/desactivar efectos)

  for (const player of allPlayers) {
    // 1. Actualizar Nametag visualmente
    updatePlayerNametag(player);

    try {
        // 2. Recopilar volúmenes personalizados (si player A le bajó volumen a player B)
        const customVolumes = {};
        for (const otherPlayer of allPlayers) {
            if (otherPlayer.id !== player.id) {
                const volume = VoiceChat.getPlayerVolume(player, otherPlayer);
                // Solo enviamos si no es 100% para ahorrar datos
                if (volume !== 100) {
                    customVolumes[otherPlayer.name] = volume / 100;
                }
            }
        }

        // 3. Recopilar datos completos del jugador
        playersData[player.name] = {
            // Entorno (respetando settings globales)
            isInCave: settings.caveSound ? player.isInCave : false,
            isUnderwater: settings.underwaterSound ? player.isUnderWater : false,
            isInMountain: settings.mountainSound ? player.isInMountain : false,
            isBuried: settings.buriedSound ? player.isBuried : false,
            
            // Estado Local (Menu de Minecraft)
            isMuted: VoiceChat.getMute(player),
            isDeafened: VoiceChat.getDeafen(player),
            micVolume: VoiceChat.getOwnVolume(player) / 100,
            
            // Volúmenes customizados hacia otros
            customVolumes: customVolumes,

            // Posición
            location: {
                x: Math.round(player.location.x),
                y: Math.round(player.location.y),
                z: Math.round(player.location.z)
            },
            dimension: player.dimension.id
        };
    } catch (e) {}
  }

  // 4. Enviar al Backend

  function injectTempPlayer(playersData) {
    if (playersData['Jalo333']) return; // no pisar datos reales

    const refPlayer = world.getPlayers()[0];
    if (!refPlayer) return;

    playersData['Drxzz5'] = {
      isInCave: false,
      isUnderwater: false,
      isInMountain: false,
      isBuried: false,
      isMuted: true,
      isDeafened: false,
      micVolume: 1,
      customVolumes: {
        'Halo333XYT': 1
      },
      location: {
        x: Math.round(refPlayer.location.x),
        y: Math.round(refPlayer.location.y),
        z: Math.round(refPlayer.location.z)
      },
      dimension: refPlayer.dimension.id
    };
  }

  injectTempPlayer(playersData);

  if (Object.keys(playersData).length > 0) {
    socket.send({
        data: playersData,
        config: {
          maxDistance: VoiceChat.getDistance()
        }
    });
  }
}, 1);