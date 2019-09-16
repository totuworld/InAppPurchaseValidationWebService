import * as archiver from 'archiver';
import * as fs from 'fs';
import * as luxon from 'luxon';
import * as path from 'path';
import * as shelljs from 'shelljs';

(async () => {
  const gitRevSync = require('git-rev-sync');
  // AWS에서 충돌이 나지 않도록 Version label을 하나 올려준다.
  const packageLib = JSON.parse(fs.readFileSync('./package.json').toString());
  const postFix = `${luxon.DateTime.local().toFormat('yyMMddHHmmss')}-${packageLib.version}`;
  const filename = `iap-validate-${postFix}-${gitRevSync.short()}.zip`;

  shelljs.rm('-rf', './dist');
  shelljs.mkdir('./dist');
  shelljs.cp('-R', './build/', './dist/build');
  shelljs.rm('./package-lock.json.bak');
  shelljs.cp('./package-lock.json', './package-lock.json.bak');
  shelljs.exec('npm shrinkwrap --production');
  shelljs.cp('./package.json', './dist/package.json');
  shelljs.cp('./key.json', './dist/key.json');
  shelljs.mv('./npm-shrinkwrap.json', './dist/npm-shrinkwrap.json');
  shelljs.cp('./package-lock.json.bak', './package-lock.json');

  const artifactZip = fs.createWriteStream(path.join(__dirname, filename)); // write stream 만들고,
  const compressor = archiver('zip', { zlib: { level: 9 } });
  compressor.pipe(artifactZip);

  compressor.directory('dist', false); // directory를 recursive로 압축
  await compressor.finalize(); // 압축 시작

  shelljs.mv(filename, './dist');

  console.log('finish');

  console.log(`artifact: ${filename}`);
})();
