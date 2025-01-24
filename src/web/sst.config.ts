/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "web",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      region: "us-east-1",
      providers: {
        aws: {
          profile: "xxx-dev",
          region: "us-east-1",
          // loadConfig: true
        }
      }
    };
  },

  async run() {
    const vpc = new sst.aws.Vpc("MyVpc");
    const cluster = new sst.aws.Cluster("MyCluster", { vpc });

    cluster.addService("MyService", {
      loadBalancer: {
        ports: [
          {
            listen: "80/http",
            forward: "3000/http"
          }
        ]
      },
      dev: {
        command: "npm run dev"
      },
      environment: {
        VITE_ADAPTER: "node",
        NODE_ENV: process.env.NODE_ENV || "development",
        // Private vars
        DATABASE_URL: "libsql:..",
        DATABASE_AUTH_TOKEN: ".....BQK7wci4U55ZgeRfxR6Tc0gkXwE28e9aK223MWPVGeQ...--G7du_AnoLv2gehtkLsxiZWkHmlaAw",

        // Public vars (using SvelteKit naming)
        PUBLIC_API_BASE: "/api",
        PUBLIC_API_URL: process.env.NODE_ENV === "development"
          ? "http://localhost:5173"
          : process.env.PUBLIC_API_URL || "",
        PUBLIC_ALLOWED_ORIGINS: process.env.NODE_ENV === "development"
          ? "capacitor://localhost,http://localhost:5173,http://localhost:5174"
          : "capacitor://localhost,http://dev-myserviceloadbalance-...us-east-1.elb.amazonaws.com/"
      }
    });
  }
});

