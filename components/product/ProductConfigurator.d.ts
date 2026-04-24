declare module '@/components/product/ProductConfigurator' {
  import type { ComponentType } from 'react'
  import type { StorefrontProduct } from '@/lib/catalog-products'

  export interface ProductConfiguratorProps {
    product: StorefrontProduct
    metal: string
    purity: string
    sizeOrFit: string
    gemstoneValue: string
    hiphopCarat: string
    engravingMode: 'none' | 'custom'
    engravingText: string
    onMetalChange: (value: string) => void
    onPurityChange: (value: string) => void
    onSizeOrFitChange: (value: string) => void
    onGemstoneValueChange: (value: string) => void
    onHiphopCaratChange: (value: string) => void
    onEngravingModeChange: (value: string) => void
    onEngravingTextChange: (value: string) => void
  }

  const ProductConfigurator: ComponentType<ProductConfiguratorProps>
  export default ProductConfigurator
}
