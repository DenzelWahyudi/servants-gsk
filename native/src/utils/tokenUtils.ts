function decodeBase64(str: string): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    const normalized = str.replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=")

    let result = ""
    for (let i = 0; i < padded.length; i += 4) {
        const a = chars.indexOf(padded[i])
        const b = chars.indexOf(padded[i + 1])
        const c = chars.indexOf(padded[i + 2])
        const d = chars.indexOf(padded[i + 3])

        result += String.fromCharCode((a << 2) | (b >> 4))
        if (padded[i + 2] !== "=") result += String.fromCharCode(((b & 15) << 4) | (c >> 2))
        if (padded[i + 3] !== "=") result += String.fromCharCode(((c & 3) << 6) | d)
    }
    return result
}

export function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(decodeBase64(token.split(".")[1]))
        return payload.exp * 1000 < Date.now()
    } catch {
        return true
    }
}
