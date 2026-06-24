const crypto = require('crypto');
const readline = require('readline');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const protobuf = require('protobufjs');
let { BB_SEASON, FE_SEASON } = require('./season.json');

const ENV_FILE = path.join(__dirname, '.env');
if (fs.existsSync(ENV_FILE)) {
    process.loadEnvFile(ENV_FILE);
}

const USE_LOCAL_DATA = false;

const BLITZ_URL = 'https://raw.githubusercontent.com/AutumnVN/StellaSoraData/refs/heads/main/blitz.json';
const RAID_URL = 'https://raw.githubusercontent.com/AutumnVN/StellaSoraData/refs/heads/main/raid.json';
const CHARACTERID_URL = 'https://raw.githubusercontent.com/AutumnVN/StellaSoraData/refs/heads/main/characterid.json';
const STARTOWERBUILDRANK_URL = 'https://raw.githubusercontent.com/AutumnVN/StellaSoraData/refs/heads/main/EN/bin/StarTowerBuildRank.json';
const POTENTIAL_URL = 'https://raw.githubusercontent.com/AutumnVN/StellaSoraData/refs/heads/main/EN/bin/CharPotential.json';
const ACTIVITY_URL = 'https://raw.githubusercontent.com/AutumnVN/StellaSoraData/refs/heads/main/EN/bin/Activity.json';
const SCOREBOSSCONTROL_URL = 'https://raw.githubusercontent.com/AutumnVN/StellaSoraData/refs/heads/main/CN/bin/ScoreBossControl.json';

const VERSION = '727.727.727.7272727';
const SDK_URL_EN = 'https://en-sdk-api.yostarplat.com';
const SDK_URL_JP = 'https://jp-sdk-api.yostarplat.com';
const SDK_URL_KR = 'https://jp-sdk-api.yostarplat.com';
const SDK_URL_TW = 'https://jp-sdk-api.yostarplat.com';
const SERVER_URL_EN = 'https://nova.stellasora.global';
const SERVER_URL_JP = 'https://nova.stellasora.jp';
const SERVER_URL_KR = 'https://nova.stellasora.kr';
const SERVER_URL_TW = 'https://nova.stargazer-games.com';
const SERVER_GARBLE_KEY_EN = Buffer.from('xNdVF^XTa6T3HCUATMQ@sKMLzAw&%L!3', 'ascii');
const SERVER_GARBLE_KEY_JP = Buffer.from('yX5Gt64PVvVH6$qwBXaPJC*LZKoK5mYh', 'ascii');
const SERVER_GARBLE_KEY_KR = Buffer.from('25hdume9H#*6hHn@d9hSF7tekTwN#JYj', 'ascii');
const SERVER_GARBLE_KEY_TW = Buffer.from('N&mfco452ZH5!nE3s&o5uxB57UGPENVo', 'ascii');
const DEVICE = process.env.DEVICE;
const EMAIL_EN = process.env.EMAIL_EN;
const EMAIL_JP = process.env.EMAIL_JP;
const EMAIL_KR = process.env.EMAIL_KR;
const EMAIL_TW = process.env.EMAIL_TW;
const TOKEN_EN = process.env.TOKEN_EN;
const TOKEN_JP = process.env.TOKEN_JP;
const TOKEN_KR = process.env.TOKEN_KR;
const TOKEN_TW = process.env.TOKEN_TW;
const UID_EN = process.env.UID_EN;
const UID_JP = process.env.UID_JP;
const UID_KR = process.env.UID_KR;
const UID_TW = process.env.UID_TW;

const SEASONS = [BB_SEASON, FE_SEASON];
const REGIONS = ['en', 'jp', 'kr', 'tw', 'cn'];

const regionData = {};
const removedData = {};

const protoText = `
syntax = "proto2";
package proto;

message IKEReq {
    optional int64 ClientTs = 2;
    optional int32 ProtoVersion = 1;
    optional bytes PubKey = 3;
}

message IKEResp {
    optional int64 ServerTs = 3;
    optional int32 Cipher = 2;
    optional bytes PubKey = 4;
    optional string Token = 1;
}

message HonorInfo {
    optional uint32 Id = 1;
    optional uint32 AffinityLV = 2;
}

message ItemTpl {
    optional uint32 Tid = 1;
    optional int32 Qty = 2;
}

message BuildPotential {
    optional uint32 PotentialId = 1;
    optional uint32 Level = 2;
}

message ScoreBossRankChar {
    optional uint32 Id = 1;
    optional uint32 Level = 2;
}

message ScoreBossRankTeam {
    optional uint32 BuildScore = 1;
    repeated ScoreBossRankChar Chars = 2;
    optional uint32 LevelScore = 3;
    optional uint32 LevelId = 4;
    repeated uint32 Discs = 5;
    repeated BuildPotential Potentials = 6;
    repeated ItemTpl Notes = 7;
    repeated uint32 ActiveSecondaryIds = 8;
}

message ScoreBossRankData {
    optional uint64 Id = 1;
    optional string NickName = 2;
    optional uint32 HeadIcon = 4;
    optional uint32 Score = 5;
    optional uint32 Rank = 6;
    optional uint32 TitlePrefix = 7;
    optional uint32 TitleSuffix = 8;
    repeated ScoreBossRankTeam Teams = 9;
    repeated HonorInfo Honors = 15;
}

message ScoreBossRankInfo {
    optional int64 LastRefreshTime = 1;
    optional ScoreBossRankData Self = 2;
    repeated ScoreBossRankData Rank = 3;
    repeated uint64 Border = 4;
    optional uint32 Total = 5;
}

message JointDrillRankChar {
    optional uint32 Id = 1;
    optional uint32 Level = 2;
    optional bytes NextPackage = 2047;
}

message JointDrillRankTeam {
    repeated JointDrillRankChar Chars = 1;
    optional uint32 BuildScore = 2;
    optional uint32 Damage = 3;
    optional uint32 Time = 4;
    repeated uint32 Discs = 5;
    repeated BuildPotential Potentials = 6;
    repeated ItemTpl Notes = 7;
    repeated uint32 ActiveSecondaryIds = 8;
    optional bytes NextPackage = 2047;
}

message JointDrillRankData {
    optional uint64 Id = 1;
    optional string NickName = 2;
    optional uint32 WorldClass = 3;
    optional uint32 HeadIcon = 4;
    optional uint32 Score = 5;
    optional uint32 Rank = 6;
    optional uint32 TitlePrefix = 7;
    optional uint32 TitleSuffix = 8;
    repeated HonorInfo Honors = 9;
    repeated JointDrillRankTeam Teams = 10;
    optional bytes NextPackage = 2047;
}

message JointDrillRankInfo {
    optional int64 LastRefreshTime = 1;
    optional JointDrillRankData Self = 2;
    repeated JointDrillRankData Rank = 3;
    optional uint32 Total = 4;
    optional bytes NextPackage = 2047;
}

message Res {
    optional uint32 Tid = 1;
    optional int32 Qty = 2;
    optional bytes NextPackage = 2047;
}

message Item {
    optional uint64 Id = 1;
    optional uint32 Tid = 2;
    optional int32 Qty = 3;
    optional int64 Expire = 4;
    optional bytes NextPackage = 2047;
}

message PlayerInfo {
    repeated Res Res = 2;
    repeated Item Items = 3;
    optional bytes NextPackage = 2047;
}

message OfficialOverseas {
    optional string Uid = 1;
    optional string Token = 2;
}

message Regular {
    optional string Name = 1;
    optional string Pass = 2;
    optional bytes NextPackage = 2047;
}

message Official {
    optional uint64 Uid = 1;
    optional string Token = 2;
    optional bytes NextPackage = 2047;
}

message LoginReq {
    optional Regular Account = 1;
    optional Official Official = 2;
    optional OfficialOverseas OfficialOverseas = 3;
    optional string Token = 4;
    optional int32 Platform = 11;
    optional string Language = 12;
    optional string Channel = 13;
    optional string Device = 14;
    optional string Version = 15;
}

message LoginResp {
    optional string Token = 1;
}

message Error {
    optional uint32 Code = 1;
    repeated string Arguments = 2;
    optional uint64 TraceId = 3;
    optional int32 Action = 4;
}
`;

const root = protobuf.parse(protoText).root;
const IKEReq = root.lookupType('proto.IKEReq');
const IKEResp = root.lookupType('proto.IKEResp');
const ScoreBossRankInfo = root.lookupType('proto.ScoreBossRankInfo');
const JointDrillRankInfo = root.lookupType('proto.JointDrillRankInfo');
const PlayerInfoType = root.lookupType('proto.PlayerInfo');
const LoginReq = root.lookupType('proto.LoginReq');
const LoginResp = root.lookupType('proto.LoginResp');

function encryptGCM(plaintext, key) {
    const args = Array.prototype.slice.call(arguments);
    const useAad = args.length >= 3 ? !!args[2] : true;
    const iv = (args.length >= 4 && args[3]) ? args[3] : crypto.randomBytes(12);
    const algo = key.length === 32 ? 'aes-256-gcm' : (key.length === 24 ? 'aes-192-gcm' : 'aes-128-gcm');
    const cipher = crypto.createCipheriv(algo, key, iv, { authTagLength: 16 });
    if (useAad) cipher.setAAD(iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, ciphertext, tag]);
}

function decryptGCM(data, key) {
    const args = Array.prototype.slice.call(arguments);
    const useAad = args.length >= 3 ? !!args[2] : true;
    const iv = data.slice(0, 12);
    const enc = data.slice(12);
    if (enc.length < 16) throw new Error('Invalid GCM payload');
    const tag = enc.slice(enc.length - 16);
    const ciphertext = enc.slice(0, enc.length - 16);
    const algo = key.length === 32 ? 'aes-256-gcm' : (key.length === 24 ? 'aes-192-gcm' : 'aes-128-gcm');
    const decipher = crypto.createDecipheriv(algo, key, iv, { authTagLength: 16 });
    if (useAad) decipher.setAAD(iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext;
}

function encryptChaCha(plaintext, key) {
    const args = Array.prototype.slice.call(arguments);
    const useAad = args.length >= 3 ? !!args[2] : true;
    const iv = (args.length >= 4 && args[3]) ? args[3] : crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('chacha20-poly1305', key, iv, { authTagLength: 16 });
    if (useAad) cipher.setAAD(iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, ciphertext, tag]);
}

function decryptChaCha(data, key) {
    const args = Array.prototype.slice.call(arguments);
    const useAad = args.length >= 3 ? !!args[2] : true;
    const iv = data.slice(0, 12);
    const enc = data.slice(12);
    if (enc.length < 16) throw new Error('Invalid ChaCha payload');
    const tag = enc.slice(enc.length - 16);
    const ciphertext = enc.slice(0, enc.length - 16);
    const decipher = crypto.createDecipheriv('chacha20-poly1305', key, iv, { authTagLength: 16 });
    if (useAad) decipher.setAAD(iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext;
}

function encryptBasic(buf, key) {
    const out = Buffer.from(buf);
    for (let i = 0; i < out.length; i++) {
        out[i] = out[i] ^ key[i % key.length];
        const b = out[i] & 0xff;
        const v7 = (b << 1) & 0xff;
        const v1 = ((b >> 7) & 0x01);
        out[i] = (v1 | v7) & 0xff;
        out[i] = out[i] ^ out.length;
    }
    return out;
}

function decryptBasic(buf, key) {
    const out = Buffer.from(buf);
    for (let i = 0; i < out.length; i++) {
        out[i] = out[i] ^ out.length;
        const b = out[i] & 0xff;
        const v1 = (b << 7) & 0xff;
        const v7 = ((b >> 1) & 0x7f) & 0xff;
        out[i] = (v7 | v1) & 0xff;
        out[i] = out[i] ^ key[i % key.length];
    }
    return out;
}

function hkdfSha256(ikm, salt, info, length) {
    const prk = crypto.createHmac('sha256', salt).update(ikm).digest();
    const hashLen = 32;
    const n = Math.ceil(length / hashLen);
    let prev = Buffer.alloc(0);
    const outParts = [];
    for (let i = 1; i <= n; i++) {
        const hmac = crypto.createHmac('sha256', prk);
        hmac.update(prev);
        if (info) hmac.update(info);
        hmac.update(Buffer.from([i]));
        prev = hmac.digest();
        outParts.push(prev);
    }
    return Buffer.concat(outParts).slice(0, length);
}

function generateSessionKey(sharedKey, serverPub, clientPub) {
    const ikm = Buffer.alloc(32);
    const count = Math.min(sharedKey.length, 32);
    sharedKey.copy(ikm, 32 - count, 0, count);

    const salt = Buffer.from(serverPub || []);
    const srvLen = salt.length || 1;
    const clientBuf = Buffer.from(clientPub || []);
    const info = Buffer.alloc(clientBuf.length);
    for (let i = 0; i < clientBuf.length; i++) {
        const c = clientBuf[i] & 0xff;
        let s = salt[i % srvLen] & 0xff;
        if (c > s) {
            s = (s << 1) & 0xff;
        } else {
            s = (s >> 1) & 0xff;
        }
        info[i] = (s ^ c) & 0xff;
    }

    return hkdfSha256(ikm, salt, info, 32);
}

function postBuffer(urlString, buf, headers = {}) {
    return fetch(urlString, {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/octet-stream' }, headers),
        body: Buffer.isBuffer(buf) ? buf : Buffer.from(buf),
    }).then(async (res) => {
        if (!res.ok) {
            const bodyText = await res.text().catch(() => '');
            throw new Error(`POST ${urlString} failed with ${res.status} ${res.statusText}${bodyText ? ': ' + bodyText : ''}`);
        }
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
    });
}

let _cachedServerTimeStamp = null;
let _cachedClientSyncTimeSinceStartup = 0;
let _httpSeq = 0;
let _useAad = true;

function markServerTimeStamp(serverTimeStamp) {
    _cachedServerTimeStamp = BigInt(serverTimeStamp.toNumber());
    _cachedClientSyncTimeSinceStartup = Math.floor(process.uptime());
}

async function isAutumnPlayingStellaSoraRightNow() {
    const lanyard = await fetch('https://api.lanyard.rest/v1/users/393694671383166998').then(res => res.json());
    return lanyard.data?.activities?.some(activity => activity.name === 'Stella Sora');
}

async function getLatestSeason() {
    const now = new Date();
    const JointDrillActivityType = 7;

    console.log('Getting latest season info...');

    const [activityData, scoreBossControlData] = await Promise.all([
        fetch(ACTIVITY_URL).then(res => res.json()),
        fetch(SCOREBOSSCONTROL_URL).then(res => res.json())
    ]);

    const currentSeasonBBId = Object.values(scoreBossControlData).find(item =>
        now >= new Date(item.StartTime) && now < new Date(item.EndTime)
    )?.Id;

    const latestSeasonFEId = Object.values(activityData).reduce((maxId, item) => {
        if (item.ActivityType !== JointDrillActivityType) return maxId;
        return item.Id > maxId ? item.Id : maxId;
    }, 0) % 51000;

    BB_SEASON = currentSeasonBBId ? `bb${currentSeasonBBId}` : BB_SEASON;
    FE_SEASON = latestSeasonFEId ? `fe${latestSeasonFEId}` : FE_SEASON;
    SEASONS[0] = BB_SEASON;
    SEASONS[1] = FE_SEASON;

    console.log(`Latest seasons - BB: ${BB_SEASON}, FE: ${FE_SEASON}`);
    fs.writeFileSync(path.join(__dirname, 'season.json'), JSON.stringify({ BB_SEASON, FE_SEASON }, null, 4), { encoding: 'utf8' });
}

async function doIkeHandshake(serverUrl = SERVER_URL_EN, serverGarbleKey = SERVER_GARBLE_KEY_EN) {
    const ecdh = crypto.createECDH('prime256v1');
    const clientPub = ecdh.generateKeys();
    const reqMsg = IKEReq.create({ ClientTs: Math.floor(Date.now() / 1000), ProtoVersion: 1, PubKey: clientPub });
    const reqBufProto = IKEReq.encode(reqMsg).finish();
    const packet = Buffer.alloc(2 + reqBufProto.length);
    packet.writeUInt16BE(1, 0);
    reqBufProto.copy(packet, 2);

    const gcm = encryptGCM(packet, serverGarbleKey, _useAad);
    const basic = encryptBasic(gcm, serverGarbleKey);

    const url = serverUrl + '/agent-zone-1/';
    const respBuf = await postBuffer(url, basic);

    const dec1 = decryptBasic(respBuf, serverGarbleKey);
    const dec2 = decryptGCM(dec1, serverGarbleKey, _useAad);

    const respMsgId = dec2.readUInt16BE(0);
    if (respMsgId !== 2) throw new Error('Unexpected IKE response msgId: ' + respMsgId);

    const respProto = dec2.slice(2);
    const resp = IKEResp.decode(respProto);
    if (resp && resp.ServerTs !== undefined && resp.ServerTs !== null) {
        markServerTimeStamp(resp.ServerTs);
    }
    const token = resp.Token;
    const cipher = resp.Cipher;
    const serverPub = resp.PubKey;
    if (!serverPub || serverPub.length === 0) throw new Error('No server public key received');

    const shared = ecdh.computeSecret(Buffer.from(serverPub));
    const sessionKey = generateSessionKey(shared, Buffer.from(serverPub), clientPub);

    return { token, cipher, sessionKey };
}

function generateYostarAuthHeader(head = {}, body = {}) {
    const SALT = '886c085e4a8d30a703367b120dd8353948405ec2';

    const HEAD = {
        Channel: head.Channel ?? 'pc',
        Platform: head.Platform ?? 'pc',
        Lang: head.Lang ?? 'en',
        DeviceID: head.DeviceID ?? DEVICE,
        Version: head.Version ?? '4.16.0',
        GVersionNo: head.GVersionNo ?? VERSION,
        GBuildNo: head.GBuildNo ?? '',
        PID: head.PID ?? 'US-NOVA',
        DeviceModel: head.DeviceModel ?? 'AutumnVN',
        Time: head.Time ?? Math.floor(Date.now() / 1000),
        UID: head.UID ?? UID_EN,
        Token: head.Token ?? '',
    };

    const headerJson = JSON.stringify(HEAD);
    const bodyJson = JSON.stringify(body);
    const toSign = headerJson + bodyJson + SALT;
    const sign = crypto.createHash('md5').update(toSign, 'utf8').digest('hex').toUpperCase();
    const authObj = { Head: HEAD, Sign: sign };
    return JSON.stringify(authObj);
}

async function quickLogin(savedToken, sdkUrl = SDK_URL_EN, headOverrides = {}) {
    const url = sdkUrl + '/user/quick-login';
    const authHeader = generateYostarAuthHeader(Object.assign({}, headOverrides, { Token: savedToken }), {});
    const respBuf = await postBuffer(url, Buffer.from('{}'), { 'Content-Type': 'application/json', 'Authorization': authHeader });
    let txt = '';
    txt = respBuf.toString('utf8');
    let obj = null;
    obj = JSON.parse(txt);
    if (!obj || obj.Code !== 200 || !obj.Data || !obj.Data.UserInfo || !obj.Data.UserInfo.Token) {
        throw new Error('/user/quick-login failed');
    }

    return { accountLoginToken: obj.Data.UserInfo.Token, accountUid: obj.Data.UserInfo.ID };
}

async function sendAuthCodeRequest(email, sdkUrl = SDK_URL_EN, head = {}) {
    const urlSend = sdkUrl + '/yostar/send-code';
    const bodyObj = { Account: email };
    const body = JSON.stringify(bodyObj);
    const authHeader = generateYostarAuthHeader(head, bodyObj);
    const respBuf = await postBuffer(urlSend, Buffer.from(body, 'utf8'), { 'Content-Type': 'application/json', 'Authorization': authHeader });
    let txt = '';
    txt = respBuf.toString('utf8');
    let obj = null;
    obj = JSON.parse(txt);

    if (!obj || obj.Code !== 200) {
        throw new Error('/yostar/send-code failed');
    }

    return obj;
}

function askQuestion(promptText) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(promptText, (answer) => { rl.close(); resolve(answer.trim()); }));
}

async function getWebLoginToken(email, code, sdkUrl = SDK_URL_EN, head = {}) {
    const urlAuth = sdkUrl + '/yostar/get-auth';
    const bodyAuthObj = { Account: email, Code: code };
    const bodyAuth = JSON.stringify(bodyAuthObj);
    const authHeader = generateYostarAuthHeader(head, bodyAuthObj);
    const respAuthBuf = await postBuffer(urlAuth, Buffer.from(bodyAuth, 'utf8'), { 'Content-Type': 'application/json', 'Authorization': authHeader });
    let txtAuth = '';
    txtAuth = respAuthBuf.toString('utf8');
    let objAuth = null;
    objAuth = JSON.parse(txtAuth);

    if (!objAuth || objAuth.Code !== 200 || !objAuth.Data || !objAuth.Data.Token) {
        throw new Error('/yostar/get-auth failed');
    }

    const authToken = objAuth.Data.Token;

    const urlLogin = sdkUrl + '/user/login';
    const bodyLoginObj = { OpenID: email, Token: authToken, Type: 'yostar', UserName: email, Secret: '', CheckAccount: 0 };
    const bodyLogin = JSON.stringify(bodyLoginObj);
    const authHeader2 = generateYostarAuthHeader(head, bodyLoginObj);
    const respBuf = await postBuffer(urlLogin, Buffer.from(bodyLogin, 'utf8'), { 'Content-Type': 'application/json', 'Authorization': authHeader2 });
    let txt = '';
    txt = respBuf.toString('utf8');
    let obj = null;
    obj = JSON.parse(txt);

    return { accountLoginToken: obj.Data.UserInfo.Token, accountUid: obj.Data.UserInfo.ID };
}

function saveYostarToken(token, envKey = 'TOKEN') {
    let content = '';
    if (fs.existsSync(ENV_FILE)) {
        content = fs.readFileSync(ENV_FILE, 'utf8');
        const lines = content.split(/\r?\n/).filter(line => !line.trim().startsWith(envKey + '='));
        content = lines.join('\n');
        if (content.length && !content.endsWith('\n')) content += '\n';
    }
    content += `${envKey}=${token}\n`;
    fs.writeFileSync(ENV_FILE, content, { encoding: 'utf8' });
    process.env[envKey] = token;
}

function makeHeader10() {
    const buf = Buffer.alloc(10, 0);

    if (_cachedServerTimeStamp === null) {
        const now = BigInt(Math.floor(Date.now() / 1000));
        let v = now;
        for (let i = 0; i < 8; i++) {
            buf[7 - i] = Number(v & BigInt(0xff));
            v >>= BigInt(8);
        }
    } else {
        const nowSinceStartup = BigInt(Math.floor(process.uptime()));
        let currentServerTs = _cachedServerTimeStamp + nowSinceStartup - BigInt(_cachedClientSyncTimeSinceStartup);
        if (currentServerTs < 0) currentServerTs = (BigInt(1) << BigInt(64)) + currentServerTs;
        let v = currentServerTs;
        for (let i = 0; i < 8; i++) {
            buf[7 - i] = Number(v & BigInt(0xff));
            v >>= BigInt(8);
        }
    }

    const seq = _httpSeq & 0xffff;
    buf.writeUInt16BE(seq, 8);
    _httpSeq = (_httpSeq + 1) & 0xffff;
    return buf;
}

function buildNovaMessage(msgId, bodyBuf, cipher, sessionKey, useServerGarble = false, serverGarbleKey = SERVER_GARBLE_KEY_EN) {
    if (!Buffer.isBuffer(bodyBuf)) bodyBuf = Buffer.from(bodyBuf || []);
    const pkt = Buffer.alloc(2 + bodyBuf.length);
    pkt.writeUInt16BE(msgId, 0);
    if (bodyBuf.length) bodyBuf.copy(pkt, 2);

    const header10 = makeHeader10();
    const plaintext = Buffer.concat([header10, pkt]);

    const useGarble = useServerGarble || msgId === 1;
    const aeadKey = useGarble ? serverGarbleKey : sessionKey;

    let enc = cipher === 1 ? encryptChaCha(plaintext, aeadKey, _useAad) : encryptGCM(plaintext, aeadKey, _useAad);

    if (useGarble) {
        enc = encryptBasic(enc, serverGarbleKey);
    }

    return enc;
}

async function doPlayerLogin(sessionToken, cipher, sessionKey, accountLoginToken, accountUid, serverUrl = SERVER_URL_EN, serverGarbleKey = SERVER_GARBLE_KEY_EN, options = {}) {
    const player_login_req = 4;
    const player_login_succeed_ack = 5;
    const player_login_failed_ack = 6;
    const system_failed_ack = 10000;

    const opts = Object.assign({}, options);
    if (!opts.language) opts.language = 'en_US';
    if (!opts.version) opts.version = VERSION;
    if (!opts.device) opts.device = DEVICE;
    if (!opts.channel) opts.channel = 'Official';

    const language = opts.language;
    const version = opts.version;
    const deviceId = opts.device;
    const channel = opts.channel;

    const reqMsg = LoginReq.create({
        OfficialOverseas: { Uid: accountUid, Token: accountLoginToken },
        Platform: 3,
        Language: language,
        Channel: channel,
        Device: deviceId,
        Version: version
    });
    const reqBufProto = LoginReq.encode(reqMsg).finish();

    const payload = buildNovaMessage(player_login_req, reqBufProto, cipher, sessionKey, false, serverGarbleKey);
    const url = serverUrl + '/agent-zone-1/';
    const respBuf = await postBuffer(url, payload, { 'X-Token': sessionToken });

    let decPlain;
    if (cipher === 1) {
        decPlain = decryptChaCha(respBuf, sessionKey, _useAad);
    } else {
        decPlain = decryptGCM(respBuf, sessionKey, _useAad);
    }

    let respMsgId = null;
    respMsgId = decPlain.readUInt16BE(0);

    if (respMsgId === player_login_succeed_ack) {
        const protoBuf = decPlain.slice(2);
        const info = LoginResp.decode(protoBuf);
        return info;
    } else {
        if (respMsgId === system_failed_ack) {
            const ErrType = root.lookupType('proto.Error');
            const errObj = ErrType.decode(decPlain.slice(2));
            throw new Error('Server returned system_failed_ack (10000): ' + JSON.stringify(errObj));
        } else if (respMsgId === player_login_failed_ack) {
            const ErrType = root.lookupType('proto.Error');
            const errObj = ErrType.decode(decPlain.slice(2));
            throw new Error('Server returned player_login_failed_ack (6): ' + JSON.stringify(errObj));
        } else {
            throw new Error('Unexpected player_login response msgId: ' + respMsgId);
        }
    }
}

async function getPlayerData(token, cipher, sessionKey, serverUrl = SERVER_URL_EN, serverGarbleKey = SERVER_GARBLE_KEY_EN) {
    const player_data_req = 1001;
    const player_data_succeed_ack = 1002;

    const payload = buildNovaMessage(player_data_req, Buffer.alloc(0), cipher, sessionKey, false, serverGarbleKey);
    const url = serverUrl + '/agent-zone-1/';
    const respBuf = await postBuffer(url, payload, { 'X-Token': token });
    let decPlain;
    if (cipher === 1) {
        decPlain = decryptChaCha(respBuf, sessionKey, _useAad);
    } else {
        decPlain = decryptGCM(respBuf, sessionKey, _useAad);
    }

    let respMsgId = null;
    respMsgId = decPlain.readUInt16BE(0);

    if (respMsgId === player_data_succeed_ack) {
        const protoBuf = decPlain.slice(2);
        const info = PlayerInfoType.decode(protoBuf);
        return info;
    } else {
        throw new Error('Unexpected player_data response msgId: ' + respMsgId);
    }
}

function saveInventoryToFile(info, filename) {
    const obj = PlayerInfoType.toObject(info, { longs: String, enums: String, bytes: 'base64' });
    const items = (obj.Items || []).slice();
    const res = (obj.Res || []).slice();

    items.sort((a, b) => {
        const ta = Number(a.Tid ?? a.tid ?? 0);
        const tb = Number(b.Tid ?? b.tid ?? 0);
        return ta - tb;
    });

    res.sort((a, b) => {
        const ta = Number(a.Tid ?? 0);
        const tb = Number(b.Tid ?? 0);
        return ta - tb;
    });

    fs.writeFileSync(filename, JSON.stringify({ Items: items, Res: res }, null, 4), { encoding: 'utf8' });
    console.log('Inventory saved to', filename);
}

async function getScoreBossRank(token, cipher, sessionKey, serverUrl = SERVER_URL_EN, serverGarbleKey = SERVER_GARBLE_KEY_EN) {
    const score_boss_rank_req = 11107;
    const score_boss_rank_succeed_ack = 11108;

    const payload = buildNovaMessage(score_boss_rank_req, Buffer.alloc(0), cipher, sessionKey, false, serverGarbleKey);
    const url = serverUrl + '/agent-zone-1/';
    const respBuf = await postBuffer(url, payload, { 'X-Token': token });
    let decPlain;
    if (cipher === 1) {
        decPlain = decryptChaCha(respBuf, sessionKey, _useAad);
    } else {
        decPlain = decryptGCM(respBuf, sessionKey, _useAad);
    }

    let respMsgId = null;
    respMsgId = decPlain.readUInt16BE(0);

    if (respMsgId === score_boss_rank_succeed_ack) {
        const protoBuf = decPlain.slice(2);
        const info = ScoreBossRankInfo.decode(protoBuf);
        return info;
    } else {
        throw new Error('Unexpected score_boss_rank response msgId: ' + respMsgId);
    }
}

function storeScoreBossRank(info, region, isJson = false) {
    const obj = isJson ? info : ScoreBossRankInfo.toObject(info, { longs: String, enums: String, bytes: 'base64' });
    if (!obj || Object.keys(obj).length === 0 || !Array.isArray(obj.Rank) || obj.Rank.length === 0) {
        console.warn('ScoreBossRank info is empty; skipping');
        return;
    }

    let oldRank = [];
    const lbFile = path.join(__dirname, `${BB_SEASON}.json`);
    if (fs.existsSync(lbFile)) {
        const prevSeason = JSON.parse(fs.readFileSync(lbFile, 'utf8'));
        const prevRegion = prevSeason?.region?.[region];
        if (prevRegion && Array.isArray(prevRegion.Rank)) oldRank = prevRegion.Rank;
    }

    const newRank = obj.Rank || [];
    const newIds = new Set(newRank.map(r => r.Id));
    const lastNewScore = newRank.length ? newRank[newRank.length - 1].Score : 0;

    const removed = [];
    for (const oldEntry of oldRank || []) {
        const oldId = oldEntry.Id;
        if (!newIds.has(oldId)) {
            const oldScore = oldEntry.Score;
            if (oldScore > lastNewScore) {
                const rankNum = oldEntry.Rank;
                const nick = oldEntry.NickName;
                removed.push(`${oldId} #${rankNum} ${nick} ${oldScore.toLocaleString('en-US')}`);
            }
        }
    }

    removedData[`bb${region}`] = Array.from(new Set(removed));
    regionData[`bb${region}`] = obj;
    console.log(`ScoreBossRank info stored (${region.toUpperCase()})`);
}

async function getJointDrillRank(token, cipher, sessionKey, serverUrl = SERVER_URL_EN, serverGarbleKey = SERVER_GARBLE_KEY_EN) {
    const joint_drill_rank_req = 6225;
    const joint_drill_rank_succeed_ack = 6226;

    const payload = buildNovaMessage(joint_drill_rank_req, Buffer.alloc(0), cipher, sessionKey, false, serverGarbleKey);
    const url = serverUrl + '/agent-zone-1/';
    const respBuf = await postBuffer(url, payload, { 'X-Token': token });
    let decPlain;
    if (cipher === 1) {
        decPlain = decryptChaCha(respBuf, sessionKey, _useAad);
    } else {
        decPlain = decryptGCM(respBuf, sessionKey, _useAad);
    }

    let respMsgId = null;
    respMsgId = decPlain.readUInt16BE(0);

    if (respMsgId === joint_drill_rank_succeed_ack) {
        const protoBuf = decPlain.slice(2);
        const info = JointDrillRankInfo.decode(protoBuf);
        return info;
    } else {
        throw new Error('Unexpected response msgId: ' + respMsgId);
    }
}

function storeJointDrillRank(info, region, isJson = false) {
    const obj = isJson ? info : JointDrillRankInfo.toObject(info, { longs: String, enums: String, bytes: 'base64' });
    if (!obj || Object.keys(obj).length === 0 || !Array.isArray(obj.Rank) || obj.Rank.length === 0) {
        console.warn('JointDrillRank info is empty; skipping');
        return;
    }

    let oldRank = [];
    const lbFile = path.join(__dirname, `${FE_SEASON}.json`);
    if (fs.existsSync(lbFile)) {
        const prevSeason = JSON.parse(fs.readFileSync(lbFile, 'utf8'));
        const prevRegion = prevSeason?.region?.[region];
        if (prevRegion && Array.isArray(prevRegion.Rank)) oldRank = prevRegion.Rank;
    }

    const newRank = obj.Rank || [];
    const newIds = new Set(newRank.map(r => r.Id));
    const lastNewScore = newRank.length ? newRank[newRank.length - 1].Score : 0;

    const removed = [];
    for (const oldEntry of oldRank || []) {
        const oldId = oldEntry.Id;
        if (!newIds.has(oldId)) {
            const oldScore = oldEntry.Score;
            if (oldScore > lastNewScore) {
                const rankNum = oldEntry.Rank;
                const nick = oldEntry.NickName;
                removed.push(`${oldId} #${rankNum} ${nick} ${oldScore.toLocaleString('en-US')}`);
            }
        }
    }

    removedData[`fe${region}`] = Array.from(new Set(removed));
    regionData[`fe${region}`] = obj;
    console.log(`JointDrillRank info stored (${region.toUpperCase()})`);
}

function getSeasonPrefix(season) {
    return String(season).replace(/\d+/g, '');
}

function getSeasonRegionKey(season, region) {
    return `${getSeasonPrefix(season)}${region}`;
}

function combineLeaderboard(season) {
    const seasonPrefix = getSeasonPrefix(season);
    const combined = [];
    let sumTotal = 0;
    let maxRefresh = 0;

    for (const region of REGIONS) {
        const json = regionData[getSeasonRegionKey(season, region)];
        if (!json) continue;
        sumTotal += Number(json.Total) || 0;
        const lr = Number(json.LastRefreshTime) || 0;
        if (lr > maxRefresh) maxRefresh = lr;
        const rankArr = json.Rank || [];
        for (const r of rankArr) {
            const copy = Object.assign({}, r);
            const nick = copy.NickName;
            copy.NickName = `${nick} (${region.toUpperCase()})`;
            combined.push(copy);
        }
    }

    combined.sort((a, b) => {
        const sa = a.Score;
        const sb = b.Score;
        if (sa === sb) return 0;
        return sb - sa;
    });

    let lastScore = null;
    let lastRank = 0;
    for (let i = 0; i < combined.length; i++) {
        const s = combined[i].Score;
        if (i === 0) {
            lastRank = 1;
            combined[i].Rank = lastRank;
            lastScore = s;
        } else if (s === lastScore) {
            combined[i].Rank = lastRank;
        } else {
            const rank = i + 1;
            combined[i].Rank = rank;
            lastRank = rank;
            lastScore = s;
        }
    }

    if (!Array.isArray(combined) || combined.length === 0 || combined.every(r => !r || Object.keys(r).length === 0)) {
        console.warn(`Combined leaderboard for ${season} is empty; skipping`);
        return;
    }

    const out = { Rank: combined, Total: sumTotal, LastRefreshTime: String(maxRefresh) };
    const combinedKey = `${seasonPrefix}all`;
    regionData[combinedKey] = out;
    removedData[combinedKey] = [...REGIONS.map(r => removedData[getSeasonRegionKey(season, r)] || []).flat()];
    console.log(`Combined leaderboard for ${season} stored`);
}

async function processSeason(season) {
    const regionKeys = [...REGIONS, 'all'];
    const regionMap = {};
    for (const rk of regionKeys) {
        const fname = getSeasonRegionKey(season, rk);
        regionMap[rk] = regionData[fname] || null;
    }
    const missingRegions = REGIONS.filter((rk) => {
        if (rk === 'cn') return false;
        const region = regionMap[rk];
        return !region || !Array.isArray(region.Rank) || region.Rank.length === 0;
    });
    if (missingRegions.length > 0) {
        console.warn(`Skipping processing ${season}; missing region data: ${missingRegions.join(', ')}`);
        return;
    }

    const [characterIdData, starTowerBuildRankData, potentialData] = await Promise.all([
        fetch(CHARACTERID_URL).then(res => res.json()),
        fetch(STARTOWERBUILDRANK_URL).then(res => res.json()),
        fetch(POTENTIAL_URL).then(res => res.json()),
    ]);

    const region = {};
    const globalNeededCharIds = new Set();

    for (const rk of regionKeys) {
        const rd = regionMap[rk];
        if (!rd) continue;

        if (rd.Rank) {
            for (const entry of rd.Rank) {
                for (const team of entry.Teams || []) {
                    team.RecordRank = computeRecordRank(team.BuildScore, starTowerBuildRankData || {});
                }
            }
        }

        if (rd.Self?.Teams) {
            for (const team of rd.Self.Teams) {
                team.RecordRank = computeRecordRank(team.BuildScore, starTowerBuildRankData || {});
            }
        }

        const charCountsAll = {};
        const charUsersAll = {};
        const charCountsByFloor = {};
        const charUsersByFloor = {};
        if (rd.Rank) {
            for (const entry of rd.Rank) {
                const perFloorCharSets = {};
                for (const team of entry.Teams || []) {
                    const fid = String(team.LevelId ?? '');
                    if (!fid) continue;
                    if (!perFloorCharSets[fid]) perFloorCharSets[fid] = new Set();
                    for (const c of team.Chars || []) perFloorCharSets[fid].add(+c.Id);
                }

                for (const fid of Object.keys(perFloorCharSets)) {
                    if (!charCountsByFloor[fid]) charCountsByFloor[fid] = {};
                    if (!charUsersByFloor[fid]) charUsersByFloor[fid] = {};
                    for (const cid of perFloorCharSets[fid]) {
                        charCountsByFloor[fid][cid] = (charCountsByFloor[fid][cid] || 0) + 1;
                        charUsersByFloor[fid][cid] = charUsersByFloor[fid][cid] || [];
                        charUsersByFloor[fid][cid].push({ id: entry.Id, name: entry.NickName, rank: entry.Rank });
                    }
                }

                const playerChars = new Set();
                for (const team of entry.Teams || []) {
                    for (const c of team.Chars || []) playerChars.add(+c.Id);
                }
                for (const cid of playerChars) {
                    charCountsAll[cid] = (charCountsAll[cid] || 0) + 1;
                    charUsersAll[cid] = charUsersAll[cid] || [];
                    charUsersAll[cid].push({ id: entry.Id, name: entry.NickName, rank: entry.Rank });
                }
            }
        }

        const usageByFloor = {};
        for (const fid of Object.keys(charCountsByFloor)) {
            const counts = charCountsByFloor[fid] || {};
            const users = charUsersByFloor[fid] || {};
            const list = Object.keys(counts)
                .map((k) => {
                    const idNum = +k;
                    const name = (characterIdData && characterIdData[idNum]) || undefined;
                    const us = (users[k] || []).map((u) => ({ id: u.id, name: u.name, rank: u.rank }));
                    return { id: idNum, count: counts[k], name, users: us };
                })
                .sort((a, b) => b.count - a.count);
            let prevCountLocal = null;
            let currentRankLocal = 0;
            for (let i = 0; i < list.length; i++) {
                if (list[i].count !== prevCountLocal) currentRankLocal = i + 1;
                list[i].rank = currentRankLocal;
                prevCountLocal = list[i].count;
            }
            usageByFloor[fid] = list;
        }

        const usageAll = Object.keys(charCountsAll)
            .map((k) => {
                const idNum = +k;
                const name = (characterIdData && characterIdData[idNum]) || undefined;
                const users = (charUsersAll[k] || []).map((u) => ({ id: u.id, name: u.name, rank: u.rank }));
                return { id: idNum, count: charCountsAll[k], name, users };
            })
            .sort((a, b) => b.count - a.count);
        let prevCountLocal = null;
        let currentRankLocal = 0;
        for (let i = 0; i < usageAll.length; i++) {
            if (usageAll[i].count !== prevCountLocal) currentRankLocal = i + 1;
            usageAll[i].rank = currentRankLocal;
            prevCountLocal = usageAll[i].count;
        }
        usageByFloor['all'] = usageAll;

        const teamCountsAll = {};
        const teamUsersAll = {};
        const teamCountsByFloor = {};
        const teamUsersByFloor = {};
        if (rd.Rank) {
            for (const entry of rd.Rank) {
                const perFloorTeamSets = {};
                for (const team of entry.Teams || []) {
                    const fid = String(team.LevelId ?? '');
                    if (!fid) continue;
                    const ids = [(team.Chars[0] || {}).Id, (team.Chars[1] || {}).Id, (team.Chars[2] || {}).Id];
                    const main = ids[0];
                    const support = [ids[1], ids[2]].sort((a, b) => a - b);
                    const key = `${main}-${support[0]}-${support[1]}`;
                    if (!perFloorTeamSets[fid]) perFloorTeamSets[fid] = new Set();
                    if (perFloorTeamSets[fid].has(key)) continue;
                    perFloorTeamSets[fid].add(key);

                    if (!teamCountsByFloor[fid]) teamCountsByFloor[fid] = {};
                    if (!teamUsersByFloor[fid]) teamUsersByFloor[fid] = {};
                    teamCountsByFloor[fid][key] = (teamCountsByFloor[fid][key] || 0) + 1;
                    teamUsersByFloor[fid][key] = teamUsersByFloor[fid][key] || [];
                    teamUsersByFloor[fid][key].push({ id: entry.Id, name: entry.NickName, rank: entry.Rank, chars: ids, teamScore: getTeamScoreForSeason(team, season, entry.Teams) });
                }

                const playerTeams = new Set();
                for (const team of entry.Teams || []) {
                    const ids = [(team.Chars[0] || {}).Id, (team.Chars[1] || {}).Id, (team.Chars[2] || {}).Id];
                    const main = ids[0];
                    const support = [ids[1], ids[2]].sort((a, b) => a - b);
                    const key = `${main}-${support[0]}-${support[1]}`;
                    if (playerTeams.has(key)) continue;
                    playerTeams.add(key);
                    teamCountsAll[key] = (teamCountsAll[key] || 0) + 1;
                    teamUsersAll[key] = teamUsersAll[key] || [];
                    teamUsersAll[key].push({ id: entry.Id, name: entry.NickName, rank: entry.Rank, chars: ids, teamScore: getTeamScoreForSeason(team, season, entry.Teams) });
                }
            }
        }

        const usageTeamByFloor = {};
        for (const fid of Object.keys(teamCountsByFloor)) {
            const counts = teamCountsByFloor[fid] || {};
            const users = teamUsersByFloor[fid] || {};
            const list = Object.keys(counts).map((k) => {
                const parts = k.split('-').map((n) => Number(n));
                const mainId = parts[0];
                const support0 = parts[1];
                const support1 = parts[2];
                const us = (users[k] || []).map((u) => ({ id: u.id, name: u.name, rank: u.rank, teamScore: u.teamScore }));
                const topUser = us.length ? us.reduce((best, u) => (!best || (u.teamScore || 0) > (best.teamScore || 0) ? u : best), null) : null;
                const mainName = (characterIdData && characterIdData[mainId]) || undefined;
                const supportName0 = (characterIdData && characterIdData[support0]) || undefined;
                const supportName1 = (characterIdData && characterIdData[support1]) || undefined;
                const displayName = `${mainName || mainId} • ${supportName0 || support0}, ${supportName1 || support1}`;
                return { key: k, main: mainId, members: [mainId, support0, support1], count: counts[k], name: displayName, users: us, topUser };
            });
            list.sort((a, b) => b.count - a.count);
            let prev = null;
            let rank = 0;
            for (let i = 0; i < list.length; i++) {
                if (list[i].count !== prev) rank = i + 1;
                list[i].rank = rank;
                prev = list[i].count;
            }
            usageTeamByFloor[fid] = list;
        }

        const usageTeamAll = Object.keys(teamCountsAll).map((k) => {
            const parts = k.split('-').map((n) => Number(n));
            const mainId = parts[0];
            const support0 = parts[1];
            const support1 = parts[2];
            const users = (teamUsersAll[k] || []).map((u) => ({ id: u.id, name: u.name, rank: u.rank, teamScore: u.teamScore }))
            const topUser = users.length ? users.reduce((best, u) => (!best || (u.teamScore || 0) > (best.teamScore || 0) ? u : best), null) : null;
            const mainName = (characterIdData && characterIdData[mainId]) || undefined;
            const supportName0 = (characterIdData && characterIdData[support0]) || undefined;
            const supportName1 = (characterIdData && characterIdData[support1]) || undefined;
            const displayName = `${mainName || mainId} • ${supportName0 || support0}, ${supportName1 || support1}`;
            return { key: k, main: mainId, members: [mainId, support0, support1], count: teamCountsAll[k], name: displayName, users: users, topUser };
        });
        usageTeamAll.sort((a, b) => b.count - a.count);
        prev = null;
        rank = 0;
        for (let i = 0; i < usageTeamAll.length; i++) {
            if (usageTeamAll[i].count !== prev) rank = i + 1;
            usageTeamAll[i].rank = rank;
            prev = usageTeamAll[i].count;
        }
        usageTeamByFloor['all'] = usageTeamAll;

        const scoreTeamByFloor = {};
        for (const fk of Object.keys(usageTeamByFloor)) {
            const rawList = usageTeamByFloor[fk] || [];
            const sortedList = [...rawList].sort((a, b) => {
                const aScore = Math.abs(a.topUser?.teamScore || 0);
                const bScore = Math.abs(b.topUser?.teamScore || 0);
                return season === BB_SEASON ? bScore - aScore : aScore - bScore;
            });
            const rankedList = sortedList.map((item, index, arr) => {
                const score = Math.abs(item.topUser?.teamScore || 0);
                let rank = 1;
                if (index > 0) {
                    const prevScore = Math.abs(arr[index - 1].topUser?.teamScore || 0);
                    if (score === prevScore) {
                        rank = arr[index - 1].rank;
                    }
                    else {
                        rank = index + 1;
                    }
                }

                item.users.sort((a, b) => {
                    const aScore = Math.abs(a.teamScore || 0);
                    const bScore = Math.abs(b.teamScore || 0);
                    return season === BB_SEASON ? bScore - aScore : aScore - bScore;
                });

                const potentialUsage = { all: {}, high: {}, low: {} };
                for (const teamUser of item.users) {
                    const userId = teamUser.id;
                    const userEntry = rd.Rank.find(e => e.Id === userId);
                    const userTeam = userEntry?.Teams?.find(t => {
                        const ids = [(t.Chars[0] || {}).Id, (t.Chars[1] || {}).Id, (t.Chars[2] || {}).Id];
                        const main = ids[0];
                        const support = [ids[1], ids[2]].sort((a, b) => a - b);
                        const key = `${main}-${support[0]}-${support[1]}`;
                        return key === item.key;
                    });

                    const potentials = userTeam?.Potentials || [];
                    for (const p of potentials) {
                        const pid = `p${p.PotentialId}`;
                        potentialUsage.all[pid] = (potentialUsage.all[pid] || 0) + 1;
                        if ((p.Level || 0) >= 4) {
                            potentialUsage.high[pid] = (potentialUsage.high[pid] || 0) + 1;
                        } else {
                            potentialUsage.low[pid] = (potentialUsage.low[pid] || 0) + 1;
                        }
                    }
                }

                potentialUsage.all = Object.fromEntries(Object.entries(potentialUsage.all).sort((a, b) => b[1] - a[1]));
                potentialUsage.high = Object.fromEntries(Object.entries(potentialUsage.high).sort((a, b) => b[1] - a[1]));
                potentialUsage.low = Object.fromEntries(Object.entries(potentialUsage.low).sort((a, b) => b[1] - a[1]));

                const discUsage = { all: {}, main: {}, support: {} };
                for (const teamUser of item.users) {
                    const userId = teamUser.id;
                    const userEntry = rd.Rank.find(e => e.Id === userId);
                    const userTeam = userEntry?.Teams?.find(t => {
                        const ids = [(t.Chars[0] || {}).Id, (t.Chars[1] || {}).Id, (t.Chars[2] || {}).Id];
                        const main = ids[0];
                        const support = [ids[1], ids[2]].sort((a, b) => a - b);
                        const key = `${main}-${support[0]}-${support[1]}`;
                        return key === item.key;
                    });

                    const discs = userTeam?.Discs || [];
                    for (const d of discs) {
                        const did = `d${d}`;
                        discUsage.all[did] = (discUsage.all[did] || 0) + 1;
                        if (discs.indexOf(d) < 3) {
                            discUsage.main[did] = (discUsage.main[did] || 0) + 1;
                        } else {
                            discUsage.support[did] = (discUsage.support[did] || 0) + 1;
                        }
                    }
                }

                discUsage.all = Object.fromEntries(Object.entries(discUsage.all).sort((a, b) => b[1] - a[1]));
                discUsage.main = Object.fromEntries(Object.entries(discUsage.main).sort((a, b) => b[1] - a[1]));
                discUsage.support = Object.fromEntries(Object.entries(discUsage.support).sort((a, b) => b[1] - a[1]));

                return {
                    ...item,
                    rank,
                    potentialUsage,
                    discUsage
                };
            });
            scoreTeamByFloor[fk] = rankedList;
        }

        rd.UsageByFloor = usageByFloor;
        rd.UsageTeamByFloor = usageTeamByFloor;
        rd.ScoreTeamByFloor = scoreTeamByFloor;

        const neededCharIds = new Set();
        if (rd.Rank) {
            for (const entry of rd.Rank) {
                for (const team of entry.Teams || []) {
                    for (const c of team.Chars || []) {
                        neededCharIds.add(+c.Id);
                    }
                }
            }
        }
        if (rd.Self?.Teams) {
            for (const team of rd.Self.Teams) {
                for (const c of team.Chars || []) {
                    neededCharIds.add(+c.Id);
                }
            }
        }
        for (const n of neededCharIds) globalNeededCharIds.add(n);

        region[rk] = rd;
    }

    const potentialDataSubset = {};
    for (const idNum of globalNeededCharIds) {
        if (potentialData && potentialData[idNum]) potentialDataSubset[idNum] = potentialData[idNum];
    }

    for (const rk2 of Object.keys(region)) {
        const rd2 = region[rk2];
        if (!rd2) continue;
        if (Array.isArray(rd2.Rank)) {
            for (const entry of rd2.Rank) {
                for (const team of entry.Teams || []) {
                    const tb = mapTeamPotentials(team);
                    team.BuildCode = packPotentialData(tb, potentialDataSubset) || null;
                }
            }
        }
        if (rd2.Self && Array.isArray(rd2.Self.Teams)) {
            for (const team of rd2.Self.Teams) {
                const tb = mapTeamPotentials(team);
                team.BuildCode = packPotentialData(tb, potentialDataSubset) || null;
            }
        }
    }

    const hasContent = Object.keys(region).some((k) => {
        const rd = region[k];
        if (!rd) return false;
        if (Array.isArray(rd.Rank) && rd.Rank.length > 0) return true;
        if (rd.Self && Object.keys(rd.Self).length > 0) return true;
        return false;
    });

    if (!hasContent) {
        console.log(`No data for ${season}; skipping`);
    } else {
        const out = { region };
        const outName = `${season}.json`;
        fs.writeFileSync(path.join(__dirname, outName), JSON.stringify(out, null, 4), { encoding: 'utf8' });
        console.log(`Processed leaderboard written to ${outName}`);
    }
}

function isMetaEmpty(m) {
    if (!m) return true;
    if (m.floor && typeof m.floor === 'object' && Object.keys(m.floor).length > 0) return false;
    const rem = m.removed || {};
    for (const k of ['all', 'en', 'jp', 'kr', 'tw', 'cn']) {
        if (Array.isArray(rem[k]) && rem[k].length > 0) return false;
    }
    return true;
}

function computeRecordRank(buildScore, rankData) {
    if (!rankData) return null;
    let best = null;
    Object.keys(rankData).forEach((k) => {
        const cfg = rankData[k];
        const min = cfg.MinGrade || 0;
        if (buildScore >= min) best = k;
    });
    return best;
}

function getTeamScoreForSeason(team, seasonName, teams) {
    if (!team) return 0;

    if (seasonName === FE_SEASON) {
        return teams.reduce((sum, t) => sum - Number(t.Time || 0), 0);
    }
    return Number(team.LevelScore);
}

function packPotentialData(tbCharPotential, charCfgMap = {}) {
    if (!Array.isArray(tbCharPotential) || tbCharPotential.length !== 3) return null;
    const bitBuffer = [];
    const addBit = (b) => bitBuffer.push(b ? 1 : 0);
    const writeBits = (value, numBits) => {
        for (let i = numBits - 1; i >= 0; i--) addBit((value >>> i) & 1);
    };
    const toUint32 = (num) => {
        num = Math.floor(num || 0);
        if (num < 0) num = 0;
        if (num > 0xffffffff) num = 0xffffffff;
        return num >>> 0;
    };
    const getLevelFromPotentials = (tbPotential, nId) => {
        if (!Array.isArray(tbPotential)) return 0;
        for (const p of tbPotential) {
            if ((p.nId ?? p.Id ?? p.id) === nId) {
                return (p.nLevel ?? p.Level ?? p.level ?? 0) | 0;
            }
        }
        return 0;
    };
    const pack_potential = (tbAll, tbPotential, bSpecial) => {
        for (const nId of tbAll) {
            const nLevel = getLevelFromPotentials(tbPotential, nId);
            if (bSpecial) writeBits(nLevel > 0 ? 1 : 0, 1);
            else writeBits(nLevel, 3);
        }
    };

    for (const v of tbCharPotential) {
        const nCharId = v.nCharId ?? v.CharId ?? v.charId;
        if (!nCharId || nCharId === 0) return null;
        writeBits(toUint32(nCharId), 32);
    }

    tbCharPotential.forEach((v, idx) => {
        const nCharId = v.nCharId ?? v.CharId ?? v.charId;
        const potentials = v.tbPotential ?? v.Potentials ?? v.potentials ?? [];
        const cfg = charCfgMap[nCharId];
        if (!cfg) return null;
        if (idx === 0) {
            pack_potential(cfg.MasterSpecificPotentialIds || [], potentials, true);
            pack_potential(cfg.MasterNormalPotentialIds || [], potentials, false);
            pack_potential(cfg.CommonPotentialIds || [], potentials, false);
        } else {
            pack_potential(cfg.AssistSpecificPotentialIds || [], potentials, true);
            pack_potential(cfg.AssistNormalPotentialIds || [], potentials, false);
            pack_potential(cfg.CommonPotentialIds || [], potentials, false);
        }
    });

    const bytes = [];
    for (let i = 0; i < bitBuffer.length; i += 8) {
        let byte = 0;
        for (let j = 0; j < 8; j++) byte = (byte << 1) | (bitBuffer[i + j] || 0);
        bytes.push(byte & 0xff);
    }
    return Buffer.from(bytes).toString('base64');
}

function mapTeamPotentials(team) {
    const teamPots = team.Potentials || [];
    const mappedPots = teamPots.map((p) => ({ Id: p.PotentialId ?? p.Id ?? p.id, Level: p.Level ?? p.nLevel ?? p.level }));
    const chars = team.Chars || [];
    const tb = [];
    for (let i = 0; i < 3; i++) {
        const c = chars[i] || { Id: 0 };
        tb.push({ CharId: c.Id, Potentials: mappedPots });
    }
    return tb;
}

function loadLocalDataToRegionData() {
    for (const season of [BB_SEASON, FE_SEASON]) {
        const file = path.join(__dirname, `${season}.json`);
        if (fs.existsSync(file)) {
            const content = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (content && content.region) {
                for (const region of REGIONS) {
                    if (content.region[region]) {
                        regionData[getSeasonRegionKey(season, region)] = content.region[region];
                        console.log(`Loaded local data for ${season} ${region.toUpperCase()}`);
                    }
                }
            }
        }
    }
}

(async () => {
    if (!USE_LOCAL_DATA) {
        if (await isAutumnPlayingStellaSoraRightNow()) {
            console.log('Autumn is playing Stella Sora; skipping');
            return;
        }

        await getLatestSeason();

        const CN_BB_URL = `https://raw.githubusercontent.com/MakoStar/ssleaderboard/refs/heads/main/${BB_SEASON}_cn.json`;
        const CN_FE_URL = `https://raw.githubusercontent.com/MakoStar/ssleaderboard/refs/heads/main/${FE_SEASON}_cn.json`;

        if (EMAIL_EN || TOKEN_EN) {
            console.log('Starting IKE handshake (EN)...');
            const { token, cipher, sessionKey } = await doIkeHandshake();
            console.log('Cipher:', cipher === 1 ? 'ChaCha20-Poly1305' : 'AES-GCM');

            _httpSeq = 1;

            let accountLoginToken = null;
            let accountUid = null;

            if (TOKEN_EN) {
                console.log('Found saved Yostar token; attempting quick-login (EN)...');
                const quickLoginObj = await quickLogin(TOKEN_EN);
                accountLoginToken = quickLoginObj.accountLoginToken;
                accountUid = quickLoginObj.accountUid;
                console.log('quick-login successed (EN)');
            }

            if (!accountLoginToken) {
                console.log('Requesting Yostar to send code (EN)...');
                await sendAuthCodeRequest(EMAIL_EN);
                const code = await askQuestion('Enter code (EN): ');
                const webLoginObj = await getWebLoginToken(EMAIL_EN, code);
                accountLoginToken = webLoginObj.accountLoginToken;
                accountUid = webLoginObj.accountUid;
                saveYostarToken(accountLoginToken);
            }

            console.log('Sending player login request (EN)...');
            const loginResp = await doPlayerLogin(token, cipher, sessionKey, accountLoginToken, accountUid);

            const newToken = loginResp.Token;

            console.log('Requesting PlayerData (EN)...');
            const playerInfoEN = await getPlayerData(newToken, cipher, sessionKey, SERVER_URL_EN, SERVER_GARBLE_KEY_EN);
            const invFile = path.join(__dirname, 'inv.json');
            saveInventoryToFile(playerInfoEN, invFile);

            console.log('Requesting ScoreBossRank (EN)...');
            const bbEN = await getScoreBossRank(newToken, cipher, sessionKey, SERVER_URL_EN, SERVER_GARBLE_KEY_EN);
            storeScoreBossRank(bbEN, 'en');

            console.log('Requesting JointDrillRank (EN)...');
            const feEN = await getJointDrillRank(newToken, cipher, sessionKey, SERVER_URL_EN, SERVER_GARBLE_KEY_EN);
            storeJointDrillRank(feEN, 'en');
        }

        if (EMAIL_JP || TOKEN_JP) {
            console.log('Starting IKE handshake (JP)...');
            const { token: tokenJpIke, cipher: cipherJp, sessionKey: sessionKeyJp } = await doIkeHandshake(SERVER_URL_JP, SERVER_GARBLE_KEY_JP);
            console.log('Cipher:', cipherJp === 1 ? 'ChaCha20-Poly1305' : 'AES-GCM');

            let accountLoginTokenJp = null;
            let accountUidJp = null;

            const jpHead = {
                UID: UID_JP,
                Version: VERSION,
                Lang: 'ja',
                PID: 'JP-NOVA',
                DeviceID: DEVICE
            };

            if (TOKEN_JP) {
                console.log('Found saved Yostar token; attempting quick-login (JP)...');
                const quickLoginObjJp = await quickLogin(TOKEN_JP, SDK_URL_JP, jpHead);
                accountLoginTokenJp = quickLoginObjJp.accountLoginToken;
                accountUidJp = quickLoginObjJp.accountUid;
                console.log('quick-login succeeded (JP)');
            }

            if (!accountLoginTokenJp) {
                console.log('Requesting Yostar to send code (JP)...');
                await sendAuthCodeRequest(EMAIL_JP, SDK_URL_JP, jpHead);
                const codeJp = await askQuestion('Enter code (JP): ');
                const webLoginObjJp = await getWebLoginToken(EMAIL_JP, codeJp, SDK_URL_JP, jpHead);
                accountLoginTokenJp = webLoginObjJp.accountLoginToken;
                accountUidJp = webLoginObjJp.accountUid;
                saveYostarToken(accountLoginTokenJp, 'TOKEN_JP');
            }

            console.log('Sending player login request (JP)...');
            const loginRespJp = await doPlayerLogin(tokenJpIke, cipherJp, sessionKeyJp, accountLoginTokenJp, accountUidJp, SERVER_URL_JP, SERVER_GARBLE_KEY_JP, { version: VERSION, language: 'ja_JP', device: DEVICE });
            const newTokenJp = loginRespJp.Token;

            console.log('Requesting ScoreBossRank (JP)...');
            const bbJP = await getScoreBossRank(newTokenJp, cipherJp, sessionKeyJp, SERVER_URL_JP, SERVER_GARBLE_KEY_JP);
            storeScoreBossRank(bbJP, 'jp');

            console.log('Requesting JointDrillRank (JP)...');
            const feJP = await getJointDrillRank(newTokenJp, cipherJp, sessionKeyJp, SERVER_URL_JP, SERVER_GARBLE_KEY_JP);
            storeJointDrillRank(feJP, 'jp');
        }

        if (EMAIL_KR || TOKEN_KR) {
            console.log('Starting IKE handshake (KR)...');
            const { token: tokenKrIke, cipher: cipherKr, sessionKey: sessionKeyKr } = await doIkeHandshake(SERVER_URL_KR, SERVER_GARBLE_KEY_KR);
            console.log('Cipher:', cipherKr === 1 ? 'ChaCha20-Poly1305' : 'AES-GCM');

            let accountLoginTokenKr = null;
            let accountUidKr = null;

            const krHead = {
                UID: UID_KR,
                Version: VERSION,
                Lang: 'ko',
                PID: 'KR-NOVA',
                DeviceID: DEVICE
            };

            if (TOKEN_KR) {
                console.log('Found saved Yostar token; attempting quick-login (KR)...');
                const quickLoginObjKr = await quickLogin(TOKEN_KR, SDK_URL_KR, krHead);
                accountLoginTokenKr = quickLoginObjKr.accountLoginToken;
                accountUidKr = quickLoginObjKr.accountUid;
                console.log('quick-login succeeded (KR)');
            }

            if (!accountLoginTokenKr) {
                console.log('Requesting Yostar to send code (KR)...');
                await sendAuthCodeRequest(EMAIL_KR, SDK_URL_KR, krHead);
                const codeKr = await askQuestion('Enter code (KR): ');
                const webLoginObjKr = await getWebLoginToken(EMAIL_KR, codeKr, SDK_URL_KR, krHead);
                accountLoginTokenKr = webLoginObjKr.accountLoginToken;
                accountUidKr = webLoginObjKr.accountUid;
                saveYostarToken(accountLoginTokenKr, 'TOKEN_KR');
            }

            console.log('Sending player login request (KR)...');
            const loginRespKr = await doPlayerLogin(tokenKrIke, cipherKr, sessionKeyKr, accountLoginTokenKr, accountUidKr, SERVER_URL_KR, SERVER_GARBLE_KEY_KR, { version: VERSION, language: 'ko_KR', device: DEVICE });
            const newTokenKr = loginRespKr.Token;

            console.log('Requesting ScoreBossRank (KR)...');
            const bbKR = await getScoreBossRank(newTokenKr, cipherKr, sessionKeyKr, SERVER_URL_KR, SERVER_GARBLE_KEY_KR);
            storeScoreBossRank(bbKR, 'kr');


            console.log('Requesting JointDrillRank (KR)...');
            const feKR = await getJointDrillRank(newTokenKr, cipherKr, sessionKeyKr, SERVER_URL_KR, SERVER_GARBLE_KEY_KR);
            storeJointDrillRank(feKR, 'kr');
        }

        if (EMAIL_TW || TOKEN_TW) {
            console.log('Starting IKE handshake (TW)...');
            const { token: tokenTwIke, cipher: cipherTw, sessionKey: sessionKeyTw } = await doIkeHandshake(SERVER_URL_TW, SERVER_GARBLE_KEY_TW);
            console.log('Cipher:', cipherTw === 1 ? 'ChaCha20-Poly1305' : 'AES-GCM');

            let accountLoginTokenTw = null;
            let accountUidTw = null;

            const twHead = {
                UID: UID_TW,
                Version: VERSION,
                Lang: 'zh-TW',
                PID: 'TW-NOVA',
                DeviceID: DEVICE
            };

            if (TOKEN_TW) {
                console.log('Found saved Yostar token; attempting quick-login (TW)...');
                const quickLoginObjTw = await quickLogin(TOKEN_TW, SDK_URL_TW, twHead);
                accountLoginTokenTw = quickLoginObjTw.accountLoginToken;
                accountUidTw = quickLoginObjTw.accountUid;
                console.log('quick-login succeeded (TW)');
            }

            if (!accountLoginTokenTw) {
                console.log('Requesting Yostar to send code (TW)...');
                await sendAuthCodeRequest(EMAIL_TW, SDK_URL_TW, twHead);
                const codeTw = await askQuestion('Enter code (TW): ');
                const webLoginObjTw = await getWebLoginToken(EMAIL_TW, codeTw, SDK_URL_TW, twHead);
                accountLoginTokenTw = webLoginObjTw.accountLoginToken;
                accountUidTw = webLoginObjTw.accountUid;
                saveYostarToken(accountLoginTokenTw, 'TOKEN_TW');
            }

            console.log('Sending player login request (TW)...');
            const loginRespTw = await doPlayerLogin(tokenTwIke, cipherTw, sessionKeyTw, accountLoginTokenTw, accountUidTw, SERVER_URL_TW, SERVER_GARBLE_KEY_TW, { version: VERSION, language: 'zh_TW', device: DEVICE });
            const newTokenTw = loginRespTw.Token;

            console.log('Requesting ScoreBossRank (TW)...');
            const bbTW = await getScoreBossRank(newTokenTw, cipherTw, sessionKeyTw, SERVER_URL_TW, SERVER_GARBLE_KEY_TW);
            storeScoreBossRank(bbTW, 'tw');

            console.log('Requesting JointDrillRank (TW)...');
            const feTW = await getJointDrillRank(newTokenTw, cipherTw, sessionKeyTw, SERVER_URL_TW, SERVER_GARBLE_KEY_TW);
            storeJointDrillRank(feTW, 'tw');
        }

        if (CN_BB_URL) {
            const bbCN = await fetch(CN_BB_URL).then(res => res.json()).catch(() => null);
            if (bbCN) {
                storeScoreBossRank(bbCN, 'cn', true);
            }
        }

        if (CN_FE_URL) {
            const feCN = await fetch(CN_FE_URL).then(res => res.json()).catch(() => null);
            if (feCN) {
                storeJointDrillRank(feCN, 'cn', true);
            }
        }
    } else {
        loadLocalDataToRegionData();
    }

    combineLeaderboard(BB_SEASON);
    combineLeaderboard(FE_SEASON);

    const metaFile = path.join(__dirname, 'meta.json');
    let oldMeta = {};
    if (fs.existsSync(metaFile)) {
        const oldContent = fs.readFileSync(metaFile, 'utf8');
        oldMeta = JSON.parse(oldContent);
    }

    const seasonMeta = {};
    for (let season of SEASONS) {
        const meta = { floor: {}, removed: { all: [], en: [], jp: [], kr: [], tw: [], cn: [] } };
        const seasonPrefix = getSeasonPrefix(season);

        let enJson = null;
        const enKey = `${seasonPrefix}en`;
        if (regionData[enKey]) {
            enJson = regionData[enKey];
        } else {
            const lbFile = path.join(__dirname, `${season}.json`);
            if (fs.existsSync(lbFile)) {
                const prevSeason = JSON.parse(fs.readFileSync(lbFile, 'utf8'));
                enJson = prevSeason && prevSeason.region && prevSeason.region.en ? prevSeason.region.en : null;
            }
        }
        if (enJson) {
            const rankArr = Array.isArray(enJson.Rank) ? enJson.Rank : [];
            const levelSet = new Set();
            const isBBSeason = /^bb/.test(season);
            if (rankArr.length > 0) {
                const topTeams = Array.isArray(rankArr[0].Teams) ? rankArr[0].Teams : [];
                const lastTeams = Array.isArray(rankArr[rankArr.length - 1].Teams) ? rankArr[rankArr.length - 1].Teams : [];
                for (const t of topTeams) {
                    if (t && typeof t.LevelId !== 'undefined') levelSet.add(Number(t.LevelId));
                }
                for (const t of lastTeams) {
                    if (t && typeof t.LevelId !== 'undefined') levelSet.add(Number(t.LevelId));
                }
                if (!isBBSeason) {
                    levelSet.add(51000 + Number(season.slice(2)));
                }
            }

            const [blitzData, raidData] = await Promise.all([
                fetch(BLITZ_URL).then(res => res.json()),
                fetch(RAID_URL).then(res => res.json())
            ]);
            const remoteMap = isBBSeason ? (blitzData || {}) : (raidData || {});

            meta.floor = Array.from(levelSet).sort((a, b) => a - b).reduce((m, lid) => {
                const fd = remoteMap[lid] || remoteMap[String(lid)] || {};
                m[String(lid)] = { name: fd.name || fd.Name || String(lid), icon: fd.icon || fd.Icon || null };
                return m;
            }, {});
        }

        const regions = ['all', ...REGIONS];
        for (const r of regions) {
            const key = r === 'all' ? `${seasonPrefix}all` : getSeasonRegionKey(season, r);
            meta.removed[r] = Array.isArray(removedData[key]) ? removedData[key] : [];
        }

        seasonMeta[season] = meta;
    }

    for (const season of SEASONS) {
        const present = new Set();
        const seasonPrefix = getSeasonPrefix(season);
        for (const fname of Object.keys(regionData)) {
            let base = fname;
            if (base.endsWith('.json')) base = path.basename(base, '.json');
            if (!(base.startsWith(season) || base.startsWith(seasonPrefix))) continue;
            const obj = regionData[fname] || regionData[base] || regionData[season + base.slice(season.length)];
            if (!obj) continue;
            if (Array.isArray(obj.Rank)) {
                for (const r of obj.Rank) {
                    if (!r) continue;
                    const id = Number(r.Id || r.id || 0) || 0;
                    if (id) present.add(id);
                }
            } else if (obj.region && typeof obj.region === 'object') {
                for (const rk of Object.keys(obj.region)) {
                    const rr = obj.region[rk];
                    if (!rr || !Array.isArray(rr.Rank)) continue;
                    for (const r of rr.Rank) {
                        if (!r) continue;
                        const id = Number(r.Id || r.id || 0) || 0;
                        if (id) present.add(id);
                    }
                }
            }
        }

        const prevSeason = oldMeta && oldMeta[season] && oldMeta[season].removed ? oldMeta[season].removed : null;
        if (!seasonMeta[season]) seasonMeta[season] = { floor: {}, removed: { all: [], en: [], jp: [], kr: [], tw: [], cn: [] } };
        if (prevSeason) {
            for (const r of ['all', 'en', 'jp', 'kr', 'tw', 'cn']) {
                const rawNewList = Array.isArray(seasonMeta[season].removed[r]) ? seasonMeta[season].removed[r] : [];
                const newList = rawNewList.filter((entry) => {
                    const m2 = String(entry).match(/^(\d+)/);
                    if (!m2) return true;
                    const idNum2 = Number(m2[1]);
                    return !present.has(idNum2);
                });
                const oldList = Array.isArray(prevSeason[r]) ? prevSeason[r] : [];
                const prevFiltered = oldList.filter((entry) => {
                    const m = String(entry).match(/^(\d+)/);
                    if (!m) return true;
                    const idNum = Number(m[1]);
                    return !present.has(idNum);
                });
                seasonMeta[season].removed[r] = Array.from(new Set([...prevFiltered, ...newList]));
            }
        }
    }

    const finalMeta = {};
    for (const season of SEASONS) {
        const m = seasonMeta[season];
        const seasonFile = path.join(__dirname, `${season}.json`);
        const hasProcessedFile = fs.existsSync(seasonFile);
        if ((!oldMeta[season]) && (!isMetaEmpty(m) || hasProcessedFile)) {
            finalMeta[season] = m;
        }
    }

    for (const key of Object.keys(oldMeta)) {
        if (finalMeta.hasOwnProperty(key)) continue;
        const m = seasonMeta[key];
        const seasonFile = path.join(__dirname, `${key}.json`);
        const hasProcessedFile = fs.existsSync(seasonFile);
        if (m) {
            if (!isMetaEmpty(m) || hasProcessedFile) {
                finalMeta[key] = m;
            }
        } else {
            finalMeta[key] = oldMeta[key];
        }
    }

    for (const key of Object.keys(finalMeta)) {
        const meta = finalMeta[key];
        if (meta && meta.removed && !Array.isArray(meta.removed.cn)) {
            meta.removed.cn = [];
        }
    }

    fs.writeFileSync(metaFile, JSON.stringify(finalMeta, null, 4), { encoding: 'utf8' });

    await processSeason(BB_SEASON);
    await processSeason(FE_SEASON);
})();
