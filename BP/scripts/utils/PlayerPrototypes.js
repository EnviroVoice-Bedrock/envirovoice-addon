import { Player } from "@minecraft/server";
Object.defineProperties(Player.prototype, {
    isInCave: {
        get() {
            const { x, y, z } = this.location;
            const topBlock = this.dimension.getTopmostBlock({ x: Math.floor(x), z: Math.floor(z) }).y;
            const distance = topBlock - y;
            return distance >= 7;
        }
    },
    isUnderWater: {
        get() {
            const { x, y, z } = this.location;
            const block = this.dimension.getBlock({ x: Math.floor(x), y: Math.floor(y + 1), z: Math.floor(z) });
            return (block?.typeId === 'minecraft:water' || block?.typeId === 'minecraft:flowing_water');
        }
    },
    isInMountain: {
        get() {
            const y = this.location.y;
            return y >= 128;
        }
    },
    isBuried: {
        get() {
            const { x, y, z } = this.location;
            const block = this.dimension.getBlock({ x: Math.floor(x), y: Math.floor(y + 1), z: Math.floor(z) });
            return block?.typeId !== 'minecraft:air' && block?.typeId !== 'minecraft:water' && block?.typeId !== 'minecraft:flowing_water';
        }
    },
    isTalking: {
        get() {
            return true;
        }
    }
});
