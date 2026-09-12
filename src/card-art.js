import {fonts,paintMaterials} from './library.js';
import {cardColors} from './model.js';
export function drawCard(canvas,state){const g=canvas.getContext('2d'),p=cardColors(state);paintMaterials(g,canvas.width,canvas.height,state,p);g.save();g.scale(canvas.width/480,canvas.height/340);g.fillStyle=p.ink;const layout=state.layout??'center';
function block(value,x,y,size,family,maxWidth,maxHeight,align='center'){let lines=[];function wrap(){g.font=`${family.includes('Pacifico')?400:700} ${size}px ${family}`;lines=[];for(const para of value.split('\n')){let line='';for(const ch of para){if(g.measureText(line+ch).width>maxWidth&&line){lines.push(line);line=ch;}else line+=ch;}lines.push(line);}}wrap();while(lines.length*size*1.15>maxHeight&&size>6){size--;wrap();}g.textAlign=align;g.textBaseline='top';lines.forEach((line,i)=>g.fillText(line,x,y+i*size*1.15));}
block(state.eyebrow,240,24,7,'Arial',420,24);
const spec={center:[240,96,390,150,'center'],split:[30,95,290,154,'left'],left:[35,88,340,160,'left'],poster:[240,68,414,205,'center'],letter:[38,92,405,120,'left']}[layout];
block(state.title,spec[0],spec[1],Math.min(state.size,layout==='poster'?74:60),fonts[state.font].family,spec[2],spec[3],spec[4]);
block(state.note,layout==='letter'?38:240,layout==='letter'?196:280,10,'Georgia',405,32,layout==='letter'?'left':'center');block(state.signature,240,318,6,'Arial',420,16);
if(state.motif!=='none'){g.fillStyle=p.accent;g.font='40px Georgia';g.fillText({flower:'✺',star:'✦',heart:'♥'}[state.motif]??'',420,225);}g.restore();}
