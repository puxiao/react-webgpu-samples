/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    webpack: (config, options) => {
        config.module.rules.push({
            test: /\.wgsl$/,
            type: "asset/source"
        })
        return config
    }
}

module.exports = nextConfig
