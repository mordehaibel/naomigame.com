import RunnerEngine from './RunnerEngine';

const config = {
  id: 'roof-jumper',
  background: 'linear-gradient(180deg, #FF6B6B 0%, #FF9A8B 40%, #4ECDC4 100%)',
  character: '🦘',
  obstacles: ['🕳️', '⬛', '🪜', '🏚️'],
  laneStyle: 'solid',
  laneColor: 'rgba(60, 40, 30, 0.55)',
  canJump: true,
};

export default function RoofJumperGame() {
  return <RunnerEngine config={config} />;
}
