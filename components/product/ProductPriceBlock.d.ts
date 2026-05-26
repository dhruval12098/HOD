declare module '@/components/product/ProductPriceBlock' {
  import type { ComponentType } from 'react'

  export interface ProductPriceBlockProps {
    priceFrom: number
    compact?: boolean
  }

  const ProductPriceBlock: ComponentType<ProductPriceBlockProps>
  export default ProductPriceBlock
}
