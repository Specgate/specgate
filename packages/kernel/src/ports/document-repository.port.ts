import { type DocumentAggregate } from "../../../domain/src/documents/document.aggregate";
import {
  type DocumentLinkEntityType,
  type DocumentType,
} from "../../../domain/src/documents/document.types";

export interface DocumentRepoPort {
  create(document: DocumentAggregate): Promise<void>;
  save(document: DocumentAggregate): Promise<void>;
  findById(
    tenantId: string,
    documentId: string,
    opts?: { includeArchived?: boolean }
  ): Promise<DocumentAggregate | null>;
  findByTypeAndEntityLink(
    tenantId: string,
    type: DocumentType,
    entityType: DocumentLinkEntityType,
    entityId: string
  ): Promise<DocumentAggregate | null>;
}
