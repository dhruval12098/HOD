type CatalogPublicationRecord = {
  status?: string | null
}

/**
 * The deployed catalogue schema publishes taxonomy records through their
 * existing `status` field. Keep this rule separate from product availability:
 * active taxonomy destinations may intentionally be empty while the catalogue
 * is being populated.
 */
export function isPublicCatalogTaxonomy(record: CatalogPublicationRecord) {
  return record.status === 'active'
}
