const path = require('node:path');
const { spawnSync } = require('node:child_process');
process.chdir(path.resolve(__dirname, '..'));
for (const suite of ['photo-handoff.cjs', 'account-safety.cjs', 'logout.cjs', 'android-photo-bridge.cjs']) {
  const result = spawnSync(process.execPath, [path.join(__dirname, suite)], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
