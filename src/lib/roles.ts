import { RoleData, RoleInfoData, RoleKey, RoleConfig, ROLE_SPECIALS } from './game-types';

export const ROLES: Record<RoleKey, RoleData> = {
  mafia: {
    label: 'المافيا', class: 'role-mafia', badge: 'badge-mafia',
    description: 'تعاون مع المافيا الأخرين باش تفوتو الليل',
    icon: '<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>'
  },
  civil: {
    label: 'مدني', class: 'role-civil', badge: 'badge-civil',
    description: 'حاول تكتشف المافيا مع الفريق قبل الفوات',
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
  },
  detective: {
    label: 'المحقق', class: 'role-detective', badge: 'badge-detective',
    description: 'كل ليلة تقدر تستفسر على شخص واحد',
    icon: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>'
  },
  doctor: {
    label: 'الدكتور', class: 'role-doctor', badge: 'badge-doctor',
    description: 'كل ليلة تقدر تنقذ شخص واحد من القتل',
    icon: '<path d="M9 12h6m-3-3v6"/><rect x="3" y="4" width="18" height="18" rx="2"/>'
  },
  chouafa: {
    label: 'الشوافة', class: 'role-chouafa', badge: 'badge-chouafa',
    description: 'قوتان سريتان لمرة واحدة: تقدر تقتل أو تنقذ من القتل',
    icon: '<circle cx="12" cy="12" r="9" stroke="currentColor" fill="none"/><circle cx="12" cy="12" r="4" stroke="currentColor" fill="none"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" stroke-width="1.5"/><path d="M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12" stroke="currentColor" stroke-width="1.5"/>'
  },
  laadoul: {
    label: 'العَدول', class: 'role-laadoul', badge: 'badge-laadoul',
    description: 'في الليلة الأولى يربط بين لاعبَين — إذا مات أحدهما مات الآخر',
    icon: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="1.5" fill="none"/>'
  },
  spy: {
    label: 'الجاسوس', class: 'role-spy', badge: 'badge-spy',
    description: 'تراقب التحركات الليلية وتعرف مين تحرك',
    icon: '<circle cx="12" cy="12" r="3"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>'
  },
  mayor: {
    label: 'العمدة', class: 'role-mayor', badge: 'badge-mayor',
    description: 'صوتك فالتصويت كيحسب بجوج',
    icon: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>'
  },
  avenger: {
    label: 'المنتقم', class: 'role-avenger', badge: 'badge-avenger',
    description: 'إلا متي تقدر تجر معاك لاعب آخر',
    icon: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'
  },
  impostor: {
    label: 'المتنكر', class: 'role-impostor', badge: 'badge-impostor',
    description: 'مدني ولكن كيبان مافيا للمحقق',
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
  },
  madman: {
    label: 'المجنون', class: 'role-madman', badge: 'badge-madman',
    description: 'الهدف ديالك هو الناس يصوتو عليك وتخرج',
    icon: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
  },
  oracle: {
    label: 'العراف', class: 'role-oracle', badge: 'badge-oracle',
    description: 'كتعرف واش جوج لاعبين من نفس الفريق أو لا',
    icon: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 4V2M11 20v-2M4 11H2M20 11h-2"/>'
  },
  mirror: {
    label: 'المرآة', class: 'role-mirror', badge: 'badge-mirror',
    description: 'مرة وحدة تقدر ترجع أي قدرة على صاحبها',
    icon: '<ellipse cx="12" cy="12" rx="11" ry="7"/><path d="M7 12v-2a5 5 0 0 1 10 0v2"/><path d="M7 12h10"/><path d="M7 12v2a5 5 0 0 0 10 0v-2"/>'
  },
  guard: {
    label: 'الحارس', class: 'role-guard', badge: 'badge-guard',
    description: 'حارس قوي كيدافع على اللاعبين',
    icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
  },
  witch: {
    label: 'الساحرة', class: 'role-witch', badge: 'badge-witch',
    description: 'عندها جرعة إنقاذ وجرعة قتل',
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
  },
  loneWolf: {
    label: 'الذئب الوحيد', class: 'role-loneWolf', badge: 'badge-loneWolf',
    description: 'كتلعب بوحدك ضد الجميع',
    icon: '<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>'
  }
};

export const ROLE_INFO: Record<string, RoleInfoData> = {
  mafia: {
    emoji: '🔴', label: 'المافيا', team: 'المافيا', teamClass: 'team-mafia',
    ability: 'كل ليلة كتختارو واحد اللاعبين باش تقتلو.',
    winCondition: 'المافيا كتربح إلا كان عددها مساوي ولا كتر من باقي اللاعبين.',
    description: 'تقتل لاعب كل ليلة وتحاول تخدع باقي اللاعبين.'
  },
  detective: {
    emoji: '🔵', label: 'المحقق', team: 'مدني', teamClass: 'team-civil',
    ability: 'كل ليلة تقدر تتحقق من واحد اللاعبين. كتعرف واش هو من المافيا أو لا.',
    winCondition: 'المدنيين كيربحو إلا قضاو على جميع المافيا.',
    description: 'كل ليلة تقدر تعرف واش لاعب من المافيا أو لا.'
  },
  doctor: {
    emoji: '🟡', label: 'الطبيب', team: 'مدني', teamClass: 'team-civil',
    ability: 'كل ليلة تقدر تحمي واحد اللاعبين من القتل.',
    winCondition: 'المدنيين كيربحو إلا قضاو على جميع المافيا.',
    description: 'تقدر تنقذ لاعب من الموت كل ليلة.'
  },
  chouafa: {
    emoji: '🟣', label: 'الشوافة', team: 'مدني', teamClass: 'team-civil',
    ability: 'قدرة قتل مرة وحدة وقدرة إنقاذ مرة وحدة طوال اللعبة. تقدر تحفظ لقدرات لروندات جايين. تقدر تستهدف أي لاعب حتى المافيا.',
    winCondition: 'المدنيين كيربحو إلا قضاو على جميع المافيا.',
    description: 'عندك قدرة قتل مرة وحدة وقدرة إنقاذ مرة وحدة طوال اللعبة.'
  },
  laadoul: {
    emoji: '⚪', label: 'العدل', team: 'مدني', teamClass: 'team-civil',
    ability: 'فالليلة الأولى كتختار جوج لاعبين. اللاعبين المختارين كيولو مرتبطين بشكل دائم. إلا مات واحد، الموت الثاني يموت معاه. إلا تنقذ واحد من القتل، التاني يتنقذ حتى هو.',
    winCondition: 'المدنيين كيربحو إلا قضاو على جميع المافيا.',
    description: 'كتربط جوج لاعبين. مصيرهم كيولي مرتبط حتى لنهاية اللعبة.'
  },
  spy: {
    emoji: '🟢', label: 'الجاسوس', team: 'مدني', teamClass: 'team-civil',
    ability: 'كل ليلة كتعرف شكون اللاعبين اللي خرجو من ديورهم. ولكن ما كتعرفش واش دارو تحديداً.',
    winCondition: 'المدنيين كيربحو إلا قضاو على جميع المافيا.',
    description: 'كتراقب التحركات فالليل وكتعرف شكون تحرك.'
  },
  mayor: {
    emoji: '🟠', label: 'العمدة', team: 'مدني', teamClass: 'team-civil',
    ability: 'صوتك فالتصويت كيحسب بجوج. هويتك تقدر تبقى سرية حتى للإفشاء.',
    winCondition: 'المدنيين كيربحو إلا قضاو على جميع المافيا.',
    description: 'الصوت ديالك أقوى من باقي اللاعبين.'
  },
  avenger: {
    emoji: '💣', label: 'المنتقم', team: 'مدني', teamClass: 'team-civil',
    ability: 'إلا تم قتلك، فوراً كتختار لاعب آخر يموت معاك.',
    winCondition: 'المدنيين كيربحو إلا قضاو على جميع المافيا.',
    description: 'إلا متي تقدر تجر معاك لاعب آخر.'
  },
  impostor: {
    emoji: '🎭', label: 'المتنكر', team: 'مدني', teamClass: 'team-civil',
    ability: 'كيبان كأنه من المافيا للمحقق.',
    winCondition: 'المدنيين كيربحو إلا قضاو على جميع المافيا.',
    description: 'مدني ولكن كيبان مافيا للمحقق.'
  },
  madman: {
    emoji: '🎲', label: 'المجنون', team: 'محايد', teamClass: 'team-neutral',
    ability: 'ما عندوش قدرات خاصة فالليل.',
    winCondition: 'كيتربح إلا تم التصويت عليه والإقصاء عن طريق التصويت العلني.',
    description: 'الهدف ديالك هو الناس يصوتو عليك وتخرج من اللعبة.'
  },
  oracle: {
    emoji: '🔮', label: 'العراف', team: 'مدني', teamClass: 'team-civil',
    ability: 'كل ليلة كتختار جوج لاعبين. كتعرف واش هوما من نفس الفريق أو لا.',
    winCondition: 'المدنيين كيربحو إلا قضاو على جميع المافيا.',
    description: 'كتعرف واش جوج لاعبين من نفس الفريق أو لا.'
  },
  mirror: {
    emoji: '🪞', label: 'المرآة', team: 'مدني', teamClass: 'team-civil',
    ability: 'مرة وحدة فاللعبة تقدر ترجع أي قدرة ليلية على صاحبها.',
    winCondition: 'المدنيين كيربحو إلا قضاو على جميع المافيا.',
    description: 'مرة وحدة تقدر ترجع أي قدرة على صاحبها.'
  },
  guard: {
    emoji: '⚔️', label: 'الحارس', team: 'مدني', teamClass: 'team-civil',
    ability: 'كل ليلة تقدر تحمي واحد اللاعبين. ما تقدرش تحمي نفس اللاعب ليلتين متتاليتين.',
    winCondition: 'المدنيين كيربحو إلا قضاو على جميع المافيا.',
    description: 'حارس قوي كيدافع على اللاعبين.'
  },
  witch: {
    emoji: '🧙', label: 'الساحرة', team: 'محايد', teamClass: 'team-neutral',
    ability: 'عندها جرعة إنقاذ وجرعة قتل. كل جرعة تقدر تستعملها مرة وحدة.',
    winCondition: '—',
    description: 'عندها جرعة إنقاذ وجرعة قتل.'
  },
  loneWolf: {
    emoji: '🐺', label: 'الذئب الوحيد', team: 'محايد', teamClass: 'team-neutral',
    ability: 'كل ليلة كتقتل واحد اللاعبين.',
    winCondition: 'كيتربح إلا بقى آخر لاعب حي فاللعبة.',
    description: 'كتلعب بوحدك ضد الجميع.'
  }
};

export function getCivilCount(players: number, roleConfig: RoleConfig) {
  const specialsSum = ROLE_SPECIALS.reduce((sum, r) => sum + (roleConfig[r as keyof RoleConfig] ? 1 : 0), 0);
  return players - roleConfig.mafia - specialsSum;
}

export function allocateRoles(n: number, roleConfig: RoleConfig): RoleKey[] {
  const r: RoleKey[] = [];
  for (let i = 0; i < roleConfig.mafia; i++) r.push('mafia');
  for (const key of ROLE_SPECIALS) {
    if (roleConfig[key as keyof RoleConfig]) r.push(key);
  }
  while (r.length < n) r.push('civil');
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
