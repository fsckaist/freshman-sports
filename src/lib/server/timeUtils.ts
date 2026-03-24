export function getRemainingTimeLabel(deadline: Date): string {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();

    if (diffMs <= 0) return JSON.stringify({ ko: "0분", en: "0m" });

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Rule 1: 1일 이상 (>= 1440분) -> ~일
    if (diffMinutes >= 1440) {
        return JSON.stringify({ ko: `${diffDays}일`, en: `${diffDays}d` });
    }

    // Rule 2: 3시간 초과 ( > 180분) -> ~시간
    if (diffMinutes > 180) {
        return JSON.stringify({ ko: `${diffHours}시간`, en: `${diffHours}h` });
    }

    // Rule 3: 3시간 이하 ( <= 180분) -> ~시간 ~분
    const min = diffMinutes % 60;
    if (diffHours > 0) {
        if (min === 0) return JSON.stringify({ ko: `${diffHours}시간`, en: `${diffHours}h` });
        return JSON.stringify({ ko: `${diffHours}시간 ${min}분`, en: `${diffHours}h ${min}m` });
    }

    return JSON.stringify({ ko: `${diffMinutes}분`, en: `${diffMinutes}m` });
}
