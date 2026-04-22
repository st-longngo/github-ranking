import SkeletonTopRanking from '@/components/common/SkeletonTopRanking';

export default function TopRankingLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SkeletonTopRanking />
    </div>
  );
}
