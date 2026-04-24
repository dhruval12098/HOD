import Loader from '@/components/home/Loader';

export default function Loading() {
  return <Loader mode="screen" minDurationMs={700} maxDurationMs={12000} />;
}
