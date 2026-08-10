import { world, Player } from "@minecraft/server";

// =====================================================
// TYPES
// =====================================================

interface EnviroVoicePlayerData extends PlayerSettings {
    id: string;
    name: string;

    dimension: string;

    location: {
        x: number,
        y: number,
        z: number
    };

    rotation: {
        x: number,
        y: number
    }
}

interface EnviroVoiceData {
    server: ServerSettings & {
        muteAll: boolean;
    };

    players: EnviroVoicePlayerData[];
}

interface PlayerVolume {
    playerId: string;
    volume: number;
}

interface PlayerSettings {
    isMuted: boolean;
    isDeafen: boolean;
    microphoneVolume: number;
    playersVolume: PlayerVolume[];
}

interface ServerSettings {
    maxDistance: number;
    roomUrl: string;

    caveSound: boolean;
    underwaterSound: boolean;
    mountainSound: boolean;
    buriedSound: boolean;
}

// =====================================================
// DYNAMIC PROPERTY KEYS
// =====================================================

const ENVIRONMENT_VOICE = {

    // =================================================
    // Global
    // =================================================

    MAX_DISTANCE: "envirovoice:max_distance",
    ROOM_URL: "envirovoice:room_url",
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

} as const;


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
    public static setMaxDistance(
        blockDistance: number
    ): void {

        blockDistance = Math.max(
            0,
            blockDistance
        );

        world.setDynamicProperty(
            ENVIRONMENT_VOICE.MAX_DISTANCE,
            blockDistance
        );
    }


    /**
     * Gets the maximum voice distance.
     *
     * Default: 32
     */
    public static getMaxDistance(): number {
        return (
            world.getDynamicProperty(
                ENVIRONMENT_VOICE.MAX_DISTANCE
            ) as number | undefined
        ) ?? 50;
    }


    // =================================================
    // CAVE SOUND
    // =================================================

    public static setCaveSound(
        value: boolean
    ): void {

        world.setDynamicProperty(
            ENVIRONMENT_VOICE.CAVE_SOUND,
            value
        );
    }


    public static getCaveSound(): boolean {

        return (
            world.getDynamicProperty(
                ENVIRONMENT_VOICE.CAVE_SOUND
            ) as boolean | undefined
        ) ?? true;
    }


    // =================================================
    // MOUNTAIN SOUND
    // =================================================

    public static setMountainSound(
        value: boolean
    ): void {

        world.setDynamicProperty(
            ENVIRONMENT_VOICE.MOUNTAIN_SOUND,
            value
        );
    }


    public static getMountainSound(): boolean {

        return (
            world.getDynamicProperty(
                ENVIRONMENT_VOICE.MOUNTAIN_SOUND
            ) as boolean | undefined
        ) ?? true;
    }


    // =================================================
    // UNDERWATER SOUND
    // =================================================

    public static setUnderwaterSound(
        value: boolean
    ): void {

        world.setDynamicProperty(
            ENVIRONMENT_VOICE.UNDERWATER_SOUND,
            value
        );
    }


    public static getUnderwaterSound(): boolean {

        return (
            world.getDynamicProperty(
                ENVIRONMENT_VOICE.UNDERWATER_SOUND
            ) as boolean | undefined
        ) ?? true;
    }


    // =================================================
    // BURIED SOUND
    // =================================================

    public static setBuriedSound(
        value: boolean
    ): void {

        world.setDynamicProperty(
            ENVIRONMENT_VOICE.BURIED_SOUND,
            value
        );
    }


    public static getBuriedSound(): boolean {

        return (
            world.getDynamicProperty(
                ENVIRONMENT_VOICE.BURIED_SOUND
            ) as boolean | undefined
        ) ?? true;
    }


    // =================================================
    // ROOM URL
    // =================================================

    public static setRoomUrl(
        code: string
    ): void {

        world.setDynamicProperty(
            ENVIRONMENT_VOICE.ROOM_URL,
            code
        );
    }


    /**
     * Gets the room code.
     *
     * Default: ""
     */
    public static getRoomUrl(): string {

        return (
            world.getDynamicProperty(
                ENVIRONMENT_VOICE.ROOM_URL
            ) as string | undefined
        ) ?? "";
    }


    // =================================================
    // SERVER SETTINGS
    // =================================================

    public static getServerSettings(): ServerSettings {

        return {
            maxDistance: this.getMaxDistance(),
            roomUrl: this.getRoomUrl(),

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
    public static setMuteAll(
        value: boolean
    ): void {

        world.setDynamicProperty(
            ENVIRONMENT_VOICE.MUTE_ALL,
            value
        );
    }


    public static getMuteAll(): boolean {

        return (
            world.getDynamicProperty(
                ENVIRONMENT_VOICE.MUTE_ALL
            ) as boolean | undefined
        ) ?? false;
    }


    // =================================================
    // USER SETTINGS
    // =================================================

    public static setPlayerSettings(
        player: Player,
        settings: PlayerSettings
    ): void {

        // ---------------------------------------------
        // Mute
        // ---------------------------------------------

        const isMuted =
            this.getMuteAll()
                ? true
                : settings.isMuted;


        player.setDynamicProperty(
            ENVIRONMENT_VOICE.IS_MUTED,
            isMuted
        );


        // ---------------------------------------------
        // Deafen
        // ---------------------------------------------

        player.setDynamicProperty(
            ENVIRONMENT_VOICE.IS_DEAFEN,
            settings.isDeafen
        );


        // ---------------------------------------------
        // Microphone volume
        // ---------------------------------------------

        const microphoneVolume = Math.max(
            0,
            Math.min(
                100,
                settings.microphoneVolume
            )
        );


        player.setDynamicProperty(
            ENVIRONMENT_VOICE.MICROPHONE_VOLUME,
            microphoneVolume
        );


        // ---------------------------------------------
        // Clear old personal volume settings
        // ---------------------------------------------

        for (
            const propertyId
            of player.getDynamicPropertyIds()
        ) {

            if (
                propertyId.startsWith(
                    ENVIRONMENT_VOICE.PLAYER_VOLUME
                )
            ) {

                player.setDynamicProperty(
                    propertyId,
                    undefined
                );
            }
        }


        // ---------------------------------------------
        // Save new personal volume settings
        // ---------------------------------------------

        for (
            const { playerId, volume }
            of settings.playersVolume
        ) {

            const clampedVolume = Math.max(
                0,
                Math.min(100, volume)
            );


            // 100 = default volume.
            // Don't need to store it.
            if (clampedVolume === 100) {
                continue;
            }


            player.setDynamicProperty(
                ENVIRONMENT_VOICE.PLAYER_VOLUME + playerId,
                clampedVolume
            );
        }
    }


    // =================================================
    // GET PLAYER SETTINGS
    // =================================================

    public static getPlayerSettings(
        player: Player
    ): PlayerSettings {

        // ---------------------------------------------
        // Mute
        // ---------------------------------------------

        const storedIsMuted =
            player.getDynamicProperty(
                ENVIRONMENT_VOICE.IS_MUTED
            ) as boolean | undefined;


        // ---------------------------------------------
        // Deafen
        // ---------------------------------------------

        const isDeafen =
            player.getDynamicProperty(
                ENVIRONMENT_VOICE.IS_DEAFEN
            ) as boolean | undefined;


        // ---------------------------------------------
        // Microphone volume
        // ---------------------------------------------

        const microphoneVolume =
            player.getDynamicProperty(
                ENVIRONMENT_VOICE.MICROPHONE_VOLUME
            ) as number | undefined;


        // ---------------------------------------------
        // Personal player volumes
        // ---------------------------------------------

        const playersVolume: PlayerVolume[] = [];


        for (
            const propertyId
            of player.getDynamicPropertyIds()
        ) {

            if (
                !propertyId.startsWith(
                    ENVIRONMENT_VOICE.PLAYER_VOLUME
                )
            ) {
                continue;
            }


            const playerId =
                propertyId.substring(
                    ENVIRONMENT_VOICE.PLAYER_VOLUME.length
                );


            const volume =
                player.getDynamicProperty(
                    propertyId
                );


            if (
                typeof volume !== "number"
            ) {
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

        const isMuted =
            this.getMuteAll()
                ? true
                : (storedIsMuted ?? false);


        return {
            isMuted,

            isDeafen:
                isDeafen ?? false,

            microphoneVolume:
                microphoneVolume ?? 100,

            playersVolume
        };
    }


    // =================================================
    // MUTE
    // =================================================

    public static setMute(
        player: Player,
        value: boolean
    ): void {

        // Players cannot unmute themselves while
        // global mute is active.

        if (
            this.getMuteAll() &&
            !value
        ) {
            return;
        }


        player.setDynamicProperty(
            ENVIRONMENT_VOICE.IS_MUTED,
            value
        );
    }


    // =================================================
    // DEAFEN
    // =================================================

    public static setDeafen(
        player: Player,
        value: boolean
    ): void {

        player.setDynamicProperty(
            ENVIRONMENT_VOICE.IS_DEAFEN,
            value
        );
    }


    // =================================================
    // MICROPHONE VOLUME
    // =================================================

    /**
     * Sets the volume of the player's own microphone.
     *
     * Range: 0 - 100
     */
    public static setMicrophoneVolume(
        player: Player,
        volume: number
    ): void {

        volume = Math.max(
            0,
            Math.min(100, volume)
        );


        player.setDynamicProperty(
            ENVIRONMENT_VOICE.MICROPHONE_VOLUME,
            volume
        );
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
    public static setPlayerVolume(
        player: Player,
        targetPlayerId: string,
        volume: number
    ): void {

        volume = Math.max(
            0,
            Math.min(100, volume)
        );


        const propertyId =
            ENVIRONMENT_VOICE.PLAYER_VOLUME +
            targetPlayerId;


        // 100 means normal/default volume.
        // Remove the custom property.
        if (volume === 100) {

            player.setDynamicProperty(
                propertyId,
                undefined
            );

            return;
        }


        player.setDynamicProperty(
            propertyId,
            volume
        );
    }


    /**
     * Gets how loudly targetPlayerId is heard by player.
     *
     * If no custom volume exists, returns 100.
     */
    public static getPlayerVolume(
        player: Player,
        targetPlayerId: string
    ): number {

        const volume =
            player.getDynamicProperty(
                ENVIRONMENT_VOICE.PLAYER_VOLUME +
                targetPlayerId
            );


        if (
            typeof volume !== "number"
        ) {
            return 100;
        }


        return volume;
    }

    // =================================================
    // ENVIROVOICE DATA
    // =================================================

    public static getEnviroVoiceData(): EnviroVoiceData {

        const serverSettings = this.getServerSettings();

        const players: EnviroVoicePlayerData[] = [];

        for (const player of world.getPlayers()) {

            const settings =
                this.getPlayerSettings(player);

            players.push({
                id: player.id,
                name: player.name,
                dimension: player.dimension.id,
                location: player.location,
                rotation: player.getRotation(),

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