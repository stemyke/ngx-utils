import {stringify} from "./json.utils";

const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14,
    20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
    6, 10, 15, 21,
];

const K = [
    3614090360, 3905402710, 606105819, 3250441966, 4118548399, 1200080426, 2821735955,
    4249261313, 1770035416, 2336552879, 4294925233, 2304563134, 1804603682, 4254626195,
    2792965006, 1236535329, 4129170786, 3225465664, 643717713, 3921069994, 3593408605,
    38016083, 3634488961, 3889429448, 568446438, 3275163606, 4107603335, 1163531501,
    2850285829, 4243563512, 1735328473, 2368359562, 4294588738, 2272392833, 1839030562,
    4259657740, 2763975236, 1272893353, 4139469664, 3200236656, 681279174, 3936430074,
    3572445317, 76029189, 3654602809, 3873151461, 530742520, 3299628645, 4096336452,
    1126891415, 2878612391, 4237533241, 1700485571, 2399980690, 4293915773, 2240044497,
    1873313359, 4264355552, 2734768916, 1309151649, 4149444226, 3174756917, 718787259,
    3951481745,
];

function leftRotate(x, c) {
    return (x << c) | (x >>> (32 - c));
}

export function md5(input: string | Record<string, any>): string {
    // UTF-8 encode the string
    const encoder = new TextEncoder();
    const data = encoder.encode(stringify(input ?? "") || "");

    const originalBitLength = data.length * 8;

    // --- Padding: append 0x80 then 0x00 until len ≡ 56 (mod 64)
    let msgLen = data.length + 1;
    while (msgLen % 64 !== 56) msgLen++;

    const buffer = new Uint8Array(msgLen + 8); // +8 bytes for length
    buffer.set(data);
    buffer[data.length] = 0x80;

    // Append original length in bits, little-endian 64-bit
    let bitLen = originalBitLength;
    for (let i = 0; i < 8; i++) {
        buffer[msgLen + i] = bitLen & 0xff;
        bitLen = Math.floor(bitLen / 256);
    }

    // Initial state
    let a0 = 0x67452301;
    let b0 = 0xefcdab89;
    let c0 = 0x98badcfe;
    let d0 = 0x10325476;

    const view = new DataView(buffer.buffer);

    // Process 512-bit chunks
    for (let offset = 0; offset < buffer.length; offset += 64) {
        const M = new Uint32Array(16);
        for (let i = 0; i < 16; i++) {
            M[i] = view.getUint32(offset + i * 4, true); // little-endian
        }

        let A = a0;
        let B = b0;
        let C = c0;
        let D = d0;

        for (let i = 0; i < 64; i++) {
            let F, g;

            if (i < 16) {
                F = (B & C) | (~B & D);
                g = i;
            } else if (i < 32) {
                F = (D & B) | (~D & C);
                g = (5 * i + 1) % 16;
            } else if (i < 48) {
                F = B ^ C ^ D;
                g = (3 * i + 5) % 16;
            } else {
                F = C ^ (B | ~D);
                g = (7 * i) % 16;
            }

            F = (F + A + K[i] + M[g]) >>> 0;
            A = D;
            D = C;
            C = B;
            B = (B + leftRotate(F, S[i])) >>> 0;
        }

        a0 = (a0 + A) >>> 0;
        b0 = (b0 + B) >>> 0;
        c0 = (c0 + C) >>> 0;
        d0 = (d0 + D) >>> 0;
    }

    // Output as hex (little-endian)
    const words = [a0, b0, c0, d0];
    let out = "";
    for (const w of words) {
        for (let i = 0; i < 4; i++) {
            const byte = (w >>> (8 * i)) & 0xff;
            out += byte.toString(16).padStart(2, "0");
        }
    }
    return out;
}
