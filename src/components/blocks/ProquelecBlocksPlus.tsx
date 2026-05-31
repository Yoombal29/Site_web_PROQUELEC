/**
 * ProquelecBlocksPlus.tsx
 * Extension premium : 60+ nouveaux blocs pour atteindre ~85 blocs au total.
 */
import React, { useEffect, useState, useRef } from 'react';
import { useNode } from '@craftjs/core';
import { getUniversalStyles } from './universalStyles';
import { resolveDynamicContent } from '@/lib/dynamic-data/resolver';
import { InlineTextEditor } from '../god-builder/InlineTextEditor';
import { SettingsLabel, SettingsInput, SettingsTextarea, SettingsSelect, SettingsColor, SettingsRow } from './ProquelecBlocks';
import { AutoSettingsPanel } from './AutoSettingsPanel';

const Input = (p: any) => <SettingsInput {...p} />;
const Textarea = (p: any) => <SettingsTextarea {...p} />;
const Select = (p: any) => <SettingsSelect {...p} />;
const Color = (p: any) => <SettingsColor {...p} />;
const Row = (p: any) => <SettingsRow {...p} />;
const Label = (p: any) => <SettingsLabel {...p} />;
const Flex = ({ children, className }: any) => <div className={'flex items-center gap-2 ' + (className||'')}>{children}</div>;
const Grid2 = ({ children }: any) => <div className="grid grid-cols-2 gap-2">{children}</div>;

// ── 1. HeadingBlock ──
export const HeadingBlock = (props: any) => {
  const { text='Titre de la section', level='h2', fontSize=32, textAlign='left', color='#0f172a', fontWeight='700', lineHeight='1.3', letterSpacing } = props;
  const { connectors:{connect,drag}, selected, actions:{setProp} } = useNode((n:any)=>({selected:n.events.selected}));
  const u = getUniversalStyles(props);
  const Tag = level;
  const displayVal = resolveDynamicContent(text);
  return React.createElement(Tag, {
    ref:(r:any)=>{if(r)connect(drag(r))},
    style:{fontSize,textAlign,color,fontWeight,lineHeight,letterSpacing:letterSpacing?letterSpacing+'px':void 0,...u.style},
    className:'proquelec-builder-node m-0 '+u.className,
    onClick:()=>!selected&&selected,
  }, selected ? React.createElement(InlineTextEditor,{value:displayVal,onChange:(v:string)=>setProp((p:any)=>p.text=v),tagName:Tag,style:{fontSize,textAlign,color,fontWeight,lineHeight}}) : displayVal);
};
const HeadingSettings = () => {
  const {actions:{setProp},text,level,fontSize,textAlign,color,fontWeight,lineHeight,letterSpacing}=useNode((n:any)=>({...n.data.props}));
  return (<div className="space-y-3">
    <Row><Label label="Texte" /><Input value={text} onChange={(e:any)=>setProp((p:any)=>p.text=e.target.value)} /></Row>
    <Row><Label label="Niveau" /><Select value={level} onChange={(e:any)=>setProp((p:any)=>p.level=e.target.value)} options={[{value:'h1',label:'H1'},{value:'h2',label:'H2'},{value:'h3',label:'H3'},{value:'h4',label:'H4'},{value:'h5',label:'H5'},{value:'h6',label:'H6'}]} /></Row>
    <Grid2><Row><Label label="Taille (px)" /><Input type="number" value={fontSize} onChange={(e:any)=>setProp((p:any)=>p.fontSize=parseInt(e.target.value))} /></Row>
    <Row><Label label="Poids" /><Select value={fontWeight} onChange={(e:any)=>setProp((p:any)=>p.fontWeight=e.target.value)} options={[{value:'300',label:'Light'},{value:'400',label:'Normal'},{value:'600',label:'Semi-bold'},{value:'700',label:'Bold'},{value:'900',label:'Black'}]} /></Row></Grid2>
    <Row><Label label="Alignement" /><Select value={textAlign} onChange={(e:any)=>setProp((p:any)=>p.textAlign=e.target.value)} options={[{value:'left',label:'Gauche'},{value:'center',label:'Centre'},{value:'right',label:'Droite'}]} /></Row>
    <Row><Label label="Couleur" /><Color value={color} onChange={(e:any)=>setProp((p:any)=>p.color=e.target.value)} /></Row>
    <Grid2><Row><Label label="Interligne" /><Input type="number" step={0.1} value={lineHeight} onChange={(e:any)=>setProp((p:any)=>p.lineHeight=e.target.value)} /></Row>
    <Row><Label label="Espacement (px)" /><Input type="number" value={letterSpacing} onChange={(e:any)=>setProp((p:any)=>p.letterSpacing=parseInt(e.target.value)||0)} /></Row></Grid2>
  </div>);
};
HeadingBlock.craft = { displayName:'Titre', props:{text:'Titre de la section',level:'h2',fontSize:32,textAlign:'left',color:'#0f172a',fontWeight:'700',lineHeight:'1.3'}, related:{settings:HeadingSettings} };

// ── 2. ListBlock ──
export const ListBlock = (props:any) => {
  const {items=['Élément 1','Élément 2','Élément 3'],ordered=false}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const Tag=ordered?'ol':'ul';
  return React.createElement(Tag,{ref:(r:any)=>{if(r)connect(drag(r))},style:{paddingLeft:'1.5em',...u.style},className:'proquelec-builder-node '+u.className},items.map((item:string,i:number)=>React.createElement('li',{key:i,className:'text-slate-700 mb-1'},resolveDynamicContent(item))));
};
const ListSettings = () => {
  const {actions:{setProp},items,ordered}=useNode((n:any)=>({...n.data.props}));
  return (<div className="space-y-3">
    <Row><Label label="Type" /><Select value={ordered?'ordered':'unordered'} onChange={(e:any)=>setProp((p:any)=>p.ordered=e.target.value==='ordered')} options={[{value:'unordered',label:'Puce'},{value:'ordered',label:'Numérotée'}]} /></Row>
    <Row><Label label="Éléments (1 par ligne)" /><Textarea rows={5} value={(items||[]).join('\n')} onChange={(e:any)=>setProp((p:any)=>p.items=e.target.value.split('\n').filter((s:string)=>s.trim()))} /></Row>
  </div>);
};
ListBlock.craft = { displayName:'Liste', props:{items:['Élément 1','Élément 2','Élément 3'],ordered:false}, related:{settings:ListSettings} };

// ── 3. QuoteBlock ──
export const QuoteBlock = (props:any) => {
  const {quote='Le meilleur moyen de prédire l\'avenir est de le créer.',author='Peter Drucker',role='Auteur',accentColor='#2563eb'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<figure ref={(r:any)=>{if(r)connect(drag(r))}} style={{borderLeft:'4px solid ' + accentColor,padding:'16px 20px',...u.style}} className={'proquelec-builder-node '+u.className}>
    <blockquote className="text-lg italic text-slate-700 mb-3 font-medium">"{resolveDynamicContent(quote)}"</blockquote>
    <figcaption className="text-sm"><strong>{resolveDynamicContent(author)}</strong>{role?<span className="text-slate-500"> — {resolveDynamicContent(role)}</span>:null}</figcaption>
  </figure>);
};
const QuoteSettings = () => {
  const {actions:{setProp},quote,author,role,accentColor}=useNode((n:any)=>({...n.data.props}));
  return (<div className="space-y-3">
    <Row><Label label="Citation" /><Textarea rows={3} value={quote} onChange={(e:any)=>setProp((p:any)=>p.quote=e.target.value)} /></Row>
    <Row><Label label="Auteur" /><Input value={author} onChange={(e:any)=>setProp((p:any)=>p.author=e.target.value)} /></Row>
    <Row><Label label="Rôle" /><Input value={role} onChange={(e:any)=>setProp((p:any)=>p.role=e.target.value)} /></Row>
    <Row><Label label="Accent" /><Color value={accentColor} onChange={(e:any)=>setProp((p:any)=>p.accentColor=e.target.value)} /></Row>
  </div>);
};
QuoteBlock.craft = { displayName:'Citation', props:{quote:'Le meilleur moyen de prédire l\'avenir est de le créer.',author:'Peter Drucker',role:'Auteur',accentColor:'#2563eb'}, related:{settings:QuoteSettings} };

// ── 4. TableBlock ──
export const TableBlock = (props:any) => {
  const {headers=['Colonne 1','Colonne 2','Colonne 3'],rows=[['A1','B1','C1'],['A2','B2','C2']],striped=true,headerBg='#0f172a',headerColor='#ffffff',borderColor='#e2e8f0'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={u.style} className={'proquelec-builder-node overflow-x-auto '+u.className}>
    <table className="w-full text-left border-collapse">
      {headers.length>0&&<thead><tr>{headers.map((h:string,i:number)=><th key={i} style={{background:headerBg,color:headerColor,borderColor,padding:'10px 12px',fontSize:13,fontWeight:600}}>{resolveDynamicContent(h)}</th>)}</tr></thead>}
      <tbody>{rows.map((row:string[],ri:number)=><tr key={ri} style={{background:striped&&ri%2===1?'#f8fafc':'white'}}>{row.map((c:string,ci:number)=><td key={ci} style={{border:'1px solid '+borderColor,padding:'8px 12px',fontSize:13}}>{resolveDynamicContent(c)}</td>)}</tr>)}</tbody>
    </table>
  </div>);
};
const TableSettings = () => {
  const {actions:{setProp},headers,rows,striped,headerBg,headerColor}=useNode((n:any)=>({...n.data.props}));
  return (<div className="space-y-3">
    <Row><Label label="En-têtes (séparés par |)" /><Input value={headers.join(' | ')} onChange={(e:any)=>setProp((p:any)=>p.headers=e.target.value.split('|').map((s:string)=>s.trim()))} /></Row>
    <Row><Label label="Lignes (| cellules, ; lignes)" /><Textarea rows={4} value={rows.map((r:string[])=>r.join(' | ')).join(' ;\n')} onChange={(e:any)=>setProp((p:any)=>p.rows=e.target.value.split(';').map((l:string)=>l.split('|').map((s:string)=>s.trim()).filter(Boolean)).filter((a:any)=>a.length>0))} /></Row>
    <Flex><label className="text-xs text-slate-400"><input type="checkbox" checked={striped} onChange={(e:any)=>setProp((p:any)=>p.striped=e.target.checked)} className="mr-1" />Rayé</label></Flex>
    <Grid2><Row><Label label="Couleur en-tête" /><Color value={headerBg} onChange={(e:any)=>setProp((p:any)=>p.headerBg=e.target.value)} /></Row>
    <Row><Label label="Texte en-tête" /><Color value={headerColor} onChange={(e:any)=>setProp((p:any)=>p.headerColor=e.target.value)} /></Row></Grid2>
  </div>);
};
TableBlock.craft = { displayName:'Tableau', props:{headers:['Colonne 1','Colonne 2','Colonne 3'],rows:[['A1','B1','C1'],['A2','B2','C2']],striped:true,headerBg:'#0f172a',headerColor:'#ffffff'}, related:{settings:TableSettings} };

// ── 5. CodeBlock ──
export const CodeBlock = (props:any) => {
  const {code='console.log("Hello World");',language='javascript',showLineNumbers=true,theme='dark'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const bg=theme==='dark'?'#1e293b':'#f8fafc',tc=theme==='dark'?'#e2e8f0':'#0f172a';
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{background:bg,color:tc,borderRadius:8,padding:16,fontSize:13,fontFamily:"'Fira Code','Cascadia Code',monospace",overflow:'auto',...u.style}} className={'proquelec-builder-node '+u.className}>
    <div className="flex items-center gap-2 mb-2 text-xs opacity-50"><span>▸ {language}</span></div>
    {code.split('\n').map((line:string,i:number)=><div key={i} className="whitespace-pre">{showLineNumbers&&<span className="opacity-40 mr-4 select-none">{String(i+1).padStart(3,' ')}</span>}<span>{line}</span></div>)}
  </div>);
};
const CodeSettings = () => {
  const {actions:{setProp},code,language,showLineNumbers,theme}=useNode((n:any)=>({...n.data.props}));
  return (<div className="space-y-3">
    <Row><Label label="Langage" /><Input value={language} onChange={(e:any)=>setProp((p:any)=>p.language=e.target.value)} /></Row>
    <Row><Label label="Code" /><Textarea rows={8} value={code} onChange={(e:any)=>setProp((p:any)=>p.code=e.target.value)} /></Row>
    <Flex><label className="text-xs text-slate-400"><input type="checkbox" checked={showLineNumbers} onChange={(e:any)=>setProp((p:any)=>p.showLineNumbers=e.target.checked)} className="mr-1" />N° lignes</label>
    <Select value={theme} onChange={(e:any)=>setProp((p:any)=>p.theme=e.target.value)} options={[{value:'dark',label:'Sombre'},{value:'light',label:'Clair'}]} /></Flex>
  </div>);
};
CodeBlock.craft = { displayName:'Code', props:{code:'console.log("Hello World");',language:'javascript',showLineNumbers:true,theme:'dark'}, related:{settings:CodeSettings} };

// ── 6. BlockquoteBlock ──
export const BlockquoteBlock = (props:any) => {
  const {text='Texte de la citation longue…',backgroundColor='#f1f5f9',borderColor='#2563eb'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<blockquote ref={(r:any)=>{if(r)connect(drag(r))}} style={{background:backgroundColor,borderLeft:'4px solid '+borderColor,padding:'16px 20px',borderRadius:'0 8px 8px 0',fontStyle:'italic',color:'#334155',lineHeight:1.7,...u.style}} className={'proquelec-builder-node '+u.className}>{resolveDynamicContent(text)}</blockquote>);
};
BlockquoteBlock.craft = { displayName:'Bloc Citation', props:{text:'Texte de la citation longue…',backgroundColor:'#f1f5f9',borderColor:'#2563eb'}, related:{settings:AutoSettingsPanel} };

// ── 7. HighlightedTextBlock ──
export const HighlightedTextBlock = (props:any) => {
  const {text='Texte surligné',highlightColor='#fef08a',textColor='#0f172a',fontSize=18}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<span ref={(r:any)=>{if(r)connect(drag(r))}} style={{background:highlightColor,color:textColor,fontSize,padding:'2px 8px',borderRadius:3,fontWeight:600,display:'inline-block',...u.style}} className={'proquelec-builder-node '+u.className}>{resolveDynamicContent(text)}</span>);
};
HighlightedTextBlock.craft = { displayName:'Texte surligné', props:{text:'Texte surligné',highlightColor:'#fef08a',textColor:'#0f172a',fontSize:18}, related:{settings:AutoSettingsPanel} };

// ── 8. DropCapBlock ──
export const DropCapBlock = (props:any) => {
  const {text='Lettre initiale en grande taille.',dropCapSize=60,dropCapColor='#2563eb'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<p ref={(r:any)=>{if(r)connect(drag(r))}} style={{lineHeight:1.8,...u.style}} className={'proquelec-builder-node '+u.className}>
    <span style={{fontSize:dropCapSize,color:dropCapColor,fontWeight:700,float:'left',lineHeight:0.8,marginRight:8,marginTop:4}}>{text.charAt(0)}</span>{text.slice(1)}
  </p>);
};
DropCapBlock.craft = { displayName:'Lettrine', props:{text:'Lettre initiale en grande taille.',dropCapSize:60,dropCapColor:'#2563eb'}, related:{settings:AutoSettingsPanel} };

// ── 9. PullquoteBlock ──
export const PullquoteBlock = (props:any) => {
  const {text='Citation flottante.',align='right',width='40%',accentColor='#2563eb',fontSize=22}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<aside ref={(r:any)=>{if(r)connect(drag(r))}} style={{float:align as any,width,margin:align==='right'?'0 0 16px 24px':'0 24px 16px 0',fontSize,color:accentColor,fontWeight:700,lineHeight:1.3,fontStyle:'italic',borderLeft:align==='left'?'3px solid '+accentColor:'none',borderRight:align==='right'?'3px solid '+accentColor:'none',padding:'0 16px',...u.style}} className={'proquelec-builder-node '+u.className}>"{resolveDynamicContent(text)}"</aside>);
};
PullquoteBlock.craft = { displayName:'Citation flottante', props:{text:'Citation flottante.',align:'right',width:'40%',accentColor:'#2563eb',fontSize:22}, related:{settings:AutoSettingsPanel} };

// ── 10. DefinitionListBlock ──
export const DefinitionListBlock = (props:any) => {
  const {items=[['Terme 1','Définition 1'],['Terme 2','Définition 2']]}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<dl ref={(r:any)=>{if(r)connect(drag(r))}} style={u.style} className={'proquelec-builder-node space-y-3 '+u.className}>
    {items.map(([term,def]:string[],i:number)=><div key={i}><dt className="font-bold text-slate-900">{resolveDynamicContent(term)}</dt><dd className="text-slate-600 ml-4 mt-0.5">{resolveDynamicContent(def)}</dd></div>)}
  </dl>);
};
DefinitionListBlock.craft = { displayName:'Liste définitions', props:{items:[['Terme 1','Déf 1'],['Terme 2','Déf 2']]}, related:{settings:AutoSettingsPanel} };

// ── 11. AddressBlock ──
export const AddressBlock = (props:any) => {
  const {company='PROQUELEC',street='Immeuble Coumba Castel, 12 rue Saint-Michel, 4e étage',city='Dakar',phone='+221 33 848 68 55',email='proquelec@proquelec.sn'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<address ref={(r:any)=>{if(r)connect(drag(r))}} style={{fontStyle:'normal',lineHeight:1.8,...u.style}} className={'proquelec-builder-node not-italic '+u.className}>
    <strong className="block text-slate-900">{company}</strong>
    <span className="block text-slate-600">{street}</span>
    <span className="block text-slate-600">{city}</span>
    <a href={'tel:'+phone} className="block text-blue-600 hover:underline">{phone}</a>
    <a href={'mailto:'+email} className="block text-blue-600 hover:underline">{email}</a>
  </address>);
};
AddressBlock.craft = { displayName:'Adresse', props:{company:'PROQUELEC',street:'Immeuble Coumba Castel, 12 rue Saint-Michel, 4e étage',city:'Dakar',phone:'+221 33 848 68 55',email:'proquelec@proquelec.sn'}, related:{settings:AutoSettingsPanel} };

// ─────────────────────────────────────────────
// MEDIA BLOCKS
// ─────────────────────────────────────────────

// ── 12. ImageCarouselBlock ──
export const ImageCarouselBlock = (props:any) => {
  const {images=['https://placehold.co/800x400/2563eb/ffffff?text=Image+1','https://placehold.co/800x400/1e293b/ffffff?text=Image+2','https://placehold.co/800x400/475569/ffffff?text=Image+3'],autoPlay=true,interval=3000,showDots=true,showArrows=true,aspectRatio='16/9',objectFit='cover'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [current,setCurrent]=useState(0);
  useEffect(()=>{let t:any;if(autoPlay){t=setInterval(()=>setCurrent(c=>(c+1)%images.length),interval)}return()=>clearInterval(t)},[autoPlay,interval,images.length]);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{position:'relative',aspectRatio,overflow:'hidden',borderRadius:8,...u.style}} className={'proquelec-builder-node group '+u.className}>
    {images.map((src:string,i:number)=><img key={i} src={src} alt={''} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:objectFit as any,opacity:i===current?1:0,transition:'opacity 0.5s',borderRadius:8}} />)}
    {showArrows&&<><button onClick={()=>setCurrent(c=>(c-1+images.length)%images.length)} style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.5)',color:'white',border:'none',borderRadius:'50%',width:32,height:32,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,opacity:0.7}} className="hover:opacity-100 transition">‹</button>
    <button onClick={()=>setCurrent(c=>(c+1)%images.length)} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.5)',color:'white',border:'none',borderRadius:'50%',width:32,height:32,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,opacity:0.7}} className="hover:opacity-100 transition">›</button></>}
    {showDots&&<div style={{position:'absolute',bottom:8,left:'50%',transform:'translateX(-50%)',display:'flex',gap:6}}>{images.map((_:string,i:number)=><button key={i} onClick={()=>setCurrent(i)} style={{width:8,height:8,borderRadius:'50%',border:'none',cursor:'pointer',background:i===current?'white':'rgba(255,255,255,0.4)',padding:0}} />)}</div>}
  </div>);
};
const ImageCarouselSettings = () => {
  const {actions:{setProp},images,autoPlay,interval,showDots,showArrows}=useNode((n:any)=>({...n.data.props}));
  return (<div className="space-y-3">
    <Row><Label label="URL images (1 par ligne)" /><Textarea rows={4} value={images.join('\n')} onChange={(e:any)=>setProp((p:any)=>p.images=e.target.value.split('\n').filter((s:string)=>s.trim()))} /></Row>
    <Flex><label className="text-xs text-slate-400"><input type="checkbox" checked={autoPlay} onChange={(e:any)=>setProp((p:any)=>p.autoPlay=e.target.checked)} className="mr-1" />Auto</label>
    <label className="text-xs text-slate-400"><input type="checkbox" checked={showDots} onChange={(e:any)=>setProp((p:any)=>p.showDots=e.target.checked)} className="mr-1" />Points</label>
    <label className="text-xs text-slate-400"><input type="checkbox" checked={showArrows} onChange={(e:any)=>setProp((p:any)=>p.showArrows=e.target.checked)} className="mr-1" />Flèches</label></Flex>
    <Row><Label label="Intervalle (ms)" /><Input type="number" value={interval} onChange={(e:any)=>setProp((p:any)=>p.interval=parseInt(e.target.value))} /></Row>
  </div>);
};
ImageCarouselBlock.craft = { displayName:'Carrousel Images', props:{images:['https://placehold.co/800x400/2563eb/ffffff?text=Image+1','https://placehold.co/800x400/1e293b/ffffff?text=Image+2'],autoPlay:true,interval:3000,showDots:true,showArrows:true,aspectRatio:'16/9',objectFit:'cover'}, related:{settings:ImageCarouselSettings} };

// ── 13. VideoPopupBlock ──
export const VideoPopupBlock = (props:any) => {
  const {videoUrl='https://www.youtube.com/watch?v=dQw4w9WgXcQ',thumbnail='',buttonLabel='▶ Lire la vidéo',width=800,height=450}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [open,setOpen]=useState(false);
  const embedUrl=videoUrl.includes('watch?v=')?videoUrl.replace('watch?v=','embed/'):videoUrl.includes('youtu.be')?videoUrl.replace('youtu.be/','youtube.com/embed/'):videoUrl;
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={u.style} className={'proquelec-builder-node '+u.className}>
    <div onClick={()=>setOpen(true)} style={{position:'relative',cursor:'pointer',borderRadius:8,overflow:'hidden',display:'inline-block'}}>{thumbnail?<img src={thumbnail} alt="" style={{width:320,height:180,objectFit:'cover'}} />:<div style={{width:320,height:180,background:'linear-gradient(135deg,#1e293b,#0f172a)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8}}><div style={{width:60,height:60,borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,color:'white'}}>▶</div></div>}
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{background:'rgba(0,0,0,0.7)',color:'white',padding:'8px 20px',borderRadius:20,fontSize:14}}>{buttonLabel}</span></div></div>
    {open&&<div onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}><div onClick={(e)=>e.stopPropagation()} style={{maxWidth:'90vw'}}><iframe src={embedUrl+'?autoplay=1'} width={width} height={height} style={{border:'none',borderRadius:8}} allow="autoplay; encrypted-media" /></div></div>}
  </div>);
};
VideoPopupBlock.craft = { displayName:'Popup Vidéo', props:{videoUrl:'https://www.youtube.com/watch?v=dQw4w9WgXcQ',buttonLabel:'▶ Lire la vidéo',width:800,height:450}, related:{settings:AutoSettingsPanel} };

// ── 14. ImageHotspotBlock ──
export const ImageHotspotBlock = (props:any) => {
  const {image='https://placehold.co/600x400/1e293b/ffffff?text=Hotspot',hotspots=[{x:30,y:40,label:'Point 1',desc:'Description du point 1'},{x:70,y:60,label:'Point 2',desc:'Description du point 2'}]}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [active,setActive]=useState<number|null>(null);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{position:'relative',display:'inline-block',...u.style}} className={'proquelec-builder-node '+u.className}>
    <img src={image} alt="" style={{maxWidth:'100%',display:'block',borderRadius:8}} />
    {hotspots.map((h:any,i:number)=><div key={i} style={{position:'absolute',left:h.x+'%',top:h.y+'%',transform:'translate(-50%,-50%)'}}>
      <div onMouseEnter={()=>setActive(i)} onMouseLeave={()=>setActive(null)} style={{width:28,height:28,borderRadius:'50%',background:'rgba(37,99,235,0.9)',border:'2px solid white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:12,fontWeight:700,boxShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>+</div>
      {active===i&&<div style={{position:'absolute',left:'50%',bottom:'calc(100% + 8px)',transform:'translateX(-50%)',background:'#1e293b',color:'white',padding:'8px 12px',borderRadius:6,fontSize:12,whiteSpace:'nowrap',zIndex:10}}><strong>{h.label}</strong>{h.desc?<span className="block text-slate-300 font-normal">{h.desc}</span>:null}</div>}
    </div>)}
  </div>);
};
ImageHotspotBlock.craft = { displayName:'Image Hotspots', props:{image:'https://placehold.co/600x400/1e293b/ffffff?text=Hotspot',hotspots:[{x:30,y:40,label:'Point 1',desc:'Description'},{x:70,y:60,label:'Point 2',desc:'Description'}]}, related:{settings:AutoSettingsPanel} };

// ── 15. ImageComparisonBlock ──
export const ImageComparisonBlock = (props:any) => {
  const {imageBefore='https://placehold.co/600x400/94a3b8/ffffff?text=Avant',imageAfter='https://placehold.co/600x400/2563eb/ffffff?text=Après',labelBefore='Avant',labelAfter='Après'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [pos,setPos]=useState(50);
  const containerRef=useRef<HTMLDivElement>(null);
  const handleMove=(e:React.MouseEvent)=>{const r=containerRef.current?.getBoundingClientRect();if(r)setPos(Math.max(0,Math.min(100,((e.clientX-r.left)/r.width)*100)))};
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={u.style} className={'proquelec-builder-node '+u.className}>
    <div ref={containerRef} onMouseMove={handleMove} style={{position:'relative',width:'100%',aspectRatio:'16/10',overflow:'hidden',borderRadius:8,cursor:'ew-resize',userSelect:'none'}}>
      <img src={imageAfter} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
      <div style={{position:'absolute',inset:0,width:pos + '%',overflow:'hidden',borderRight:'2px solid white'}}><img src={imageBefore} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block',maxWidth:'none'}} /></div>
      <div style={{position:'absolute',top:8,left:8,background:'rgba(0,0,0,0.6)',color:'white',padding:'2px 8px',borderRadius:4,fontSize:11}}>{labelBefore}</div>
      <div style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,0.6)',color:'white',padding:'2px 8px',borderRadius:4,fontSize:11}}>{labelAfter}</div>
      <div style={{position:'absolute',left:pos + '%',top:'50%',transform:'translate(-50%,-50%)',width:40,height:40,borderRadius:'50%',background:'white',boxShadow:'0 2px 8px rgba(0,0,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>↔</div>
    </div>
  </div>);
};
ImageComparisonBlock.craft = { displayName:'Comparaison Image', props:{imageBefore:'https://placehold.co/600x400/94a3b8/ffffff?text=Avant',imageAfter:'https://placehold.co/600x400/2563eb/ffffff?text=Après',labelBefore:'Avant',labelAfter:'Après'}, related:{settings:AutoSettingsPanel} };

// ── 16. MasonryGalleryBlock ──
export const MasonryGalleryBlock = (props:any) => {
  const {images=['https://placehold.co/300x400/2563eb/ffffff?text=1','https://placehold.co/300x500/1e293b/ffffff?text=2','https://placehold.co/300x300/475569/ffffff?text=3','https://placehold.co/300x450/0f172a/ffffff?text=4'],columns=3,gap=8}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const cols=Array.from({length:columns},()=>[] as string[]);
  images.forEach((src:string,i:number)=>cols[i%columns].push(src));
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{display:'flex',gap,alignItems:'flex-start',...u.style}} className={'proquelec-builder-node '+u.className}>
    {cols.map((col:string[],ci:number)=><div key={ci} style={{flex:1,display:'flex',flexDirection:'column',gap}}>
      {col.map((src:string,si:number)=><img key={si} src={src} alt="" style={{width:'100%',display:'block',borderRadius:6,objectFit:'cover'}} />)}
    </div>)}
  </div>);
};
MasonryGalleryBlock.craft = { displayName:'Galerie Masonry', props:{images:['https://placehold.co/300x400/2563eb/ffffff?text=1','https://placehold.co/300x500/1e293b/ffffff?text=2','https://placehold.co/300x300/475569/ffffff?text=3','https://placehold.co/300x450/0f172a/ffffff?text=4'],columns:3,gap:8}, related:{settings:AutoSettingsPanel} };

// ── 17. LottieBlock ──
export const LottieBlock = (props:any) => {
  const {animationUrl='https://assets5.lottiefiles.com/packages/lf20_sZTNZn.json',width=300,height=300}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{width,height,...u.style}} className={'proquelec-builder-node '+u.className}>
    <lottie-player src={animationUrl} autoplay loop style={{width:'100%',height:'100%'}}></lottie-player>
  </div>);
};
LottieBlock.craft = { displayName:'Lottie Animation', props:{animationUrl:'https://assets5.lottiefiles.com/packages/lf20_sZTNZn.json',width:300,height:300}, related:{settings:AutoSettingsPanel} };

// ── 18. AudioBlock ──
export const AudioBlock = (props:any) => {
  const {url='https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',title='Audio Player'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{padding:12,background:'#f8fafc',borderRadius:8,border:'1px solid #e2e8f0',...u.style}} className={'proquelec-builder-node '+u.className}>
    <p className="text-sm font-medium text-slate-700 mb-2">{title}</p>
    <audio controls src={url} style={{width:'100%'}}>Your browser does not support audio.</audio>
  </div>);
};
AudioBlock.craft = { displayName:'Audio', props:{url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',title:'Audio'}, related:{settings:AutoSettingsPanel} };

// ── 19. FileDownloadBlock ──
export const FileDownloadBlock = (props:any) => {
  const {url='#',label='Télécharger le fichier',fileSize='2.4 Mo',icon='📄',bgColor='#f1f5f9',accentColor='#2563eb'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<a ref={(r:any)=>{if(r)connect(drag(r))}} href={url} download style={{display:'flex',alignItems:'center',gap:12,background:bgColor,padding:'10px 16px',borderRadius:8,border:'1px solid ' + accentColor,color:'#0f172a',textDecoration:'none',...u.style}} className={'proquelec-builder-node hover:bg-slate-100 transition '+u.className}>
    <span style={{fontSize:24}}>{icon}</span>
    <div><span className="font-medium text-sm">{label}</span>{fileSize&&<span className="block text-xs text-slate-500">{fileSize}</span>}</div>
    <span style={{marginLeft:'auto',color:accentColor,fontSize:14}}>↓</span>
  </a>);
};
FileDownloadBlock.craft = { displayName:'Téléchargement', props:{url:'#',label:'Télécharger le fichier',fileSize:'2.4 Mo',icon:'📄',bgColor:'#f1f5f9',accentColor:'#2563eb'}, related:{settings:AutoSettingsPanel} };

// ── 20. ThumbnailGalleryBlock ──
export const ThumbnailGalleryBlock = (props:any) => {
  const {images=['https://placehold.co/600x400/2563eb/ffffff?text=1','https://placehold.co/600x400/1e293b/ffffff?text=2','https://placehold.co/600x400/475569/ffffff?text=3'],gap=8}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [active,setActive]=useState(0);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={u.style} className={'proquelec-builder-node '+u.className}>
    <img src={images[active]} alt="" style={{width:'100%',aspectRatio:'16/9',objectFit:'cover',borderRadius:8,marginBottom:gap}} />
    <div style={{display:'flex',gap}}>{images.map((src:string,i:number)=><img key={i} src={src} alt="" onClick={()=>setActive(i)} style={{width:64,height:48,objectFit:'cover',borderRadius:4,cursor:'pointer',opacity:i===active?1:0.5,border:i===active?'2px solid #2563eb':'2px solid transparent'}} />)}</div>
  </div>);
};
ThumbnailGalleryBlock.craft = { displayName:'Galerie Vignettes', props:{images:['https://placehold.co/600x400/2563eb/ffffff?text=1','https://placehold.co/600x400/1e293b/ffffff?text=2','https://placehold.co/600x400/475569/ffffff?text=3'],gap:8}, related:{settings:AutoSettingsPanel} };
// ─────────────────────────────────────────────
// INTERACTIVE BLOCKS
// ─────────────────────────────────────────────

// ── 21. FlipBoxBlock ──
export const FlipBoxBlock = (props:any) => {
  const {frontText='Face avant',backText='Face arrière',frontBg='#2563eb',backBg='#1e293b',textColor='#ffffff',height=280}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [flipped,setFlipped]=useState(false);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} onClick={()=>setFlipped(!flipped)} style={{perspective:1000,height,cursor:'pointer',...u.style}} className={'proquelec-builder-node '+u.className}>
    <div style={{position:'relative',width:'100%',height:'100%',transition:'transform 0.6s',transformStyle:'preserve-3d',transform:flipped?'rotateY(180deg)':'rotateY(0deg)'}}>
      <div style={{position:'absolute',inset:0,backfaceVisibility:'hidden',background:frontBg,color:textColor,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:12,padding:24,fontSize:18,fontWeight:600,textAlign:'center'}}>{resolveDynamicContent(frontText)}</div>
      <div style={{position:'absolute',inset:0,backfaceVisibility:'hidden',background:backBg,color:textColor,transform:'rotateY(180deg)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:12,padding:24,fontSize:16,textAlign:'center'}}>{resolveDynamicContent(backText)}</div>
    </div>
  </div>);
};
FlipBoxBlock.craft = { displayName:'FlipBox', props:{frontText:'Face avant',backText:'Face arrière',frontBg:'#2563eb',backBg:'#1e293b',textColor:'#ffffff',height:280}, related:{settings:AutoSettingsPanel} };

// ── 22. CountdownBlock ──
export const CountdownBlock = (props:any) => {
  const {targetDate='2027-01-01T00:00:00',labels={days:'Jours',hours:'Heures',minutes:'Minutes',seconds:'Secondes'},boxBg='#1e293b',boxTextColor='#ffffff',accentColor='#2563eb'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const calc=()=>{const d=new Date(targetDate).getTime()-Date.now();return d>0?{d:Math.floor(d/86400000),h:Math.floor((d%86400000)/3600000),m:Math.floor((d%3600000)/60000),s:Math.floor((d%60000)/1000)}:{d:0,h:0,m:0,s:0}};
  const [t,setT]=useState(calc);
  useEffect(()=>{const i=setInterval(()=>setT(calc),1000);return()=>clearInterval(i)});
  const box={background:boxBg,color:boxTextColor,borderRadius:8,padding:'12px 16px',minWidth:60,textAlign:'center' as const};
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{display:'flex',gap:12,justifyContent:'center',...u.style}} className={'proquelec-builder-node '+u.className}>
    {[
      {l:labels.days,v:t.d},{l:labels.hours,v:t.h},{l:labels.minutes,v:t.m},{l:labels.seconds,v:t.s}
    ].map((o:any,i:number)=><div key={i}><div style={box}><div style={{fontSize:28,fontWeight:700,lineHeight:1.2}}>{String(o.v).padStart(2,'0')}</div><div style={{fontSize:11,opacity:0.7,marginTop:2}}>{o.l}</div></div></div>)}
  </div>);
};
CountdownBlock.craft = { displayName:'Compte à rebours', props:{targetDate:'2027-01-01T00:00:00',labels:{days:'Jours',hours:'Heures',minutes:'Minutes',seconds:'Secondes'},boxBg:'#1e293b',boxTextColor:'#ffffff'}, related:{settings:AutoSettingsPanel} };

// ── 23. TestimonialCarouselBlock ──
export const TestimonialCarouselBlock = (props:any) => {
  const {items=[{text:'Excellent service !',author:'Jean Dupont',role:'CEO',avatar:''},{text:'Produits de grande qualité.',author:'Marie Martin',role:'CTO',avatar:''}],bgColor='#f8fafc',textColor='#0f172a',accentColor='#2563eb'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [current,setCurrent]=useState(0);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{background:bgColor,borderRadius:12,padding:32,...u.style}} className={'proquelec-builder-node relative '+u.className}>
    {items.map((item:any,i:number)=><div key={i} style={{display:i===current?'block':'none',textAlign:'center'}}>
      <div style={{fontSize:40,opacity:0.2,lineHeight:0.3}}>""</div>
      <p style={{color:textColor,fontSize:16,lineHeight:1.7,maxWidth:500,margin:'16px auto'}}>{item.text}</p>
      <div><div style={{width:48,height:48,borderRadius:'50%',background:accentColor,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,margin:'0 auto 8px'}}>{item.author.charAt(0)}</div>
      <p style={{color:textColor,fontWeight:600,fontSize:14}}>{item.author}</p>{item.role&&<p style={{color:textColor,opacity:0.6,fontSize:12}}>{item.role}</p>}</div></div>)}
    {items.length>1&&<div style={{display:'flex',justifyContent:'center',gap:8,marginTop:20}}>{items.map((_:any,i:number)=><button key={i} onClick={()=>setCurrent(i)} style={{width:8,height:8,borderRadius:'50%',border:'none',cursor:'pointer',background:i===current?accentColor:'#cbd5e1',padding:0}} />)}</div>}
  </div>);
};
TestimonialCarouselBlock.craft = { displayName:'Carrousel Témoignages', props:{items:[{text:'Excellent service !',author:'Jean Dupont',role:'CEO'},{text:'Produits de grande qualité.',author:'Marie Martin',role:'CTO'}],bgColor:'#f8fafc',textColor:'#0f172a',accentColor:'#2563eb'}, related:{settings:AutoSettingsPanel} };

// ── 24. FAQBlock ──
export const FAQBlock = (props:any) => {
  const {items=[{q:'Question 1 ?',a:'Réponse 1…'},{q:'Question 2 ?',a:'Réponse 2…'}],activeColor='#2563eb'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [open,setOpen]=useState<number|null>(null);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={u.style} className={'proquelec-builder-node divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden '+u.className}>
    {items.map((item:any,i:number)=><div key={i}>
      <button onClick={()=>setOpen(open===i?null:i)} style={{width:'100%',textAlign:'left',padding:'12px 16px',border:'none',background:open===i?'#f8fafc':'white',cursor:'pointer',fontWeight:600,fontSize:14,color:open===i?activeColor:'#0f172a',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        {item.q}<span style={{transition:'transform 0.2s',transform:open===i?'rotate(180deg)':'rotate(0deg)'}}>▼</span></button>
      {open===i&&<div style={{padding:'0 16px 12px',fontSize:13,color:'#475569',lineHeight:1.7}}>{item.a}</div>}
    </div>)}
  </div>);
};
FAQBlock.craft = { displayName:'FAQ', props:{items:[{q:'Question 1 ?',a:'Réponse 1…'},{q:'Question 2 ?',a:'Réponse 2…'}],activeColor:'#2563eb'}, related:{settings:AutoSettingsPanel} };

// ── 25. ModalBlock ──
export const ModalBlock = (props:any) => {
  const {buttonLabel='Ouvrir la modale',title='Titre de la modale',content='Contenu de la modale…',width=480}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [open,setOpen]=useState(false);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={u.style} className={'proquelec-builder-node inline-block '+u.className}>
    <button onClick={()=>setOpen(true)} style={{background:'#2563eb',color:'white',border:'none',padding:'8px 20px',borderRadius:8,cursor:'pointer',fontSize:14}}>{buttonLabel}</button>
    {open&&<div onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div onClick={(e)=>e.stopPropagation()} style={{background:'white',borderRadius:12,width:Math.min(width,window.innerWidth-32),maxHeight:'80vh',overflow:'auto',padding:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}><h3 style={{margin:0,fontSize:18,fontWeight:600}}>{title}</h3><button onClick={()=>setOpen(false)} style={{border:'none',background:'none',fontSize:20,cursor:'pointer',color:'#94a3b8'}}>✕</button></div>
        <p style={{color:'#475569',lineHeight:1.7,fontSize:14}}>{content}</p>
      </div>
    </div>}
  </div>);
};
ModalBlock.craft = { displayName:'Modale', props:{buttonLabel:'Ouvrir la modale',title:'Titre',content:'Contenu de la modale…',width:480}, related:{settings:AutoSettingsPanel} };

// ── 26. ToggleBlock ──
export const ToggleBlock = (props:any) => {
  const {label='Afficher plus',content='Contenu dépliable…',openByDefault=false}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [open,setOpen]=useState(openByDefault);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{border:'1px solid #e2e8f0',borderRadius:8,...u.style}} className={'proquelec-builder-node '+u.className}>
    <button onClick={()=>setOpen(!open)} style={{width:'100%',textAlign:'left',padding:'10px 14px',background:'#f8fafc',border:'none',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',justifyContent:'space-between',borderRadius:8}}>{label}<span style={{transition:'transform 0.2s',transform:open?'rotate(180deg)':'rotate(0deg)'}}>▾</span></button>
    {open&&<div style={{padding:'10px 14px',fontSize:13,color:'#475569',lineHeight:1.7,borderTop:'1px solid #e2e8f0'}}>{content}</div>}
  </div>);
};
ToggleBlock.craft = { displayName:'Toggle', props:{label:'Afficher plus',content:'Contenu dépliable…',openByDefault:false}, related:{settings:AutoSettingsPanel} };

// ── 27. TimelineBlock ──
export const TimelineBlock = (props:any) => {
  const {items=[{year:'2023',title:'Étape 1',desc:'Description de l\'étape 1.'},{year:'2024',title:'Étape 2',desc:'Description de l\'étape 2.'}],accentColor='#2563eb'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={u.style} className={'proquelec-builder-node '+u.className}>
    {items.map((item:any,i:number)=><div key={i} style={{display:'flex',gap:16,paddingBottom:i<items.length-1?24:0,position:'relative'}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
        <div style={{width:16,height:16,borderRadius:'50%',background:accentColor,border:'3px solid #e2e8f0',flexShrink:0}} />
        {i<items.length-1&&<div style={{width:2,flex:1,background:'#e2e8f0'}} />}
      </div>
      <div><span style={{fontSize:12,color:accentColor,fontWeight:600}}>{item.year}</span><h4 style={{margin:'2px 0 4px',fontSize:15,fontWeight:600}}>{item.title}</h4><p style={{fontSize:13,color:'#475569',lineHeight:1.6,margin:0}}>{item.desc}</p></div>
    </div>)}
  </div>);
};
TimelineBlock.craft = { displayName:'Timeline', props:{items:[{year:'2023',title:'Étape 1',desc:'Description'},{year:'2024',title:'Étape 2',desc:'Description'}],accentColor:'#2563eb'}, related:{settings:AutoSettingsPanel} };

// ── 28. StepsBlock ──
export const StepsBlock = (props:any) => {
  const {items=[{title:'Étape 1',desc:'Description de l\'étape 1.'},{title:'Étape 2',desc:'Description de l\'étape 2.'},{title:'Étape 3',desc:'Description de l\'étape 3.'}],accentColor='#2563eb',layout='horizontal'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const isH=layout==='horizontal';
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{display:'flex',flexDirection:isH?'row':'column',gap:isH?24:16,...u.style}} className={'proquelec-builder-node '+u.className}>
    {items.map((item:any,i:number)=><div key={i} style={{flex:isH?1:'none',display:'flex',alignItems:'center',gap:12,flexDirection:isH?'column':'row',textAlign:isH?'center':'left'}}>
      <div style={{width:40,height:40,borderRadius:'50%',background:accentColor,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,flexShrink:0}}>{i+1}</div>
      <div><h4 style={{fontSize:14,fontWeight:600,margin:'0 0 2px'}}>{item.title}</h4><p style={{fontSize:12,color:'#475569',margin:0,lineHeight:1.5}}>{item.desc}</p></div>
    </div>)}
  </div>);
};
StepsBlock.craft = { displayName:'Étapes', props:{items:[{title:'Étape 1',desc:'Desc'},{title:'Étape 2',desc:'Desc'},{title:'Étape 3',desc:'Desc'}],accentColor:'#2563eb',layout:'horizontal'}, related:{settings:AutoSettingsPanel} };

// ── 29. TeamMembersGridBlock ──
export const TeamMembersGridBlock = (props:any) => {
  const {members=[{name:'Alice Dupont',role:'CEO',photo:'',bio:'Description…'},{name:'Bob Martin',role:'CTO',photo:'',bio:'Description…'}],columns=3,gap=20}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax('+(columns>3?'250':'280')+'px,1fr))',gap,...u.style}} className={'proquelec-builder-node '+u.className}>
    {members.map((m:any,i:number)=><div key={i} style={{textAlign:'center',padding:16,background:'#f8fafc',borderRadius:8}}>
      {m.photo?<img src={m.photo} alt="" style={{width:96,height:96,borderRadius:'50%',objectFit:'cover',margin:'0 auto 12px'}} />:<div style={{width:96,height:96,borderRadius:'50%',background:'#2563eb',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:700,margin:'0 auto 12px'}}>{m.name.charAt(0)}</div>}
      <h4 style={{fontSize:15,fontWeight:600,margin:'0 0 2px'}}>{m.name}</h4><p style={{fontSize:12,color:'#2563eb',fontWeight:500,margin:'0 0 6px'}}>{m.role}</p><p style={{fontSize:12,color:'#475569',lineHeight:1.5,margin:0}}>{m.bio}</p>
    </div>)}
  </div>);
};
TeamMembersGridBlock.craft = { displayName:'Membres Équipe', props:{members:[{name:'Alice Dupont',role:'CEO',photo:'',bio:'Description…'},{name:'Bob Martin',role:'CTO',photo:'',bio:'Description…'}],columns:3,gap:20}, related:{settings:AutoSettingsPanel} };
// ─────────────────────────────────────────────
// MARKETING BLOCKS
// ─────────────────────────────────────────────

// ── 30. CallToActionBlock ──
export const CallToActionBlock = (props:any) => {
  const {title='Prêt à démarrer ?',description='Rejoignez-nous dès aujourd\'hui.',buttonText='Commencer',buttonUrl='#',bgColor='#2563eb',textColor='#ffffff',buttonBg='#ffffff',buttonTextColor='#2563eb',layout='horizontal',padding=48}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const isH=layout==='horizontal';
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{background:bgColor,color:textColor,padding,borderRadius:12,display:'flex',flexDirection:isH?'row':'column',alignItems:'center',justifyContent:'space-between',gap:20,...u.style}} className={'proquelec-builder-node '+u.className}>
    <div style={{textAlign:isH?'left':'center'}}><h3 style={{margin:'0 0 6px',fontSize:24,fontWeight:700}}>{resolveDynamicContent(title)}</h3><p style={{margin:0,opacity:0.9,fontSize:14,lineHeight:1.6}}>{resolveDynamicContent(description)}</p></div>
    <a href={buttonUrl} style={{background:buttonBg,color:buttonTextColor,padding:'10px 28px',borderRadius:8,fontWeight:600,fontSize:14,textDecoration:'none',whiteSpace:'nowrap',display:'inline-block',flexShrink:0}}>{buttonText}</a>
  </div>);
};
CallToActionBlock.craft = { displayName:'CTA', props:{title:'Prêt à démarrer ?',description:'Rejoignez-nous dès aujourd\'hui.',buttonText:'Commencer',buttonUrl:'#',bgColor:'#2563eb',textColor:'#ffffff',buttonBg:'#ffffff',buttonTextColor:'#2563eb',layout:'horizontal',padding:48}, related:{settings:AutoSettingsPanel} };

// ── 31. PriceListBlock ──
export const PriceListBlock = (props:any) => {
  const {items=[{name:'Pack Standard',price:'49€',desc:'Description du pack',featured:false},{name:'Pack Premium',price:'99€',desc:'Description du pack',featured:true}],columns=3}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:20,...u.style}} className={'proquelec-builder-node '+u.className}>
    {items.map((item:any,i:number)=><div key={i} style={{border:item.featured?'2px solid #2563eb':'1px solid #e2e8f0',borderRadius:12,padding:24,textAlign:'center',position:'relative',background:item.featured?'#f8fafc':'white'}}>
      {item.featured&&<span style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',background:'#2563eb',color:'white',padding:'2px 12px',borderRadius:20,fontSize:11,fontWeight:600}}>Populaire</span>}
      <h4 style={{fontSize:16,fontWeight:600,margin:'0 0 8px'}}>{item.name}</h4>
      <div style={{fontSize:32,fontWeight:700,color:'#0f172a',margin:'8px 0'}}>{item.price}</div>
      <p style={{fontSize:13,color:'#475569',lineHeight:1.6,margin:'0 0 16px'}}>{item.desc}</p>
      <button style={{width:'100%',background:item.featured?'#2563eb':'#f1f5f9',color:item.featured?'white':'#0f172a',border:'none',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:13}}>Souscrire</button>
    </div>)}
  </div>);
};
PriceListBlock.craft = { displayName:'Grille Tarifs', props:{items:[{name:'Pack Standard',price:'49€',desc:'Description',featured:false},{name:'Pack Premium',price:'99€',desc:'Description',featured:true}],columns:3}, related:{settings:AutoSettingsPanel} };

// ── 32. StarRatingBlock ──
export const StarRatingBlock = (props:any) => {
  const {rating=4.5,maxStars=5,size=24,color='#f59e0b',showValue=true}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{display:'flex',alignItems:'center',gap:6,...u.style}} className={'proquelec-builder-node '+u.className}>
    {Array.from({length:maxStars},(_,i)=><span key={i} style={{fontSize:size,color:i<Math.floor(rating)?color:i<rating?color:'#e2e8f0',lineHeight:1}}>{i<Math.floor(rating)||(i===Math.floor(rating)&&rating%1<0.25)?'★':i<rating?'⯨':'☆'}</span>)}
    {showValue&&<span style={{fontSize:size*0.7,color:'#64748b',fontWeight:600}}>{rating.toFixed(1)}</span>}
  </div>);
};
StarRatingBlock.craft = { displayName:'Avis ★', props:{rating:4.5,maxStars:5,size:24,color:'#f59e0b',showValue:true}, related:{settings:AutoSettingsPanel} };

// ── 33. SocialIconsBlock ──
export const SocialIconsBlock = (props:any) => {
  const {platforms=['facebook','twitter','linkedin','instagram'],iconSize=24,iconColor='#0f172a',bgColor='transparent',shape='circle',gap=12,alignment='center'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const icons:any={facebook:'f',twitter:'𝕏',linkedin:'in',instagram:'ig',youtube:'▶',github:'⌂',tiktok:'♪'};
  const urls:any={facebook:'https://facebook.com',twitter:'https://twitter.com',linkedin:'https://linkedin.com',instagram:'https://instagram.com',youtube:'https://youtube.com',github:'https://github.com',tiktok:'https://tiktok.com'};
  const borderRadius=shape==='circle'?'50%':shape==='square'?'4px':'0';
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{display:'flex',gap,justifyContent:alignment,...u.style}} className={'proquelec-builder-node '+u.className}>
    {platforms.map((p:string,i:number)=><a key={i} href={urls[p]||'#'} target="_blank" style={{width:iconSize+16,height:iconSize+16,borderRadius,display:'flex',alignItems:'center',justifyContent:'center',background:bgColor,color:iconColor,fontSize:iconSize*0.7,fontWeight:700,textDecoration:'none',border:'1px solid #e2e8f0'}}>{icons[p]||p.charAt(0).toUpperCase()}</a>)}
  </div>);
};
SocialIconsBlock.craft = { displayName:'Réseaux sociaux', props:{platforms:['facebook','twitter','linkedin','instagram'],iconSize:24,iconColor:'#0f172a',bgColor:'transparent',shape:'circle',gap:12,alignment:'center'}, related:{settings:AutoSettingsPanel} };

// ── 34. ShareButtonsBlock ──
export const ShareButtonsBlock = (props:any) => {
  const {buttons=['facebook','twitter','linkedin','whatsapp'],size=36,label='Partager :',alignment='center'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const shareLinks:any={facebook:'https://facebook.com/sharer.php?u=',twitter:'https://twitter.com/intent/tweet?url=',linkedin:'https://linkedin.com/sharing/share-offsite/?url=',whatsapp:'https://wa.me/?text=',email:'mailto:?body='};
  const shareLabels:any={facebook:'f',twitter:'𝕏',linkedin:'in',whatsapp:'WA',email:'✉'};
  const shareBgs:any={facebook:'#1877f2',twitter:'#000',linkedin:'#0a66c2',whatsapp:'#25d366',email:'#64748b'};
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{display:'flex',alignItems:'center',gap:8,justifyContent:alignment,...u.style}} className={'proquelec-builder-node '+u.className}>
    {label&&<span style={{fontSize:13,color:'#64748b',marginRight:4}}>{label}</span>}
    {buttons.map((b:string,i:number)=><a key={i} href={shareLinks[b]+encodeURIComponent(typeof window!=='undefined'?window.location.href:'')} target="_blank" style={{width:size,height:size,borderRadius:'50%',background:shareBgs[b]||'#94a3b8',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.35,fontWeight:700,textDecoration:'none'}}>{shareLabels[b]||b.charAt(0).toUpperCase()}</a>)}
  </div>);
};
ShareButtonsBlock.craft = { displayName:'Partage social', props:{buttons:['facebook','twitter','linkedin','whatsapp'],size:36,label:'Partager :',alignment:'center'}, related:{settings:AutoSettingsPanel} };

// ── 35. NewsletterBlock ──
export const NewsletterBlock = (props:any) => {
  const {title='Newsletter',description='Recevez nos actualités.',buttonText='S\'abonner',placeholder='Votre email',bgColor='#f1f5f9',textColor='#0f172a',accentColor='#2563eb'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{background:bgColor,color:textColor,padding:32,borderRadius:12,textAlign:'center',...u.style}} className={'proquelec-builder-node '+u.className}>
    <h3 style={{margin:'0 0 6px',fontSize:18,fontWeight:600}}>{resolveDynamicContent(title)}</h3>
    <p style={{margin:'0 0 16px',fontSize:13,opacity:0.7}}>{resolveDynamicContent(description)}</p>
    <div style={{display:'flex',gap:8,maxWidth:400,margin:'0 auto'}}>
      <input type="email" placeholder={placeholder} style={{flex:1,padding:'8px 14px',borderRadius:6,border:'1px solid #e2e8f0',fontSize:13,outline:'none'}} />
      <button style={{background:accentColor,color:'white',border:'none',padding:'8px 18px',borderRadius:6,cursor:'pointer',fontWeight:600,fontSize:13,whiteSpace:'nowrap'}}>{buttonText}</button>
    </div>
  </div>);
};
NewsletterBlock.craft = { displayName:'Newsletter', props:{title:'Newsletter',description:'Recevez nos actualités.',buttonText:'S\'abonner',placeholder:'Votre email',bgColor:'#f1f5f9',textColor:'#0f172a',accentColor:'#2563eb'}, related:{settings:AutoSettingsPanel} };
// ─────────────────────────────────────────────
// UTILITY BLOCKS
// ─────────────────────────────────────────────

// ── 36. BreadcrumbsBlock ──
export const BreadcrumbsBlock = (props:any) => {
  const {items=[{label:'Accueil',url:'/'},{label:'Services',url:'/services'},{label:'Électricité',url:'#'}],separator='/',fontSize=13,color='#64748b',activeColor='#0f172a'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<nav ref={(r:any)=>{if(r)connect(drag(r))}} style={{display:'flex',alignItems:'center',gap:8,fontSize,...u.style}} className={'proquelec-builder-node '+u.className}>
    {items.map((item:any,i:number)=><React.Fragment key={i}>
      {i>0&&<span style={{color:'#94a3b8',fontSize:fontSize*0.8}}>{separator}</span>}
      {i<items.length-1?<a href={item.url} style={{color,textDecoration:'none',fontSize}}>{item.label}</a>:<span style={{color:activeColor,fontWeight:600}}>{item.label}</span>}
    </React.Fragment>)}
  </nav>);
};
BreadcrumbsBlock.craft = { displayName:'Fil d\'Ariane', props:{items:[{label:'Accueil',url:'/'},{label:'Services',url:'/services'},{label:'Électricité',url:'#'}],separator:'/',fontSize:13,color:'#64748b',activeColor:'#0f172a'}, related:{settings:AutoSettingsPanel} };

// ── 37. AuthorBoxBlock ──
export const AuthorBoxBlock = (props:any) => {
  const {name='Jean Dupont',role='Auteur',bio='Biographie de l\'auteur…',photo='',bgColor='#f8fafc',accentColor='#2563eb'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{display:'flex',gap:16,padding:20,background:bgColor,borderRadius:12,alignItems:'center',...u.style}} className={'proquelec-builder-node '+u.className}>
    {photo?<img src={photo} alt="" style={{width:64,height:64,borderRadius:'50%',objectFit:'cover'}} />:<div style={{width:64,height:64,borderRadius:'50%',background:accentColor,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700,flexShrink:0}}>{name.charAt(0)}</div>}
    <div><h4 style={{margin:'0 0 2px',fontSize:15,fontWeight:600}}>{name}</h4><p style={{margin:'0 0 4px',fontSize:12,color:accentColor,fontWeight:500}}>{role}</p><p style={{margin:0,fontSize:12,color:'#475569',lineHeight:1.6}}>{bio}</p></div>
  </div>);
};
AuthorBoxBlock.craft = { displayName:'Boîte Auteur', props:{name:'Jean Dupont',role:'Auteur',bio:'Biographie…',photo:'',bgColor:'#f8fafc',accentColor:'#2563eb'}, related:{settings:AutoSettingsPanel} };

// ── 38. LogoGridBlock ──
export const LogoGridBlock = (props:any) => {
  const {logos=['https://placehold.co/120x60/94a3b8/ffffff?text=Logo+1','https://placehold.co/120x60/64748b/ffffff?text=Logo+2','https://placehold.co/120x60/475569/ffffff?text=Logo+3'],columns=4,gap=24,grayscale=true}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap,alignItems:'center',justifyItems:'center',...u.style}} className={'proquelec-builder-node '+u.className}>
    {logos.map((src:string,i:number)=><img key={i} src={src} alt={''} style={{maxWidth:'100%',height:40,opacity:0.6,filter:grayscale?'grayscale(1)':'none',transition:'opacity 0.2s,filter 0.2s'}} className="hover:opacity-100 hover:grayscale-0" />)}
  </div>);
};
LogoGridBlock.craft = { displayName:'Grille Logos', props:{logos:['https://placehold.co/120x60/94a3b8/ffffff?text=Logo+1','https://placehold.co/120x60/64748b/ffffff?text=Logo+2','https://placehold.co/120x60/475569/ffffff?text=Logo+3'],columns:4,gap:24,grayscale:true}, related:{settings:AutoSettingsPanel} };

// ── 39. CookieConsentBlock ──
export const CookieConsentBlock = (props:any) => {
  const {message='Ce site utilise des cookies pour améliorer votre expérience.',acceptText='Accepter',declineText='Refuser',bgColor='#1e293b',textColor='#ffffff',accentColor='#2563eb'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [visible,setVisible]=useState(true);
  if(!visible)return null;
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{position:'fixed',bottom:0,left:0,right:0,background:bgColor,color:textColor,padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,zIndex:9998,flexWrap:'wrap',...u.style}} className={'proquelec-builder-node '+u.className}>
    <span style={{fontSize:13,lineHeight:1.5}}>{message}</span>
    <div style={{display:'flex',gap:8}}><button onClick={()=>setVisible(false)} style={{background:accentColor,color:'white',border:'none',padding:'6px 16px',borderRadius:6,cursor:'pointer',fontSize:12,fontWeight:600}}>{acceptText}</button>
    <button onClick={()=>setVisible(false)} style={{background:'transparent',color:textColor,border:'1px solid rgba(255,255,255,0.3)',padding:'6px 16px',borderRadius:6,cursor:'pointer',fontSize:12}}>{declineText}</button></div>
  </div>);
};
CookieConsentBlock.craft = { displayName:'Cookies Consent', props:{message:'Ce site utilise des cookies.',acceptText:'Accepter',declineText:'Refuser',bgColor:'#1e293b',textColor:'#ffffff',accentColor:'#2563eb'}, related:{settings:AutoSettingsPanel} };

// ── 40. BackToTopBlock ──
export const BackToTopBlock = (props:any) => {
  const {icon='↑',label='',bgColor='#0f172a',iconColor='#ffffff',size=40,bottom=24,right=24,showAfter=300}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{const h=()=>setVisible(window.scrollY>showAfter);window.addEventListener('scroll',h);return()=>window.removeEventListener('scroll',h)},[showAfter]);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} style={{position:'fixed',bottom,right,zIndex:9997,width:size,height:size,borderRadius:'50%',background:bgColor,color:iconColor,display:visible?'flex':'none',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:size*0.45,fontWeight:700,boxShadow:'0 2px 12px rgba(0,0,0,0.15)',lineHeight:1,...u.style}} className={'proquelec-builder-node transition '+u.className}>{label||icon}</div>);
};
BackToTopBlock.craft = { displayName:'Retour Haut', props:{icon:'↑',label:'',bgColor:'#0f172a',iconColor:'#ffffff',size:40,bottom:24,right:24,showAfter:300}, related:{settings:AutoSettingsPanel} };

// ── 41. SearchBlock ──
export const SearchBlock = (props:any) => {
  const {placeholder='Rechercher…',buttonText='🔍',width=320,borderColor='#e2e8f0',accentColor='#2563eb'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [query,setQuery]=useState('');
  const handleSearch=(e:any)=>{e.preventDefault();if(query.trim())alert('Recherche : '+query)};
  return (<form ref={(r:any)=>{if(r)connect(drag(r))}} onSubmit={handleSearch} style={{display:'flex',maxWidth:width,...u.style}} className={'proquelec-builder-node '+u.className}>
    <input value={query} onChange={(e:any)=>setQuery(e.target.value)} placeholder={placeholder} style={{flex:1,padding:'8px 14px',border:'1px solid '+borderColor,borderRight:'none',borderRadius:'6px 0 0 6px',fontSize:13,outline:'none'}} />
    <button type="submit" style={{background:accentColor,color:'white',border:'none',padding:'8px 14px',borderRadius:'0 6px 6px 0',cursor:'pointer',fontSize:14}}>{buttonText}</button>
  </form>);
};
SearchBlock.craft = { displayName:'Recherche', props:{placeholder:'Rechercher…',buttonText:'🔍',width:320,borderColor:'#e2e8f0',accentColor:'#2563eb'}, related:{settings:AutoSettingsPanel} };

// ── 42. AvatarBlock ──
export const AvatarBlock = (props:any) => {
  const {src='',name='User',size=48,shape='circle',borderColor='#e2e8f0'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const borderRadius=shape==='circle'?'50%':shape==='rounded'?'8px':'0';
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{display:'inline-flex',...u.style}} className={'proquelec-builder-node '+u.className}>
    {src?<img src={src} alt={name} style={{width:size,height:size,borderRadius,objectFit:'cover',border:'2px solid '+borderColor}} />:
    <div style={{width:size,height:size,borderRadius,background:'linear-gradient(135deg,#2563eb,#1e40af)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.4,fontWeight:700,border:'2px solid '+borderColor}}>{name.charAt(0).toUpperCase()}</div>}
  </div>);
};
AvatarBlock.craft = { displayName:'Avatar', props:{src:'',name:'User',size:48,shape:'circle',borderColor:'#e2e8f0'}, related:{settings:AutoSettingsPanel} };

// ── 43. BadgeBlock ──
export const BadgeBlock = (props:any) => {
  const {text='Nouveau',bgColor='#2563eb',textColor='#ffffff',size='md'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const sizes:any={sm:{fontSize:10,padding:'2px 8px'},md:{fontSize:12,padding:'3px 10px'},lg:{fontSize:14,padding:'4px 14px'}};
  const s=sizes[size]||sizes.md;
  return (<span ref={(r:any)=>{if(r)connect(drag(r))}} style={{display:'inline-block',background:bgColor,color:textColor,borderRadius:20,fontWeight:600,lineHeight:1.4,...s,...u.style}} className={'proquelec-builder-node '+u.className}>{resolveDynamicContent(text)}</span>);
};
BadgeBlock.craft = { displayName:'Badge', props:{text:'Nouveau',bgColor:'#2563eb',textColor:'#ffffff',size:'md'}, related:{settings:AutoSettingsPanel} };
// ─────────────────────────────────────────────
// SPECIALIZED BLOCKS (Elementor Pro parity)
// ─────────────────────────────────────────────

// ── 44. ShapeDividerBlock ──
export const ShapeDividerBlock = (props:any) => {
  const {shape='wave',height=100,color='#2563eb',flip=false,position='bottom'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const paths:any={
    wave:'M0,80 C30,60 70,100 100,80 L100,100 L0,100 Z',
    triangle:'M0,100 L50,0 L100,100 Z',
    curve:'M0,90 C30,100 70,40 100,60 L100,100 L0,100 Z',
    arrow:'M0,100 L25,50 L50,100 L75,50 L100,100 Z',
    cloud:'M0,60 Q25,30 50,50 T100,40 L100,100 L0,100 Z',
    mountain:'M0,60 L20,30 L40,50 L60,10 L80,40 L100,20 L100,100 L0,100 Z',
  };
  const d=paths[shape]||paths.wave;
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{position:'relative',width:'100%',height,overflow:'hidden',lineHeight:0,...u.style}} className={'proquelec-builder-node '+u.className}>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{width:'100%',height:'100%',transform:flip?'scaleX(-1)':'none'}}>
      <path d={d} fill={color} />
    </svg>
  </div>);
};
const ShapeDividerSettings = () => {
  const {actions:{setProp},shape,height,color,flip}=useNode((n:any)=>({...n.data.props}));
  return (<div className='space-y-3'>
    <Row><Label label='Forme' /><Select value={shape} onChange={(e:any)=>setProp((p:any)=>p.shape=e.target.value)} options={[{value:'wave',label:'Vague'},{value:'triangle',label:'Triangle'},{value:'curve',label:'Courbe'},{value:'arrow',label:'Flèche'},{value:'cloud',label:'Nuage'},{value:'mountain',label:'Montagne'}]} /></Row>
    <Row><Label label='Hauteur (px)' /><Input type='number' value={height} onChange={(e:any)=>setProp((p:any)=>p.height=parseInt(e.target.value))} /></Row>
    <Row><Label label='Couleur' /><Color value={color} onChange={(e:any)=>setProp((p:any)=>p.color=e.target.value)} /></Row>
    <Flex><label className='text-xs text-slate-400'><input type='checkbox' checked={flip} onChange={(e:any)=>setProp((p:any)=>p.flip=e.target.checked)} className='mr-1' />Inverser</label></Flex>
  </div>);
};
ShapeDividerBlock.craft = { displayName:'Séparateur Forme', props:{shape:'wave',height:100,color:'#2563eb',flip:false,position:'bottom'}, related:{settings:ShapeDividerSettings} };

// ── 45. AnimatedHeadlineBlock ──
export const AnimatedHeadlineBlock = (props:any) => {
  const {beforeText='Nous',animatedWords=['innovons','créons','transformons'],afterText='pour vous',animation='rotate',fontSize=36,color='#0f172a',accentColor='#2563eb'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [index,setIndex]=useState(0);
  useEffect(()=>{const i=setInterval(()=>setIndex(c=>(c+1)%animatedWords.length),2500);return()=>clearInterval(i)},[animatedWords.length]);
  return (<h2 ref={(r:any)=>{if(r)connect(drag(r))}} style={{fontSize,color,fontWeight:700,lineHeight:1.3,...u.style}} className={'proquelec-builder-node m-0 '+u.className}>
    {resolveDynamicContent(beforeText)}&nbsp;
    <span style={{color:accentColor,position:'relative',display:'inline-block',minWidth:100}}>
      {animatedWords[index]}
      <span style={{position:'absolute',bottom:-2,left:0,right:0,height:3,background:accentColor,borderRadius:2,opacity:0.4}} />
    </span>
    &nbsp;{resolveDynamicContent(afterText)}
  </h2>);
};
AnimatedHeadlineBlock.craft = { displayName:'Titre animé', props:{beforeText:'Nous',animatedWords:['innovons','créons','transformons'],afterText:'pour vous',animation:'rotate',fontSize:36,color:'#0f172a',accentColor:'#2563eb'}, related:{settings:AutoSettingsPanel} };

// ── 46. FeatureListBlock ──
export const FeatureListBlock = (props:any) => {
  const {items=[{icon:'⚡',text:'Haute performance'},{icon:'🔒',text:'Sécurisé'},{icon:'🚀',text:'Rapide'}],iconColor='#2563eb',gap=12,iconSize=20}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<ul ref={(r:any)=>{if(r)connect(drag(r))}} style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap,...u.style}} className={'proquelec-builder-node '+u.className}>
    {items.map((item:any,i:number)=><li key={i} style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:iconSize,color:iconColor,lineHeight:1,flexShrink:0}}>{item.icon}</span><span style={{fontSize:14,color:'#334155'}}>{resolveDynamicContent(item.text)}</span></li>)}
  </ul>);
};
const FeatureListSettings = () => {
  const {actions:{setProp},items}=useNode((n:any)=>({...n.data.props}));
  return (<div className='space-y-3'>
    <Row><Label label='Éléments (icône|texte par ligne)' /><Textarea rows={5} value={items.map((i:any)=>i.icon+'|'+i.text).join('\\n')} onChange={(e:any)=>setProp((p:any)=>p.items=e.targetValue.split('\\n').map((s:string)=>{const[m,...t]=s.split('|');return{icon:m?.trim()||'⚡',text:t.join('|').trim()||s}}))} /></Row>
  </div>);
};
FeatureListBlock.craft = { displayName:'Liste fonctionnalités', props:{items:[{icon:'⚡',text:'Haute performance'},{icon:'🔒',text:'Sécurisé'},{icon:'🚀',text:'Rapide'}],iconColor:'#2563eb',gap:12,iconSize:20}, related:{settings:FeatureListSettings} };

// ── 47. ParallaxContainerBlock ──
export const ParallaxContainerBlock = (props:any) => {
  const {children,backgroundImage='',overlayColor='rgba(0,0,0,0.5)',speed=0.5,minHeight=400}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [offset,setOffset]=useState(0);
  useEffect(()=>{const h=()=>{const rect=document.querySelector('.proquelec-builder-node')?.getBoundingClientRect();if(rect)setOffset(rect.top*speed)};window.addEventListener('scroll',h);return()=>window.removeEventListener('scroll',h)},[speed]);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{position:'relative',overflow:'hidden',minHeight,...u.style}} className={'proquelec-builder-node '+u.className}>
    {backgroundImage&&<div style={{position:'absolute',inset:0,backgroundImage:'url('+backgroundImage+')',backgroundSize:'cover',backgroundPosition:'center',transform:'translateY('+offset+'px)',willChange:'transform'}} />}
    {overlayColor&&<div style={{position:'absolute',inset:0,background:overlayColor}} />}
    <div style={{position:'relative',zIndex:1}}>{children}</div>
  </div>);
};
ParallaxContainerBlock.craft = { displayName:'Conteneur Parallaxe', props:{backgroundImage:'',overlayColor:'rgba(0,0,0,0.5)',speed:0.5,minHeight:400}, related:{settings:AutoSettingsPanel} };

// ── 48. ScrollProgressBlock ──
export const ScrollProgressBlock = (props:any) => {
  const {position='top',height=4,bgColor='#2563eb',trackColor='#e2e8f0',zIndex=9999}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [progress,setProgress]=useState(0);
  useEffect(()=>{const h=()=>{const s=window.scrollY,d=document.documentElement.scrollHeight-window.innerHeight;setProgress(d>0?(s/d)*100:0)};window.addEventListener('scroll',h,{passive:true});return()=>window.removeEventListener('scroll',h)},[]);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{position:'fixed',[position]:0,left:0,right:0,height:trackColor?'auto':height,background:trackColor||'transparent',zIndex,...u.style}} className={'proquelec-builder-node '+u.className}>
    <div style={{width:progress+'%',height,background:bgColor,transition:'width 0.1s linear',borderRadius:height>3?'0 3px 3px 0':0}} />
  </div>);
};
ScrollProgressBlock.craft = { displayName:'Barre progression', props:{position:'top',height:4,bgColor:'#2563eb',trackColor:'#e2e8f0',zIndex:9999}, related:{settings:AutoSettingsPanel} };

// ── 49. ImageAccordionBlock ──
export const ImageAccordionBlock = (props:any) => {
  const {images=['https://placehold.co/300x400/2563eb/ffffff?text=1','https://placehold.co/300x400/1e293b/ffffff?text=2','https://placehold.co/300x400/475569/ffffff?text=3'],height=400}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const [active,setActive]=useState(0);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{display:'flex',height,overflow:'hidden',borderRadius:8,...u.style}} className={'proquelec-builder-node '+u.className}>
    {images.map((src:string,i:number)=><div key={i} onClick={()=>setActive(i)} style={{flex:active===i?3:1,cursor:'pointer',overflow:'hidden',transition:'flex 0.3s ease',position:'relative'}}>
      <img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.3s',transform:active===i?'scale(1.05)':'scale(1)'}} />
    </div>)}
  </div>);
};
ImageAccordionBlock.craft = { displayName:'Accordéon Images', props:{images:['https://placehold.co/300x400/2563eb/ffffff?text=1','https://placehold.co/300x400/1e293b/ffffff?text=2','https://placehold.co/300x400/475569/ffffff?text=3'],height:400}, related:{settings:AutoSettingsPanel} };

// ── 50. PaginationBlock ──
export const PaginationBlock = (props:any) => {
  const {totalPages=5,currentPage=1,color='#2563eb',size='md'}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const sizes:any={sm:30,md:36,lg:44};
  const s=sizes[size]||sizes.md;
  const pages=Array.from({length:totalPages},(_,i)=>i+1);
  return (<nav ref={(r:any)=>{if(r)connect(drag(r))}} style={{display:'flex',gap:4,justifyContent:'center',alignItems:'center',...u.style}} className={'proquelec-builder-node '+u.className}>
    {pages.map(p=><button key={p} style={{width:s,height:s,borderRadius:s/2,border:p===currentPage?'2px solid '+color:'1px solid #e2e8f0',background:p===currentPage?color:'white',color:p===currentPage?'white':'#0f172a',fontSize:s*0.4,fontWeight:600,cursor:'pointer',padding:0,display:'flex',alignItems:'center',justifyContent:'center'}}>{p}</button>)}
  </nav>);
};
PaginationBlock.craft = { displayName:'Pagination', props:{totalPages:5,currentPage:1,color:'#2563eb',size:'md'}, related:{settings:AutoSettingsPanel} };

// ── 51. StickyContainerBlock ──
export const StickyContainerBlock = (props:any) => {
  const {children,top=0,zIndex=100,backgroundColor='#ffffff',shadow=true}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{position:'sticky',top,zIndex,background:backgroundColor,boxShadow:shadow?'0 2px 12px rgba(0,0,0,0.08)':'none',...u.style}} className={'proquelec-builder-node '+u.className}>{children}</div>);
};
StickyContainerBlock.craft = { displayName:'Conteneur Sticky', props:{top:0,zIndex:100,backgroundColor:'#ffffff',shadow:true}, related:{settings:AutoSettingsPanel} };

// ── 52. ParticlesBlock ──
export const ParticlesBlock = (props:any) => {
  const {count=30,color='#2563eb',speed=1,sizeRange=3,connectLines=false}=props;
  const {connectors:{connect,drag}}=useNode();
  const u=getUniversalStyles(props);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;
    const particles=Array.from({length:count},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-0.5)*speed,vy:(Math.random()-0.5)*speed,r:Math.random()*sizeRange+1}));
    let id:number;
    const animate=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>canvas.width)p.vx*=-1;if(p.y<0||p.y>canvas.height)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=color;ctx.globalAlpha=0.6;ctx.fill()});id=requestAnimationFrame(animate)};
    animate();
    return()=>cancelAnimationFrame(id);
  },[count,color,speed,sizeRange]);
  return (<div ref={(r:any)=>{if(r)connect(drag(r))}} style={{position:'relative',width:'100%',height:200,overflow:'hidden',...u.style}} className={'proquelec-builder-node '+u.className}>
    <canvas ref={canvasRef} style={{width:'100%',height:'100%',display:'block'}} />
  </div>);
};
ParticlesBlock.craft = { displayName:'Particules', props:{count:30,color:'#2563eb',speed:1,sizeRange:3,connectLines:false}, related:{settings:AutoSettingsPanel} };

// ── TableOfContentsBlock ──
export const TableOfContentsBlock = (props: any) => {
  const { title = 'Table des matières', maxLevel = 3, numbered = true, sticky = false, containerBg = '#f8fafc', titleColor = '#0f172a', linkColor = '#2563eb' } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const [headings, setHeadings] = useState<{ level: number; text: string; id: string }[]>([]);

  useEffect(() => {
    // Scan the canvas for heading elements (h1-h6)
    const timeout = setTimeout(() => {
      const allHeadings: { level: number; text: string; id: string }[] = [];
      // In builder mode, scan inside the frame
      const frame = document.querySelector('.craftjs-renderer');
      const root = frame || document;
      root.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((el) => {
        const level = parseInt(el.tagName[1]);
        if (level <= maxLevel) {
          const text = el.textContent || '';
          const id = el.id || 'heading-' + text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          if (!el.id) el.id = id;
          if (text) allHeadings.push({ level, text, id });
        }
      });
      setHeadings(allHeadings);
    }, 500);
    return () => clearTimeout(timeout);
  }, [maxLevel]);

  return (
    <nav ref={(r: any) => { if (r) connect(drag(r)); }}
      style={{ backgroundColor: containerBg, borderRadius: 8, padding: 16, position: sticky ? 'sticky' as any : 'relative', top: sticky ? 20 : undefined, ...u.style }}
      className={'proquelec-builder-node ' + u.className}>
      {title && <h4 style={{ color: titleColor, fontSize: 14, fontWeight: 700, marginBottom: 12, marginTop: 0 }}>{title}</h4>}
      {headings.length === 0 && <p className="text-xs text-slate-400 italic">Ajoutez des titres (H1-H6) sur la page pour générer la table des matières.</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {headings.map((h, i) => (
          <li key={h.id} style={{ paddingLeft: (h.level - 1) * 16, marginBottom: 4 }}>
            <a href={'#' + h.id} style={{ color: linkColor, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
              className="hover:underline">
              {numbered && <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, minWidth: 20 }}>{i + 1}.</span>}
              <span>{h.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
const TableOfContentsSettings = () => {
  const { actions: { setProp }, title, maxLevel, numbered, sticky, containerBg, titleColor, linkColor } = useNode((n: any) => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <Row><Label label="Titre" /><Input value={title} onChange={(e: any) => setProp((p: any) => p.title = e.target.value)} /></Row>
      <Row><Label label="Niveau max." /><Select value={maxLevel} onChange={(e: any) => setProp((p: any) => p.maxLevel = parseInt(e.target.value))} options={[{ value: 2, label: 'H2' }, { value: 3, label: 'H3' }, { value: 4, label: 'H4' }, { value: 6, label: 'Tous (H1-H6)' }]} /></Row>
      <Row><Label label="Numérotation" /><input type="checkbox" checked={numbered} onChange={(e: any) => setProp((p: any) => p.numbered = e.target.checked)} className="rounded" /></Row>
      <Row><Label label="Sticky" /><input type="checkbox" checked={sticky} onChange={(e: any) => setProp((p: any) => p.sticky = e.target.checked)} className="rounded" /></Row>
      <Row><Label label="Fond" /><Color value={containerBg} onChange={(e: any) => setProp((p: any) => p.containerBg = e.target.value)} /></Row>
      <Row><Label label="Couleur titre" /><Color value={titleColor} onChange={(e: any) => setProp((p: any) => p.titleColor = e.target.value)} /></Row>
      <Row><Label label="Couleur liens" /><Color value={linkColor} onChange={(e: any) => setProp((p: any) => p.linkColor = e.target.value)} /></Row>
    </div>
  );
};
TableOfContentsBlock.craft = { displayName: 'Table des matières', props: { title: 'Table des matières', maxLevel: 3, numbered: true, sticky: false, containerBg: '#f8fafc', titleColor: '#0f172a', linkColor: '#2563eb' }, related: { settings: TableOfContentsSettings } };
