import RunnerEngine from './RunnerEngine';

const config = {
  id: 'underwater',
  background: 'linear-gradient(180deg, #4FC3F7 0%, #1E88E5 40%, #0D47A1 80%, #00008B 100%)',
  character: '🏊',
  obstacles: ['🦈', '🐙', '🪸', '🐡', '🐟'],
  laneStyle: 'dotted',
  laneColor: 'rgba(180, 230, 255, 0.4)',
  canJump: false,
};

export default function UnderwaterGame() {
  return <RunnerEngine config={config} />;
}
