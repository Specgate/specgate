export class SpecGateDocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpecGateDocumentError";
  }
}

export class DocumentNotFoundError extends SpecGateDocumentError {
  constructor(documentId: string) {
    super(`Document with ID ${documentId} not found.`);
    this.name = "DocumentNotFoundError";
  }
}

export class AssetNotFoundError extends SpecGateDocumentError {
  constructor(assetId: string) {
    super(`Asset with ID ${assetId} not found.`);
    this.name = "AssetNotFoundError";
  }
}
