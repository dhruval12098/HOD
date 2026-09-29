import { permanentRedirect } from 'next/navigation'
import { LEGACY_HIPHOP_REPLACEMENT_PATH } from '@/lib/legacy-hiphop'

export default function HipHopPage() {
  permanentRedirect(LEGACY_HIPHOP_REPLACEMENT_PATH)
}
