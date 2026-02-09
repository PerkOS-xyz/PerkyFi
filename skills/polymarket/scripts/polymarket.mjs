#!/usr/bin/env node

/**
 * Polymarket Data Fetcher
 * Get real-time prediction market data from Polymarket
 */

const GAMMA_API = 'https://gamma-api.polymarket.com';
const CLOB_API = 'https://clob.polymarket.com';

// Category keywords for filtering
const CATEGORIES = {
  politics: ['trump', 'biden', 'election', 'president', 'congress', 'senate', 'governor', 'political', 'vote'],
  crypto: ['bitcoin', 'ethereum', 'btc', 'eth', 'crypto', 'defi', 'nft', 'blockchain', 'coinbase', 'binance'],
  sports: ['nba', 'nfl', 'mlb', 'soccer', 'football', 'basketball', 'championship', 'super bowl', 'world cup'],
  entertainment: ['oscar', 'grammy', 'emmy', 'movie', 'netflix', 'spotify', 'celebrity'],
  science: ['spacex', 'nasa', 'climate', 'ai', 'technology', 'research'],
  business: ['ipo', 'stock', 'market', 'company', 'ceo', 'merger', 'acquisition']
};

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

function matchesCategory(text, category) {
  if (!category || !CATEGORIES[category]) return true;
  const keywords = CATEGORIES[category];
  const lowerText = text.toLowerCase();
  return keywords.some(kw => lowerText.includes(kw));
}

function formatOdds(prices) {
  if (!prices) return { yes: 'N/A', no: 'N/A' };
  
  // Handle string JSON
  let pricesArr = prices;
  if (typeof prices === 'string') {
    try {
      pricesArr = JSON.parse(prices);
    } catch {
      return { yes: 'N/A', no: 'N/A' };
    }
  }
  
  if (!Array.isArray(pricesArr) || pricesArr.length < 2) return { yes: 'N/A', no: 'N/A' };
  
  const yes = (parseFloat(pricesArr[0]) * 100).toFixed(1);
  const no = (parseFloat(pricesArr[1]) * 100).toFixed(1);
  return { yes: `${yes}%`, no: `${no}%` };
}

async function getEvents(options = {}) {
  const { limit = 10, category = null } = options;
  
  const url = `${GAMMA_API}/events?limit=${limit * 3}&active=true&closed=false`;
  const data = await fetchJSON(url);
  
  const results = [];
  for (const event of data) {
    const title = event.title || '';
    if (!matchesCategory(title, category)) continue;
    
    const markets = (event.markets || []).map(m => {
      let tokenIds = m.clobTokenIds;
      if (typeof tokenIds === 'string') {
        try { tokenIds = JSON.parse(tokenIds); } catch {}
      }
      return {
        question: m.question,
        odds: formatOdds(m.outcomePrices),
        volume: m.volume,
        slug: m.slug,
        conditionId: m.conditionId,
        tokenIds
      };
    });
    
    results.push({
      id: event.id,
      title: event.title,
      slug: event.slug,
      url: `https://polymarket.com/event/${event.slug}`,
      markets
    });
    
    if (results.length >= limit) break;
  }
  
  return results;
}

async function getMarket(options = {}) {
  const { slug, id } = options;
  
  let url;
  if (slug) {
    url = `${GAMMA_API}/markets?slug=${slug}`;
  } else if (id) {
    url = `${GAMMA_API}/markets/${id}`;
  } else {
    throw new Error('Must provide --slug or --id');
  }
  
  const data = await fetchJSON(url);
  const market = Array.isArray(data) ? data[0] : data;
  
  if (!market) {
    throw new Error('Market not found');
  }
  
  return {
    id: market.id,
    question: market.question,
    description: market.description,
    odds: formatOdds(market.outcomePrices),
    volume: market.volume,
    liquidity: market.liquidity,
    slug: market.slug,
    url: `https://polymarket.com/event/${market.slug}`,
    conditionId: market.conditionId,
    tokenIds: market.clobTokenIds,
    endDate: market.endDate
  };
}

async function getPrice(options = {}) {
  const { token } = options;
  
  if (!token) {
    throw new Error('Must provide --token TOKEN_ID');
  }
  
  const url = `${CLOB_API}/price?token_id=${token}`;
  const data = await fetchJSON(url);
  
  return {
    tokenId: token,
    price: data.price,
    percentage: `${(parseFloat(data.price) * 100).toFixed(1)}%`
  };
}

function printUsage() {
  console.log(`
Polymarket Data Fetcher

Usage:
  polymarket.mjs events [--limit N] [--category CATEGORY]
  polymarket.mjs market --slug SLUG | --id ID
  polymarket.mjs price --token TOKEN_ID

Commands:
  events    List active events with odds
  market    Get specific market details
  price     Get current price for a token

Options:
  --limit N         Number of results (default: 10)
  --category CAT    Filter by category: politics, crypto, sports, entertainment, science, business
  --slug SLUG       Market slug (for market command)
  --id ID           Market ID (for market command)
  --token TOKEN_ID  Token ID (for price command)

Examples:
  polymarket.mjs events --limit 5 --category politics
  polymarket.mjs market --slug "presidential-election-winner-2028"
  polymarket.mjs price --token "123456789..."
`);
}

function parseArgs(args) {
  const options = {};
  const command = args[0];
  
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        options[key] = value;
        i++;
      } else {
        options[key] = true;
      }
    }
  }
  
  return { command, options };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(0);
  }
  
  const { command, options } = parseArgs(args);
  
  try {
    let result;
    
    switch (command) {
      case 'events':
        result = await getEvents(options);
        break;
      case 'market':
        result = await getMarket(options);
        break;
      case 'price':
        result = await getPrice(options);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        printUsage();
        process.exit(1);
    }
    
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
