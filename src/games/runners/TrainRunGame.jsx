import RunnerEngine from './RunnerEngine';

const config = {
  id: 'train-run',
  background: 'linear-gradient(180deg, #1A1A2E 0%, #0F1419 70%, #2C3E50 100%)',
  character: '🏃',
  obstacles: ['🚂', '🚃', '🚆'],
  laneStyle: 'solid',
  laneColor: 'rgba(180, 180, 180, 0.35)',
  canJump: false,
};

export default function TrainRunGame() {
  return <RunnerEngine config={config} />;
}
