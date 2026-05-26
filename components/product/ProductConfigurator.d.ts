declare module '@/components/product/ProductConfigurator' {
  import type { ComponentType } from 'react'
  import type { StorefrontProduct } from '@/lib/catalog-products'

  export interface ProductConfiguratorProps {
    product: StorefrontProduct
    variantId?: string
    metal: string
    sizeOrFit: string
    ringSize: string
    gemstoneValue: string
    shapeSlug: string
    hiphopCarat: string
    engravingMode: 'none' | 'custom'
    engravingText: string
    onMetalChange: (value: string) => void
    onVariantChange?: (value: string) => void
    onSizeOrFitChange: (value: string) => void
    onRingSizeChange?: (value: string) => void
    onGemstoneValueChange: (value: string) => void
    onShapeChange?: (value: string) => void
    onHiphopCaratChange: (value: string) => void
    onEngravingModeChange: (value: string) => void
    onEngravingTextChange: (value: string) => void
    onRingCategoryChange?: (value: string) => void
    priceFrom?: number
    metalComposition?: unknown
    metalCompositionColor?: string
  }

  const ProductConfigurator: ComponentType<ProductConfiguratorProps>
  export default ProductConfigurator
}
