import RunnerEngine from './RunnerEngine';

const config = {
  id: 'brick-jumper',
  background: 'linear-gradient(180deg, #4A4A4A 0%, #6B4423 50%, #8B6F47 100%)',
  character: '🏃',
  obstacles: ['🧱', '🪨', '⬜', '🪜'],
  laneStyle: 'solid',
  laneColor: 'rgba(255, 220, 180, 0.55)',
  canJump: true,
};

export default function BrickJumperGame() {
  return <RunnerEngine config={config} />;
}
