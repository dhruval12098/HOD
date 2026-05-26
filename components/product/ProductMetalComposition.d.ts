declare module '@/components/product/ProductMetalComposition' {
  import type { ComponentType } from 'react'

  export interface ProductMetalCompositionProps {
    composition?: unknown
    fallbackColor?: string
    compact?: boolean
  }

  const ProductMetalComposition: ComponentType<ProductMetalCompositionProps>
  export default ProductMetalComposition
}
