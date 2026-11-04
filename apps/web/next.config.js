const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@seapedia/types'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

module.exports = nextConfig;
