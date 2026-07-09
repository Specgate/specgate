import { describe, it, expect, beforeEach, vi } from "vitest";
import { DocumentsUseCases } from "./documents.use-cases";
import type { IDocumentRepository } from "../ports/document.repository";
import type { ObjectStoragePort } from "@corely/kernel";

describe("DocumentsUseCases", () => {
  let repository: IDocumentRepository;
  let storage: ObjectStoragePort;
  let useCases: DocumentsUseCases;

  const mockCtx = { tenantId: "tenant-1", userId: "user-1" };
  const mockProjectId = "project-1";

  beforeEach(() => {
    repository = {
      createDocument: vi.fn(),
      updateDocument: vi.fn(),
      getDocumentById: vi.fn(),
      listDocuments: vi.fn(),
      deleteDocument: vi.fn(),
      createAsset: vi.fn(),
      deleteAsset: vi.fn(),
      getAssetById: vi.fn(),
      linkDocumentToSpec: vi.fn(),
      unlinkDocumentFromSpec: vi.fn(),
      getSpecDocumentLink: vi.fn(),
      listSpecRelatedDocuments: vi.fn(),
    } as unknown as IDocumentRepository;

    storage = {
      putObject: vi.fn(),
      removeObject: vi.fn(),
      getObjectBuffer: vi.fn(),
      createSignedDownloadUrl: vi.fn(),
      provider: vi.fn().mockReturnValue("mock"),
    } as unknown as ObjectStoragePort;

    useCases = new DocumentsUseCases(repository, undefined, storage);
  });

  describe("uploadDocumentAsset", () => {
    it("should reject files larger than 25MB", async () => {
      await expect(
        useCases.uploadDocumentAsset(mockCtx, mockProjectId, null, {
          fileName: "large.pdf",
          contentType: "application/pdf",
          sizeBytes: 30 * 1024 * 1024,
          bytes: Buffer.from("test"),
        })
      ).rejects.toThrow("File is too large.");
    });

    it("should reject unsupported file types", async () => {
      await expect(
        useCases.uploadDocumentAsset(mockCtx, mockProjectId, null, {
          fileName: "malicious.exe",
          contentType: "application/x-msdownload",
          sizeBytes: 1024,
          bytes: Buffer.from("test"),
        })
      ).rejects.toThrow("Unsupported file type");
    });

    it("should upload supported file types and create an asset", async () => {
      const mockAsset = { id: "asset-1", storageKey: "key-1" };
      (repository.createAsset as import("vitest").Mock).mockResolvedValue(mockAsset);

      const result = await useCases.uploadDocumentAsset(mockCtx, mockProjectId, null, {
        fileName: "test.png",
        contentType: "image/png",
        sizeBytes: 1024,
        bytes: Buffer.from("test"),
      });

      expect(storage.putObject).toHaveBeenCalled();
      expect(repository.createAsset).toHaveBeenCalled();
      expect(result.data.asset).toEqual(mockAsset);
    });
  });

  describe("listSpecRelatedDocuments", () => {
    it("should map assets with signed URLs", async () => {
      const mockLinks = [
        {
          id: "link-1",
          document: {
            id: "doc-1",
            assets: [
              { id: "asset-1", storageKey: "key-1" }
            ]
          }
        }
      ];
      (repository.listSpecRelatedDocuments as import("vitest").Mock).mockResolvedValue(mockLinks);
      (storage.createSignedDownloadUrl as import("vitest").Mock).mockResolvedValue({ url: "https://signed.url" });

      const result = await useCases.listSpecRelatedDocuments(mockCtx, mockProjectId, "spec-1");

      expect(result.data[0].document!.assets![0].url).toBe("https://signed.url");
      expect(storage.createSignedDownloadUrl).toHaveBeenCalledWith(
        expect.objectContaining({ objectKey: "key-1" })
      );
    });
  });
});
