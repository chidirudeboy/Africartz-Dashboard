const { spawnSync } = require("child_process");

const deploymentTimestamp =
  process.env.REACT_APP_DEPLOYED_AT || new Date().toISOString();

console.log(`Building dashboard with deployment timestamp: ${deploymentTimestamp}`);

const result = spawnSync(
  process.execPath,
  [require.resolve("react-scripts/bin/react-scripts.js"), "build"],
  {
    env: {
      ...process.env,
      REACT_APP_DEPLOYED_AT: deploymentTimestamp,
    },
    stdio: "inherit",
  }
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
