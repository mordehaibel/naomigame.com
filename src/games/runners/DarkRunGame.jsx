import RunnerEngine from './RunnerEngine';

const config = {
  id: 'dark-run',
  background: 'radial-gradient(ellipse at center 80%, rgba(255,180,80,0.25), transparent 50%), linear-gradient(180deg, #000 0%, #1A1A2E 100%)',
  character: '🏃',
  obstacles: ['👻', '🪦', '🦇', '🕯️'],
  laneStyle: 'dotted',
  laneColor: 'rgba(255, 200, 100, 0.25)',
  canJump: false,
};

export default function DarkRunGame() {
  return <RunnerEngine config={config} />;
}
