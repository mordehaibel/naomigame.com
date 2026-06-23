import RunnerEngine from './RunnerEngine';

const config = {
  id: 'city-run',
  background: 'linear-gradient(180deg, #2F4F4F 0%, #4A5568 50%, #696969 100%)',
  character: '🏃',
  obstacles: ['🚗', '🚙', '🛵', '🚓', '🚕'],
  laneStyle: 'dashed',
  laneColor: 'rgba(255, 230, 0, 0.55)',
  canJump: false,
};

export default function CityRunGame() {
  return <RunnerEngine config={config} />;
}
