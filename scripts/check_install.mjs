import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');let count=0;
for(const file of ['package.json','apps/web/package.json']){
 const absolute=path.join(root,file),pkg=JSON.parse(fs.readFileSync(absolute));const require=createRequire(absolute);
 for(const [name,wanted] of Object.entries({...pkg.dependencies,...pkg.devDependencies})){
  let manifest;
  try{manifest=require.resolve(name+'/package.json');}catch{
   let cursor=path.dirname(require.resolve(name));
   for(;;){const candidate=path.join(cursor,'package.json');if(fs.existsSync(candidate)&&JSON.parse(fs.readFileSync(candidate)).name===name){manifest=candidate;break;}const parent=path.dirname(cursor);if(parent===cursor)throw new Error('Cannot find '+name+' metadata');cursor=parent;}
  }
  const actual=JSON.parse(fs.readFileSync(manifest)).version;
  if(actual!==wanted)throw new Error(`${file}: ${name} installed ${actual}, expected exact ${wanted}`);
  count++;
 }
}
console.log(`Verified ${count} exact direct dependency versions against the installed tree.`);
