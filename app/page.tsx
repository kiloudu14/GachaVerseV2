import { GameLayout } from '@/components/layout/GameLayout';
import { MaintenanceScreen } from '@/components/layout/MaintenanceScreen';
import { MAINTENANCE_MODE } from '@/lib/maintenance';

export default function Home() {
  if (MAINTENANCE_MODE) return <MaintenanceScreen />;
  return <GameLayout />;
}
