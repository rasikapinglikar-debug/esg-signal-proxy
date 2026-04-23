const express  = require('express');
const cors     = require('cors');
const fetch    = require('node-fetch');
const cron     = require('node-cron');
const xml2js   = require('xml2js');

const app  = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// ── ENV VARS ──
const NEWS_API_KEY   = process.env.NEWS_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TRIGGER_SECRET = process.env.TRIGGER_SECRET || 'esg-trigger-2025';
const FROM_EMAIL     = process.env.FROM_EMAIL || 'ESG Signal <onboarding@resend.dev>';

function getAEEmails() {
  return {
    AE4:   process.env.AE4_EMAIL,
    AE5:   process.env.AE5_EMAIL,
    Dave:  process.env.DAVE_EMAIL,
    Jake:  process.env.JAKE_EMAIL,
    Jim:   process.env.JIM_EMAIL,
    Lucas: process.env.LUCAS_EMAIL,
  };
}

const AE_ASSIGNMENTS = {
  "AE4": ["BlackRock", "Vanguard Group", "Fidelity Investments", "BNY Investments", "Invesco", "Franklin Templeton", "Prudential Financial", "T. Rowe Price Group", "Northern Trust", "Geode Capital Management", "Ameriprise Financial", "Charles Schwab Investment", "Blackstone", "Power Financial", "Federated Hermes", "Principal Financial", "New York Life Investments", "Dimensional Fund Advisors", "Affiliated Managers Group", "Allspring Global Investments", "MassMutual", "Neuberger Berman", "Voya Financial", "U.S. Bancorp", "Mercer", "Dodge & Cox", "SEI Investments", "Jackson Financial", "Russell Investments", "NISA Investment", "Lazard", "Fisher Investments", "Guggenheim Investments", "American Century", "Raymond James", "Conning", "Robert W. Baird", "TCW Group", "Mesirow", "Payden & Rygel", "Artisan Partners", "StepStone Group", "Massachusetts PRIM", "Minnesota State Board of Investment", "NYC Teachers Retirement System", "Connecticut Retirement Plans", "OPTrust", "Northern LGPS", "Greater Manchester Pension Fund", "London CIV", "AP1 (First AP Fund)", "Elo", "ERAFP", "Abu Dhabi Investment Authority (ADIA)", "Emirates Investment Authority", "Colleges of Applied Arts and Technology (CAAT)", "Fonds de solidarité FTQ", "BP Pension Fund", "Unilever UK Pension Fund", "Smart Pension", "Pensioenfonds Detailhandel", "Statens pensjonsfond Norge (GPFN)", "Ircantec", "Apicil Group", "KZVK (Kirchliche Zusatzversorgungskasse)", "Helvetia Sammelstiftung", "PKA", "Indiana Public Retirement System (INPRS)", "Utah Retirement Systems", "Oklahoma Teachers Retirement System", "Contra Costa County Employees Retirement Association (CCCERA)", "Texas Municipal Retirement System (TMRS)", "Pensioenfonds Huisartsen", "Topdanmark Pension", "Avanza Pension (Sweden)", "Debeka", "National Pensions Reserve Fund (NPRF successor)", "General Organization for Social Insurance (GOSI)", "Morgan Lewis", "Baker Botts", "Cravath Swaine & Moore", "Hunton Andrews Kurth", "Stephenson Harwood", "McCarthy Tetrault", "Hadef & Partners", "Khoshaim & Associates", "Freshfields Germany", "BSP (Bonn Steichen & Partners)", "South Pole", "Carbon Trust", "Frontier Economics", "Georgeson", "Drees & Sommer", "Bank of America", "First Abu Dhabi Bank", "National Bank of Canada", "Dubai Islamic Bank", "Nykredit", "KeyCorp"],
  "AE5": ["PNC Financial", "Virtus Investment Partners", "Victory Capital", "CBRE Investment Management", "PRIMECAP", "Hightower Advisors", "Starwood Capital", "RhumbLine Advisers", "Acadian", "TPG", "Thoma Bravo", "Warburg Pincus", "Apollo Global Management", "Oaktree Capital Management", "Vista Equity Partners", "General Atlantic", "Leonard Green & Partners", "Apogem Capital Partners", "TA Associates", "Sixth Street", "Insight Partners", "Fortress Investment Group", "Oak Hill Advisors", "Andreessen Horowitz", "Cerberus Capital Management", "American Securities", "Tiger Global Management", "BSP-Alcentra", "BDT & MSD Partners", "L Catterton", "Stone Point Capital", "Crescent Capital Group", "Angelo Gordon", "PSG", "KPS Capital Partners", "Summit Partners", "The Jordan Company", "Churchill Asset Management", "Lightspeed Venture Partners", "TSG Consumer Partners", "Castlelake", "InterVest Capital Partners", "Farallon Capital Management", "Vista Credit Partners", "Citigroup", "Emirates NBD", "Mashreq Bank", "Bunq", "Helaba", "Systemiq", "Cambridge Econometrics", "FTI Consulting (ESG)", "I Care & Consult", "K&L Gates", "Arnold & Porter", "Cahill Gordon & Reindel", "Simmons & Simmons", "Mishcon de Reya", "DLA Piper", "Stikeman Elliott", "King & Spalding ME", "Houthoff", "Florida State Board of Administration", "North Carolina Retirement", "Colorado PERA", "Illinois Teachers Retirement", "Los Angeles City Employees Retirement", "Caisse de depot et placement (CDPQ)", "Brunel Pension Partnership", "West Midlands Pension Fund", "PMT (Metalektro)", "AP2 (Second AP Fund)", "FRR (Fonds de Reserve)", "Investment Corporation of Dubai (ICD)", "Abu Dhabi Investment Council (ADIC)", "Pennsylvania Public School Employees Retirement (PSERS)", "Ohio State Teachers Retirement System (STRS Ohio)", "Missouri State Employees Retirement System (MOSERS)", "Delaware Public Employees Retirement System", "Dallas Police and Fire Pension System", "Marin County Employees Retirement Association (MCERA)", "Public Employee Retirement System of Idaho (PERSI)", "Alberta Teachers Retirement Fund (ATRF)", "Fondaction (CSN)", "Rolls-Royce UK Pension Fund", "Pearson Pension Plan", "Cushon", "Pensioenfonds Zoetwaren", "Pensioenfonds Vliegverkeer (PFVV)", "PFA Pension", "Skandia (Sweden)", "Mandatum Life (Finland)", "CNAV (Caisse Nationale d'Assurance Vieillesse)", "Agrica", "HUK-Coburg", "EZVK (Evangelische Zusatzversorgungskasse)", "Swiss Life Sammelstiftung", "Irish Life Investment Managers (ILIM)", "Abu Dhabi Pension Fund (ADPF)", "ATP"],
  "Dave": ["UBS", "Aegon Group", "Generali Group", "KKR", "Dai-ichi Life Holdings", "Ares Management", "MEAG", "Meiji Yasuda Life Insurance", "Aviva", "Samsung Group", "Banco Santander", "KBC Group", "Robeco Group", "WTW", "Talanx Group", "F Van Lanschot", "Storebrand Group", "Groupama Asset Management", "Advent International", "AXA IM ALTS", "Clearlake Capital Group", "Bain Capital", "Genstar Capital", "Barings", "New Mountain Capital", "Ardian", "HarbourVest Partners", "Astorg", "Antares Capital", "Hamilton Lane", "Eurazeo", "Värde Partners", "Morgan Stanley Investment Management", "Bregal Investments", "Park Square Capital"],
  "Jake": ["Capital Group", "Allianz Group", "Amundi", "AXA Group", "Deutsche Bank", "Sumitomo Mitsui Trust Holdings", "HSBC Holdings", "Nippon Life Insurance", "Asset Management One", "LBBW", "M&G Investments", "TD Global Invest. Solutions", "Janus Henderson Group", "Swiss Life Asset Managers", "Zurcher Kantonalbank", "Zurich Financial Services", "St. James's Place", "Anima Holding Italy", "Royal London Group", "CVC Capital Partners", "OFI AM", "Caixabank", "Danske Bank", "Man Group", "Mn Services", "Partners Group", "ASR", "Bayerischen Landesbank", "OP Financial Group", "LGT Capital Partners", "EQT", "Nordic Capital", "Golub Capital", "Hayfin Capital Management", "Hillhouse Capital Group", "Accel-KKR", "AllianceBernstein", "Crestline Investors", "Tikehau Capital", "CVC Credit Partners", "Aberdeen Investments", "Lombard Odier Investment Mgmt", "AXA Investment Managers", "Wells Fargo", "Groupe BPCE / Natixis", "Saudi National Bank", "Truist Financial", "ASN Bank", "WSP Global", "Pollination", "2° Investing Initiative", "Alvarez & Marsal (ESG)", "Milbank", "Vedder Price", "Covington & Burling", "Gibson Dunn", "Taylor Wessing", "Clyde & Co", "Osler Hoskin & Harcourt", "Fasken", "August & Debouzy", "Elvinger Hoss Prussen", "Texas Teachers Retirement System", "Virginia Retirement System", "Michigan Retirement Systems", "Maryland State Retirement", "PSP Investments", "Borders to Coast Pension Partnership", "Strathclyde Pension Fund", "PME (Metaalindustrie)", "AP3 (Third AP Fund)", "Agirc-Arrco", "Hassana Investment (GOSI)", "Sanabil Investments (PIF sub)", "Tennessee Consolidated Retirement System", "Kansas Public Employees Retirement System (KPERS)", "Rhode Island Employees Retirement System", "Los Angeles Fire and Police Pensions (LAFPP)", "New York City Board of Education Retirement System (BERS)", "Wyoming Retirement System", "Municipal Employees Pension Plan (MEPP) Saskatchewan", "Pension Protection Fund (PPF)", "BT Pension Scheme (BTPS)", "National Grid UK Pension Scheme", "People's Partnership (The People's Pension)", "Pensioenfonds Horeca & Catering", "Stichting Pensioenfonds Openbaar Vervoer (SPOV)", "AP Pension", "Länsförsäkringar (Sweden)", "LocalTapiola (Finland)", "Préfon-Retraite", "DEVK Versicherungen", "Württembergische Versicherung (W&W Group)", "ASGA Pensionskasse", "Nest Sammelstiftung", "Davy Asset Management", "Public Pension Agency Saudi Arabia (PPA)"],
  "Jim": ["State Street Global", "BNP Paribas", "Natixis Investment Managers", "Nuveen", "Brookfield Asset Management", "Manulife", "Mitsubishi UFJ Financial Group", "Macquarie Group", "Union Investment", "Intesa Sanpaolo", "Abrdn", "Zenkyoren", "Shinkin Central Bank", "Baillie Gifford", "Pictet Asset Management", "BMO Wealth Management", "Scotiabank", "SEB", "Resona Holdings", "Landesbank Hessen-Thuringen", "EFG International", "BBVA", "IFM Investors", "BCV", "Mirae Asset Financial Group", "Aon", "IDUNA Gruppe", "Goldman Sachs Asset Management", "HPS Investment Partners", "The Carlyle Group", "Clayton Dubilier & Rice", "Silver Lake", "Pacific Investment Management Company", "Permira Advisers", "Cinven", "Blue Owl Capital", "Bridgepoint", "Pemberton Asset Management", "PAG", "TCV", "MBK Partners", "Liontrust", "Sarasin & Partners", "Sycomore Asset Management", "DWS Group", "Toronto-Dominion Bank", "DZ Bank", "Al Rajhi Bank", "SpareBank 1", "Belfius", "Anthesis Group", "Quantis", "L.E.K. Consulting", "Charles River Associates", "Fried Frank", "Winston & Strawn", "Akin Gump", "Seward & Kissel", "Burges Salmon", "HFW (Holman Fenwick Willan)", "Blake Cassels & Graydon", "Gowling WLG", "Joffe & Associes", "Arendt & Medernach", "Wisconsin Investment Board", "Oregon Investment Council", "PSERS Pennsylvania", "Arizona State Retirement", "BT Pension Scheme", "ACCESS Pool", "Lothian Pension Fund", "bpfBOUW", "AP4 (Fourth AP Fund)", "Bayerische Versorgungskammer (BVK)", "Oman Investment Authority (OIA)", "Georgia Teachers Retirement System", "Montana Board of Investments", "Maine Public Employees Retirement System (MainePERS)", "San Diego City Employees Retirement System (SDCERS)", "Illinois Municipal Retirement Fund (IMRF)", "Vermont Pension Investment Committee (VPIC)", "Manitoba Teachers' Society Pension Plan", "National Employment Savings Trust (NEST)", "Sainsbury's Pension Scheme", "Centrica Pension Scheme", "NOW: Pensions", "Pensioenfonds Vervoer", "Kommunal Landspensjonskasse (KLP)", "Sampension", "Fjärde AP-fonden (AP4)", "Malakoff Humanis", "Pro BTP", "Signal Iduna", "Provinzial Rheinland", "Pensionskasse der Swisscom", "Ethos Foundation / Ethos Services", "Ethias", "Social Insurance Investment Portfolio (Bahrain)"],
  "Lucas": ["J.P. Morgan Chase", "Legal & General Group", "Wellington Management", "Sun Life Financial", "Schroders", "Fidelity International", "Royal Bank of Canada", "Nomura Asset Management", "Credit Suisse", "Nordea", "Societe Generale", "Prudential", "Dekabank Group", "Sumitomo Life Insurance", "CIBC Asset Management", "Achmea", "Swedbank", "Union Bancaire Privee", "Vontobel Asset Management", "Credit Mutuel", "Sumitomo Mitsui Financial Group", "Rothschild", "Swiss Re", "KB Asset Management", "Svenska Handelsbanken", "Hg", "Intermediate Capital Group", "Hellman & Friedman", "PGIM Private Alternatives", "Francisco Partners", "GTCR", "Platinum Equity", "Adams Street Partners", "Arcmont Asset Management", "Veritas Capital", "Apax Partners", "GoldenTree Asset Management", "Thomas H. Lee Partners", "PAI Partners", "EIG", "Albacore Capital Group", "IK Partners", "Altor Equity Partners", "Carmignac", "Flossbach von Storch", "Bank of Nova Scotia", "KfW", "Abu Dhabi Commercial Bank", "Jyske Bank", "Fifth Third Bancorp", "DNV", "Vivid Economics (McKinsey)", "Morrow Sodali", "Strategy& (PwC)", "Cornerstone Research", "Schulte Roth & Zabel", "Vinson & Elkins", "Shearman & Sterling (A&O Shearman)", "Troutman Pepper", "Bird & Bird", "Reed Smith", "Bennett Jones", "Al Tamimi & Company", "Al Busaidy Mansoor Jamal", "Fidal", "Wildgen", "New Jersey Division of Investment", "Ohio Public Employees Retirement", "NYC Employees Retirement System", "Iowa Public Employees Retirement", "Investment Management Corp Ontario (IMCO)", "LGPS Central", "LGPS Wales (Wales Pension Partnership)", "London Pensions Fund Authority (LPFA)", "PFZW", "Keva", "Caisse des Dépôts", "VBL (Versorgungsanstalt)", "Mumtalakat (Bahrain)", "South Carolina Retirement System", "Nevada Public Employees Retirement System (NVPERS)", "New Hampshire Retirement System", "Sacramento County Employees' Retirement System (SCERS)", "Chicago Teachers Pension Fund (CTPF)", "CAAT Pension Plan", "Régime de retraite du personnel d'encadrement (RRPE)", "Shell Contributory Pension Fund", "Marks & Spencer Pension Scheme", "Tesco PLC Pension Scheme", "Scottish Widows Master Trust", "Pensioenfonds Medisch Specialisten", "Statens pensjonsfond utland (GPFG / Oil Fund)", "Lærernes Pension (LP)", "SPP Fonder", "AG2R La Mondiale", "Klesia", "R+V Versicherung", "Sparkassen-Versicherung", "Bâloise (Baloise Sammelstiftung)", "Ireland Strategic Investment Fund (ISIF)", "Integrale", "Goodwin Procter", "Squire Patton Boggs", "CMS Francis Lefebvre", "Kohlberg & Company", "MetLife Investment Management", "H.I.G. Capital", "Fiera Capital", "Desjardins Group", "Healthcare of Ontario Pension (HOOPP)"],
};

// ════════════════════════════════════
//  RSS FEED SOURCES
//  These are publicly accessible feeds
//  that work from server-side requests
// ════════════════════════════════════
const RSS_FEEDS = [
  // ESG & Sustainability specialists
  { name: 'ESG Today',           url: 'https://www.esgtoday.com/feed/',                    category: 'esg' },
  { name: 'Responsible Investor',url: 'https://www.responsible-investor.com/feed/',         category: 'esg' },
  { name: 'ESG Investor',        url: 'https://esginvestor.net/feed/',                      category: 'esg' },
  { name: 'GreenBiz',            url: 'https://www.greenbiz.com/feeds/news',                category: 'esg' },
  { name: 'Sustainability Mag',  url: 'https://www.sustainabilitymag.com/feed',             category: 'esg' },
  // Financial news
  { name: 'Reuters Business',    url: 'https://feeds.reuters.com/reuters/businessNews',     category: 'finance' },
  { name: 'FT',                  url: 'https://www.ft.com/?format=rss',                     category: 'finance' },
  { name: 'Investment Week',     url: 'https://www.investmentweek.co.uk/rss',               category: 'finance' },
  { name: 'Funds Europe',        url: 'https://www.funds-europe.com/feed',                  category: 'finance' },
  { name: 'IPE',                 url: 'https://www.ipe.com/rss.xml',                        category: 'pensions' },
  { name: 'P&I',                 url: 'https://www.pionline.com/rss',                       category: 'pensions' },
  { name: 'PE International',    url: 'https://www.privateequityinternational.com/feed/',   category: 'pe' },
  { name: 'AltAssets',           url: 'https://www.altassets.net/feed',                     category: 'pe' },
  { name: 'Citywire',            url: 'https://citywire.com/fund-insider/rss',              category: 'finance' },
  // Press releases (these usually allow server access)
  { name: 'GlobeNewswire',       url: 'https://www.globenewswire.com/RssFeed/subjectcode/14-Environment', category: 'press' },
  { name: 'BusinessWire ESG',    url: 'https://feed.businesswire.com/rss/home/?rss=G1&market=22',         category: 'press' },
];

// Fallback: NewsAPI queries (browser-side already works, this is backup)
const NEWS_API_QUERIES = [
  '"new fund" OR "impact fund" OR "Article 8" OR "Article 9" ESG',
  '"responsible investment" OR "sustainable investment" finance',
  '"head of ESG" OR "chief sustainability" appointed',
  '"net zero" OR "carbon neutral" investment fund',
  '"SFDR" OR "TCFD" OR "CSRD" asset manager',
  '"stewardship" OR "shareholder engagement" investment',
  '"ESG rating" OR "ESG score" OR "ESG report" financial',
  '"green bond" OR "social bond" sustainability',
  'sustainability "private equity" OR "asset management" OR "pension"',
  '"responsible investment" OR "impact investing"',
];

// ── ESG KEYWORDS ──
const ESG_KEYWORDS = [
  'esg','environmental social governance','sustainability report','net zero','net-zero',
  'carbon neutral','carbon offset','decarboni','responsible investment','impact investing',
  'impact fund','sfdr','tcfd','csrd','article 8','article 9','taxonomy regulation',
  'pri signatory','un sdg','sustainable development goal','stewardship code',
  'shareholder engagement','proxy voting','green bond','social bond','sustainability bond',
  'esg rating','esg score','climate risk','climate finance','scope 1','scope 2','scope 3',
  'head of esg','chief sustainability','sustainability director','esg framework',
  'esg policy','esg strategy','esg commitment','paris agreement','science based target',
  'sbti','just transition','biodiversity','nature positive','esg report',
  'sustainable invest','impact report','esg data','esg integration',
  'new fund','fund launch','secondaries','private credit','growing alternatives',
  'growing private equity','growing private markets',
];

// ════════════════════════════════════
//  RSS PARSER
// ════════════════════════════════════
async function fetchRSSFeed(feed) {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; ESGSignal/2.0; +https://rasikapinglikar-debug.github.io/esg-signal)',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    };
    const r = await fetch(feed.url, { headers, timeout: 10000 });
    if (!r.ok) return [];
    const xml = await r.text();
    const parsed = await xml2js.parseStringPromise(xml, { explicitArray: false });

    let items = [];
    // Handle RSS 2.0
    if (parsed.rss?.channel?.item) {
      const raw = parsed.rss.channel.item;
      items = Array.isArray(raw) ? raw : [raw];
    }
    // Handle Atom
    if (parsed.feed?.entry) {
      const raw = parsed.feed.entry;
      items = Array.isArray(raw) ? raw : [raw];
    }

    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    return items.map(item => {
      const pubDate = item.pubDate || item.published || item.updated || item['dc:date'] || '';
      const published = new Date(pubDate);
      return {
        title: item.title?._ || item.title || '',
        description: item.description?._ || item.description || item.summary?._ || item.summary || '',
        url: item.link?.$ ? item.link.$.href : (item.link || item.guid?._ || item.guid || ''),
        publishedAt: isNaN(published) ? new Date().toISOString() : published.toISOString(),
        source: { name: feed.name },
        _category: feed.category,
      };
    }).filter(item => {
      if (!item.title || item.title === '[Removed]') return false;
      const pub = new Date(item.publishedAt).getTime();
      return pub > cutoff;
    });
  } catch (e) {
    console.log(`RSS failed (${feed.name}): ${e.message}`);
    return [];
  }
}

// ════════════════════════════════════
//  NEWSAPI FALLBACK
// ════════════════════════════════════
async function fetchNewsAPI() {
  if (!NEWS_API_KEY) return [];
  const from = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];
  const allArticles = [];
  for (const query of NEWS_API_QUERIES) {
    try {
      const params = new URLSearchParams({ q:query, language:'en', pageSize:'10', sortBy:'publishedAt', from, apiKey:NEWS_API_KEY });
      const r = await fetch(`https://newsapi.org/v2/everything?${params}`);
      const d = await r.json();
      if (d.articles) allArticles.push(...d.articles);
      await new Promise(r=>setTimeout(r,300));
    } catch(e) { console.log(`NewsAPI query failed: ${e.message}`); }
  }
  return allArticles;
}

// ════════════════════════════════════
//  FETCH ALL NEWS (RSS + NewsAPI)
// ════════════════════════════════════
async function fetchAllNews() {
  console.log('Fetching from RSS feeds + NewsAPI…');

  // Fetch all RSS feeds in parallel
  const rssResults = await Promise.all(RSS_FEEDS.map(f => fetchRSSFeed(f)));
  const rssArticles = rssResults.flat();
  console.log(`RSS: ${rssArticles.length} articles from ${RSS_FEEDS.length} feeds`);

  // Also fetch from NewsAPI
  const newsApiArticles = await fetchNewsAPI();
  console.log(`NewsAPI: ${newsApiArticles.length} articles`);

  // Combine and deduplicate
  const all = [...rssArticles, ...newsApiArticles];
  const seen = new Set();
  const unique = all.filter(a => {
    const key = a.url || a.title;
    if (!key || key === '[Removed]' || seen.has(key)) return false;
    seen.add(key); return true;
  });

  console.log(`Combined unique articles: ${unique.length}`);
  return unique;
}

// ════════════════════════════════════
//  MATCH FOR AE
// ════════════════════════════════════
function matchForAE(articles, aeCompanies) {
  const matches = [];
  for (const article of articles) {
    const text = ((article.title||'') + '|' + (article.description||'')).toLowerCase();
    const esgMatch = ESG_KEYWORDS.find(kw => text.includes(kw.toLowerCase()));
    if (!esgMatch) continue;
    const companyMatch = aeCompanies.find(co => {
      const coLower = co.toLowerCase();
      if (text.includes(coLower)) return true;
      // Try first significant word
      const firstWord = co.split(' ')[0].toLowerCase();
      if (firstWord.length > 4 && text.includes(firstWord)) return true;
      // Try without common suffixes
      const short = co.replace(/ (Group|Management|Investment|Investments|Capital|Partners|Holdings|Global|Financial|Asset|Managers|Advisors|Life|Insurance)$/i, '').toLowerCase().trim();
      if (short.length > 4 && short !== coLower && text.includes(short)) return true;
      return false;
    });
    if (!companyMatch) continue;
    matches.push({ ...article, _trigger: esgMatch, _company: companyMatch });
  }
  return matches.sort((a,b) => a._company.localeCompare(b._company));
}

// ════════════════════════════════════
//  BUILD EMAIL
// ════════════════════════════════════
function buildEmail(aeName, matches, totalCompanies) {
  const dateStr = new Date().toLocaleDateString('en-GB',{ weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const header = `
    <div style="background:#0d1421;padding:22px 28px;border-radius:10px 10px 0 0;">
      <h1 style="color:#10d4a8;margin:0 0 3px;font-size:20px;font-family:sans-serif;">◈ ESG Signal</h1>
      <p style="color:#8ba0bc;margin:0;font-size:12px;font-family:sans-serif;">Daily Digest · ${dateStr} · ${aeName}'s accounts (${totalCompanies} companies)</p>
    </div>`;
  if (!matches.length) {
    return `<div style="max-width:620px;margin:0 auto;">${header}<div style="background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;padding:24px 28px;font-family:sans-serif;"><p style="color:#6b7280;font-size:14px;margin:0;line-height:1.6;">No ESG triggers found for your ${totalCompanies} accounts in the last 24 hours.<br>Check back tomorrow or open the <a href="https://rasikapinglikar-debug.github.io/esg-signal" style="color:#10d4a8;">ESG Signal tool</a>.</p></div></div>`;
  }
  const cards = matches.map(a => `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;border-left:4px solid #10d4a8;background:#fff;font-family:sans-serif;">
      <div style="margin-bottom:8px;">
        <span style="background:#d1fae5;color:#065f46;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700;">🏢 ${a._company}</span>
        <span style="background:#ede9fe;color:#5b21b6;padding:2px 9px;border-radius:20px;font-size:11px;margin-left:5px;">🔑 ${a._trigger}</span>
        <span style="background:#f0f9ff;color:#0369a1;padding:2px 9px;border-radius:20px;font-size:11px;margin-left:5px;">📰 ${a.source?.name||'Unknown'}</span>
      </div>
      <h3 style="margin:0 0 6px;font-size:15px;color:#111;line-height:1.4;"><a href="${a.url}" style="color:#111;text-decoration:none;">${a.title}</a></h3>
      <p style="margin:0 0 12px;font-size:13px;color:#555;line-height:1.5;">${a.description||''}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
        <span style="font-size:12px;color:#9ca3af;">${new Date(a.publishedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>
        <a href="${a.url}" style="background:#10d4a8;color:#fff;padding:6px 14px;border-radius:6px;font-size:12px;text-decoration:none;font-weight:600;">Read article →</a>
      </div>
    </div>`).join('');
  return `
  <div style="max-width:620px;margin:0 auto;background:#f9fafb;padding:16px;font-family:sans-serif;">
    ${header}
    <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:16px 28px 12px;">
      <p style="margin:0;font-size:14px;color:#374151;">🎯 <strong style="color:#10d4a8;">${matches.length} ESG trigger${matches.length>1?'s':''}</strong> across your ${totalCompanies} accounts in the last 24 hours.</p>
    </div>
    <div style="padding:16px 0;">${cards}</div>
    <div style="text-align:center;padding:16px;color:#9ca3af;font-size:11px;border-top:1px solid #e5e7eb;">
      ESG Signal · ${aeName} · RSS + NewsAPI · Always verify before outreach<br><br>
      <a href="https://rasikapinglikar-debug.github.io/esg-signal" style="color:#10d4a8;text-decoration:none;">Open ESG Signal Tool →</a>
    </div>
  </div>`;
}

// ════════════════════════════════════
//  SEND EMAIL
// ════════════════════════════════════
async function sendEmail(toEmail, aeName, matches, totalCompanies) {
  if (!RESEND_API_KEY || !toEmail) return;
  const dateStr = new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  const subject = matches.length
    ? `🌿 ESG Signal [${aeName}]: ${matches.length} trigger${matches.length>1?'s':''} today — ${dateStr}`
    : `ESG Signal [${aeName}]: No triggers today — ${dateStr}`;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${RESEND_API_KEY}`},
      body: JSON.stringify({ from:FROM_EMAIL, to:[toEmail], subject, html:buildEmail(aeName,matches,totalCompanies) })
    });
    const d = await r.json();
    if (d.id) console.log(`✅ Sent to ${aeName}: ${matches.length} matches`);
    else console.error(`❌ Failed ${aeName}:`, d);
  } catch(e) { console.error(`❌ Email error ${aeName}:`, e.message); }
}

// ════════════════════════════════════
//  MAIN DIGEST RUNNER
// ════════════════════════════════════
async function runDailyDigest(target='all') {
  console.log(`[${new Date().toISOString()}] Digest — target: ${target}`);
  const emails = getAEEmails();
  try {
    const articles = await fetchAllNews();
    const aesToRun = target==='all' ? Object.keys(AE_ASSIGNMENTS) : [target].filter(ae=>AE_ASSIGNMENTS[ae]);

    for (const ae of aesToRun) {
      const email = emails[ae];
      if (!email) { console.log(`⏭ Skip ${ae} — no email`); continue; }
      const matches = matchForAE(articles, AE_ASSIGNMENTS[ae]);
      console.log(`${ae}: ${matches.length} matches`);
      matches.forEach(m => console.log(`   → ${m._company} | ${m._trigger} | ${m.title.substring(0,55)}`));
      await sendEmail(email, ae, matches, AE_ASSIGNMENTS[ae].length);
      await new Promise(r=>setTimeout(r,500));
    }

    // Manager: all unique matches
    const mgr = process.env.MANAGER_EMAIL;
    if (mgr && target==='all') {
      const seen = new Set();
      const allMatches = [];
      for (const ae of Object.keys(AE_ASSIGNMENTS)) {
        for (const m of matchForAE(articles, AE_ASSIGNMENTS[ae])) {
          if (!seen.has(m.url)) { seen.add(m.url); allMatches.push({...m,_ae:ae}); }
        }
      }
      console.log(`Manager: ${allMatches.length} total matches`);
      await sendEmail(mgr, 'Manager (All AEs)', allMatches, 539);
    }
  } catch(e) { console.error('Digest error:', e.message); }
}

// ── ROUTES ──
app.get('/', (_req, res) => {
  res.json({ status:'ESG Signal v2 OK', sources:`${RSS_FEEDS.length} RSS feeds + NewsAPI`, schedule:'07:00 UTC daily', time:new Date().toISOString() });
});

app.get('/news', async (req, res) => {
  if (!NEWS_API_KEY) return res.status(500).json({ error:'NEWS_API_KEY not set' });
  const { q, pageSize='10', from } = req.query;
  if (!q) return res.status(400).json({ error:'Missing q' });
  try {
    const params = new URLSearchParams({ q, language:'en', pageSize, sortBy:'publishedAt', apiKey:NEWS_API_KEY });
    if (from) params.append('from', from);
    const r = await fetch(`https://newsapi.org/v2/everything?${params}`);
    const d = await r.json();
    if (d.status==='error') return res.status(400).json({ error:d.message });
    res.json(d);
  } catch(err) { res.status(500).json({ error:err.message }); }
});

app.get('/trigger-digest', async (req, res) => {
  if (req.query.secret !== TRIGGER_SECRET) return res.status(401).json({ error:'Wrong secret' });
  const ae = req.query.ae || 'all';
  res.json({ message:`Digest triggered for "${ae}" — check email in ~3 minutes` });
  runDailyDigest(ae);
});

// Schedule 07:00 UTC = 12:30 IST
cron.schedule('0 7 * * *', () => { console.log('⏰ Cron: daily digest'); runDailyDigest('all'); }, { timezone:'UTC' });

console.log(`✅ ESG Signal v2 on port ${PORT}`);
console.log(`✅ Sources: ${RSS_FEEDS.length} RSS feeds + NewsAPI`);
console.log(`✅ Schedule: 07:00 UTC (12:30 IST)`);
app.listen(PORT, ()=>{});
