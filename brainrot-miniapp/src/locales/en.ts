const en = {
  'nav.home': 'Cases', 'nav.games': 'Games', 'nav.farm': 'Farm', 'nav.shop': 'Shop', 'nav.quests': 'Quests', 'nav.profile': 'Profile',
  'common.loading': 'Loading…', 'common.error': 'Something went wrong', 'common.retry': 'Try again', 'common.close': 'Close',
  'common.bet': 'Bet', 'common.play': 'Play', 'common.cashout': 'Cash out', 'common.win': 'You won', 'common.lose': 'You lost',
  'common.notEnough': 'Not enough coins', 'common.level': 'Lv', 'common.empty': 'Nothing here yet', 'common.max': 'Max', 'common.again': 'Play again',
  'common.payout': 'Payout',
  'home.live': 'Live drops', 'home.cases': 'Cases', 'home.liveEmpty': 'Drops will appear here',
  'case.contains': 'What you can get', 'case.open': 'Open for', 'case.opening': 'Opening…', 'case.won': 'You got', 'case.openAgain': 'Open again', 'case.sold': 'Worth',
  'games.upgrade': 'Upgrade', 'games.crash': 'Rocket', 'games.mines': 'Mines', 'games.tower': 'Tower', 'games.battle': 'Battle',
  'upgrade.chance': 'Chance', 'upgrade.multiplier': 'Multiplier', 'upgrade.go': 'Upgrade',
  'crash.auto': 'Auto cash out at', 'crash.crashed': 'Crashed at', 'crash.launch': 'Launch',
  'mines.count': 'Mines', 'mines.start': 'Start game', 'mines.hint': 'Open safe tiles, avoid mines',
  'tower.level': 'Floor', 'tower.start': 'Start climbing', 'tower.hint': 'Pick a safe tile on every floor',
  'battle.find': 'Find opponent', 'battle.you': 'You', 'battle.opponent': 'Opponent', 'battle.hint': 'Highest roll takes the pot',
  'farm.title': 'Farm & Base', 'farm.pending': 'Ready to collect', 'farm.perHour': 'per hour', 'farm.collect': 'Collect coins', 'farm.collected': 'Collected',
  'farm.noEnergy': 'No energy left. Come back later', 'farm.base': 'Base level', 'farm.energy': 'Energy',
  'shop.title': 'Shop', 'shop.buy': 'Buy', 'shop.owned': 'Owned', 'shop.bought': 'Purchased',
  'quests.title': 'Quests', 'quests.claim': 'Claim', 'quests.claimed': 'Claimed', 'quests.reward': 'Reward',
  'profile.title': 'Profile', 'profile.stats': 'Statistics', 'profile.cases': 'Cases opened', 'profile.won': 'Total won', 'profile.games': 'Games played', 'profile.hidden': 'Hidden',
  'settings.title': 'Settings', 'settings.sound': 'Sound', 'settings.streamer': 'Streamer mode', 'settings.streamerHint': 'Hides your name and balance',
  'settings.hideStats': 'Hide statistics', 'settings.language': 'Language', 'settings.theme': 'Theme', 'settings.dark': 'Dark', 'settings.light': 'Light',
  'settings.saveError': 'Could not save settings',
} as const;
export type TKey = keyof typeof en;
export type Dict = Record<TKey, string>;
export default en as Dict;
