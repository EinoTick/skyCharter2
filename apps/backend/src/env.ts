// This module must be the first import in index.ts.
// TypeScript preserves import order when compiling to CJS, so placing this
// first ensures dotenv.config() runs before any other module (including
// @skycharter/database) reads process.env.DATABASE_URL.
import dotenv from 'dotenv'
dotenv.config()
