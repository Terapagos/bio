const $=id=>document.getElementById(id);
let backend=sessionStorage.getItem('panel-backend')||'',token=sessionStorage.getItem('panel-token')||'',chapters=[],current=null,pageIndex=0,selected=-1,objectUrl='',drawing=false,loading=false;
$('backend').value=backend||(location.hostname==='dat.place'?'https://dat-manga-translator.fly.dev':location.origin);
function message(text){$('message').textContent=text;}
async function api(path,options={}){
  const res=await fetch(backend+path,{...options,headers:{Authorization:`Bearer ${token}`,...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});
  if(!res.ok){let error;try{error=(await res.json()).error;}catch{}throw Error(error||`Request failed (${res.status})`);}
  return res.headers.get('content-type')?.includes('application/json')?res.json():res.blob();
}
const post=(path,data)=>api(path,{method:'POST',body:JSON.stringify(data)});
function safe(fn){return async(...args)=>{try{await fn(...args);}catch(e){message(e.message);}};}
async function refresh(){chapters=await api('/api/chapters');$('chapters').replaceChildren();for(const c of [...chapters].reverse()){const b=document.createElement('button');b.textContent=c.title;const status=document.createElement('span');status.textContent=`${c.pages.length} pages · ${c.status}`;b.append(status);b.onclick=safe(()=>open(c));$('chapters').append(b);}}
async function unlock(){await refresh();$('login').hidden=true;$('workspace').hidden=false;$('disconnect').hidden=false;sessionStorage.setItem('panel-backend',backend);sessionStorage.setItem('panel-token',token);message('');}
$('connect').onsubmit=safe(async e=>{e.preventDefault();const url=new URL($('backend').value);if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname)))throw Error('Use an HTTPS backend address');if(url.username||url.password||url.search||url.hash)throw Error('Enter a plain backend address');backend=url.origin;token=$('token').value;await unlock();});
$('disconnect').onclick=()=>{token='';sessionStorage.removeItem('panel-token');location.reload();};
async function open(c){current=c;pageIndex=0;selected=-1;$('empty').hidden=true;$('chapter').hidden=false;await showPage();}
async function showPage(){
  if(!current||loading)return;loading=true;try{
    $('editor').hidden=true;selected=-1;$('chapterTitle').textContent=current.title;$('chapterStatus').textContent=current.status;
    $('pageNumber').textContent=`${pageIndex+1} / ${current.pages.length}`;$('prev').disabled=pageIndex===0;$('next').disabled=pageIndex===current.pages.length-1;
    const blob=await api(`/api/chapters/${current.id}/pages/${pageIndex}/original`);if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(blob);$('pageImage').src=objectUrl;overlays();
    const err=current.pages[pageIndex].error;if(err)message(err);
  }finally{loading=false;}
}
function overlays(){
  $('overlays').replaceChildren();if($('original').checked)return;
  current.pages[pageIndex].regions.forEach((r,i)=>{const b=document.createElement('button');b.className=`bubble${selected===i?' selected':''}`;b.style.left=`${r.x/10}%`;b.style.top=`${r.y/10}%`;b.style.width=`${r.w/10}%`;b.style.height=`${r.h/10}%`;b.style.background=r.fill===false?'transparent':'white';b.style.fontSize=`${Math.max(7,Math.min(20,Math.sqrt((r.w*r.h/1e6)*$('page').clientWidth**2/Math.max(1,r.text.length))*.85))}px`;b.textContent=r.text;b.setAttribute('aria-label',`Edit dialogue ${i+1}`);b.onclick=()=>edit(i);$('overlays').append(b);});
}
function edit(i){selected=i;const r=current.pages[pageIndex].regions[i];$('editor').hidden=false;$('sourceText').value=r.source||'';$('english').value=r.text;for(const k of ['x','y','w','h'])$(k).value=Math.round(r[k]);$('fill').checked=r.fill!==false;overlays();}
$('original').onchange=overlays;
$('prev').onclick=safe(async()=>{if(pageIndex>0){pageIndex--;await showPage();}});
$('next').onclick=safe(async()=>{if(pageIndex<current.pages.length-1){pageIndex++;await showPage();}});
async function persist(){await api(`/api/chapters/${current.id}/pages/${pageIndex}`,{method:'PUT',body:JSON.stringify({regions:current.pages[pageIndex].regions})});overlays();message('Dialogue saved. Download PNG to check final typesetting.');}
$('save').onclick=safe(async()=>{if(selected<0)return;const r=current.pages[pageIndex].regions[selected],update={...r,text:$('english').value,fill:$('fill').checked};for(const k of ['x','y','w','h'])update[k]=Number($(k).value);if(update.x<0||update.y<0||update.w<=0||update.h<=0||update.x+update.w>1000||update.y+update.h>1000)throw Error('Keep the dialogue box inside the page');current.pages[pageIndex].regions[selected]=update;await persist();});
$('remove').onclick=safe(async()=>{current.pages[pageIndex].regions.splice(selected,1);selected=-1;$('editor').hidden=true;await persist();});
$('add').onclick=()=>{if(['queued','translating'].includes(current.status))return message('Wait for translation to finish');drawing=!drawing;$('page').classList.toggle('drawing',drawing);message(drawing?'Drag a rectangle over the original dialogue.':'Drawing cancelled');};
let start;
$('page').onpointerdown=e=>{if(!drawing)return;e.preventDefault();$('page').setPointerCapture(e.pointerId);const b=$('page').getBoundingClientRect();start={x:(e.clientX-b.left)/b.width*1000,y:(e.clientY-b.top)/b.height*1000};};
$('page').onpointerup=e=>{if(!drawing||!start)return;const b=$('page').getBoundingClientRect(),x=Math.max(0,Math.min(1000,(e.clientX-b.left)/b.width*1000)),y=Math.max(0,Math.min(1000,(e.clientY-b.top)/b.height*1000));const r={x:Math.min(start.x,x),y:Math.min(start.y,y),w:Math.abs(start.x-x),h:Math.abs(start.y-y),text:'',source:'',fill:true};start=null;drawing=false;$('page').classList.remove('drawing');if(r.w<10||r.h<10)return;current.pages[pageIndex].regions.push(r);edit(current.pages[pageIndex].regions.length-1);message('Enter the English dialogue and save.');};
const base64=file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.onerror=reject;r.readAsDataURL(file);});
$('upload').onsubmit=safe(async e=>{e.preventDefault();const files=[...$('images').files].sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));if(!files.length||files.length>30)throw Error('Choose 1–30 images');if(files.reduce((n,f)=>n+f.size,0)>24e6)throw Error('Please upload less than 24 MB combined');message('Uploading chapter…');const images=[];for(const f of files)images.push(await base64(f));const c=await post('/api/upload',{title:$('title').value,language:$('language').value,images});await refresh();await open(c);message('Chapter uploaded. Start translation when ready.');});
$('import').onclick=safe(async()=>{message('Importing permitted chapter images…');const c=await post('/api/import',{title:$('title').value,language:$('language').value,url:$('url').value,permitted:$('permitted').checked});await refresh();await open(c);message('Chapter imported. Review the page order before translating.');});
$('translate').onclick=safe(async()=>{if(!current)return;await post(`/api/chapters/${current.id}/translate`,{});current.status='queued';$('chapterStatus').textContent='queued';message('Translation queued on the server. You can close this tab or turn off your PC.');});
function saveBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
$('download').onclick=safe(async()=>{const blob=await api(`/api/chapters/${current.id}/pages/${pageIndex}/render`);saveBlob(blob,`page-${String(pageIndex+1).padStart(3,'0')}.png`);});
// Store-only ZIP writer: CBZ readers accept uncompressed PNG entries.
const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(data){let c=0xffffffff;for(const x of data)c=crcTable[(c^x)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
export function zip(entries){let offset=0;const parts=[],central=[];for(const [name,data]of entries){const filename=new TextEncoder().encode(name),crc=crc32(data),h=new Uint8Array(30+filename.length),v=new DataView(h.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint32(14,crc,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,filename.length,true);h.set(filename,30);parts.push(h,data);const c=new Uint8Array(46+filename.length),cv=new DataView(c.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,filename.length,true);cv.setUint32(42,offset,true);c.set(filename,46);central.push(c);offset+=h.length+data.length;}const size=central.reduce((s,c)=>s+c.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,entries.length,true);v.setUint16(10,entries.length,true);v.setUint32(12,size,true);v.setUint32(16,offset,true);return new Blob([...parts,...central,end],{type:'application/vnd.comicbook+zip'});}
$('downloadAll').onclick=safe(async()=>{const c=current,entries=[];let size=0;for(let i=0;i<c.pages.length;i++){message(`Rendering download ${i+1} / ${c.pages.length}…`);const data=new Uint8Array(await(await api(`/api/chapters/${c.id}/pages/${i}/render`)).arrayBuffer());size+=data.length;if(size>100e6)throw Error('Chapter download exceeds 100 MB; download individual PNGs');entries.push([`${String(i+1).padStart(3,'0')}.png`,data]);}saveBlob(zip(entries),'translated-chapter.cbz');message('Chapter download ready.');});
setInterval(safe(async()=>{if(!token||$('workspace').hidden)return;const was=current?.status;await refresh();if(current){const fresh=chapters.find(c=>c.id===current.id);if(fresh&&['queued','translating'].includes(was)){current=fresh;$('chapterStatus').textContent=current.status;if(!['queued','translating'].includes(current.status)){await showPage();message(`Translation ${current.status}. Review each page before downloading.`);}}}}),6000);
window.addEventListener('resize',()=>{if(current)overlays();});
if(token&&backend)safe(unlock)();
