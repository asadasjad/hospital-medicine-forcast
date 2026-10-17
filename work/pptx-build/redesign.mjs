import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
const skill='/Users/asadasjad/.codex/plugins/cache/openai-primary-runtime/presentations/26.915.20218/skills/presentations';
const root='/Users/asadasjad/DEV/hospital-medicine-forcast';
const build=path.join(root,'work/pptx-build');
const out=path.join(root,'outputs/hospital-medicine-forecasting-projector-v2.pptx');
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const C={ink:'#0B1F33',navy:'#071A2D',blue:'#135CE8',teal:'#00A99D',paper:'#FFFFFF',pale:'#F1F6FB',line:'#C9D7E5',muted:'#334B63',light:'#D9E8F8',mint:'#E5F8F4',gold:'#F5B942'};
const font='Arial', accent='Georgia';
const p=Presentation.create({slideSize:{width:1280,height:720}});
function shape(s,x,y,w,h,fill,stroke='none',geom='roundRect') {return s.shapes.add({geometry:geom,position:{left:x,top:y,width:w,height:h},fill,line:{fill:stroke,width:stroke==='none'?0:1},borderRadius:geom==='roundRect'?'rounded-2xl':undefined});}
function text(s,str,x,y,w,h,size,color=C.ink,bold=false,align='left',opt={}) {const z=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});z.text=str;z.text.style={typeface:opt.font||font,fontSize:size,color,bold,italic:!!opt.italic,alignment:align,verticalAlignment:opt.valign||'middle',autoFit:'shrinkText'};return z;}
function rule(s,x,y,w,h=2,color=C.line){shape(s,x,y,w,h,color,'none','rect')}
function heading(s,title,sub=''){s.background.fill=C.paper;text(s,title,72,42,1136,70,40,C.ink,true);if(sub)text(s,sub,76,114,1128,34,18,C.muted);}
function notes(s,str){s.speakerNotes.textFrame.setText(str);}
function roundedLabel(s,str,x,y,w,fill,color=C.ink,size=16){shape(s,x,y,w,36,fill,'none');text(s,str,x+8,y,w-16,36,size,color,true,'center');}
// 1: high contrast title, golden split with quiet right-side visual
{const s=p.slides.add();s.background.fill=C.navy;
 text(s,'HOSPITAL MEDICINE',78,78,650,30,17,'#7DDCD4',true);
 text(s,'Too much is',78,173,730,92,68,C.paper,true);text(s,'waste.',78,259,690,92,76,'#72DED4',true);
 text(s,'Too little is',78,377,730,78,48,'#D5E1EE',true);text(s,'risk.',78,444,690,82,68,C.paper,true);text(s,'Find the balance.',80,541,600,42,29,'#8BE4DC',false,'left',{font:accent,italic:true});
 shape(s,844,126,350,442,'#0D2945','#24425E');shape(s,880,165,278,364,'#103655','none');
 text(s,'01',904,198,170,100,78,'#83E0D8',true);rule(s,904,318,176,5,C.teal);text(s,'Forecast before\nshortage.',904,349,218,112,27,C.paper,true);
 text(s,'Forecasting & inventory intelligence',80,604,750,34,20,'#D6E4F3');text(s,'ASAD   ·   AON   ·   YASIR',80,653,500,22,15,'#AFC4D9',true);
 notes(s,'Asad: Hospitals need enough medicine on hand. Too much can expire; too little can cause a shortage. Our goal is to help find a better balance.');}
// 2: 3-step horizontal split
{const s=p.slides.add();heading(s,'One system. Three clear jobs.','A decision-support workflow for hospital medicine.');
 const data=[['01','Predict','demand'],['02','Understand','inventory'],['03','Recommend','what to order']];
 data.forEach((d,i)=>{const x=72+i*384;shape(s,x,206,352,302,i===1?C.mint:C.pale,C.line);text(s,d[0],x+26,224,82,54,35,i===1?C.teal:C.blue,true);text(s,d[1],x+26,300,294,58,31,C.ink,true);text(s,d[2],x+26,362,294,50,27,C.muted,false);if(i<2)text(s,'→',x+352,318,32,48,24,C.teal,true,'center');});
 text(s,'From historical sales to a practical next step.',74,568,1100,44,24,C.ink,true);notes(s,'Asad: The system has three jobs. It predicts demand, checks the inventory position, and recommends what to order.');}
// 3: simplified hero dashboard built to project
{const s=p.slides.add();heading(s,'See the next decision in one view.','Product dashboard · editable visual based on the project interface');
 shape(s,72,174,1136,486,C.pale,C.line);shape(s,94,194,1092,446,C.paper,C.line);
 shape(s,116,216,46,46,C.blue,'none');text(s,'H',116,216,46,46,23,C.paper,true,'center');text(s,'Hospital Medicine Forecasting',178,215,510,43,21,C.ink,true);roundedLabel(s,'NEXT MONTH',946,218,194,C.mint,C.teal,15);
 const ms=[['8','categories'],['60.91','MAE'],['118.24','RMSE']];ms.forEach((m,i)=>{const x=116+i*224;shape(s,x,280,204,78,C.paper,C.line);text(s,m[0],x+16,285,174,41,27,i===0?C.blue:C.ink,true);text(s,m[1],x+16,326,174,23,15,C.muted,true);});
 shape(s,116,382,468,232,C.paper,C.line);text(s,'DEMAND FORECAST',140,396,390,30,16,C.muted,true);
 [['N02BE',.91,'901'],['M01AB',.38,'151'],['N05B',.27,'238'],['R03',.22,'147']].forEach((d,i)=>{const y=438+i*39;text(s,d[0],140,y,76,25,16,C.ink,true);shape(s,223,y+8,230,12,'#E1E9F1','none','roundRect');shape(s,223,y+8,230*d[1],12,i===0?C.teal:C.blue,'none','roundRect');text(s,d[2],470,y-1,80,28,16,C.ink,true,'right');});
 shape(s,604,382,558,232,C.paper,C.line);text(s,'INVENTORY RECOMMENDATIONS',628,396,496,30,16,C.muted,true);
 const cols=[['CATEGORY',628],['DEMAND',770],['STOCK',870],['ORDER',961],['RISK',1057]];cols.forEach(([a,x])=>text(s,a,x,435,100,23,13,C.muted,true));rule(s,628,462,500,1);
 [['N02BE','901','700','252','MEDIUM'],['M01AB','151','100','66','MEDIUM'],['N05B','238','250','9','MEDIUM']].forEach((r,i)=>{const y=474+i*40;[628,770,870,961,1057].forEach((x,j)=>text(s,r[j],x,y,j===0?130:90,27,j===0?16:15,j===4?C.blue:C.ink,j===0||j===3));});
 notes(s,'Yasir: This is the dashboard view. Forecasts, stock, suggested orders and risk appear together, so a team can see the next decision in one place.');}
// 4: large type, five signals in two clear regions
{const s=p.slides.add();heading(s,'The dashboard makes each signal easy to scan.');
 const left=[['01','Forecast','Next-period demand'],['02','Stock','Units on hand and incoming'],['03','Coverage','Days of supply']];
 left.forEach((d,i)=>{const y=182+i*132;roundedLabel(s,d[0],78,y,72,C.pale,C.blue,16);text(s,d[1],178,y-2,440,52,29,C.ink,true);text(s,d[2],180,y+52,440,34,18,C.muted);if(i<2)rule(s,178,y+106,440,1);});
 shape(s,720,182,488,386,C.navy,'none');text(s,'04',758,214,72,43,21,'#79DCD4',true);text(s,'Risk',758,269,384,54,35,C.paper,true);text(s,'Stockout  ·  Expiry',758,324,384,34,19,'#D0DFED');rule(s,758,386,398,2,'#35516D');text(s,'05',758,414,72,43,21,'#79DCD4',true);text(s,'Suggested order',758,467,398,54,32,C.paper,true);text(s,'A clear replenishment quantity',758,518,398,30,17,'#D0DFED');
 notes(s,'Yasir: The dashboard shows predicted demand, available stock, days of supply, risk levels, and a suggested order. The goal is to make the decision easy to read.');}
// 5: big numeric focal point
{const s=p.slides.add();heading(s,'N02BE');text(s,'A prototype scenario · 30-day planning horizon',76,114,1128,34,18,C.muted,false,'left',{font:accent,italic:true});
 shape(s,72,182,1136,436,C.pale,C.line);text(s,'901',126,220,390,146,112,C.ink,true);text(s,'PREDICTED DEMAND',142,364,340,34,18,C.muted,true);
 shape(s,564,260,142,72,C.paper,'#D4E0EB');text(s,'→',564,260,142,72,44,C.teal,true,'center');text(s,'252',758,220,370,146,112,C.blue,true);text(s,'RECOMMENDED ORDER',776,364,370,34,18,C.muted,true);
 rule(s,126,434,1024,2);text(s,'700',126,465,180,57,37,C.ink,true);text(s,'ON HAND',130,520,180,27,15,C.muted,true);text(s,'+',318,472,48,45,30,C.teal,true,'center');text(s,'100',390,465,180,57,37,C.ink,true);text(s,'INCOMING',394,520,180,27,15,C.muted,true);text(s,'+',588,472,48,45,30,C.teal,true,'center');text(s,'150',660,465,180,57,37,C.ink,true);text(s,'SAFETY BUFFER',664,520,190,27,15,C.muted,true);
 text(s,'Demo inventory inputs · rule-based calculation',126,570,1000,28,16,C.muted);notes(s,'Aon: For N02BE, demand is predicted at 901 units. With 700 on hand, 100 incoming, and a 150-unit safety buffer, the prototype recommends 252 units. Inventory values are demo inputs.');}
// 6: timeline of four
{const s=p.slides.add();heading(s,'Four steps turn history into a plan.');
 const data=[['01','Historical data','Monthly sales'],['02','Demand forecast','Linear Regression'],['03','Inventory analysis','Stock · lead time · buffer'],['04','Suggested order','Order quantity · risk']];
 data.forEach((d,i)=>{const x=72+i*288;shape(s,x,214,248,260,i===3?C.mint:C.pale,C.line);text(s,d[0],x+24,234,68,46,27,i===3?C.teal:C.blue,true);text(s,d[1],x+24,302,202,70,24,C.ink,true);text(s,d[2],x+24,397,204,54,17,C.muted);if(i<3)text(s,'→',x+249,315,39,50,24,C.teal,true,'center');});
 text(s,'Forecast first. Inventory context next. Decision last.',74,546,1100,42,23,C.ink,true);notes(s,'Asad: We start with monthly sales history. The model forecasts demand. The inventory engine combines that forecast with stock and lead-time inputs, then returns an order suggestion and risk flags.');}
// 7: strong numerical hierarchy
{const s=p.slides.add();heading(s,'A simple model. Measured on held-out months.','Monthly pharmaceutical sales · time-based train/test split');
 shape(s,72,184,710,294,C.pale,C.line);text(s,'70',106,206,270,130,100,C.blue,true);text(s,'MONTHS',114,328,250,34,18,C.muted,true);rule(s,390,224,2,206);text(s,'8',438,206,224,130,100,C.teal,true);text(s,'ATC CATEGORIES',446,328,290,34,18,C.muted,true);text(s,'2014–2019',108,394,570,49,33,C.ink,true);
 shape(s,810,184,398,294,C.navy,'none');text(s,'LINEAR',850,220,300,40,17,'#9CC1F4',true);text(s,'REGRESSION',850,256,300,58,33,C.paper,true);text(s,'Time-based evaluation',850,337,300,32,18,'#D4E2F0');
 shape(s,72,510,548,100,C.pale,C.line);text(s,'MAE',100,523,112,32,17,C.muted,true);text(s,'60.91',100,554,460,46,34,C.ink,true);shape(s,660,510,548,100,C.mint,'#CBE8E2');text(s,'RMSE',688,523,112,32,17,C.teal,true);text(s,'118.24',688,554,460,46,34,C.ink,true);
 notes(s,'Asad: We used 70 monthly observations across eight categories, covering 2014 to 2019. We evaluated Linear Regression using a time-based split. The test errors were 60.91 MAE and 118.24 RMSE.');}
// 8: golden split 62/38 input/output
{const s=p.slides.add();heading(s,'The order rule is visible and explainable.','Inventory engine · 30-day planning horizon');
 const inputs=[['Forecast demand','Expected use'],['Current stock','Units on hand'],['Incoming stock','Already ordered'],['Safety stock','Buffer quantity'],['Supplier lead time','Days to delivery']];
 inputs.forEach((d,i)=>{const y=173+i*82;shape(s,72,y,648,65,C.pale,C.line);text(s,d[0],96,y+5,300,30,19,C.ink,true);text(s,d[1],96,y+34,430,24,15,C.muted);});
 text(s,'→',724,334,66,60,35,C.teal,true,'center');shape(s,806,212,402,326,C.navy,'none');text(s,'ENGINE OUTPUT',842,246,310,30,16,'#86DED6',true);text(s,'Suggested\norder',842,296,320,112,40,C.paper,true);rule(s,842,430,326,2,'#37516A');text(s,'Stockout risk',842,452,304,30,19,C.paper,true);text(s,'Expiry risk  ·  Days of supply',842,492,326,26,16,'#CAD8E7');
 text(s,'Planning support with human review.',76,612,900,30,19,C.muted);notes(s,'Aon: The inventory engine uses predicted demand, on-hand and incoming stock, safety stock, and supplier lead time. It calculates a suggested order and flags stockout or expiry risk.');}
// 9: team with strong names
{const s=p.slides.add();heading(s,'Three roles. One connected workflow.');
 const team=[['ASAD','Data & machine learning','01'],['AON','Inventory engine & backend','02'],['YASIR','Dashboard & frontend','03']];
 team.forEach((d,i)=>{const x=72+i*384;shape(s,x,196,352,306,i===1?C.mint:C.pale,C.line);text(s,d[2],x+26,219,62,42,21,i===1?C.teal:C.blue,true);text(s,d[0],x+26,291,296,70,38,C.ink,true);rule(s,x+26,376,300,2,i===1?C.teal:C.blue);text(s,d[1],x+26,399,296,59,19,C.muted);});
 text(s,'DATA',104,568,192,34,17,C.blue,true,'center');text(s,'→',296,559,48,46,28,C.teal,true,'center');text(s,'FORECAST',350,568,206,34,17,C.blue,true,'center');text(s,'→',558,559,48,46,28,C.teal,true,'center');text(s,'INVENTORY LOGIC',612,568,266,34,17,C.blue,true,'center');text(s,'→',876,559,48,46,28,C.teal,true,'center');text(s,'DASHBOARD',930,568,250,34,17,C.blue,true,'center');
 notes(s,'Asad: I worked on the data and forecasting.\nAon: I built the inventory rules and backend integration.\nYasir: I built the dashboard that brings the results together.');}
// 10 close
{const s=p.slides.add();s.background.fill=C.navy;
 text(s,'Predict.',82,132,700,92,68,C.paper,true);text(s,'Prepare.',82,245,750,96,76,'#72DED4',false,'left',{font:accent,italic:true});text(s,'Prevent.',82,362,750,92,68,C.paper,true);
 shape(s,850,138,340,414,'#0D2945','#24425E');text(s,'01',884,178,220,105,82,'#83E0D8',true);text(s,'DECISIONS',886,288,234,30,17,'#AFC4D9',true);rule(s,886,343,224,4,C.teal);text(s,'before the\nshortage.',886,372,228,100,29,C.paper,true);
 text(s,'Hospital Medicine Forecasting & Inventory Intelligence',84,589,1050,38,21,'#D6E4F3');notes(s,'Asad: Predict demand. Prepare inventory. Prevent avoidable shortages and waste. Thank you.');}
await fs.mkdir(build,{recursive:true});const candidate=path.join(build,'projector-v2-candidate.pptx');await(await PresentationFile.exportPptx(p)).save(candidate);
for(let i=0;i<p.slides.items.length;i++){const blob=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(path.join(build,`projector-v2-${String(i+1).padStart(2,'0')}.png`),new Uint8Array(await blob.arrayBuffer()));}
const report=await finalizePresentation({explicitTotalSlideCount:10,workspaceDir:root,candidatePath:candidate,finalPath:out,pythonExecutable:'/Users/asadasjad/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'design',families:[font,accent]},verifyArtifactToolImport:true,receiptPath:path.join(build,'projector-v2-validation-final.json')});
console.log(JSON.stringify({out,slideCount:p.slides.items.length,report:{integrity:report.packageIntegrity.status,layoutFindings:report.presentationLayout.finding_count,warnings:report.presentationLayout.warning_count}},null,2));
