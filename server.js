const express  = require('express');
const cors     = require('cors');
const fetch    = require('node-fetch');
const cron     = require('node-cron');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── ENV VARS — set all in Render dashboard ──
const NEWS_API_KEY   = process.env.NEWS_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ALERT_EMAIL    = process.env.ALERT_EMAIL;
const FROM_EMAIL     = process.env.FROM_EMAIL || 'ESG Signal <onboarding@resend.dev>';
const TRIGGER_SECRET = process.env.TRIGGER_SECRET || 'esg-trigger-2025';

app.use(cors());
app.use(express.json());

// ════════════════════════════════════
//  YOUR ACTUAL 550 COMPANY LIST
// ════════════════════════════════════
const COMPANY_550 = [
  "BlackRock",
  "Vanguard Group",
  "Fidelity Investments",
  "State Street Global",
  "J.P. Morgan Chase",
  "UBS",
  "Capital Group",
  "Allianz Group",
  "Amundi",
  "BNY Investments",
  "Invesco",
  "Legal & General Group",
  "Franklin Templeton",
  "Prudential Financial",
  "T. Rowe Price Group",
  "Northern Trust",
  "BNP Paribas",
  "Natixis Investment Managers",
  "Wellington Management",
  "Nuveen",
  "Geode Capital Management",
  "Ameriprise Financial",
  "Charles Schwab Investment",
  "Sun Life Financial",
  "AXA Group",
  "Blackstone",
  "Power Financial",
  "Deutsche Bank",
  "Brookfield Asset Management",
  "Aegon Group",
  "Manulife",
  "Sumitomo Mitsui Trust Holdings",
  "Schroders",
  "Fidelity International",
  "Royal Bank of Canada",
  "Mitsubishi UFJ Financial Group",
  "Federated Hermes",
  "HSBC Holdings",
  "Principal Financial",
  "New York Life Investments",
  "Dimensional Fund Advisors",
  "Affiliated Managers Group",
  "Macquarie Group",
  "MetLife Investment Management",
  "Nippon Life Insurance",
  "Generali Group",
  "KKR",
  "Nomura Asset Management",
  "Allspring Global Investments",
  "Union Investment",
  "MassMutual",
  "Intesa Sanpaolo",
  "Abrdn",
  "Credit Suisse",
  "Neuberger Berman",
  "Voya Financial",
  "Dai-ichi Life Holdings",
  "Asset Management One",
  "U.S. Bancorp",
  "LBBW",
  "Mercer",
  "Ares Management",
  "Nordea",
  "M&G Investments",
  "Zenkyoren",
  "MEAG",
  "Dodge & Cox",
  "SEI Investments",
  "TD Global Invest. Solutions",
  "Janus Henderson Group",
  "Shinkin Central Bank",
  "Jackson Financial",
  "Meiji Yasuda Life Insurance",
  "Societe Generale",
  "Swiss Life Asset Managers",
  "Russell Investments",
  "Zurcher Kantonalbank",
  "Aviva",
  "Baillie Gifford",
  "NISA Investment",
  "Prudential",
  "Pictet Asset Management",
  "Dekabank Group",
  "Zurich Financial Services",
  "Sumitomo Life Insurance",
  "BMO Wealth Management",
  "Lazard",
  "Samsung Group",
  "Banco Santander",
  "Scotiabank",
  "Fisher Investments",
  "SEB",
  "Guggenheim Investments",
  "American Century",
  "CIBC Asset Management",
  "Raymond James",
  "Conning",
  "St. James's Place",
  "Robert W. Baird",
  "Anima Holding Italy",
  "Achmea",
  "TCW Group",
  "KBC Group",
  "Royal London Group",
  "CVC Capital Partners",
  "Mesirow",
  "Resona Holdings",
  "OFI AM",
  "Swedbank",
  "Robeco Group",
  "PNC Financial",
  "Caixabank",
  "Landesbank Hessen-Thuringen",
  "Danske Bank",
  "Virtus Investment Partners",
  "EFG International",
  "Man Group",
  "Union Bancaire Privee",
  "Victory Capital",
  "WTW",
  "BBVA",
  "Mn Services",
  "Payden & Rygel",
  "Artisan Partners",
  "Talanx Group",
  "StepStone Group",
  "CBRE Investment Management",
  "Partners Group",
  "IFM Investors",
  "Vontobel Asset Management",
  "Credit Mutuel",
  "F Van Lanschot",
  "Sumitomo Mitsui Financial Group",
  "PRIMECAP",
  "BCV",
  "Hightower Advisors",
  "Fiera Capital",
  "ASR",
  "Rothschild",
  "Storebrand Group",
  "Mirae Asset Financial Group",
  "Aon",
  "Bayerischen Landesbank",
  "Starwood Capital",
  "OP Financial Group",
  "IDUNA Gruppe",
  "Groupama Asset Management",
  "Swiss Re",
  "RhumbLine Advisers",
  "Acadian",
  "LGT Capital Partners",
  "KB Asset Management",
  "Svenska Handelsbanken",
  "EQT",
  "Goldman Sachs Asset Management",
  "HPS Investment Partners",
  "TPG",
  "The Carlyle Group",
  "Thoma Bravo",
  "Advent International",
  "Warburg Pincus",
  "Hg",
  "Clayton Dubilier & Rice",
  "Apollo Global Management",
  "Intermediate Capital Group",
  "Silver Lake",
  "Hellman & Friedman",
  "Oaktree Capital Management",
  "Vista Equity Partners",
  "AXA IM ALTS",
  "General Atlantic",
  "Clearlake Capital Group",
  "Leonard Green & Partners",
  "Apogem Capital Partners",
  "TA Associates",
  "Pacific Investment Management Company",
  "Permira Advisers",
  "Bain Capital",
  "Sixth Street",
  "Insight Partners",
  "Cinven",
  "Genstar Capital",
  "PGIM Private Alternatives",
  "Fortress Investment Group",
  "Blue Owl Capital",
  "Oak Hill Advisors",
  "Francisco Partners",
  "Barings",
  "Andreessen Horowitz",
  "Cerberus Capital Management",
  "American Securities",
  "Tiger Global Management",
  "BSP-Alcentra",
  "Bridgepoint",
  "GTCR",
  "BDT & MSD Partners",
  "New Mountain Capital",
  "Nordic Capital",
  "L Catterton",
  "Platinum Equity",
  "Stone Point Capital",
  "Crescent Capital Group",
  "Adams Street Partners",
  "Angelo Gordon",
  "PSG",
  "Ardian",
  "Pemberton Asset Management",
  "Arcmont Asset Management",
  "Golub Capital",
  "Veritas Capital",
  "HarbourVest Partners",
  "Astorg",
  "KPS Capital Partners",
  "PAG",
  "Antares Capital",
  "Hayfin Capital Management",
  "Summit Partners",
  "Hillhouse Capital Group",
  "The Jordan Company",
  "H.I.G. Capital",
  "Apax Partners",
  "Accel-KKR",
  "GoldenTree Asset Management",
  "Thomas H. Lee Partners",
  "Hamilton Lane",
  "Churchill Asset Management",
  "Vitruvian Partners",
  "Lightspeed Venture Partners",
  "TSG Consumer Partners",
  "AllianceBernstein",
  "BC Partners",
  "Eurazeo",
  "Castlelake",
  "Crestline Investors",
  "Värde Partners",
  "PAI Partners",
  "TCV",
  "Tikehau Capital",
  "InterVest Capital Partners",
  "Morgan Stanley Investment Management",
  "Farallon Capital Management",
  "MBK Partners",
  "CVC Credit Partners",
  "EIG",
  "Bregal Investments",
  "Albacore Capital Group",
  "IK Partners",
  "Altor Equity Partners",
  "Kohlberg & Company",
  "Park Square Capital",
  "Vista Credit Partners",
  "Liontrust",
  "Aberdeen Investments",
  "Sarasin & Partners",
  "Lombard Odier Investment Mgmt",
  "Sycomore Asset Management",
  "Carmignac",
  "AXA Investment Managers",
  "DWS Group",
  "Flossbach von Storch",
  "Bank of America",
  "Citigroup",
  "Wells Fargo",
  "Toronto-Dominion Bank",
  "Bank of Nova Scotia",
  "National Bank of Canada",
  "Desjardins Group",
  "Groupe BPCE / Natixis",
  "DZ Bank",
  "KfW",
  "First Abu Dhabi Bank",
  "Emirates NBD",
  "Saudi National Bank",
  "Al Rajhi Bank",
  "Abu Dhabi Commercial Bank",
  "Dubai Islamic Bank",
  "Mashreq Bank",
  "Truist Financial",
  "SpareBank 1",
  "Jyske Bank",
  "Nykredit",
  "Bunq",
  "ASN Bank",
  "Belfius",
  "Fifth Third Bancorp",
  "KeyCorp",
  "Helaba",
  "South Pole",
  "ERM (Environmental Resources Mgmt)",
  "WSP Global",
  "DNV",
  "Carbon Trust",
  "Systemiq",
  "Pollination",
  "Anthesis Group",
  "Vivid Economics (McKinsey)",
  "Frontier Economics",
  "Cambridge Econometrics",
  "2° Investing Initiative",
  "Quantis",
  "Morrow Sodali",
  "Georgeson",
  "FTI Consulting (ESG)",
  "Alvarez & Marsal (ESG)",
  "L.E.K. Consulting",
  "Strategy& (PwC)",
  "Charles River Associates",
  "Cornerstone Research",
  "Drees & Sommer",
  "I Care & Consult",
  "Goodwin Procter",
  "Milbank",
  "Fried Frank",
  "Schulte Roth & Zabel",
  "Morgan Lewis",
  "K&L Gates",
  "Vedder Price",
  "Winston & Strawn",
  "Vinson & Elkins",
  "Baker Botts",
  "Arnold & Porter",
  "Covington & Burling",
  "Akin Gump",
  "Shearman & Sterling (A&O Shearman)",
  "Cravath Swaine & Moore",
  "Cahill Gordon & Reindel",
  "Gibson Dunn",
  "Seward & Kissel",
  "Troutman Pepper",
  "Hunton Andrews Kurth",
  "Simmons & Simmons",
  "Taylor Wessing",
  "Burges Salmon",
  "Bird & Bird",
  "Stephenson Harwood",
  "Mishcon de Reya",
  "Clyde & Co",
  "HFW (Holman Fenwick Willan)",
  "Reed Smith",
  "Squire Patton Boggs",
  "DLA Piper",
  "Osler Hoskin & Harcourt",
  "Blake Cassels & Graydon",
  "Bennett Jones",
  "McCarthy Tetrault",
  "Stikeman Elliott",
  "Fasken",
  "Gowling WLG",
  "Al Tamimi & Company",
  "Hadef & Partners",
  "King & Spalding ME",
  "Al Busaidy Mansoor Jamal",
  "Khoshaim & Associates",
  "CMS Francis Lefebvre",
  "August & Debouzy",
  "Joffe & Associes",
  "Fidal",
  "Freshfields Germany",
  "Houthoff",
  "Elvinger Hoss Prussen",
  "Arendt & Medernach",
  "Wildgen",
  "BSP (Bonn Steichen & Partners)",
  "Florida State Board of Administration",
  "Texas Teachers Retirement System",
  "Wisconsin Investment Board",
  "New Jersey Division of Investment",
  "Massachusetts PRIM",
  "North Carolina Retirement",
  "Virginia Retirement System",
  "Oregon Investment Council",
  "Ohio Public Employees Retirement",
  "Minnesota State Board of Investment",
  "Colorado PERA",
  "Michigan Retirement Systems",
  "PSERS Pennsylvania",
  "NYC Employees Retirement System",
  "NYC Teachers Retirement System",
  "Illinois Teachers Retirement",
  "Maryland State Retirement",
  "Arizona State Retirement",
  "Iowa Public Employees Retirement",
  "Connecticut Retirement Plans",
  "Los Angeles City Employees Retirement",
  "PSP Investments",
  "Healthcare of Ontario Pension (HOOPP)",
  "Investment Management Corp Ontario (IMCO)",
  "OPTrust",
  "Caisse de depot et placement (CDPQ)",
  "BT Pension Scheme",
  "LGPS Central",
  "Northern LGPS",
  "Brunel Pension Partnership",
  "Borders to Coast Pension Partnership",
  "ACCESS Pool",
  "LGPS Wales (Wales Pension Partnership)",
  "Greater Manchester Pension Fund",
  "West Midlands Pension Fund",
  "Strathclyde Pension Fund",
  "Lothian Pension Fund",
  "London Pensions Fund Authority (LPFA)",
  "London CIV",
  "PMT (Metalektro)",
  "PME (Metaalindustrie)",
  "bpfBOUW",
  "PFZW",
  "AP1 (First AP Fund)",
  "AP2 (Second AP Fund)",
  "AP3 (Third AP Fund)",
  "AP4 (Fourth AP Fund)",
  "Keva",
  "Elo",
  "Caisse des Dépôts",
  "ERAFP",
  "FRR (Fonds de Reserve)",
  "Agirc-Arrco",
  "Bayerische Versorgungskammer (BVK)",
  "VBL (Versorgungsanstalt)",
  "Abu Dhabi Investment Authority (ADIA)",
  "Investment Corporation of Dubai (ICD)",
  "Hassana Investment (GOSI)",
  "Oman Investment Authority (OIA)",
  "Mumtalakat (Bahrain)",
  "Emirates Investment Authority",
  "Abu Dhabi Investment Council (ADIC)",
  "Sanabil Investments (PIF sub)",
  "Pennsylvania Public School Employees Retirement (PSERS)",
  "Ohio State Teachers Retirement System (STRS Ohio)",
  "Tennessee Consolidated Retirement System",
  "Georgia Teachers Retirement System",
  "South Carolina Retirement System",
  "Indiana Public Retirement System (INPRS)",
  "Missouri State Employees Retirement System (MOSERS)",
  "Kansas Public Employees Retirement System (KPERS)",
  "Montana Board of Investments",
  "Nevada Public Employees Retirement System (NVPERS)",
  "Utah Retirement Systems",
  "Delaware Public Employees Retirement System",
  "Rhode Island Employees Retirement System",
  "Maine Public Employees Retirement System (MainePERS)",
  "New Hampshire Retirement System",
  "Oklahoma Teachers Retirement System",
  "Dallas Police and Fire Pension System",
  "Los Angeles Fire and Police Pensions (LAFPP)",
  "San Diego City Employees Retirement System (SDCERS)",
  "Sacramento County Employees' Retirement System (SCERS)",
  "Contra Costa County Employees Retirement Association (CCCERA)",
  "Marin County Employees Retirement Association (MCERA)",
  "New York City Board of Education Retirement System (BERS)",
  "Illinois Municipal Retirement Fund (IMRF)",
  "Chicago Teachers Pension Fund (CTPF)",
  "Texas Municipal Retirement System (TMRS)",
  "Public Employee Retirement System of Idaho (PERSI)",
  "Wyoming Retirement System",
  "Vermont Pension Investment Committee (VPIC)",
  "CAAT Pension Plan",
  "Colleges of Applied Arts and Technology (CAAT)",
  "Alberta Teachers Retirement Fund (ATRF)",
  "Municipal Employees Pension Plan (MEPP) Saskatchewan",
  "Manitoba Teachers' Society Pension Plan",
  "Régime de retraite du personnel d'encadrement (RRPE)",
  "Fonds de solidarité FTQ",
  "Fondaction (CSN)",
  "Pension Protection Fund (PPF)",
  "National Employment Savings Trust (NEST)",
  "Shell Contributory Pension Fund",
  "BP Pension Fund",
  "Rolls-Royce UK Pension Fund",
  "BT Pension Scheme (BTPS)",
  "Sainsbury's Pension Scheme",
  "Marks & Spencer Pension Scheme",
  "Unilever UK Pension Fund",
  "Pearson Pension Plan",
  "National Grid UK Pension Scheme",
  "Centrica Pension Scheme",
  "Tesco PLC Pension Scheme",
  "Smart Pension",
  "Cushon",
  "People's Partnership (The People's Pension)",
  "NOW: Pensions",
  "Scottish Widows Master Trust",
  "Pensioenfonds Detailhandel",
  "Pensioenfonds Zoetwaren",
  "Pensioenfonds Horeca & Catering",
  "Pensioenfonds Vervoer",
  "Pensioenfonds Medisch Specialisten",
  "Pensioenfonds Huisartsen",
  "Pensioenfonds Vliegverkeer (PFVV)",
  "Stichting Pensioenfonds Openbaar Vervoer (SPOV)",
  "Kommunal Landspensjonskasse (KLP)",
  "Statens pensjonsfond utland (GPFG / Oil Fund)",
  "Statens pensjonsfond Norge (GPFN)",
  "PFA Pension",
  "AP Pension",
  "Sampension",
  "Lærernes Pension (LP)",
  "Topdanmark Pension",
  "Skandia (Sweden)",
  "Länsförsäkringar (Sweden)",
  "Fjärde AP-fonden (AP4)",
  "SPP Fonder",
  "Avanza Pension (Sweden)",
  "Mandatum Life (Finland)",
  "LocalTapiola (Finland)",
  "Malakoff Humanis",
  "AG2R La Mondiale",
  "Ircantec",
  "CNAV (Caisse Nationale d'Assurance Vieillesse)",
  "Préfon-Retraite",
  "Pro BTP",
  "Klesia",
  "Apicil Group",
  "Agrica",
  "DEVK Versicherungen",
  "Signal Iduna",
  "R+V Versicherung",
  "Debeka",
  "HUK-Coburg",
  "Württembergische Versicherung (W&W Group)",
  "Provinzial Rheinland",
  "Sparkassen-Versicherung",
  "KZVK (Kirchliche Zusatzversorgungskasse)",
  "EZVK (Evangelische Zusatzversorgungskasse)",
  "ASGA Pensionskasse",
  "Pensionskasse der Swisscom",
  "Bâloise (Baloise Sammelstiftung)",
  "Helvetia Sammelstiftung",
  "Swiss Life Sammelstiftung",
  "Nest Sammelstiftung",
  "Ethos Foundation / Ethos Services",
  "Ireland Strategic Investment Fund (ISIF)",
  "National Pensions Reserve Fund (NPRF successor)",
  "Irish Life Investment Managers (ILIM)",
  "Davy Asset Management",
  "Ethias",
  "Integrale",
  "General Organization for Social Insurance (GOSI)",
  "Abu Dhabi Pension Fund (ADPF)",
  "Public Pension Agency Saudi Arabia (PPA)",
  "Social Insurance Investment Portfolio (Bahrain)",
  "PKA",
  "ATP"
];

// ── ESG HIGH-CONFIDENCE KEYWORDS ──
const ESG_KEYWORDS = [
  'esg','environmental social governance','sustainability report','net zero',
  'net-zero','carbon neutral','carbon offset','decarboni','responsible investment',
  'impact investing','impact fund','sfdr','tcfd','csrd','article 8','article 9',
  'taxonomy regulation','pri signatory','un sdg','sustainable development goal',
  'stewardship code','shareholder engagement','proxy voting','green bond',
  'social bond','sustainability bond','esg rating','esg score','climate risk',
  'climate finance','scope 1','scope 2','scope 3','head of esg',
  'chief sustainability','sustainability director','esg framework','esg policy',
  'esg strategy','esg commitment','paris agreement','science based target',
  'sbti','just transition','biodiversity','nature positive','esg report',
  'sustainable invest','impact report','esg data','esg integration',
];

// ── NEWS QUERIES ──
const DIGEST_QUERIES = [
  'ESG investment sustainability finance',
  'responsible investment impact fund',
  'net zero carbon climate investment',
  'SFDR TCFD CSRD sustainable finance',
  'ESG stewardship shareholder engagement',
  'sustainability ESG report strategy fund',
];

app.use(cors());

// ── HEALTH CHECK ──
app.get('/', (_req, res) => {
  res.json({
    status: 'ESG Signal proxy OK',
    digest_schedule: 'Daily at 07:00 UTC',
    companies_tracked: COMPANY_550.length,
    time: new Date().toISOString()
  });
});

// ── PROXY (existing — unchanged) ──
app.get('/news', async (req, res) => {
  if (!NEWS_API_KEY) return res.status(500).json({ error: 'NEWS_API_KEY not set' });
  const { q, pageSize = '10', from } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing q' });
  try {
    const params = new URLSearchParams({ q, language:'en', pageSize, sortBy:'publishedAt', apiKey:NEWS_API_KEY });
    if (from) params.append('from', from);
    const r = await fetch(`https://newsapi.org/v2/everything?${params}`);
    const d = await r.json();
    if (d.status === 'error') return res.status(400).json({ error: d.message });
    res.json(d);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── MANUAL TEST TRIGGER ──
// Visit: https://your-render-url.onrender.com/trigger-digest?secret=esg-trigger-2025
app.get('/trigger-digest', async (req, res) => {
  if (req.query.secret !== TRIGGER_SECRET) return res.status(401).json({ error: 'Wrong secret' });
  res.json({ message: 'Digest running in background — check your email in ~2 minutes' });
  runDailyDigest();
});

// ════════════════════════════════════
//  FETCH & MATCH LOGIC
// ════════════════════════════════════
async function fetchAndMatch() {
  const from = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];
  const allArticles = [];

  for (const query of DIGEST_QUERIES) {
    try {
      const params = new URLSearchParams({
        q: query, language:'en', pageSize:'10',
        sortBy:'publishedAt', from, apiKey:NEWS_API_KEY
      });
      const r = await fetch(`https://newsapi.org/v2/everything?${params}`);
      const d = await r.json();
      if (d.articles) allArticles.push(...d.articles);
      await new Promise(res => setTimeout(res, 300)); // small delay between calls
    } catch(e) { console.error(`Query failed: ${query}`, e.message); }
  }

  // Deduplicate by URL
  const seen = new Set();
  const unique = allArticles.filter(a => {
    if (!a.title || a.title === '[Removed]' || !a.url || seen.has(a.url)) return false;
    seen.add(a.url); return true;
  });

  console.log(`Fetched ${unique.length} unique articles`);

  // Match: MUST have ESG keyword AND 550 company name
  const matches = [];
  for (const article of unique) {
    const text = ((article.title||'')+'|'+(article.description||'')+'|'+(article.content||'')).toLowerCase();

    const esgMatch = ESG_KEYWORDS.find(kw => text.includes(kw));
    if (!esgMatch) continue;

    const companyMatch = COMPANY_550.find(co => text.includes(co.toLowerCase()));
    if (!companyMatch) continue;

    matches.push({ ...article, _esgKeyword: esgMatch, _company: companyMatch });
  }

  return matches;
}

// ════════════════════════════════════
//  BUILD EMAIL HTML
// ════════════════════════════════════
function buildEmailHtml(matches) {
  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday:'long', day:'numeric', month:'long', year:'numeric'
  });

  const header = `
    <div style="background:#0d1421;padding:24px 28px;border-radius:10px 10px 0 0;">
      <h1 style="color:#10d4a8;margin:0 0 4px;font-size:22px;font-family:sans-serif;">◈ ESG Signal</h1>
      <p style="color:#8ba0bc;margin:0;font-size:13px;font-family:sans-serif;">Daily Digest · ${dateStr}</p>
    </div>`;

  if (matches.length === 0) {
    return `<div style="max-width:600px;margin:0 auto;font-family:sans-serif;">
      ${header}
      <div style="background:#fff;padding:24px 28px;border-radius:0 0 10px 10px;border:1px solid #e5e7eb;border-top:none;">
        <p style="color:#6b7280;font-size:14px;margin:0;">No high-confidence ESG matches found involving your 550 target companies in the last 24 hours. Check back tomorrow!</p>
      </div>
    </div>`;
  }

  const cards = matches.map(a => `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:14px;border-left:4px solid #10d4a8;background:#fff;">
      <div style="margin-bottom:8px;">
        <span style="background:#d1fae5;color:#065f46;padding:2px 9px;border-radius:20px;font-size:11px;font-weight:700;font-family:sans-serif;margin-right:6px;">🏢 ${a._company}</span>
        <span style="background:#dbeafe;color:#1e40af;padding:2px 9px;border-radius:20px;font-size:11px;font-family:sans-serif;">${a._esgKeyword}</span>
      </div>
      <h3 style="margin:0 0 6px;font-size:15px;color:#111;font-family:sans-serif;line-height:1.4;">
        <a href="${a.url}" style="color:#111;text-decoration:none;">${a.title}</a>
      </h3>
      <p style="margin:0 0 12px;font-size:13px;color:#555;line-height:1.5;font-family:sans-serif;">${a.description||''}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
        <span style="font-size:12px;color:#9ca3af;font-family:sans-serif;">
          📰 ${a.source?.name||'Unknown'} · ${new Date(a.publishedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
        </span>
        <a href="${a.url}" style="background:#10d4a8;color:#fff;padding:6px 14px;border-radius:6px;font-size:12px;text-decoration:none;font-weight:600;font-family:sans-serif;">Read article →</a>
      </div>
    </div>`).join('');

  return `
  <div style="max-width:600px;margin:0 auto;font-family:sans-serif;background:#f9fafb;padding:20px;">
    ${header}
    <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:20px 28px 8px;margin-bottom:16px;">
      <p style="margin:0;font-size:14px;color:#374151;">
        🎯 Found <strong style="color:#10d4a8;">${matches.length} high-confidence ESG alert${matches.length>1?'s':''}</strong>
        involving your 550 target companies in the last 24 hours.
      </p>
    </div>
    ${cards}
    <div style="text-align:center;padding:20px;color:#9ca3af;font-size:11px;font-family:sans-serif;">
      ESG Signal · Daily Digest · Verified articles from NewsAPI · Always verify before outreach<br><br>
      <a href="https://rasikapinglikar-debug.github.io/esg-signal" style="color:#10d4a8;text-decoration:none;">Open ESG Signal Tool →</a>
    </div>
  </div>`;
}

// ════════════════════════════════════
//  SEND EMAIL via Resend
// ════════════════════════════════════
async function sendDigestEmail(matches) {
  if (!RESEND_API_KEY) { console.log('⚠ RESEND_API_KEY not set — skipping email send'); return; }
  if (!ALERT_EMAIL)    { console.log('⚠ ALERT_EMAIL not set — skipping email send'); return; }

  const dateStr = new Date().toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'});
  const subject = matches.length > 0
    ? `🌿 ESG Signal: ${matches.length} alert${matches.length>1?'s':''} today — ${dateStr}`
    : `ESG Signal: No alerts today — ${dateStr}`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ALERT_EMAIL],
        subject,
        html: buildEmailHtml(matches),
      })
    });
    const d = await r.json();
    if (d.id) console.log(`✅ Digest sent! ID: ${d.id} | Matches: ${matches.length}`);
    else console.error('❌ Resend error:', JSON.stringify(d));
  } catch(e) { console.error('❌ Email send failed:', e.message); }
}

// ════════════════════════════════════
//  MAIN DIGEST RUNNER
// ════════════════════════════════════
async function runDailyDigest() {
  console.log(`[${new Date().toISOString()}] Starting daily ESG digest…`);
  try {
    const matches = await fetchAndMatch();
    console.log(`Matched: ${matches.length} articles`);
    matches.forEach(m => console.log(`  → ${m._company} | ${m._esgKeyword} | ${m.title}`));
    await sendDigestEmail(matches);
  } catch(e) { console.error('Digest runner error:', e.message); }
}

// ════════════════════════════════════
//  SCHEDULE — every day at 07:00 UTC
//  = 07:30 IST / 08:00 CET / 07:00 GMT
// ════════════════════════════════════
cron.schedule('0 7 * * *', () => {
  console.log('⏰ Cron: running daily digest');
  runDailyDigest();
}, { timezone: 'UTC' });

console.log(`✅ ESG Signal proxy running on port ${PORT}`);
console.log(`✅ Daily digest scheduled: 07:00 UTC`);
console.log(`✅ Tracking ${COMPANY_550.length} companies`);

app.listen(PORT, () => {});
