import RunnerEngine from './RunnerEngine';

const config = {
  id: 'winding-path',
  background: 'linear-gradient(180deg, #654321 0%, #8B6F47 50%, #A0826D 100%)',
  character: '🏃‍♂️',
  obstacles: ['🪨', '🌳', '🌿', '🪵'],
  laneStyle: 'dotted',
  laneColor: 'rgba(255, 220, 150, 0.5)',
  canJump: false,
};

export default function WindingPathGame() {
  return <RunnerEngine config={config} />;
}
