export default class SourceManager {
    constructor() {
        this.backroundPicture = null;
        this.backroundPattern = null;

        this.textures = new Map();
        this.assets = new Map();
    }

    addAsset(assetName, asset) {
        this.assets.set(assetName, asset);
    }

    getAssetByName(assetName) {
        return this.assets.get(assetName);
    }
}