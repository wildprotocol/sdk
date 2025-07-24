// Partially based off Uniswap v4 TickMath.sol

export class TickMathError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TickMathError";
    }
}

export class InvalidTick extends TickMathError {
    public tick: bigint;

    constructor(tick: bigint) {
        super(`Invalid tick: ${tick}`);
        this.name = "InvalidTick";
        this.tick = tick;
    }
}

export class InvalidSqrtPrice extends TickMathError {
    public sqrtPriceX96: bigint;

    constructor(sqrtPriceX96: bigint) {
        super(`Invalid sqrt price: ${sqrtPriceX96}`);
        this.name = "InvalidSqrtPrice"; 
        this.sqrtPriceX96 = sqrtPriceX96;
    }
}

export class InvalidTokenAmount extends TickMathError {
    public tokenAmount: bigint;

    constructor(tokenAmount: bigint) {
        super(`Invalid token amount: ${tokenAmount}`);
        this.name = "InvalidTokenAmount";
        this.tokenAmount = tokenAmount;
    }
}

export class SubByTooLarge extends TickMathError {
    public subBy: bigint;
    public sqrtTargetPrice: bigint;

    constructor(subBy: bigint, sqrtTargetPrice: bigint) {
        super(`Subtraction is greater than the price target: ${subBy} > ${sqrtTargetPrice}`);
        this.name = "SubByTooLarge";
        this.subBy = subBy;
        this.sqrtTargetPrice = sqrtTargetPrice;
    }
}

export class StartTickTooLow extends TickMathError {
    public startTick: bigint;
    public targetTick: bigint;

    constructor(startTick: bigint, targetTick: bigint) {
        super(`Start tick is too low: ${startTick} < ${targetTick}`);
        this.name = "StartTickTooLow";
        this.startTick = startTick;
        this.targetTick = targetTick;
    }
}

export class StartTickTooHigh extends TickMathError {
    public startTick: bigint;
    public targetTick: bigint;

    constructor(startTick: bigint, targetTick: bigint) {
        super(`Start tick is too high: ${startTick} > ${targetTick}`);
        this.name = "StartTickTooHigh";
        this.startTick = startTick;
        this.targetTick = targetTick;
    }
}

export const  MIN_TICK: bigint = -887272n;
export const  MAX_TICK: bigint = 887272n;
export const  MIN_TICK_SPACING: bigint = 1n;
export const  MAX_TICK_SPACING: bigint = 32767n;

export const  MIN_SQRT_RATIO: bigint = 4295128739n;
export const  MAX_SQRT_RATIO: bigint = 1461446703485210103287273052203988822378723970342n;
export const  MAX_SQRT_RATIO_MINUS_MIN_SQRT_RATIO_MINUS_ONE: bigint = MAX_SQRT_RATIO - MIN_SQRT_RATIO - 1n;

export const maxUsableTick = (tickSpacing: bigint): bigint => {
    return (MAX_TICK / tickSpacing) * tickSpacing;
}

export const minUsableTick = (tickSpacing: bigint): bigint => {
    return (MIN_TICK / tickSpacing) * tickSpacing;
}

export const getSqrtPriceAtTick = (tick: bigint): bigint => {
    /**
     * Calculates sqrt(1.0001^tick) * 2^96
     * 
     * @param tick - The input tick for the above formula
     * @returns A Fixed point Q64.96 number representing the sqrt of the price
     * @throws InvalidTick if |tick| > max tick
     */
    
    // Sign extend tick to 24 bits (simulate Solidity behavior)
    if (tick < 0) {
        tick = tick >= -(1n << 23n) ? tick : tick | ~((1n << 24n) - 1n);
    } else {
        tick = tick < (1n << 23n) ? tick : tick & ((1n << 24n) - 1n);
    }

    // Get absolute value
    const absTick = tick < 0n ? -tick : tick;

    if (absTick > MAX_TICK) {
        throw new InvalidTick(tick);
    }

    // Calculate price using bit decomposition
    // Start with 1 << 128 or the first constant
    let price: bigint;
    if ((absTick & 0x1n) !== 0n) {
        price = 0xFFFCB933BD6FAD37AA2D162D1A594001n;
    } else {
        price = 1n << 128n;
    }

    if ((absTick & 0x2n) !== 0n) {
        price = (price * 0xFFF97272373D413259A46990580E213An) >> 128n;
    }
    if ((absTick & 0x4n) !== 0n) {
        price = (price * 0xFFF2E50F5F656932EF12357CF3C7FDCCn) >> 128n;
    }
    if ((absTick & 0x8n) !== 0n) {
        price = (price * 0xFFE5CACA7E10E4E61C3624EAA0941CD0n) >> 128n;
    }
    if ((absTick & 0x10n) !== 0n) {
        price = (price * 0xFFCB9843D60F6159C9DB58835C926644n) >> 128n;
    }
    if ((absTick & 0x20n) !== 0n) {
        price = (price * 0xFF973B41FA98C081472E6896DFB254C0n) >> 128n;
    }
    if ((absTick & 0x40n) !== 0n) {
        price = (price * 0xFF2EA16466C96A3843EC78B326B52861n) >> 128n;
    }
    if ((absTick & 0x80n) !== 0n) {
        price = (price * 0xFE5DEE046A99A2A811C461F1969C3053n) >> 128n;
    }
    if ((absTick & 0x100n) !== 0n) {
        price = (price * 0xFCBE86C7900A88AEDCFFC83B479AA3A4n) >> 128n;
    }
    if ((absTick & 0x200n) !== 0n) {
        price = (price * 0xF987A7253AC413176F2B074CF7815E54n) >> 128n;
    }
    if ((absTick & 0x400n) !== 0n) {
        price = (price * 0xF3392B0822B70005940C7A398E4B70F3n) >> 128n;
    }
    if ((absTick & 0x800n) !== 0n) {
        price = (price * 0xE7159475A2C29B7443B29C7FA6E889D9n) >> 128n;
    }
    if ((absTick & 0x1000n) !== 0n) {
        price = (price * 0xD097F3BDFD2022B8845AD8F792AA5825n) >> 128n;
    }
    if ((absTick & 0x2000n) !== 0n) {
        price = (price * 0xA9F746462D870FDF8A65DC1F90E061E5n) >> 128n;
    }
    if ((absTick & 0x4000n) !== 0n) {
        price = (price * 0x70D869A156D2A1B890BB3DF62BAF32F7n) >> 128n;
    }
    if ((absTick & 0x8000n) !== 0n) {
        price = (price * 0x31BE135F97D08FD981231505542FCFA6n) >> 128n;
    }
    if ((absTick & 0x10000n) !== 0n) {
        price = (price * 0x9AA508B5B7A84E1C677DE54F3E99BC9n) >> 128n;
    }
    if ((absTick & 0x20000n) !== 0n) {
        price = (price * 0x5D6AF8DEDB81196699C329225EE604n) >> 128n;
    }
    if ((absTick & 0x40000n) !== 0n) {
        price = (price * 0x2216E584F5FA1EA926041BEDFE98n) >> 128n;
    }
    if ((absTick & 0x80000n) !== 0n) {
        price = (price * 0x48A170391F7DC42444E8FA2n) >> 128n;
    }

    // If tick is positive, invert the price
    if (tick > 0n) {
        price = ((1n << 256n) - 1n) / price;
    }

    // Convert from Q128.128 to Q64.96 by dividing by 2^32, rounding up
    const sqrtPriceX96 = (price + (1n << 32n) - 1n) >> 32n;

    return sqrtPriceX96;
}       

const mostSignificantBit = (x: bigint): bigint => {
    if (x === 0n) return 0n;
    
    let msb = 0n;
    let value = x;
    
    // Use bit shifting to find the most significant bit
    while (value > 1n) {
        value >>= 1n;
        msb++;
    }
    
    return msb;
}

export const getTickAtSqrtPrice = (sqrtPriceX96: bigint): bigint => {
    /**
     * Calculates the greatest tick value such that getSqrtPriceAtTick(tick) <= sqrtPriceX96
     * 
     * @param sqrtPriceX96 - The sqrt price for which to compute the tick as a Q64.96
     * @returns The greatest tick for which getSqrtPriceAtTick(tick) <= sqrtPriceX96
     * @throws InvalidSqrtPrice if sqrtPriceX96 is out of valid range
     */
    
    // Validate input range
    if ((sqrtPriceX96 - MIN_SQRT_RATIO) > MAX_SQRT_RATIO_MINUS_MIN_SQRT_RATIO_MINUS_ONE) {
        throw new InvalidSqrtPrice(sqrtPriceX96);
    }

    const price = sqrtPriceX96 << 32n;

    let r = price;
    const msb = mostSignificantBit(r);

    if (msb >= 128n) {
        r = price >> (msb - 127n);
    } else {
        r = price << (127n - msb);
    }

    let log2 = (msb - 128n) << 64n;

    // Binary search for log_2 with 14 iterations
    for (let i = 0; i < 14; i++) {
        r = (r * r) >> 127n;
        const f = r >> 128n;
        log2 = log2 | (f << (63n - BigInt(i)));
        r = r >> f;
    }

    // Convert log_2 to log_sqrt10001 using the magic number
    const logSqrt10001 = log2 * 255738958999603826347141n;

    // Calculate bounds with magic numbers for error correction
    let tickLow = (logSqrt10001 - 3402992956809132418596140100660247210n) >> 128n;
    let tickHi = (logSqrt10001 + 291339464771989622907027621153398088495n) >> 128n;

    // Ensure we stay within int24 bounds
    tickLow = tickLow > MAX_TICK ? MAX_TICK : (tickLow < MIN_TICK ? MIN_TICK : tickLow);
    tickHi = tickHi > MAX_TICK ? MAX_TICK : (tickHi < MIN_TICK ? MIN_TICK : tickHi);

    if (tickLow === tickHi) {
        return tickLow;
    } else {
        return getSqrtPriceAtTick(tickHi) <= sqrtPriceX96 ? tickHi : tickLow;
    }
}

export const invertSqrtPriceX96 = (sqrtPriceX96: bigint): bigint => {
    const tick = getTickAtSqrtPrice(sqrtPriceX96);
    return getSqrtPriceAtTick(-tick);
}

export const quantizeTick = (tick: bigint, tickSpacing: bigint, round: boolean = false): bigint => {
    if (round) {
        const absTick = tick >= 0n ? tick : -tick;
        const absMod = absTick % tickSpacing;
        const absResult = absMod > tickSpacing / 2n 
            ? absTick + (tickSpacing - absMod)
            : absTick - absMod;
        return tick >= 0n ? absResult : -absResult;
    }
    return tick - (tick % tickSpacing);
}

export const assertTickInRange = (tick: bigint, tickSpacing: bigint = 200n): void => {
    if (tick < MIN_TICK || tick > MAX_TICK) {
        throw new InvalidTick(tick);
    }
    if (tick % tickSpacing !== 0n) {
        throw new InvalidTick(tick);
    }
}

export const getTargetPriceAndHooksSimple = (
    priceX96: bigint,
    numToken0: bigint,
    numToken1: bigint,
    tickSpacing: bigint = 60n
): [bigint, bigint, bigint] => {
    if (priceX96 < MIN_SQRT_RATIO || priceX96 > MAX_SQRT_RATIO) {
        throw new InvalidSqrtPrice(priceX96);
    }

    const targetTick = quantizeTick(
        getTickAtSqrtPrice(priceX96),
        tickSpacing,
        true
    );
    assertTickInRange(targetTick, tickSpacing);

    const endTick = maxUsableTick(tickSpacing);
    assertTickInRange(endTick, tickSpacing); // SAFETY: Not needed per se

    const sqrtTargetPrice = getSqrtPriceAtTick(targetTick);
    const sqrtEndPrice = getSqrtPriceAtTick(endTick);
    const sqrtPriceRange = invertSqrtPriceX96(sqrtTargetPrice) - invertSqrtPriceX96(sqrtEndPrice);

    if (numToken0 <= 0n) {
        throw new InvalidTokenAmount(numToken0);
    }

    const subBy = sqrtPriceRange * numToken1 / numToken0;
    if (subBy > sqrtTargetPrice) {
        throw new SubByTooLarge(subBy, sqrtTargetPrice);
    }

    const sqrtStartPriceX96 = sqrtTargetPrice - subBy;

    if (sqrtStartPriceX96 < MIN_SQRT_RATIO) {
        throw new StartTickTooLow(sqrtStartPriceX96, MIN_SQRT_RATIO);
    }

    if (sqrtStartPriceX96 > MAX_SQRT_RATIO) {
        throw new StartTickTooHigh(sqrtStartPriceX96, MAX_SQRT_RATIO);
    }

    let startTick = getTickAtSqrtPrice(sqrtStartPriceX96);
    startTick = quantizeTick(startTick, tickSpacing, true);

    if (startTick > targetTick) {
        throw new Error(
            `start_tick should be less than target_tick: ${startTick} <= ${targetTick}`
        );
    }

    assertTickInRange(startTick, tickSpacing);
    assertTickInRange(targetTick, tickSpacing);

    return [startTick, targetTick, endTick];
}

export const minTokens = (
    priceX96: bigint,
    numToken1: bigint,
    tickSpacing: bigint = 60n
) => {

    if (priceX96 < MIN_SQRT_RATIO || priceX96 > MAX_SQRT_RATIO) {
        throw new Error("Invalid price_x96");
    }

    const targetTick = quantizeTick(
        getTickAtSqrtPrice(priceX96),
        tickSpacing,
        true
    );
    assertTickInRange(targetTick, tickSpacing);

    const endTick = maxUsableTick(tickSpacing);
    assertTickInRange(endTick, tickSpacing); // SAFETY: Not needed per se

    const sqrtTargetPrice = getSqrtPriceAtTick(targetTick);
    const sqrtEndPrice = getSqrtPriceAtTick(endTick);
    const sqrtPriceRange = invertSqrtPriceX96(sqrtTargetPrice) - invertSqrtPriceX96(sqrtEndPrice);

    if (numToken1 <= 0n) {
        throw new Error("Base token must be non-zero");
    }

    const numTokenMin = ceilDiv(sqrtPriceRange * numToken1, sqrtTargetPrice + MIN_SQRT_RATIO);

    const numTokenMinWithBuffer = numTokenMin * 10000n / 9999n;
    return numTokenMinWithBuffer;
}

const ceilDiv = (numerator: bigint, denominator: bigint) => {
    return (numerator + denominator - 1n) / denominator;
}

export const getTargetPriceAndHooks = (
    priceQuoteX96: bigint,
    numBaseToken: bigint,
    numQuoteToken: bigint,
    isBaseToken0: boolean,
    tickSpacing: bigint = 60n
): [bigint, bigint, bigint] => {
    if (isBaseToken0) {
        return getTargetPriceAndHooksSimple(
            priceQuoteX96,
            numBaseToken,
            numQuoteToken,
            tickSpacing
        );
    } else {
        const [startTick, targetTick, endTick] = getTargetPriceAndHooksSimple(
            priceQuoteX96,
            numBaseToken,
            numQuoteToken,
            tickSpacing
        );
        return [-endTick, -targetTick, -startTick];
    }
}

export const priceToSqrtPriceX96 = (price: bigint): bigint => {
    return BigInt(Math.floor(Math.sqrt(Number(price)) * Math.pow(2, 96)));
}
