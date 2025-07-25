export const sqrt = (N: bigint): bigint => {
    if(N < 0n) return BigInt(Math.sqrt(-1));
    let aprx;
    if(N < 9007199254740991n) {
        aprx = BigInt(Math.floor(Math.sqrt(Number(N))));
        if(aprx**2n > N) aprx--;
        return aprx;
    };
    
    const base32 = N.toString(32);
    const len = base32.length*5 - 5 + parseInt(base32[0], 32).toString(2).length;
    
    function approx(a1: bigint, len: number): bigint {
        if(len < 53) {
            let aprx = BigInt(Math.floor(Math.sqrt(Number(a1))));
            if(aprx**2n > a1) aprx--;
            return aprx;
        }
        let base = Math.floor(len/2) - len%2;
        if(base%2 == 1) base--;
    
        let b1 = a1>>BigInt(base),
            b0 = BigInt.asUintN(base, a1),
            r1 = approx(b1, len - base),
            r0 = (((b1 - r1**2n)<<BigInt(base)) + b0)/(2n*r1);
    
        return (r1<<BigInt(base/2)) + (r0>>BigInt(base/2));
    }
    
    aprx = approx(N, len);
    if(aprx**2n > N) aprx--;
    return aprx;
}