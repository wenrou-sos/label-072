import { StatsCards } from '../components/Stats/StatsCards';
import { StatsCharts } from '../components/Stats/StatsCharts';

export const Statistics = () => {
  return (
    <div className="space-y-6">
      <StatsCards />
      <StatsCharts />
    </div>
  );
};
