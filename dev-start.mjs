import { exec } from 'child_process';

// Start the Next.js development server
const devServer = exec('next dev');

devServer.stdout.on('data', async (data) => {
  console.log(data);

  if (data.includes('Ready in')) {
    try {
      const open = (await import('open')).default;
      await open('http://localhost:3000');
    } catch (error) {
      console.error('Failed to open browser:', error);
    }
  }
});

devServer.stderr.on('data', (data) => {
  console.error(data);
});

devServer.on('close', (code) => {
  console.log(`dev server exited with code ${code}`);
});
