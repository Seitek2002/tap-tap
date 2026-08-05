#!/usr/bin/env node
// Останавливает процессы, слушающие порты фронта/бека (обычно остаются
// висеть после ручного тестирования — vite/node не всегда завершаются
// сами). По умолчанию 5173 (фронт) и 4000 (бек, см. ../bakai-server) —
// свои порты можно передать аргументами: node scripts/kill-ports.cjs 5174.
const { execSync } = require('node:child_process');

const ports = process.argv.slice(2).length
  ? process.argv.slice(2).map(Number)
  : [5173, 4000];

const isWindows = process.platform === 'win32';

// Windows: netstat -p tcp молча исключает TCPv6-слушателей (vite обычно
// висит именно на [::1]) — поэтому фильтруем протокол/порт сами, разбирая
// столбцы, а не полагаемся на встроенный фильтр протокола.
function findPidsWindows(port) {
  const output = execSync('netstat -ano', { encoding: 'utf8' });
  const pids = new Set();
  for (const line of output.split('\n')) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 5) continue;
    const [proto, localAddress, , state, pid] = parts;
    if (!proto.startsWith('TCP') || state !== 'LISTENING') continue;
    if (localAddress.split(':').pop() === String(port)) pids.add(pid);
  }
  return [...pids];
}

function killPort(port) {
  try {
    if (isWindows) {
      const pids = findPidsWindows(port);
      if (pids.length === 0) {
        console.log(`Порт ${port}: свободен`);
        return;
      }
      for (const pid of pids) {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`Порт ${port}: остановлен процесс PID ${pid}`);
      }
    } else {
      const pids = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();
      if (!pids) {
        console.log(`Порт ${port}: свободен`);
        return;
      }
      for (const pid of pids.split('\n')) {
        execSync(`kill -9 ${pid}`);
        console.log(`Порт ${port}: остановлен процесс PID ${pid}`);
      }
    }
  } catch {
    console.log(`Порт ${port}: свободен`);
  }
}

for (const port of ports) killPort(port);
