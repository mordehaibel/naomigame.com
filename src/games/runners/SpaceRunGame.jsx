import RunnerEngine from './RunnerEngine';

const config = {
  id: 'space-run',
  background: 'radial-gradient(ellipse at top, #1a0033 0%, #000 70%), linear-gradient(180deg, #0a0a23 0%, #000000 100%)',
  character: '🚀',
  obstacles: ['☄️', '🪐', '👽', '🛸', '⭐'],
  laneStyle: 'dashed',
  laneColor: 'rgba(255, 255, 255, 0.25)',
  canJump: false,
};

export default function SpaceRunGame() {
  return <RunnerEngine config={config} />;
}
