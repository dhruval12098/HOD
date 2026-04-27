import Loader from '@/components/home/Loader';

export default function Loading() {
  return <Loader ready={false} minDurationMs={500} maxDurationMs={12000} />;
}
