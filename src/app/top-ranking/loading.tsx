import SkeletonTopRanking from '@/components/common/SkeletonTopRanking';

export default function TopRankingLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <SkeletonTopRanking />
    </div>
  );
}
