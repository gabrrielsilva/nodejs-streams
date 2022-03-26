import net from 'net';
net.createServer((socket) => socket.pipe(process.stdout)).listen(1338);

// node -e "process.stdin.pipe(require('net').connect(1338))"
