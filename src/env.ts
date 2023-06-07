export const DEV = (process?.env?.NODE_ENV?.toLowerCase().trim() !== 'production');
export const ENV = DEV ? 'DEVELOPMENT' : 'PRODUCTION';
export const log = DEV ? console.debug : (...args) => { };
