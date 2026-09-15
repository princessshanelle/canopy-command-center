import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import webpush from "web-push";

const PORT=Number(process.env.PORT||8787);
const HOST="0.0.0.0";
const DATA_DIR=process.env.DATA_DIR||"./data";
const DATA_FILE=path.join(DATA_DIR,"canopy.json");
fs.mkdirSync(DATA_DIR,{recursive:true});

function load(){
  try{return JSON.parse(fs.readFileSync(DATA_FILE,"utf8"))}
  catch{return {subscriptions:[],reminders:[],vapid:{publicKey:process.env.VAPID_PUBLIC_KEY||"",privateKey:process.env.VAPID_PRIVATE_KEY||""}}}
}
let db=load();
if(!db.vapid.publicKey||!db.vapid.privateKey){
  const keys=webpush.generateVAPIDKeys();
  db.vapid=keys;
  save();
}
webpush.setVapidDetails(
  process.env.VAPID_CONTACT||"mailto:canopy@example.com",
  db.vapid.publicKey,db.vapid.privateKey
);

function save(){fs.writeFileSync(DATA_FILE,JSON.stringify(db,null,2))}
function send(res,status,body,headers={}){
  const out=JSON.stringify(body);res.writeHead(status,{"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type",...headers});res.end(out);
}
function readBody(req){
  return new Promise((resolve,reject)=>{let s="";req.on("data",c=>s+=c);req.on("end",()=>{try{resolve(JSON.parse(s||"{}"))}catch(e){reject(e)}});req.on("error",reject)});
}
function zonedParts(date,timeZone){
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(date);
  const out={}; for(const p of parts) out[p.type]=p.value; return out;
}
function dueNow(r,now){
  if(r.done||r.sentAt||!r.date||!r.time)return false;
  const tz=r.timezone||process.env.TZ||"UTC";
  const p=zonedParts(now,tz);
  const today=`${p.year}-${p.month}-${p.day}`;
  const hm=`${p.hour}:${p.minute}`;
  return r.date===today && r.time===hm;
}
async function dispatch(){
  const now=new Date();
  let changed=false;
  for(const r of db.reminders){
    if(!dueNow(r,now))continue;
    const payload=JSON.stringify({
      title:r.title||"Canopy Alarm",
      body:`${r.kind||"Reminder"} · ${r.title||"Scheduled activity"}`,
      url:r.url||"./index.html",
      reminderId:r.id||""
    });
    let sent=0,alive=[];
    for(const sub of db.subscriptions){
      try{await webpush.sendNotification(sub,payload);sent++;alive.push(sub)}
      catch(e){if(e.statusCode!==404&&e.statusCode!==410)alive.push(sub)}
    }
    db.subscriptions=alive;
    if(sent>0){r.sentAt=now.toISOString();changed=true}
  }
  if(changed)save();
}
setInterval(()=>dispatch().catch(console.error),10000);
dispatch().catch(console.error);

const server=http.createServer(async(req,res)=>{
  if(req.method==="OPTIONS"){res.writeHead(204,{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type"});return res.end()}
  const u=new URL(req.url,`http://${req.headers.host}`);
  try{
    if(u.pathname==="/api/health")return send(res,200,{ok:true});
    if(u.pathname==="/api/config")return send(res,200,{publicKey:db.vapid.publicKey});
    if(u.pathname==="/api/alarm-status")return send(res,200,{ok:true,subscriptions:db.subscriptions.length,scheduled:db.reminders.filter(r=>!r.done&&!r.sentAt).length});
    if(u.pathname==="/api/subscriptions"&&req.method==="POST"){
      const body=await readBody(req);if(!body.subscription?.endpoint)return send(res,400,{error:"Invalid subscription"});
      if(!db.subscriptions.some(x=>x.endpoint===body.subscription.endpoint))db.subscriptions.push(body.subscription);
      save();return send(res,200,{ok:true});
    }
    if(u.pathname==="/api/test-push"&&req.method==="POST"){
      const payload=JSON.stringify({title:"Canopy test notification",body:"Your Canopy push notifications are connected. 🌱",url:"./index.html"});
      let sent=0,alive=[];
      for(const sub of db.subscriptions){
        try{await webpush.sendNotification(sub,payload);sent++;alive.push(sub)}
        catch(e){if(e.statusCode!==404&&e.statusCode!==410)alive.push(sub)}
      }
      db.subscriptions=alive;save();return send(res,200,{ok:true,sent});
    }
    if(u.pathname==="/api/reminders"&&req.method==="POST"){
      const body=await readBody(req);
      if(!body.id||!body.date||!body.time||!body.title)return send(res,400,{error:"id, title, date and time are required"});
      const item={id:String(body.id),title:String(body.title),date:String(body.date),time:String(body.time),timezone:String(body.timezone||process.env.TZ||"UTC"),done:Boolean(body.done),kind:String(body.kind||"Reminder"),url:String(body.url||"./index.html"),sentAt:null};
      const i=db.reminders.findIndex(x=>x.id===item.id);
      if(i>=0){
        const old=db.reminders[i];
        const scheduleChanged=old.date!==item.date||old.time!==item.time||old.timezone!==item.timezone||old.title!==item.title||old.done!==item.done||old.url!==item.url||old.kind!==item.kind;
        item.sentAt=scheduleChanged?null:old.sentAt;
        db.reminders[i]=item;
      }else db.reminders.push(item);
      save();return send(res,200,{ok:true});
    }
    if(u.pathname.startsWith("/api/reminders/")&&req.method==="DELETE"){
      const id=decodeURIComponent(u.pathname.slice("/api/reminders/".length));
      db.reminders=db.reminders.filter(x=>x.id!==id);save();return send(res,200,{ok:true});
    }
    send(res,404,{error:"Not found"});
  }catch(e){console.error(e);send(res,500,{error:e.message})}
});
server.listen(PORT,HOST,()=>console.log(`Canopy backend listening on ${HOST}:${PORT}`));
