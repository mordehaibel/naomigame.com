// Layout commun des jeux-plateau : le plateau occupe le maximum d'espace,
// les panneaux annexes (score, pièce suivante, difficulté, contrôles) sont
// regroupés dans une colonne latérale compacte au lieu d'être éparpillés.
//
//  - Mobile : colonne — stats en haut, plateau, puis annexes/contrôles en bas.
//  - Desktop (lg+) : rangée — grand plateau à gauche (flex-1), colonne latérale
//    compacte à droite (stats + annexes). Les contrôles tactiles restent en bas
//    (masqués en desktop via md:hidden dans chaque jeu) — passés dans `controls`.
//
// Props : stats, aside, controls = nœuds React (optionnels) ; children = le plateau.
export default function GameArena({ stats, aside, controls, children }) {
  return (
    <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-center gap-2 lg:gap-6">
      {/* stats : en haut sur mobile uniquement */}
      {stats && <div className="w-full lg:hidden">{stats}</div>}

      {/* Plateau — prend tout l'espace disponible */}
      <div className="flex-1 min-w-0 w-full flex items-center justify-center">
        {children}
      </div>

      {/* Colonne latérale : compacte à droite en desktop, bandeau en bas sur mobile */}
      {(stats || aside || controls) && (
        <div className="flex flex-col items-center gap-2 lg:gap-3 w-full lg:w-56 lg:shrink-0">
          {stats && <div className="hidden lg:block w-full">{stats}</div>}
          {aside}
          {controls}
        </div>
      )}
    </div>
  );
}
