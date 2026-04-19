export type GemStyle =
  | 'round' | 'pear' | 'oval' | 'emerald' | 'trilogy'
  | 'row' | 'eternity' | 'chain' | 'tennis' | 'grillz'
  | 'cross' | 'signet';

export interface Product {
  id: number;
  slug: string;
  name: string;
  category: 'fine' | 'hiphop';
  type: string;
  stone: string;
  cut: string;
  metals: string[];
  priceFrom: number;
  carat: string;
  featured: boolean;
  isNew: boolean;
  shortMeta: string;
  gemColor: string;
  gemStyle: GemStyle;
  imageUrl?: string;
  galleryUrls?: string[];
  videoUrl?: string;
}

const BASE_PRODUCTS: Product[] = [
  { id:1,  slug:'halo-solitaire-ring',   name:'Halo Solitaire Ring',      category:'fine',   type:'ring',     stone:'cvd-colourless', cut:'round',   metals:['18k-rose','18k-white','platinum'], priceFrom:2800,  carat:'1.2 ct',      featured:true,  isNew:false, shortMeta:'CVD · 1.2ct · 18K Rose',    gemColor:'#D4A840', gemStyle:'round'   },
  { id:2,  slug:'teardrop-pendant',      name:'Teardrop Pendant',         category:'fine',   type:'pendant',  stone:'cvd-colourless', cut:'pear',    metals:['18k-yellow','18k-white'],        priceFrom:1600,  carat:'0.9 ct',      featured:true,  isNew:true,  shortMeta:'CVD · 0.9ct · 18K Yellow',  gemColor:'#D4A840', gemStyle:'pear'    },
  { id:3,  slug:'tennis-bracelet-4ct',   name:'Tennis Bracelet',          category:'fine',   type:'bracelet', stone:'cvd-colourless', cut:'round',   metals:['14k','18k-white','platinum'],    priceFrom:4200,  carat:'4.0 ct',      featured:true,  isNew:false, shortMeta:'CVD · 4ct · 14K',           gemColor:'#D4A840', gemStyle:'row'     },
  { id:4,  slug:'fancy-yellow-trilogy',  name:'Fancy Yellow Trilogy',     category:'fine',   type:'ring',     stone:'natural-fancy',  cut:'cushion', metals:['18k-yellow'],                    priceFrom:12400, carat:'2.0 ct total',featured:true,  isNew:true,  shortMeta:'Natural Fancy · 18K Yellow', gemColor:'#E8C84A', gemStyle:'trilogy' },
  { id:5,  slug:'pear-drop-necklace',    name:'Pear Drop Necklace',       category:'fine',   type:'necklace', stone:'cvd-colourless', cut:'pear',    metals:['18k-white','18k-yellow'],        priceFrom:2100,  carat:'1.1 ct',      featured:true,  isNew:false, shortMeta:'CVD · 1.1ct · 18K',         gemColor:'#D4A840', gemStyle:'pear'    },
  { id:6,  slug:'eternity-band',         name:'Diamond Eternity Band',    category:'fine',   type:'ring',     stone:'cvd-colourless', cut:'round',   metals:['18k-white','18k-yellow','platinum'],priceFrom:3200,carat:'1.5 ct',     featured:true,  isNew:false, shortMeta:'CVD · Full Set · 18K',      gemColor:'#D4A840', gemStyle:'eternity'},
  { id:7,  slug:'emerald-cut-solitaire', name:'Emerald Cut Solitaire',    category:'fine',   type:'ring',     stone:'natural-colourless', cut:'emerald-cut', metals:['platinum','18k-white'], priceFrom:14800, carat:'2.0 ct', featured:false, isNew:true, shortMeta:'Natural · 2ct · Platinum', gemColor:'#D4A840', gemStyle:'emerald' },
  { id:8,  slug:'oval-halo-earrings',    name:'Oval Halo Earrings',       category:'fine',   type:'earring',  stone:'natural-colourless', cut:'oval', metals:['18k-white','18k-rose'], priceFrom:7800, carat:'1.8 ct pair', featured:false, isNew:false, shortMeta:'Natural · 1.8ct pair · 18K', gemColor:'#D4A840', gemStyle:'oval' },
  { id:9,  slug:'cuban-link-chain-iced', name:'Iced Cuban Link Chain',    category:'hiphop', type:'chain',    stone:'cvd-colourless', cut:'round',   metals:['14k','18k-yellow'],              priceFrom:6800,  carat:'12 ct',       featured:true,  isNew:true,  shortMeta:'Full Iced · 14K · 12ct',    gemColor:'#D4A840', gemStyle:'chain'   },
  { id:10, slug:'baguette-grillz',       name:'Baguette Grillz Top Row',  category:'hiphop', type:'grillz',   stone:'cvd-colourless', cut:'baguette',metals:['14k','18k-yellow'],              priceFrom:2400,  carat:'4 ct',        featured:true,  isNew:false, shortMeta:'Baguette · 4ct · 14K',      gemColor:'#D4A840', gemStyle:'grillz'  },
  { id:11, slug:'tennis-chain-hiphop',   name:'Tennis Chain',             category:'hiphop', type:'chain',    stone:'cvd-colourless', cut:'round',   metals:['14k','18k-white'],              priceFrom:3600,  carat:'8 ct',        featured:true,  isNew:false, shortMeta:'4-prong · 8ct · 20"',       gemColor:'#D4A840', gemStyle:'tennis'  },
  { id:12, slug:'diamond-pendant-cross', name:'Diamond Cross Pendant',    category:'hiphop', type:'pendant',  stone:'cvd-colourless', cut:'round',   metals:['14k','18k-yellow'],              priceFrom:2800,  carat:'5 ct',        featured:false, isNew:true,  shortMeta:'Full Iced · 5ct · 14K',     gemColor:'#D4A840', gemStyle:'cross'   },
  { id:13, slug:'hiphop-ring-signet',    name:'Iced Signet Ring',         category:'hiphop', type:'ring',     stone:'cvd-colourless', cut:'baguette',metals:['14k','18k-yellow'],              priceFrom:3200,  carat:'3.5 ct',      featured:false, isNew:false, shortMeta:'Baguette · 3.5ct · 14K',    gemColor:'#D4A840', gemStyle:'signet'  },
  { id:14, slug:'hiphop-bracelet-iced',  name:'Iced Baguette Bracelet',   category:'hiphop', type:'bracelet', stone:'cvd-colourless', cut:'baguette',metals:['14k','18k-white'],              priceFrom:4800,  carat:'10 ct',       featured:false, isNew:false, shortMeta:'Baguette · 10ct · 14K',     gemColor:'#D4A840', gemStyle:'row'     },
];

const JEWELLERY_MEDIA: Record<string, Pick<Product, 'imageUrl' | 'galleryUrls' | 'videoUrl'>> = {
  'halo-solitaire-ring': {
    imageUrl: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxfHxqZXdlbHJ5fGVufDB8fHx8MTc3NjU5NjE1OHww&ixlib=rb-4.1.0&q=80&w=1080',
    galleryUrls: [
      'https://images.unsplash.com/photo-1633934542430-0905ccb5f050?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwyfHxqZXdlbHJ5fGVufDB8fHx8MTc3NjU5NjE1OHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwzfHxqZXdlbHJ5fGVufDB8fHx8MTc3NjU5NjE1OHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw0fHxqZXdlbHJ5fGVufDB8fHx8MTc3NjU5NjE1OHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw1fHxqZXdlbHJ5fGVufDB8fHx8MTc3NjU5NjE1OHww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  'teardrop-pendant': {
    imageUrl: 'https://images.unsplash.com/photo-1616837874254-8d5aaa63e273?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw2fHxqZXdlbHJ5fGVufDB8fHx8MTc3NjU5NjE1OHww&ixlib=rb-4.1.0&q=80&w=1080',
    galleryUrls: [
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw3fHxqZXdlbHJ5fGVufDB8fHx8MTc3NjU5NjE1OHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw4fHxqZXdlbHJ5fGVufDB8fHx8MTc3NjU5NjE1OHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1599458349289-18f0ee82e6ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw5fHxqZXdlbHJ5fGVufDB8fHx8MTc3NjU5NjE1OHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1585960622850-ed33c41d6418?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxMHx8amV3ZWxyeXxlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  'tennis-bracelet-4ct': {
    imageUrl: 'https://images.unsplash.com/photo-1600721391776-b5cd0e0048f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxMXx8amV3ZWxyeXxlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    galleryUrls: [
      'https://images.unsplash.com/photo-1590166223826-12dee1677420?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxMnx8amV3ZWxyeXxlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxM3x8amV3ZWxyeXxlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1631982690223-8aa4be0a2497?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxNHx8amV3ZWxyeXxlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1601821765780-754fa98637c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxNXx8amV3ZWxyeXxlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  'fancy-yellow-trilogy': {
    imageUrl: 'https://images.unsplash.com/photo-1600721391689-2564bb8055de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxNnx8amV3ZWxyeXxlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    galleryUrls: [
      'https://images.unsplash.com/photo-1608042314453-ae338d80c427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxN3x8amV3ZWxyeXxlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1569397288884-4d43d6738fbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxOHx8amV3ZWxyeXxlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1620656798579-1984d9e87df7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxOXx8amV3ZWxyeXxlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwyMHx8amV3ZWxyeXxlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  'pear-drop-necklace': {
    imageUrl: 'https://images.unsplash.com/photo-1589674668791-4889d2bba4c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxfHxkaWFtb25kJTIwcmluZ3xlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    galleryUrls: [
      'https://images.unsplash.com/photo-1719924998065-0c60e329ef58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwyfHxkaWFtb25kJTIwcmluZ3xlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1605100804567-1ffe942b5cd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwzfHxkaWFtb25kJTIwcmluZ3xlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1613945407943-59cd755fd69e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw0fHxkaWFtb25kJTIwcmluZ3xlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw1fHxkaWFtb25kJTIwcmluZ3xlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  'eternity-band': {
    imageUrl: 'https://images.unsplash.com/photo-1607703829739-c05b7beddf60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw2fHxkaWFtb25kJTIwcmluZ3xlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    galleryUrls: [
      'https://images.unsplash.com/photo-1600143674013-a690b5d25104?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw3fHxkaWFtb25kJTIwcmluZ3xlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1529519195486-16945f0fb37f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw4fHxkaWFtb25kJTIwcmluZ3xlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1621438872240-d30f55aaa59c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw5fHxkaWFtb25kJTIwcmluZ3xlbnwwfHx8fDE3NzY1OTYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1631897817977-a1005c199b36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxMHx8ZGlhbW9uZCUyMHJpbmd8ZW58MHx8fHwxNzc2NTk2MTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  'emerald-cut-solitaire': {
    imageUrl: 'https://images.unsplash.com/photo-1588445046108-14dced0c98fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxMXx8ZGlhbW9uZCUyMHJpbmd8ZW58MHx8fHwxNzc2NTk2MTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    galleryUrls: [
      'https://images.unsplash.com/photo-1677948655785-898116437d92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxMnx8ZGlhbW9uZCUyMHJpbmd8ZW58MHx8fHwxNzc2NTk2MTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1518370265276-f22b706aeac8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxM3x8ZGlhbW9uZCUyMHJpbmd8ZW58MHx8fHwxNzc2NTk2MTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1512217358397-b68c2bc84682?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxNHx8ZGlhbW9uZCUyMHJpbmd8ZW58MHx8fHwxNzc2NTk2MTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1677045419454-e8b201856472?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxNXx8ZGlhbW9uZCUyMHJpbmd8ZW58MHx8fHwxNzc2NTk2MTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  'oval-halo-earrings': {
    imageUrl: 'https://images.unsplash.com/photo-1559006864-38a01f201f95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxNnx8ZGlhbW9uZCUyMHJpbmd8ZW58MHx8fHwxNzc2NTk2MTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    galleryUrls: [
      'https://images.unsplash.com/photo-1648564585735-19491888545c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxN3x8ZGlhbW9uZCUyMHJpbmd8ZW58MHx8fHwxNzc2NTk2MTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxOHx8ZGlhbW9uZCUyMHJpbmd8ZW58MHx8fHwxNzc2NTk2MTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1724937798320-d0c4fac1787d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxOXx8ZGlhbW9uZCUyMHJpbmd8ZW58MHx8fHwxNzc2NTk2MTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1673823258465-d9160aa4ed63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwyMHx8ZGlhbW9uZCUyMHJpbmd8ZW58MHx8fHwxNzc2NTk2MTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  'cuban-link-chain-iced': {
    imageUrl: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxfHxuZWNrbGFjZXxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    galleryUrls: [
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwyfHxuZWNrbGFjZXxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwzfHxuZWNrbGFjZXxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1685970731194-e27b477e87ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw0fHxuZWNrbGFjZXxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1685970731571-72ede0cb26ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw1fHxuZWNrbGFjZXxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  'baguette-grillz': {
    imageUrl: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw2fHxuZWNrbGFjZXxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    galleryUrls: [
      'https://images.unsplash.com/photo-1620656798579-1984d9e87df7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw3fHxuZWNrbGFjZXxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw4fHxuZWNrbGFjZXxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1676329945867-01c9975aa9d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw5fHxuZWNrbGFjZXxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1721103418218-416182aca079?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxMHx8bmVja2xhY2V8ZW58MHx8fHwxNzc2NTk2MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  'tennis-chain-hiphop': {
    imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxMXx8bmVja2xhY2V8ZW58MHx8fHwxNzc2NTk2MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    galleryUrls: [
      'https://images.unsplash.com/photo-1601821765780-754fa98637c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxMnx8bmVja2xhY2V8ZW58MHx8fHwxNzc2NTk2MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1610661022658-5068c4d8f286?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxM3x8bmVja2xhY2V8ZW58MHx8fHwxNzc2NTk2MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxNHx8bmVja2xhY2V8ZW58MHx8fHwxNzc2NTk2MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1521694139475-da661702d635?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxNXx8bmVja2xhY2V8ZW58MHx8fHwxNzc2NTk2MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  'diamond-pendant-cross': {
    imageUrl: 'https://images.unsplash.com/photo-1705326452390-3ecf6070595f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxNnx8bmVja2xhY2V8ZW58MHx8fHwxNzc2NTk2MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    galleryUrls: [
      'https://images.unsplash.com/photo-1722410180670-b6d5a2e704fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxN3x8bmVja2xhY2V8ZW58MHx8fHwxNzc2NTk2MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1633555234047-192d10238f5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxOHx8bmVja2xhY2V8ZW58MHx8fHwxNzc2NTk2MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1633934542430-0905ccb5f050?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxOXx8bmVja2xhY2V8ZW58MHx8fHwxNzc2NTk2MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1588444968576-f8fe92ce56fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwyMHx8bmVja2xhY2V8ZW58MHx8fHwxNzc2NTk2MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  'hiphop-ring-signet': {
    imageUrl: 'https://images.unsplash.com/photo-1633810543462-77c4a3b13f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxfHxicmFjZWxldHxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    galleryUrls: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwyfHxicmFjZWxldHxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1619119069152-a2b331eb392a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwzfHxicmFjZWxldHxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1721206624492-3d05631471ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw0fHxicmFjZWxldHxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1676291055501-286c48bb186f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw1fHxicmFjZWxldHxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  'hiphop-bracelet-iced': {
    imageUrl: 'https://images.unsplash.com/photo-1717605383946-96c6884c36b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw2fHxicmFjZWxldHxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    galleryUrls: [
      'https://images.unsplash.com/photo-1708221235482-a6e2a807198f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw3fHxicmFjZWxldHxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1728646998199-127b357a464d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw4fHxicmFjZWxldHxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1676120963306-8969fa6a810e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHw5fHxicmFjZWxldHxlbnwwfHx8fDE3NzY1OTYxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjkyOTJ8MHwxfHNlYXJjaHwxMHx8YnJhY2VsZXR8ZW58MHx8fHwxNzc2NTk2MTU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
};

export const PRODUCTS: Product[] = BASE_PRODUCTS.map((product) => ({
  ...product,
  ...JEWELLERY_MEDIA[product.slug],
}));

export function renderGemSVG(style: GemStyle, size = 110, color = '#D4A840'): string {
  const s = size;
  const c = color;
  const cL = '#B8922A';

  switch (style) {
    case 'pear':
      return `<svg width="${s}" height="${s}" viewBox="0 0 110 110" fill="none">
        <path d="M55 15 Q75 38 72 68 Q65 92 55 94 Q45 92 38 68 Q35 38 55 15Z" stroke="${cL}" stroke-width="1" fill="${c}22"/>
        <path d="M55 25 Q68 42 65 65 Q60 82 55 84 Q50 82 45 65 Q42 42 55 25Z" stroke="${cL}" stroke-width=".5" fill="${c}14"/>
        <circle cx="48" cy="45" r="3" fill="#fff" opacity=".6"/>
      </svg>`;

    case 'oval':
      return `<svg width="${s}" height="${s}" viewBox="0 0 110 110" fill="none">
        <ellipse cx="55" cy="55" rx="22" ry="32" stroke="${cL}" stroke-width="1" fill="${c}22"/>
        <ellipse cx="55" cy="55" rx="14" ry="22" stroke="${cL}" stroke-width=".5" fill="${c}14"/>
        <circle cx="50" cy="42" r="4" fill="#fff" opacity=".6"/>
      </svg>`;

    case 'emerald':
      return `<svg width="${s}" height="${s}" viewBox="0 0 110 110" fill="none">
        <rect x="32" y="25" width="46" height="60" stroke="${cL}" stroke-width="1" fill="${c}22"/>
        <rect x="38" y="33" width="34" height="44" stroke="${cL}" stroke-width=".5" fill="${c}14"/>
        <rect x="44" y="41" width="22" height="28" stroke="${cL}" stroke-width=".3" fill="none"/>
      </svg>`;

    case 'trilogy':
      return `<svg width="${s}" height="${s}" viewBox="0 0 110 110" fill="none">
        <polygon points="55,18 73,30 68,90 42,90 37,30" stroke="${cL}" stroke-width="1" fill="${c}33"/>
        <polygon points="28,40 38,48 33,80 18,80 13,48" stroke="${cL}" stroke-width="0.8" fill="#D4A84033"/>
        <polygon points="82,40 92,48 87,80 72,80 67,48" stroke="${cL}" stroke-width="0.8" fill="#D4A84033"/>
      </svg>`;

    case 'row':
      return `<svg width="${s}" height="${s}" viewBox="0 0 110 110" fill="none">
        <rect x="12" y="45" width="86" height="20" rx="10" stroke="${cL}" stroke-width="1" fill="${c}22"/>
        ${[22,38,55,72,88].map(cx => `<circle cx="${cx}" cy="55" r="5" fill="${c}55" stroke="${cL}" stroke-width=".5"/>`).join('')}
      </svg>`;

    case 'eternity':
      return `<svg width="${s}" height="${s}" viewBox="0 0 110 110" fill="none">
        <circle cx="55" cy="55" r="32" stroke="${cL}" stroke-width="1" fill="none"/>
        <circle cx="55" cy="55" r="26" stroke="${cL}" stroke-width="0.5" fill="none" opacity=".4"/>
        ${Array.from({length:10}).map((_,i) => {
          const a = (i/10)*Math.PI*2;
          const x = Math.round((55+Math.cos(a)*29)*100)/100;
          const y = Math.round((55+Math.sin(a)*29)*100)/100;
          return `<circle cx="${x}" cy="${y}" r="3.4" fill="${c}66" stroke="${cL}" stroke-width=".4"/>`;
        }).join('')}
      </svg>`;

    case 'chain':
      return `<svg width="${s}" height="${s}" viewBox="0 0 110 110" fill="none">
        ${[22,40,58,76].map(cy =>
          `<ellipse cx="55" cy="${cy}" rx="22" ry="8" stroke="${cL}" stroke-width="1" fill="${c}22"/>
           <rect x="45" y="${cy-2}" width="20" height="4" fill="${c}"/>`
        ).join('')}
      </svg>`;

    case 'tennis':
      return `<svg width="${s}" height="${s}" viewBox="0 0 110 110" fill="none">
        ${[15,30,45,60,75,90].map(cx =>
          `<circle cx="${cx}" cy="55" r="6" fill="${c}55" stroke="${cL}" stroke-width=".6"/>`
        ).join('')}
        <path d="M15 55 L90 55" stroke="${cL}" stroke-width="0.6"/>
      </svg>`;

    case 'grillz':
      return `<svg width="${s}" height="${s}" viewBox="0 0 110 110" fill="none">
        <path d="M20 40 L90 40 L85 80 L25 80 Z" stroke="${cL}" stroke-width="1" fill="${c}33"/>
        ${[0,1,2,3,4,5].map(i =>
          `<rect x="${25+i*11}" y="45" width="8" height="28" fill="${c}55" stroke="${cL}" stroke-width=".4"/>`
        ).join('')}
      </svg>`;

    case 'cross':
      return `<svg width="${s}" height="${s}" viewBox="0 0 110 110" fill="none">
        <rect x="48" y="20" width="14" height="70" fill="${c}33" stroke="${cL}" stroke-width="1"/>
        <rect x="30" y="42" width="50" height="14" fill="${c}33" stroke="${cL}" stroke-width="1"/>
        ${[26,42,58,74].map(y =>
          `<circle cx="55" cy="${y}" r="3" fill="${c}" opacity=".7"/>`
        ).join('')}
      </svg>`;

    case 'signet':
      return `<svg width="${s}" height="${s}" viewBox="0 0 110 110" fill="none">
        <rect x="22" y="38" width="66" height="34" rx="4" stroke="${cL}" stroke-width="1" fill="${c}22"/>
        <rect x="30" y="44" width="50" height="22" rx="2" stroke="${cL}" stroke-width=".6" fill="${c}33"/>
        ${[40,55,70].map(x =>
          `<rect x="${x-4}" y="50" width="8" height="10" fill="${c}" opacity=".7"/>`
        ).join('')}
      </svg>`;

    case 'round':
    default:
      return `<svg width="${s}" height="${s}" viewBox="0 0 110 110" fill="none">
        <polygon points="55,15 85,35 77,85 33,85 25,35" stroke="${cL}" stroke-width="1" fill="${c}22"/>
        <polygon points="55,25 75,40 69,75 41,75 35,40" stroke="${cL}" stroke-width=".5" fill="${c}14"/>
        <line x1="55" y1="15" x2="33" y2="85" stroke="${cL}" stroke-width=".4" opacity=".5"/>
        <line x1="55" y1="15" x2="77" y2="85" stroke="${cL}" stroke-width=".4" opacity=".5"/>
        <line x1="25" y1="35" x2="85" y2="35" stroke="${cL}" stroke-width=".4" opacity=".5"/>
        <circle cx="48" cy="35" r="3" fill="#fff" opacity=".7"/>
      </svg>`;
  }
}
