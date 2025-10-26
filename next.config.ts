import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Perform customizations to webpack config
        // config.plugins.push(new webpack.IgnorePlugin(/some-pattern/)); 
        return config; // Important: return the modified config
  }
};

export default nextConfig;
