import crypto from 'crypto';
import axios from 'axios';
import { SSO_CLIENT_ID, SSO_SECRET_KEY, SSO_IS_BETA } from '$env/static/private';

/**
 * SPARCS SSO V2 Client for SvelteKit
 * Adapted from the official SPARCS SSO V2 NodeJS client.
 */

export interface SSOUserInfo {
    uid: string;
    sid: string;
    first_name: string;
    last_name: string;
    email: string;
    gender: string;
    birthday?: string;
    point: number;
    flags: string[];
    facebook_id: string;
    twitter_id: string;
    kaist_id: string;
    kaist_info: string; // JSON string
    kaist_info_v2?: string; // JSON string (newer API)
    sparcs_id: string;
}

interface KaistInfoV1 {
    ku_std_no?: string;
    employeeType?: string;
    mail?: string;
}

interface KaistInfoV2 {
    std_no?: string;
    socps_cd?: string;
    email?: string;
}

export interface ParsedUserData {
    uid: string;
    sid: string;
    name: string;
    email: string;
    studentNumber: string;
    kaistType: string;
    isEligible: boolean;
}

class SSOClient {
    private clientId: string;
    private secretKey: Buffer;
    private readonly URLS: Record<string, string> = {};

    constructor(clientId: string, secretKey: string, isBeta = false) {
        const SERVER_DOMAIN = 'https://sparcssso.kaist.ac.kr/';
        const BETA_DOMAIN = 'https://ssobeta.sparcs.org/';

        const DOMAIN = isBeta ? BETA_DOMAIN : SERVER_DOMAIN;
        const baseUrl = `${DOMAIN}api/v2/`;

        this.URLS = {
            token_require: `${baseUrl}token/require/`,
            token_info: `${baseUrl}token/info/`,
            logout: `${baseUrl}logout/`,
        };

        this.clientId = clientId;
        this.secretKey = Buffer.from(secretKey, 'utf8');
    }

    private _signPayload(payload: (string | number)[], appendTimestamp = true) {
        const timestamp = Math.floor(Date.now() / 1000);
        if (appendTimestamp) {
            payload.push(timestamp);
        }
        const msg = Buffer.from(payload.join(''), 'utf-8');
        const sign = crypto.createHmac('md5', this.secretKey).update(msg).digest('hex');
        return { sign, timestamp };
    }

    getLoginParams(): { url: string; state: string } {
        const state = crypto.randomBytes(10).toString('hex');
        const params = new URLSearchParams({
            client_id: this.clientId,
            state,
        });
        const url = `${this.URLS.token_require}?${params.toString()}`;
        return { url, state };
    }

    async getUserInfo(code: string): Promise<SSOUserInfo> {
        const { sign, timestamp } = this._signPayload([code]);
        const data = new URLSearchParams({
            client_id: this.clientId,
            code,
            timestamp: String(timestamp),
            sign,
        });

        const res = await axios.post(this.URLS.token_info, data.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return res.data as SSOUserInfo;
    }

    getLogoutUrl(sid: string, redirectUri: string): string {
        const { sign, timestamp } = this._signPayload([sid, redirectUri]);
        const params = new URLSearchParams({
            client_id: this.clientId,
            sid,
            timestamp: String(timestamp),
            redirect_uri: redirectUri,
            sign,
        });
        return `${this.URLS.logout}?${params.toString()}`;
    }
}

/** Parse KAIST-specific data from SSO user info (following sso_example.ts pattern) */
export function parseUserData(raw: SSOUserInfo): ParsedUserData {
    // Parse v1 kaist_info
    let kaistV1: KaistInfoV1 = {};
    if (raw.kaist_info) {
        try { kaistV1 = typeof raw.kaist_info === 'string' ? JSON.parse(raw.kaist_info) : raw.kaist_info; } catch { /* ignore */ }
    }

    // Parse v2 kaist_info if available
    let kaistV2: KaistInfoV2 = {};
    if (raw.kaist_info_v2) {
        try { kaistV2 = typeof raw.kaist_info_v2 === 'string' ? JSON.parse(raw.kaist_info_v2) : raw.kaist_info_v2; } catch { /* ignore */ }
    }

    const studentNumber = kaistV2.std_no || kaistV1.ku_std_no || '';
    const kaistType = kaistV2.socps_cd || kaistV1.employeeType || '';
    const email = kaistV2.email || kaistV1.mail || raw.email || '';

    // Determine full name
    const name = [raw.first_name, raw.last_name].filter(Boolean).join(' ').trim() || 'Unknown';

    // Eligibility: has a student number or recognized KAIST member type
    const allowedTypes = /^(S|RS|RPF|RPE|RA|RD)$/;
    const isEligible = !!studentNumber || allowedTypes.test(kaistType);

    return {
        uid: raw.uid,
        sid: raw.sid,
        name,
        email,
        studentNumber,
        kaistType,
        isEligible,
    };
}

// Singleton SSO client
export const ssoClient = new SSOClient(
    SSO_CLIENT_ID,
    SSO_SECRET_KEY,
    SSO_IS_BETA === 'true'
);
