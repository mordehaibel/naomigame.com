import RunnerEngine from './RunnerEngine';

const config = {
  id: 'snow-run',
  background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 40%, #FFFFFF 100%)',
  character: '⛷️',
  obstacles: ['🌨️', '❄️', '🪨', '🌲'],
  laneStyle: 'solid',
  laneColor: 'rgba(150, 200, 230, 0.45)',
  canJump: false,
};

export default function SnowRunGame() {
  return <RunnerEngine config={config} />;
}
