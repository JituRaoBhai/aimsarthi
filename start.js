Theme.hook();boot();
(function(){var s=document.getElementById('spl');if(!s)return;var t0=Date.now(),d=0,rm=matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.classList.contains('lite'),min=rm?400:2500,rb=document.getElementById('spre');
try{if(sessionStorage.getItem('acelife:spl')){s.remove();return}sessionStorage.setItem('acelife:spl','1')}catch(e){}
document.body.classList.add('spo');
if(rb)rb.addEventListener('click',function(){location.reload()});
function hide(){if(d)return;d=1;s.classList.add('out');document.body.classList.remove('spo');setTimeout(function(){s.remove()},650)}
var iv=setInterval(function(){var el=Date.now()-t0,rd=false;try{rd=ready}catch(e){}
 if(rd&&el>=min){clearInterval(iv);try{if(el>5000)localStorage.setItem('tasky:slow','1');else if(el<2800)localStorage.removeItem('tasky:slow')}catch(e){}hide();return}
 if(el>3500)s.classList.add('slow');if(el>12000&&rb)rb.hidden=false;if(el>40000){clearInterval(iv);hide()}},80)})();
