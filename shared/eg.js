/* EveryGame Offline — shared behaviour for every game page. Small on purpose. */
(function(){
  var game=document.documentElement.getAttribute('data-game')||location.pathname.split('/').slice(-2)[0];

  /* Remember what was played last so the home screen can offer "Jump back in" */
  try{
    var k='eg.recent',r=JSON.parse(localStorage.getItem(k)||'[]').filter(function(x){return x&&x.g!==game});
    r.unshift({g:game,h:location.hash||'',t:Date.now()});localStorage.setItem(k,JSON.stringify(r.slice(0,8)));
  }catch(e){}

  /* Overlays: mark the moment one becomes visible so the shared entrance animation plays once,
     not every time a game re-renders what's inside it */
  var shown=new WeakMap();

  /* A win gets a moment: one short burst of paper, then it's gone. Games with their own celebration opt out. */
  var WIN=/(?:^|\W)(you win|you won|you've won)(?=\W|$)/i,LOSS=/\b(you lose|you lost|computer wins|cpu wins|game over)\b/i;
  var OWN={memory:1,rarebit:1,casino:1},lastCheer=0;
  function cheer(){
    if(OWN[game]||Date.now()-lastCheer<4000)return;
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    lastCheer=Date.now();
    var c=document.createElement('canvas'),d=Math.min(2,devicePixelRatio||1),W=innerWidth,H=innerHeight;
    c.width=W*d;c.height=H*d;c.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99999';
    c.setAttribute('aria-hidden','true');document.body.appendChild(c);
    var x=c.getContext('2d');x.scale(d,d);
    var col=['#ffd23f','#ff5c8a','#6fe3ff','#8fe388','#ffffff','#b7a6ff'],P=[],n=Math.min(90,Math.round(W/5));
    for(var i=0;i<n;i++){var side=i%2?1:-1,a=(-Math.PI/2)+side*(.25+Math.random()*.75),sp=7+Math.random()*9;
      P.push({x:W/2+side*W*.18,y:H*.62,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-3,w:5+Math.random()*5,h:8+Math.random()*7,r:Math.random()*6.3,vr:(Math.random()-.5)*.4,c:col[i%col.length],t:Math.random()*6.3})}
    var t0=performance.now();
    (function step(now){var k=(now-t0)/1700;x.clearRect(0,0,W,H);if(k>=1){c.remove();return}
      for(var i=0;i<P.length;i++){var p=P[i];p.vy+=.32;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.t+=.2;
        x.save();x.globalAlpha=k>.7?(1-k)/.3:1;x.translate(p.x,p.y);x.rotate(p.r);x.scale(1,Math.cos(p.t));x.fillStyle=p.c;x.fillRect(-p.w/2,-p.h/2,p.w,p.h);x.restore()}
      requestAnimationFrame(step)})(t0);
  }
  function vis(el){return el.isConnected&&!el.hidden&&el.getClientRects().length>0}
  function scan(){
    document.querySelectorAll('.overlay,.ov').forEach(function(el){
      var v=vis(el);if(v&&!shown.get(el)){el.setAttribute('data-eg-in','');setTimeout(function(){el.removeAttribute('data-eg-in')},520);setTimeout(function(){if(vis(el)&&WIN.test(el.textContent)&&!LOSS.test(el.textContent))cheer()},260)}
      shown.set(el,v);
    });
  }
  var q=false;function later(){if(q)return;q=true;requestAnimationFrame(function(){q=false;scan()})}
  function start(){scan();new MutationObserver(later).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','style']})}
  document.body?start():addEventListener('DOMContentLoaded',start);

  /* Escape closes whatever is open, if the game gave it a close button */
  addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    var o=[].slice.call(document.querySelectorAll('.overlay,.ov')).filter(vis).pop();if(!o)return;
    var b=o.querySelector('[data-close],.close,#closeBtn');if(b)b.click();
  });
})();
