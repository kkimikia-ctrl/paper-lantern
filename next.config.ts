import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Garante que variáveis de ambiente do servidor nunca vazam para o bundle do cliente.
  // ANALYZE_API_KEY e ANALYZE_MODEL não devem aparecer em NEXT_PUBLIC_*.
  serverExternalPackages: [],
};

export default nextConfig;
