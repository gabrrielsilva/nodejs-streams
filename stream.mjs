import { pipeline, Readable, Writable, Transform } from 'stream';
import { promisify } from 'util';
import { createWriteStream } from 'fs';

const pipelineAsync = promisify(pipeline);
{
  const readableStream = Readable({
    read() {
      this.push('1 Hello dude!\n');
      this.push('2 Hello dude!\n');
      this.push('3 Hello dude!\n');
      this.push(null); // end process
    },
  });

  const writableStream = Writable({
    write(chunk, encoding, cb) {
      console.log('buffer:', chunk, '\nstring:', chunk.toString());
      cb();
    },
  });

  await pipelineAsync(
    readableStream,
    // process.stdout
    writableStream
  );

  console.log('process 01 finished');
}
{
  const readableStream = Readable({
    read() {
      for (let i = 0; i < 1e5; i++) {
        const user = { id: Date.now() + i, name: `Robot-${i}` };
        const data = JSON.stringify(user);
        this.push(data);
      }

      this.push(null);
    },
  });

  const writableMapToCSV = Transform({
    transform(chunk, encoding, cb) {
      const data = JSON.parse(chunk);
      const result = `${data.id},${data.name.toUpperCase()}\n`;
      cb(null, result);
    },
  });

  const setHeader = Transform({
    transform(chunk, encoding, cb) {
      this.counter = this.counter ?? 0;
      if (this.counter) {
        return cb(null, chunk);
      }

      this.counter += 1;
      cb(null, 'id,name\n'.concat(chunk));
    },
  });

  await pipelineAsync(
    readableStream,
    writableMapToCSV,
    setHeader,
    // process.stdout
    createWriteStream('my.csv')
  );
}
