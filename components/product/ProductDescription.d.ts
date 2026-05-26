declare module '@/components/product/ProductDescription' {
  import type { ComponentType } from 'react'

  export interface ProductDescriptionProps {
    text: string
    compact?: boolean
  }

  const ProductDescription: ComponentType<ProductDescriptionProps>
  export default ProductDescription
}
