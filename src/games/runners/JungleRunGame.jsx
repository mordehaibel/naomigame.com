import RunnerEngine from './RunnerEngine';

const config = {
  id: 'jungle-run',
  background: 'linear-gradient(180deg, #228B22 0%, #006400 60%, #2F4F2F 100%)',
  character: '🏃',
  obstacles: ['🌳', '🐅', '🐍', '🌴', '🦧'],
  laneStyle: 'dashed',
  laneColor: 'rgba(255, 255, 200, 0.35)',
  canJump: false,
};

export default function JungleRunGame() {
  return <RunnerEngine config={config} />;
}
