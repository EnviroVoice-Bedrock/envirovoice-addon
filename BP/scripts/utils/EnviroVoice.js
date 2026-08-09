import { world } from "@minecraft/server";
// =====================================================
// DYNAMIC PROPERTY KEYS
// =====================================================
const ENVIRONMENT_VOICE = {
    // =================================================
    // Global
    // =================================================
    MAX_DISTANCE: "envirovoice:max_distance",
    ROOM_CODE: "envirovoice:room_code",
    MUTE_ALL: "envirovoice:mute_all",
    // =================================================
    // Environment sounds
    // =================================================
    CAVE_SOUND: "envirovoice:cave_sound",
    UNDERWATER_SOUND: "envirovoice:underwater_sound",
    MOUNTAIN_SOUND: "envirovoice:mountain_sound",
    BURIED_SOUND: "envirovoice:buried_sound",
    // =================================================
    // Player
    // =================================================
    IS_MUTED: "envirovoice:is_muted",
    IS_DEAFEN: "envirovoice:is_deafen",
    MICROPHONE_VOLUME: "envirovoice:microphone_volume",
    // =================================================
    // Player-specific volume
    // =================================================
    PLAYER_VOLUME: "envirovoice:player_volume:"
};
// =====================================================
// ENVIRONMENT VOICE
// =====================================================
export class EnviroVoice {
    // =================================================
    // ADMIN / GLOBAL SETTINGS
    // =================================================
    /**
     * Sets the maximum distance at which players
     * can hear each other.
     *
     * Expected range: > 0
     */
    static setMaxDistance(blockDistance) {
        blockDistance = Math.max(0, blockDistance);
        world.setDynamicProperty(ENVIRONMENT_VOICE.MAX_DISTANCE, blockDistance);
    }
    /**
     * Gets the maximum voice distance.
     *
     * Default: 32
     */
    static getMaxDistance() {
        return world.getDynamicProperty(ENVIRONMENT_VOICE.MAX_DISTANCE) ?? 32;
    }
    // =================================================
    // CAVE SOUND
    // =================================================
    static setCaveSound(value) {
        world.setDynamicProperty(ENVIRONMENT_VOICE.CAVE_SOUND, value);
    }
    static getCaveSound() {
        return world.getDynamicProperty(ENVIRONMENT_VOICE.CAVE_SOUND) ?? true;
    }
    // =================================================
    // MOUNTAIN SOUND
    // =================================================
    static setMountainSound(value) {
        world.setDynamicProperty(ENVIRONMENT_VOICE.MOUNTAIN_SOUND, value);
    }
    static getMountainSound() {
        return world.getDynamicProperty(ENVIRONMENT_VOICE.MOUNTAIN_SOUND) ?? true;
    }
    // =================================================
    // UNDERWATER SOUND
    // =================================================
    static setUnderwaterSound(value) {
        world.setDynamicProperty(ENVIRONMENT_VOICE.UNDERWATER_SOUND, value);
    }
    static getUnderwaterSound() {
        return world.getDynamicProperty(ENVIRONMENT_VOICE.UNDERWATER_SOUND) ?? true;
    }
    // =================================================
    // BURIED SOUND
    // =================================================
    static setBuriedSound(value) {
        world.setDynamicProperty(ENVIRONMENT_VOICE.BURIED_SOUND, value);
    }
    static getBuriedSound() {
        return world.getDynamicProperty(ENVIRONMENT_VOICE.BURIED_SOUND) ?? true;
    }
    // =================================================
    // ROOM CODE
    // =================================================
    static setRoomCode(code) {
        world.setDynamicProperty(ENVIRONMENT_VOICE.ROOM_CODE, code);
    }
    /**
     * Gets the room code.
     *
     * Default: ""
     */
    static getRoomCode() {
        return world.getDynamicProperty(ENVIRONMENT_VOICE.ROOM_CODE) ?? "";
    }
    // =================================================
    // SERVER SETTINGS
    // =================================================
    static getServerSettings() {
        return {
            maxDistance: this.getMaxDistance(),
            roomCode: this.getRoomCode(),
            caveSound: this.getCaveSound(),
            underwaterSound: this.getUnderwaterSound(),
            mountainSound: this.getMountainSound(),
            buriedSound: this.getBuriedSound()
        };
    }
    // =================================================
    // GLOBAL MUTE
    // =================================================
    /**
     * Forces every player to be muted while enabled.
     *
     * This does not modify each player's individual
     * mute setting.
     */
    static setMuteAll(value) {
        world.setDynamicProperty(ENVIRONMENT_VOICE.MUTE_ALL, value);
    }
    static getMuteAll() {
        return world.getDynamicProperty(ENVIRONMENT_VOICE.MUTE_ALL) ?? false;
    }
    // =================================================
    // USER SETTINGS
    // =================================================
    static setPlayerSettings(player, settings) {
        // ---------------------------------------------
        // Mute
        // ---------------------------------------------
        const isMuted = this.getMuteAll()
            ? true
            : settings.isMuted;
        player.setDynamicProperty(ENVIRONMENT_VOICE.IS_MUTED, isMuted);
        // ---------------------------------------------
        // Deafen
        // ---------------------------------------------
        player.setDynamicProperty(ENVIRONMENT_VOICE.IS_DEAFEN, settings.isDeafen);
        // ---------------------------------------------
        // Microphone volume
        // ---------------------------------------------
        const microphoneVolume = Math.max(0, Math.min(100, settings.microphoneVolume));
        player.setDynamicProperty(ENVIRONMENT_VOICE.MICROPHONE_VOLUME, microphoneVolume);
        // ---------------------------------------------
        // Clear old personal volume settings
        // ---------------------------------------------
        for (const propertyId of player.getDynamicPropertyIds()) {
            if (propertyId.startsWith(ENVIRONMENT_VOICE.PLAYER_VOLUME)) {
                player.setDynamicProperty(propertyId, undefined);
            }
        }
        // ---------------------------------------------
        // Save new personal volume settings
        // ---------------------------------------------
        for (const { playerId, volume } of settings.playersVolume) {
            const clampedVolume = Math.max(0, Math.min(100, volume));
            // 100 = default volume.
            // Don't need to store it.
            if (clampedVolume === 100) {
                continue;
            }
            player.setDynamicProperty(ENVIRONMENT_VOICE.PLAYER_VOLUME + playerId, clampedVolume);
        }
    }
    // =================================================
    // GET PLAYER SETTINGS
    // =================================================
    static getPlayerSettings(player) {
        // ---------------------------------------------
        // Mute
        // ---------------------------------------------
        const storedIsMuted = player.getDynamicProperty(ENVIRONMENT_VOICE.IS_MUTED);
        // ---------------------------------------------
        // Deafen
        // ---------------------------------------------
        const isDeafen = player.getDynamicProperty(ENVIRONMENT_VOICE.IS_DEAFEN);
        // ---------------------------------------------
        // Microphone volume
        // ---------------------------------------------
        const microphoneVolume = player.getDynamicProperty(ENVIRONMENT_VOICE.MICROPHONE_VOLUME);
        // ---------------------------------------------
        // Personal player volumes
        // ---------------------------------------------
        const playersVolume = [];
        for (const propertyId of player.getDynamicPropertyIds()) {
            if (!propertyId.startsWith(ENVIRONMENT_VOICE.PLAYER_VOLUME)) {
                continue;
            }
            const playerId = propertyId.substring(ENVIRONMENT_VOICE.PLAYER_VOLUME.length);
            const volume = player.getDynamicProperty(propertyId);
            if (typeof volume !== "number") {
                continue;
            }
            playersVolume.push({
                playerId,
                volume
            });
        }
        // ---------------------------------------------
        // Global mute overrides personal mute
        // ---------------------------------------------
        const isMuted = this.getMuteAll()
            ? true
            : (storedIsMuted ?? false);
        return {
            isMuted,
            isDeafen: isDeafen ?? false,
            microphoneVolume: microphoneVolume ?? 100,
            playersVolume
        };
    }
    // =================================================
    // MUTE
    // =================================================
    static setMute(player, value) {
        // Players cannot unmute themselves while
        // global mute is active.
        if (this.getMuteAll() &&
            !value) {
            return;
        }
        player.setDynamicProperty(ENVIRONMENT_VOICE.IS_MUTED, value);
    }
    // =================================================
    // DEAFEN
    // =================================================
    static setDeafen(player, value) {
        player.setDynamicProperty(ENVIRONMENT_VOICE.IS_DEAFEN, value);
    }
    // =================================================
    // MICROPHONE VOLUME
    // =================================================
    /**
     * Sets the volume of the player's own microphone.
     *
     * Range: 0 - 100
     */
    static setMicrophoneVolume(player, volume) {
        volume = Math.max(0, Math.min(100, volume));
        player.setDynamicProperty(ENVIRONMENT_VOICE.MICROPHONE_VOLUME, volume);
    }
    // =================================================
    // PLAYER VOLUME
    // =================================================
    /**
     * Sets how loudly targetPlayerId is heard by player.
     *
     * This is personal to the listener.
     *
     * Example:
     *
     * setPlayerVolume(playerA, playerB.id, 50)
     *
     * means playerA hears playerB at 50% volume.
     *
     * Range: 0 - 100
     */
    static setPlayerVolume(player, targetPlayerId, volume) {
        volume = Math.max(0, Math.min(100, volume));
        const propertyId = ENVIRONMENT_VOICE.PLAYER_VOLUME +
            targetPlayerId;
        // 100 means normal/default volume.
        // Remove the custom property.
        if (volume === 100) {
            player.setDynamicProperty(propertyId, undefined);
            return;
        }
        player.setDynamicProperty(propertyId, volume);
    }
    /**
     * Gets how loudly targetPlayerId is heard by player.
     *
     * If no custom volume exists, returns 100.
     */
    static getPlayerVolume(player, targetPlayerId) {
        const volume = player.getDynamicProperty(ENVIRONMENT_VOICE.PLAYER_VOLUME +
            targetPlayerId);
        if (typeof volume !== "number") {
            return 100;
        }
        return volume;
    }
    // =================================================
    // ENVIROVOICE DATA
    // =================================================
    static getEnviroVoiceData() {
        const serverSettings = this.getServerSettings();
        const players = [];
        for (const player of world.getPlayers()) {
            const settings = this.getPlayerSettings(player);
            players.push({
                id: player.id,
                name: player.name,
                isMuted: settings.isMuted,
                isDeafen: settings.isDeafen,
                microphoneVolume: settings.microphoneVolume,
                playersVolume: settings.playersVolume
            });
        }
        return {
            server: {
                ...serverSettings,
                muteAll: this.getMuteAll()
            },
            players
        };
    }
}
