import { world, system, Player } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import Icons from "./Icons.js";


// =====================================================
// TYPES
// =====================================================

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


// =====================================================
// DYNAMIC PROPERTY KEYS
// =====================================================

const ENVIRONMENT_VOICE = {
    // Global
    MAX_DISTANCE: "envirovoice:max_distance",
    ROOM_URL: "envirovoice:room_url",
    MUTE_ALL: "envirovoice:mute_all",

    // Player
    IS_MUTED: "envirovoice:is_muted",
    IS_DEAFEN: "envirovoice:is_deafen",
    MICROPHONE_VOLUME: "envirovoice:microphone_volume",

    // Player-specific volume
    PLAYER_VOLUME: "envirovoice:player_volume:"
} as const;


// =====================================================
// ENVIRONMENT VOICE
// =====================================================

export class EnviroVoice {

    // =====================================================
    // ADMIN / GLOBAL SETTINGS
    // =====================================================

    public static setMaxDistance(blockDistance: number): void {
        world.setDynamicProperty(
            ENVIRONMENT_VOICE.MAX_DISTANCE,
            blockDistance
        );
    }


    public static getMaxDistance(): number | undefined {
        return world.getDynamicProperty(
            ENVIRONMENT_VOICE.MAX_DISTANCE
        ) as number | undefined;
    }


    public static setRoomUrl(url: string): void {
        world.setDynamicProperty(
            ENVIRONMENT_VOICE.ROOM_URL,
            url
        );
    }


    public static getRoomUrl(): string | undefined {
        return world.getDynamicProperty(
            ENVIRONMENT_VOICE.ROOM_URL
        ) as string | undefined;
    }


    // =====================================================
    // GLOBAL MUTE
    // =====================================================

    /**
     * Forces every player to be muted while enabled.
     *
     * This does not modify each player's individual
     * mute setting. It only changes the global state.
     */
    public static setMuteAll(value: boolean): void {
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


    // =====================================================
    // USER SETTINGS
    // =====================================================

    public static setPlayerSettings(
        player: Player,
        settings: PlayerSettings
    ): void {

        // If global mute is active, don't allow the
        // player settings to override it.
        const isMuted =
            this.getMuteAll()
                ? true
                : settings.isMuted;


        player.setDynamicProperty(
            ENVIRONMENT_VOICE.IS_MUTED,
            isMuted
        );


        player.setDynamicProperty(
            ENVIRONMENT_VOICE.IS_DEAFEN,
            settings.isDeafen
        );


        player.setDynamicProperty(
            ENVIRONMENT_VOICE.MICROPHONE_VOLUME,
            settings.microphoneVolume
        );


        for (const { playerId, volume } of settings.playersVolume) {
            player.setDynamicProperty(
                ENVIRONMENT_VOICE.PLAYER_VOLUME + playerId,
                volume
            );
        }
    }


    public static getPlayerSettings(
        player: Player
    ): PlayerSettings {

        const storedIsMuted =
            player.getDynamicProperty(
                ENVIRONMENT_VOICE.IS_MUTED
            ) as boolean | undefined;


        const isDeafen =
            player.getDynamicProperty(
                ENVIRONMENT_VOICE.IS_DEAFEN
            ) as boolean | undefined;


        const microphoneVolume =
            player.getDynamicProperty(
                ENVIRONMENT_VOICE.MICROPHONE_VOLUME
            ) as number | undefined;


        const playersVolume: PlayerVolume[] = [];


        // Find all personal volume settings
        for (const propertyId of player.getDynamicPropertyIds()) {

            if (
                !propertyId.startsWith(
                    ENVIRONMENT_VOICE.PLAYER_VOLUME
                )
            ) {
                continue;
            }


            const playerId = propertyId.substring(
                ENVIRONMENT_VOICE.PLAYER_VOLUME.length
            );


            const volume =
                player.getDynamicProperty(propertyId);


            if (typeof volume !== "number") {
                continue;
            }


            playersVolume.push({
                playerId,
                volume
            });
        }


        // Global mute overrides the player's own setting.
        const isMuted =
            this.getMuteAll()
                ? true
                : (storedIsMuted ?? false);


        return {
            isMuted,
            isDeafen: isDeafen ?? false,
            microphoneVolume: microphoneVolume ?? 100,
            playersVolume
        };
    }


    // =====================================================
    // MUTE
    // =====================================================

    public static setMute(
        player: Player,
        value: boolean
    ): void {

        // Players cannot unmute themselves while
        // global mute is active.
        if (this.getMuteAll() && !value) {
            return;
        }


        player.setDynamicProperty(
            ENVIRONMENT_VOICE.IS_MUTED,
            value
        );
    }


    // =====================================================
    // DEAFEN
    // =====================================================

    public static setDeafen(
        player: Player,
        value: boolean
    ): void {

        player.setDynamicProperty(
            ENVIRONMENT_VOICE.IS_DEAFEN,
            value
        );
    }


    // =====================================================
    // MICROPHONE VOLUME
    // =====================================================

    /**
     * Sets the volume of the player's own microphone.
     *
     * Expected range: 0 - 100
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


    // =====================================================
    // PLAYER VOLUME
    // =====================================================

    /**
     * Sets how loudly `targetPlayerId` is heard by `player`.
     *
     * This is personal to the listener.
     *
     * Example:
     *
     * setPlayerVolume(playerA, playerB.id, 50)
     *
     * means playerA hears playerB at 50% volume.
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


        player.setDynamicProperty(
            ENVIRONMENT_VOICE.PLAYER_VOLUME + targetPlayerId,
            volume
        );
    }


    /**
     * Gets how loudly `targetPlayerId` is heard by `player`.
     *
     * If no custom volume exists, returns 100.
     */
    public static getPlayerVolume(
        player: Player,
        targetPlayerId: string
    ): number {

        const volume =
            player.getDynamicProperty(
                ENVIRONMENT_VOICE.PLAYER_VOLUME + targetPlayerId
            );


        if (typeof volume !== "number") {
            return 100;
        }


        return volume;
    }
}