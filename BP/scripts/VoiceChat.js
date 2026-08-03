import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import icons from "./Icons.js";

export class VoiceChat {
  // =====================================================
  // CONFIGURACIÓN GENERAL
  // =====================================================
  
  static setDistance(distance) {
    world.setDynamicProperty("voice:distance", distance);
  }

  static getDistance() {
    return world.getDynamicProperty("voice:distance") ?? 15;
  }

  static getServerURL() {
    return world.getDynamicProperty("voice:server_url");
  }

  static setServerURL(url) {
    world.setDynamicProperty("voice:server_url", url);
  }

  // =====================================================
  // MUTE Y DEAFEN
  // =====================================================
  
  static getMute(player) {
    return world.getDynamicProperty(`voice:mute:${player.id}`) ?? false;
  }

  static _setMuteInternal(player, state) {
    const newState = state !== undefined ? state : !this.getMute(player);
    world.setDynamicProperty(`voice:mute:${player.id}`, newState);
    return newState;
  }

  static mute(player, state) {
    const oldState = this.getMute(player);
    const newState = state !== undefined ? state : !oldState;
    
    if (oldState !== newState) {
      world.setDynamicProperty(`voice:mute:${player.id}`, newState);
      player.sendMessage(newState ? "§cYou are muted" : "§aYou are unmuted");
    }
    
    return newState;
  }

  static getDeafen(player) {
    return world.getDynamicProperty(`voice:deafen:${player.id}`) ?? false;
  }

  static setDeafen(player, state) {
    const oldState = this.getDeafen(player);
    const newState = state !== undefined ? state : !oldState;
    
    if (oldState !== newState) {
      world.setDynamicProperty(`voice:deafen:${player.id}`, newState);
      
      this._setMuteInternal(player, newState);
      
      player.sendMessage(newState ? "§cYou are deafened" : "§aYou are undeafened");
    }
    
    return newState;
  }

  static muteEveryone(state) {
    const newState = state !== undefined ? state : !this.getEveryoneMute();
    world.setDynamicProperty("voice:mute:everyone", newState);
    
    for (const player of world.getPlayers()) {
      this._setMuteInternal(player, newState);
    }
    
    world.sendMessage(newState ? "§c[Admin] Voice chat muted for everyone" : "§a[Admin] Voice chat unmuted for everyone");
    
    return newState;
  }

  static getEveryoneMute() {
    return world.getDynamicProperty("voice:mute:everyone") ?? false;
  }

  // =====================================================
  // VOLUMEN
  // =====================================================
  
  // Mi propio volumen, esto afecta a otros
  static getOwnVolume(player) {
    return world.getDynamicProperty(`voice:volume:${player.id}`) ?? 100;
  }

  static setOwnVolume(player, volume) {
    world.setDynamicProperty(`voice:volume:${player.id}`, volume);
  }

  // Volumen de otro jugador que solo afecta para mí
  static setPlayerVolume(me, targetPlayer, volume) {
    me.setDynamicProperty(`voice:player_volume:${targetPlayer.id}`, volume);
  }

  static getPlayerVolume(me, targetPlayer) {
    return me.getDynamicProperty(`voice:player_volume:${targetPlayer.id}`) ?? 100;
  }

  // =====================================================
  // EFECTOS DE SONIDO
  // =====================================================
  
  static getVoiceSettings() {
    return {
      caveSound: world.getDynamicProperty(`voice:settings:caveSound`) ?? true,
      underwaterSound: world.getDynamicProperty(`voice:settings:underwaterSound`) ?? true,
      mountainSound: world.getDynamicProperty(`voice:settings:mountainSound`) ?? true,
      buriedSound: world.getDynamicProperty(`voice:settings:buriedSound`) ?? true,
    };
  }

  static setVoiceSettings(settings) {
    world.setDynamicProperty(`voice:settings:caveSound`, settings[0]);
    world.setDynamicProperty(`voice:settings:underwaterSound`, settings[1]);
    world.setDynamicProperty(`voice:settings:mountainSound`, settings[2]);
    world.setDynamicProperty(`voice:settings:buriedSound`, settings[3]);
  }

  // =====================================================
  // DETECCIÓN DE VOZ (NUEVO)
  // =====================================================
  
  static setTalkingState(player, isTalking) {
    world.setDynamicProperty(`voice:talking:${player.id}`, isTalking);
  }

  static getTalkingState(player) {
    return world.getDynamicProperty(`voice:talking:${player.id}`) ?? false;
  }

  static setVoiceVolume(player, volumeDb) {
    world.setDynamicProperty(`voice:voice_volume:${player.id}`, volumeDb);
  }

  static getVoiceVolume(player) {
    return world.getDynamicProperty(`voice:voice_volume:${player.id}`) ?? -100;
  }

  // =====================================================
  // FORMULARIOS UI
  // =====================================================
  
  static userVoiceForm(player) {
    const voice = new ModalFormData();
    const players = world.getPlayers({ excludeNames: [player.name] });
    voice.title("Voice Settings");
    voice.slider("Microphone Volume", 0, 100, { defaultValue: VoiceChat.getOwnVolume(player) });
    voice.toggle("Mute", { defaultValue: VoiceChat.getMute(player) });
    voice.toggle("Deafen", { defaultValue: VoiceChat.getDeafen(player) });
    voice.label("Players Settings");
    for (const p of players) {
      const volume = VoiceChat.getPlayerVolume(player, p);
      voice.slider(`${p.name} Volume`, 0, 100, { defaultValue: volume });
    }
    voice.submitButton("Apply");
    return voice;
  }

  static adminVoiceForm(player) {
    const settings = this.getVoiceSettings();
    const voice = new ModalFormData();
    const players = world.getPlayers({ excludeNames: [player.name] });
    voice.title("Voice Settings");
    voice.slider("Microphone Volume", 0, 100, { defaultValue: VoiceChat.getOwnVolume(player) });
    voice.toggle("Mute", { defaultValue: VoiceChat.getMute(player) });
    voice.toggle("Deafen", { defaultValue: VoiceChat.getDeafen(player) });
    voice.label("Block Distance");
    voice.slider("Distance", 10, 50, { defaultValue: this.getDistance() });
    voice.label("Voice Effect Sounds");
    voice.toggle("Cave Sound " + icons.cave, { defaultValue: settings.caveSound });
    voice.toggle("Underwater Sound " + icons.raindrop, { defaultValue: settings.underwaterSound });
    voice.toggle("Mountain Sound " + icons.cloud, { defaultValue: settings.mountainSound });
    voice.toggle("Buried Sound " + icons.buried, { defaultValue: settings.buriedSound });
    voice.label("Players Settings");
    for (const p of players) {
      const volume = VoiceChat.getPlayerVolume(player, p);
      voice.slider(`${p.name} Volume`, 0, 100, { defaultValue: volume });
    }
    voice.submitButton("Apply");
    return voice;
  }

  static urlVoiceForm() {
    const voice = new ModalFormData();
    voice.title("Server URL");
    voice.textField("Server URL", "https://...");
    return voice;
  }

  static openVoiceForm(player, forceSyncCallback) {
    system.run(() => {
      const isAdmin = player.playerPermissionLevel === 2;
      if (isAdmin) {
        this.adminVoiceForm(player)
          .show(player)
          .then((data) => {
            if (data.canceled) return;
            const [
              microphoneVolume,
              mute,
              deafen,,
              blockDistance,,
              caveSound,
              underwaterSound,
              mountainSound,
              buriedSound,,
            ] = data.formValues;
            
            VoiceChat.setOwnVolume(player, microphoneVolume);
            VoiceChat.setDeafen(player, deafen);
            
            if (!deafen) {
              VoiceChat.mute(player, mute);
            }
            
            VoiceChat.setDistance(blockDistance);
            this.setVoiceSettings([
              caveSound,
              underwaterSound,
              mountainSound,
              buriedSound,
            ]);
            
            const players = world.getPlayers({ excludeNames: [player.name] });
            for (const p of players) {
              const volume = data.formValues[11 + players.indexOf(p)];
              VoiceChat.setPlayerVolume(player, p, volume);
            }
            
            if (forceSyncCallback) {
              forceSyncCallback();
            }
          });
      } else {
        const everyoneMute = VoiceChat.getEveryoneMute();
        if (everyoneMute) {
          player.sendMessage("§cVoice chat is muted by admin");
          return;
        }
        
        this.userVoiceForm(player)
          .show(player)
          .then((data) => {
            if (data.canceled) return;
            const [microphoneVolume, mute, deafen,] = data.formValues;
            
            VoiceChat.setOwnVolume(player, microphoneVolume);
            VoiceChat.setDeafen(player, deafen);
            
            if (!deafen) {
              VoiceChat.mute(player, mute);
            }
            
            const players = world.getPlayers({ excludeNames: [player.name] });
            for (const p of players) {
              const volume = data.formValues[4 + players.indexOf(p)];
              VoiceChat.setPlayerVolume(player, p, volume);
            }
            
            if (forceSyncCallback) {
              forceSyncCallback();
            }
          });
      }
    });
  }

  static openUrlVoiceForm(player) {
    system.run(() => {
      this.urlVoiceForm()
        .show(player)
        .then((data) => {
          if (data.canceled) return;
          const serverURL = data.formValues[0];
          VoiceChat.setServerURL(serverURL);
        });
    });
  }
}