export const TOURNAMENT = {
  name: 'Kavins Intra Club Tournament',
  organizer: 'Jose',
  venue: 'Kavins Academy',
  date: '11 July 2025',
  time: '10:00 AM – 3:00 PM',
  type: 'Doubles',
  categories: ["Men's", "Women's", 'Mixed', '50+'],
  courts: 3,
  format: 'League + Knockout',
  teams: 42,
  pools: 8,
  knockoutFrom: 'Round of 16',
  status: 'Setup Pending',
}

export type Category = "Men's" | "Women's" | 'Mixed' | '50+'

export interface Team {
  id: number
  p1: string; p1id: string
  p2: string; p2id: string
  seeded: boolean; seed?: number
  category: Category
}

export const TEAMS: Team[] = [
  // Seeds 1–8
  { id:1,  p1:'Rajesh',     p1id:'BD10231', p2:'Hari',        p2id:'BD10232', seeded:true,  seed:1, category:"Men's" },
  { id:2,  p1:'Vignesh',    p1id:'BD10233', p2:'Manoj',       p2id:'BD10234', seeded:true,  seed:2, category:"Men's" },
  { id:3,  p1:'Suresh',     p1id:'BD10235', p2:'Kiran',       p2id:'BD10236', seeded:true,  seed:3, category:"Men's" },
  { id:4,  p1:'Deepak',     p1id:'BD10237', p2:'Anand',       p2id:'BD10238', seeded:true,  seed:4, category:"Men's" },
  { id:5,  p1:'Ravi',       p1id:'BD10239', p2:'Sathish',     p2id:'BD10240', seeded:true,  seed:5, category:'Mixed' },
  { id:6,  p1:'Ganesh',     p1id:'BD10241', p2:'Murugan',     p2id:'BD10242', seeded:true,  seed:6, category:'Mixed' },
  { id:7,  p1:'Pradeep',    p1id:'BD10243', p2:'Senthil',     p2id:'BD10244', seeded:true,  seed:7, category:'50+' },
  { id:8,  p1:'Arun',       p1id:'BD10245', p2:'Vijay',       p2id:'BD10246', seeded:true,  seed:8, category:'50+' },
  // Men's non-seeds
  { id:9,  p1:'Raju',       p1id:'BD10247', p2:'Arul',        p2id:'BD10248', seeded:false, category:"Men's" },
  { id:10, p1:'Jose',       p1id:'BD10249', p2:'Harsha',      p2id:'BD10250', seeded:false, category:"Men's" },
  { id:11, p1:'Arjun',      p1id:'BD10251', p2:'Srihari',     p2id:'BD10252', seeded:false, category:"Men's" },
  { id:12, p1:'Karthik',    p1id:'BD10253', p2:'Praveen',     p2id:'BD10254', seeded:false, category:"Men's" },
  { id:13, p1:'Surya',      p1id:'BD10255', p2:'Ajay',        p2id:'BD10256', seeded:false, category:"Men's" },
  { id:14, p1:'Akash',      p1id:'BD10257', p2:'Dinesh',      p2id:'BD10258', seeded:false, category:"Men's" },
  { id:15, p1:'Bala',       p1id:'BD10259', p2:'Naveen',      p2id:'BD10260', seeded:false, category:"Men's" },
  { id:16, p1:'Rahul',      p1id:'BD10261', p2:'Vinoth',      p2id:'BD10262', seeded:false, category:"Men's" },
  { id:17, p1:'Muthu',      p1id:'BD10263', p2:'Selvam',      p2id:'BD10264', seeded:false, category:"Men's" },
  { id:31, p1:'Saravanan',  p1id:'BD10291', p2:'Ponraj',      p2id:'BD10292', seeded:false, category:"Men's" },
  { id:32, p1:'Anbu',       p1id:'BD10293', p2:'Selva',       p2id:'BD10294', seeded:false, category:"Men's" },
  { id:33, p1:'Thiagu',     p1id:'BD10295', p2:'Muthukumar',  p2id:'BD10296', seeded:false, category:"Men's" },
  { id:37, p1:'Bharath',    p1id:'BD10303', p2:'Nirmal',      p2id:'BD10304', seeded:false, category:"Men's" },
  { id:40, p1:'Aswin',      p1id:'BD10309', p2:'Jeevan',      p2id:'BD10310', seeded:false, category:"Men's" },
  // Mixed non-seeds
  { id:18, p1:'Pandi',      p1id:'BD10265', p2:'Vel',         p2id:'BD10266', seeded:false, category:'Mixed' },
  { id:19, p1:'Ramesh',     p1id:'BD10267', p2:'Kumaran',     p2id:'BD10268', seeded:false, category:'Mixed' },
  { id:20, p1:'Sekar',      p1id:'BD10269', p2:'Bose',        p2id:'BD10270', seeded:false, category:'Mixed' },
  { id:21, p1:'Nathan',     p1id:'BD10271', p2:'Kavin',       p2id:'BD10272', seeded:false, category:'Mixed' },
  { id:22, p1:'Durai',      p1id:'BD10273', p2:'Prakash',     p2id:'BD10274', seeded:false, category:'Mixed' },
  { id:23, p1:'Mani',       p1id:'BD10275', p2:'Shankar',     p2id:'BD10276', seeded:false, category:'Mixed' },
  { id:24, p1:'Aravind',    p1id:'BD10277', p2:'Cheran',      p2id:'BD10278', seeded:false, category:'Mixed' },
  { id:25, p1:'Babu',       p1id:'BD10279', p2:'Sundaram',    p2id:'BD10280', seeded:false, category:'Mixed' },
  { id:34, p1:'Pandian',    p1id:'BD10297', p2:'Arumugam',    p2id:'BD10298', seeded:false, category:'Mixed' },
  { id:35, p1:'Sathya',     p1id:'BD10299', p2:'Vasanth',     p2id:'BD10300', seeded:false, category:'Mixed' },
  { id:39, p1:'Sudhan',     p1id:'BD10307', p2:'Gowri',       p2id:'BD10308', seeded:false, category:'Mixed' },
  // 50+ non-seeds
  { id:26, p1:'Gopal',      p1id:'BD10281', p2:'Siva',        p2id:'BD10282', seeded:false, category:'50+' },
  { id:27, p1:'Sriram',     p1id:'BD10283', p2:'Balaji',      p2id:'BD10284', seeded:false, category:'50+' },
  { id:28, p1:'Elavarasan', p1id:'BD10285', p2:'Jegan',       p2id:'BD10286', seeded:false, category:'50+' },
  { id:29, p1:'Vinay',      p1id:'BD10287', p2:'Mohan',       p2id:'BD10288', seeded:false, category:'50+' },
  { id:30, p1:'Harish',     p1id:'BD10289', p2:'Nithish',     p2id:'BD10290', seeded:false, category:'50+' },
  { id:36, p1:'Sendhil',    p1id:'BD10301', p2:'Logesh',      p2id:'BD10302', seeded:false, category:'50+' },
  { id:38, p1:'Jeeva',      p1id:'BD10305', p2:'Tamilarasan', p2id:'BD10306', seeded:false, category:'50+' },
  { id:41, p1:'Mahesh',     p1id:'BD10311', p2:'Dineshkumar', p2id:'BD10312', seeded:false, category:'50+' },
  { id:42, p1:'Prabu',      p1id:'BD10313', p2:'Velu',        p2id:'BD10314', seeded:false, category:'50+' },
]

export interface Pool {
  id: string; label: string
  teams: number[]
  category: Category
}

export const POOLS: Pool[] = [
  { id:'A', label:'Pool A', teams:[1,9,10,11,13],    category:"Men's" },
  { id:'B', label:'Pool B', teams:[2,14,15,16,17],   category:"Men's" },
  { id:'C', label:'Pool C', teams:[3,31,32,33,37],   category:"Men's" },
  { id:'D', label:'Pool D', teams:[4,40,12,9,13],    category:"Men's" },
  { id:'E', label:'Pool E', teams:[5,18,19,20,21],   category:'Mixed' },
  { id:'F', label:'Pool F', teams:[6,22,23,24,25],   category:'Mixed' },
  { id:'G', label:'Pool G', teams:[7,26,27,28,29],   category:'50+' },
  { id:'H', label:'Pool H', teams:[8,30,36,38,41],   category:'50+' },
]

// Category → pool IDs
export const CAT_POOLS: Record<Category, string[]> = {
  "Men's":   ['A','B','C','D'],
  "Women's": [],
  'Mixed':   ['E','F'],
  '50+':     ['G','H'],
}

export function teamLabel(id: number): string {
  const t = TEAMS.find(t => t.id === id)
  return t ? `${t.p1} & ${t.p2}` : '—'
}

export interface Match {
  id: string; poolId: string; court: number
  t1: number; t2: number
  status: 'Scheduled'|'Live'|'Completed'
  s1?: number[]; s2?: number[]; winner?: number
  time?: string; orderOfPlay?: number
}

export const LEAGUE_MATCHES: Match[] = [
  // Pool A (Men's)
  { id:'A1', poolId:'A', court:1, t1:1,  t2:9,  status:'Completed', s1:[21,15], s2:[15,10], winner:1,  time:'10:00', orderOfPlay:1 },
  { id:'A2', poolId:'A', court:2, t1:10, t2:11, status:'Completed', s1:[21,18], s2:[18,21], winner:11, time:'10:00', orderOfPlay:2 },
  { id:'A3', poolId:'A', court:3, t1:12, t2:13, status:'Completed', s1:[21,19], s2:[19,21], winner:12, time:'10:00', orderOfPlay:3 },
  { id:'A4', poolId:'A', court:1, t1:1,  t2:10, status:'Completed', s1:[21,12], s2:[12,8],  winner:1,  time:'10:40', orderOfPlay:4 },
  { id:'A5', poolId:'A', court:2, t1:9,  t2:11, status:'Live',      s1:[11],    s2:[14],                time:'11:20', orderOfPlay:5 },
  { id:'A6', poolId:'A', court:3, t1:12, t2:1,  status:'Scheduled',                                     time:'12:00', orderOfPlay:6 },
  // Pool B (Men's)
  { id:'B1', poolId:'B', court:1, t1:2,  t2:14, status:'Completed', s1:[21,15], s2:[15,12], winner:2,  time:'10:00', orderOfPlay:7 },
  { id:'B2', poolId:'B', court:2, t1:15, t2:16, status:'Completed', s1:[19,21], s2:[21,18], winner:16, time:'10:00', orderOfPlay:8 },
  { id:'B3', poolId:'B', court:3, t1:17, t2:14, status:'Scheduled',                                     time:'10:40', orderOfPlay:9 },
  { id:'B4', poolId:'B', court:1, t1:2,  t2:15, status:'Scheduled',                                     time:'11:20', orderOfPlay:10 },
  // Pool C (Men's)
  { id:'C1', poolId:'C', court:2, t1:3,  t2:31, status:'Completed', s1:[21,13], s2:[13,9],  winner:3,  time:'10:00', orderOfPlay:11 },
  { id:'C2', poolId:'C', court:3, t1:32, t2:33, status:'Scheduled',                                     time:'10:40', orderOfPlay:12 },
  // Pool D (Men's)
  { id:'D1', poolId:'D', court:1, t1:4,  t2:40, status:'Completed', s1:[21,16], s2:[16,11], winner:4,  time:'10:00', orderOfPlay:13 },
  { id:'D2', poolId:'D', court:2, t1:12, t2:13, status:'Scheduled',                                     time:'10:40', orderOfPlay:14 },
  // Pool E (Mixed)
  { id:'E1', poolId:'E', court:3, t1:5,  t2:18, status:'Completed', s1:[21,18], s2:[18,14], winner:5,  time:'10:00', orderOfPlay:15 },
  { id:'E2', poolId:'E', court:1, t1:19, t2:20, status:'Scheduled',                                     time:'10:40', orderOfPlay:16 },
  { id:'E3', poolId:'E', court:2, t1:21, t2:5,  status:'Scheduled',                                     time:'11:20', orderOfPlay:17 },
  // Pool F (Mixed)
  { id:'F1', poolId:'F', court:3, t1:6,  t2:22, status:'Completed', s1:[21,11], s2:[11,8],  winner:6,  time:'10:00', orderOfPlay:18 },
  { id:'F2', poolId:'F', court:1, t1:23, t2:24, status:'Scheduled',                                     time:'10:40', orderOfPlay:19 },
  // Pool G (50+)
  { id:'G1', poolId:'G', court:2, t1:7,  t2:26, status:'Completed', s1:[21,15], s2:[15,9],  winner:7,  time:'10:00', orderOfPlay:20 },
  { id:'G2', poolId:'G', court:3, t1:27, t2:28, status:'Scheduled',                                     time:'10:40', orderOfPlay:21 },
  // Pool H (50+)
  { id:'H1', poolId:'H', court:1, t1:8,  t2:30, status:'Completed', s1:[21,10], s2:[10,7],  winner:8,  time:'10:00', orderOfPlay:22 },
  { id:'H2', poolId:'H', court:2, t1:36, t2:38, status:'Scheduled',                                     time:'10:40', orderOfPlay:23 },
]

export interface StandingsRow {
  teamId:number; played:number; won:number; lost:number
  ptWon:number; ptLost:number; diff:number; lp:number
}

export function buildStandings(poolId: string, matches: Match[], pools: Pool[]): StandingsRow[] {
  const pool = pools.find(p => p.id === poolId)
  if (!pool) return []
  const rows: Record<number, StandingsRow> = {}
  pool.teams.forEach(id => {
    rows[id] = { teamId:id, played:0, won:0, lost:0, ptWon:0, ptLost:0, diff:0, lp:0 }
  })
  matches.filter(m => m.poolId === poolId && m.status === 'Completed').forEach(m => {
    const pw = (m.s1||[]).reduce((a,b)=>a+b,0)
    const pl = (m.s2||[]).reduce((a,b)=>a+b,0)
    if (rows[m.t1]) { rows[m.t1].played++; rows[m.t1].ptWon+=pw; rows[m.t1].ptLost+=pl; if(m.winner===m.t1){rows[m.t1].won++;rows[m.t1].lp+=2}else rows[m.t1].lost++ }
    if (rows[m.t2]) { rows[m.t2].played++; rows[m.t2].ptWon+=pl; rows[m.t2].ptLost+=pw; if(m.winner===m.t2){rows[m.t2].won++;rows[m.t2].lp+=2}else rows[m.t2].lost++ }
  })
  return Object.values(rows).map(r=>({...r,diff:r.ptWon-r.ptLost})).sort((a,b)=>b.lp-a.lp||b.diff-a.diff)
}

export interface KnockoutMatch {
  id:string; round:'R16'|'QF'|'SF'|'F'; matchNo:number
  t1:number|null; t2:number|null; winner:number|null; score?:string; status:'Pending'|'Live'|'Completed'
}

export const INITIAL_BRACKET: KnockoutMatch[] = [
  { id:'R16-1', round:'R16', matchNo:1, t1:1,  t2:16, winner:1,  score:'21-15, 21-18', status:'Completed' },
  { id:'R16-2', round:'R16', matchNo:2, t1:21, t2:2,  winner:2,  score:'15-21, 18-21', status:'Completed' },
  { id:'R16-3', round:'R16', matchNo:3, t1:3,  t2:18, winner:3,  score:'21-12, 21-14', status:'Completed' },
  { id:'R16-4', round:'R16', matchNo:4, t1:17, t2:4,  winner:4,  score:'14-21, 11-21', status:'Completed' },
  { id:'R16-5', round:'R16', matchNo:5, t1:5,  t2:12, winner:5,  score:'21-17, 21-19', status:'Completed' },
  { id:'R16-6', round:'R16', matchNo:6, t1:39, t2:6,  winner:6,  score:'13-21, 10-21', status:'Completed' },
  { id:'R16-7', round:'R16', matchNo:7, t1:7,  t2:14, winner:7,  score:'21-16, 21-13', status:'Completed' },
  { id:'R16-8', round:'R16', matchNo:8, t1:29, t2:8,  winner:8,  score:'12-21, 9-21',  status:'Completed' },
  { id:'QF-1',  round:'QF',  matchNo:1, t1:1,  t2:4,  winner:1,  score:'21-18, 19-21, 21-16', status:'Completed' },
  { id:'QF-2',  round:'QF',  matchNo:2, t1:2,  t2:3,  winner:10, score:'21-19, 21-17',         status:'Completed' },
  { id:'QF-3',  round:'QF',  matchNo:3, t1:5,  t2:8,  winner:5,  score:'21-15, 21-12',         status:'Completed' },
  { id:'QF-4',  round:'QF',  matchNo:4, t1:6,  t2:7,  winner:10, score:'18-21, 13-21',         status:'Completed' },
  { id:'SF-1',  round:'SF',  matchNo:1, t1:1,  t2:10, winner:1,  score:'21-19, 18-21, 21-17',  status:'Completed' },
  { id:'SF-2',  round:'SF',  matchNo:2, t1:5,  t2:10, winner:10, score:'17-21, 21-18, 21-19',  status:'Completed' },
  { id:'F-1',   round:'F',   matchNo:1, t1:1,  t2:10, winner:null, score:'', status:'Live' },
]

export const POOL_COLORS: Record<string, string> = {
  A:'#1565C0', B:'#7B1FA2', C:'#00897B', D:'#E65100',
  E:'#1B5E20', F:'#880E4F', G:'#0D47A1', H:'#4A148C', I:'#BF360C',
}

export const CAT_COLORS: Record<string, { bg:string; text:string }> = {
  "Men's":   { bg:'#E3F2FD', text:'#1565C0' },
  "Women's": { bg:'#FCE4EC', text:'#C62828' },
  'Mixed':   { bg:'#F3E5F5', text:'#7B1FA2' },
  '50+':     { bg:'#E0F2F1', text:'#00897B' },
}
