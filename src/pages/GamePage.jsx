import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Banner from '../components/common/Banner';
import Button from '../components/common/Button';
import { useT } from '../hooks/useT';
import { getGameById } from '../data/games';

import SnakeGame from '../games/snake/SnakeGame';
import MemoryGame from '../games/memory/MemoryGame';
import QuickMathGame from '../games/math/QuickMathGame';
import ReactionTimeGame from '../games/reactionTime/ReactionTimeGame';
import WhackAMoleGame from '../games/whackAMole/WhackAMoleGame';
import SlidingPuzzleGame from '../games/slidingPuzzle/SlidingPuzzleGame';
import AdventureGame from '../games/adventure/AdventureGame';
import NumberHuntGame from '../games/numberHunt/NumberHuntGame';
import ShapeMatchGame from '../games/shapeMatch/ShapeMatchGame';
import MemoryFlashGame from '../games/memoryFlash/MemoryFlashGame';
import NumberSequenceGame from '../games/numberSequence/NumberSequenceGame';
import EquationBuilderGame from '../games/equationBuilder/EquationBuilderGame';
import PongGame from '../games/pong/PongGame';
import BreakoutGame from '../games/breakout/BreakoutGame';
import TetrisGame from '../games/tetris/TetrisGame';
import PacmanGame from '../games/pacman/PacmanGame';
import TrainRunGame from '../games/runners/TrainRunGame';
import WindingPathGame from '../games/runners/WindingPathGame';
import RoofJumperGame from '../games/runners/RoofJumperGame';
import DarkRunGame from '../games/runners/DarkRunGame';
import JungleRunGame from '../games/runners/JungleRunGame';
import SnowRunGame from '../games/runners/SnowRunGame';
import CityRunGame from '../games/runners/CityRunGame';
import BrickJumperGame from '../games/runners/BrickJumperGame';
import UnderwaterGame from '../games/runners/UnderwaterGame';
import SpaceRunGame from '../games/runners/SpaceRunGame';
import GamePlaceholder from '../games/GamePlaceholder';

const BUILT_GAMES = {
  snake: SnakeGame,
  memory: MemoryGame,
  math: QuickMathGame,
  'reaction-time': ReactionTimeGame,
  'whack-a-mole': WhackAMoleGame,
  'sliding-puzzle': SlidingPuzzleGame,
  adventure: AdventureGame,
  'number-hunt': NumberHuntGame,
  'shape-match': ShapeMatchGame,
  'memory-flash': MemoryFlashGame,
  'number-sequence': NumberSequenceGame,
  'equation-builder': EquationBuilderGame,
  pong: PongGame,
  breakout: BreakoutGame,
  tetris: TetrisGame,
  pacman: PacmanGame,
  'train-run': TrainRunGame,
  'winding-path': WindingPathGame,
  'roof-jumper': RoofJumperGame,
  'dark-run': DarkRunGame,
  'jungle-run': JungleRunGame,
  'snow-run': SnowRunGame,
  'city-run': CityRunGame,
  'brick-jumper': BrickJumperGame,
  underwater: UnderwaterGame,
  'space-run': SpaceRunGame,
};

export default function GamePage() {
  const { gameId } = useParams();
  const { t } = useT();
  const navigate = useNavigate();
  const game = getGameById(gameId);

  if (!game) {
    return (
      <div className="min-h-screen">
        <Banner />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4 text-white drop-shadow-lg">{t('gameNotFound')}</h1>
          <Button variant="primary" onClick={() => navigate('/games')} icon={ArrowRight}>
            {t('common.backToGames')}
          </Button>
        </div>
      </div>
    );
  }

  const GameComponent = BUILT_GAMES[game.id];

  return (
    // hauteur = écran − bannière (repliée) → l'écran de jeu tient sans scroll
    <div style={{ minHeight: 'calc(100dvh - var(--banner-h, 60px))' }}>
      {/* Bannière repliée par défaut sur une page de jeu → max de place à l'écran du jeu */}
      <Banner defaultCollapsed />
      <main className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-2"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-3xl md:text-4xl">{game.emoji}</div>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-white drop-shadow-lg leading-tight">
                {t(`games.${game.id}.name`)}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 leading-tight">{game.name}</p>
            </div>
          </div>
          <Link to="/games">
            <Button variant="ghost" size="md" icon={ArrowRight}>
              {t('common.backToGames')}
            </Button>
          </Link>
        </motion.div>

        {/* Scène de jeu : min-height = écran − bannière − en-tête → le plateau (dimensionné
            par la hauteur de l'écran) domine le centre, centré, sans scroll ni vide. */}
        <div
          className="card-modern p-2 sm:p-4 md:p-5 relative overflow-hidden flex flex-col justify-center"
          style={{
            minHeight: 'calc(100dvh - var(--banner-h, 60px) - 134px)',
            background:
              'radial-gradient(circle at 10% 0%, rgba(255, 200, 230, 0.5), transparent 50%), radial-gradient(circle at 90% 100%, rgba(180, 220, 255, 0.5), transparent 55%), linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,250,253,0.95) 100%)',
          }}
        >
          {/* wrapper bloc w-full : redonne aux jeux (root max-w-* mx-auto) leur pleine largeur,
              sinon le mx-auto dans un parent flex annule le stretch et rétrécit le plateau. */}
          <div className="w-full">
            {GameComponent ? <GameComponent /> : <GamePlaceholder game={game} />}
          </div>
        </div>
      </main>
    </div>
  );
}
