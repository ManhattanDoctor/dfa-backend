import { DateUtil } from '@ts-core/common';

// 30 requests from the same IP can be made to a single endpoint in 10 seconds.
export const THROTTLE_DEFAULT_TTL = 10 * DateUtil.MILLISECONDS_SECOND;
export const THROTTLE_DEFAULT_NAME = 'default';
export const THROTTLE_DEFAULT_LIMIT = 30;
export const THROTTLE_DEFAULT = { name: THROTTLE_DEFAULT_NAME, ttl: THROTTLE_DEFAULT_TTL, limit: THROTTLE_DEFAULT_LIMIT };

// 20 requests from the same IP can be made to a single endpoint in 5 seconds.
export const THROTTLE_FAST_TTL = 5 * DateUtil.MILLISECONDS_SECOND;
export const THROTTLE_FAST_NAME = 'fast';
export const THROTTLE_FAST_LIMIT = 20;
export const THROTTLE_FAST = { name: THROTTLE_FAST_NAME, ttl: THROTTLE_FAST_TTL, limit: THROTTLE_FAST_LIMIT };

// 4 requests from the same IP can be made to a single endpoint in 5 seconds.
export const THROTTLE_SLOW_TTL = 5 * DateUtil.MILLISECONDS_SECOND;
export const THROTTLE_SLOW_NAME = 'slow';
export const THROTTLE_SLOW_LIMIT = 4;
export const THROTTLE_SLOW = { name: THROTTLE_SLOW_NAME, ttl: THROTTLE_SLOW_TTL, limit: THROTTLE_SLOW_LIMIT };

