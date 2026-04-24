export function getCollectionHref(categorySlug?: string | null) {
  return categorySlug ? `/${categorySlug}` : '/fine-jewellery'
}
