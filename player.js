const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PLAYER_DIR = path.join(ROOT, 'player');
const META_FILE = path.join(ROOT, 'meta.json');
const PLAYER_INDEX_FILE = path.join(ROOT, 'player.json');

const REGION_SUFFIX_RE = / \((?:EN|JP|KR|TW|CN)\)$/;
const SEASON_FILE_RE = /^(?:bb|fe)\d+\.json$/;

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 4), { encoding: 'utf8' });
}

function getSeasonFiles() {
    return fs.readdirSync(ROOT)
        .filter((file) => SEASON_FILE_RE.test(file))
        .map((file) => path.basename(file, '.json'));
}

function getSeasonTimestamp(season, seasonData) {
    const data = seasonData.get(season);
    let latest = 0;
    for (const region of Object.values(data?.region || {})) {
        const time = Number(region?.LastRefreshTime) || 0;
        if (time > latest) latest = time;
    }
    return latest;
}

function getSeasonOrder(meta, seasonData) {
    const seasons = new Set(seasonData.keys());
    const metaOrder = Object.keys(meta).filter((season) => seasons.has(season));
    const known = new Set(metaOrder);
    const extraSeasons = [...seasons].filter((season) => !known.has(season));

    extraSeasons.sort((a, b) => getSeasonTimestamp(b, seasonData) - getSeasonTimestamp(a, seasonData));

    if (metaOrder.length === 0) return extraSeasons;

    const order = [...metaOrder];
    for (const season of extraSeasons) {
        const time = getSeasonTimestamp(season, seasonData);
        let insertAt = order.length;
        for (let i = 0; i < order.length; i++) {
            if (getSeasonTimestamp(order[i], seasonData) < time) {
                insertAt = i;
                break;
            }
        }
        order.splice(insertAt, 0, season);
    }
    return order;
}

function normalizeName(name) {
    if (typeof name !== 'string') return null;
    return name.replace(REGION_SUFFIX_RE, '');
}

function sortPlayerIds(ids) {
    return [...ids].sort((a, b) => {
        const numA = Number(a);
        const numB = Number(b);
        if (Number.isFinite(numA) && Number.isFinite(numB)) return numA - numB;
        return a.localeCompare(b);
    });
}

function main() {
    let meta = {};
    if (fs.existsSync(META_FILE)) {
        meta = readJson(META_FILE);
    }

    const seasonData = new Map();
    for (const season of getSeasonFiles()) {
        try {
            seasonData.set(season, readJson(path.join(ROOT, `${season}.json`)));
        } catch (error) {
            console.warn(`Skipping ${season}.json: ${error.message}`);
        }
    }

    const seasons = getSeasonOrder(meta, seasonData);
    const players = new Map();

    for (const season of seasons) {
        const region = seasonData.get(season)?.region || {};
        const entries = new Map();
        const namedEntries = new Map();

        for (const [regionKey, regionData] of Object.entries(region)) {
            if (regionKey === 'all' || !Array.isArray(regionData?.Rank)) continue;
            for (const entry of regionData.Rank) {
                if (!entry || entry.Id == null) continue;
                const id = String(entry.Id);
                if (!entries.has(id)) entries.set(id, entry);
                if (!namedEntries.has(id)) namedEntries.set(id, entry);
            }
        }

        const allRank = Array.isArray(region.all?.Rank) ? region.all.Rank : [];
        for (const entry of allRank) {
            if (!entry || entry.Id == null) continue;
            const id = String(entry.Id);
            if (!entries.has(id)) entries.set(id, entry);
        }

        for (const [id, entry] of entries) {
            let player = players.get(id);
            if (!player) {
                player = {
                    name: null,
                    icon: null,
                    pastname: [],
                    seasons: {},
                    hasLatest: false,
                };
                players.set(id, player);
            }

            const namedEntry = namedEntries.get(id) || entry;
            const name = normalizeName(namedEntry.NickName);
            const icon = namedEntry.HeadIcon ?? entry.HeadIcon ?? null;

            if (!player.hasLatest) {
                player.name = name;
                player.icon = icon;
                player.hasLatest = true;
            } else if (name !== null && name !== player.name && !player.pastname.includes(name)) {
                player.pastname.push(name);
            }

            player.seasons[season] = entry;
        }
    }

    const playerIds = sortPlayerIds(players.keys());
    const playerIndex = {};

    fs.mkdirSync(PLAYER_DIR, { recursive: true });

    for (const id of playerIds) {
        const player = players.get(id);
        playerIndex[id] = {
            name: player.name,
            pastname: player.pastname,
            icon: player.icon,
        };
        writeJson(path.join(PLAYER_DIR, `${id}.json`), player.seasons);
    }

    writeJson(PLAYER_INDEX_FILE, playerIndex);

    const currentFiles = new Set(playerIds.map((id) => `${id}.json`));
    for (const file of fs.readdirSync(PLAYER_DIR)) {
        if (/^\d+\.json$/.test(file) && !currentFiles.has(file)) {
            fs.unlinkSync(path.join(PLAYER_DIR, file));
        }
    }

    console.log(`Generated player.json and ${playerIds.length} player files`);
}

main();
