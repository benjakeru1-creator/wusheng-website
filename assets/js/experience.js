(function(){
  "use strict";
  var hero=document.querySelector("[data-product-hero]");if(!hero)return;
  var products={
    jasmine:{no:"01",name:"茉莉花茶",en:"JASMINE TEA",word:"JASMINE",desc:"茉莉的香气先到，茶味随后。入口清亮，尾段留下一点干净的回甘。",img:"assets/img/bottle_jasmine.png",alt:"万物生长茉莉花茶瓶身",link:"products.html#jasmine",product:"#d7e7dc",product2:"#6f9e8d",aroma:"清扬花香",taste:"轻盈 · 清爽",moment:"上午 · 办公桌边",pair:"水果 · 清淡点心",meters:[90,20,62]},
    osmanthus:{no:"02",name:"桂花乌龙",en:"OSMANTHUS OOLONG",word:"OSMANTHUS",desc:"焙火托住桂花的甜润。香气在中段打开，柔和但不掩盖乌龙本身。",img:"assets/img/bottle_osmanthus.png",alt:"万物生长桂花乌龙瓶身",link:"products.html#osmanthus",product:"#f0ca72",product2:"#b77e2b",aroma:"桂花甜润",taste:"温厚 · 柔和",moment:"午后 · 午饭之后",pair:"坚果 · 烘焙点心",meters:[68,58,74]},
    oolong:{no:"03",name:"乌龙茶",en:"ROASTED OOLONG",word:"OOLONG",desc:"没有花香抢戏，只有茶叶自己的焙火与熟果香。醇厚，回甘慢而长。",img:"assets/img/bottle_oolong.png",alt:"万物生长乌龙茶瓶身",link:"products.html#oolong",product:"#c28a6b",product2:"#774735",aroma:"焙火 · 熟果香",taste:"醇厚 · 有层次",moment:"佐餐 · 傍晚",pair:"家常菜 · 油脂料理",meters:[22,80,82]}
  };
  var stage=hero.querySelector(".product-hero__stage"),bottle=hero.querySelector("[data-product-bottle]"),tabs=Array.prototype.slice.call(hero.querySelectorAll("[data-experience-flavor]")),reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches,active="";
  function text(selector,value){var el=hero.querySelector(selector);if(el)el.textContent=value;}
  function render(key,focus){
    var p=products[key];if(!p||key===active)return;active=key;
    hero.style.setProperty("--product",p.product);hero.style.setProperty("--product-2",p.product2);
    tabs.forEach(function(tab){var on=tab.dataset.experienceFlavor===key;tab.classList.toggle("is-active",on);tab.setAttribute("aria-selected",on?"true":"false");tab.tabIndex=on?0:-1;if(on&&focus)tab.focus();});
    stage.classList.add("is-swapping");
    window.setTimeout(function(){
      bottle.src=p.img;bottle.alt=p.alt;text("[data-product-number]","NO. "+p.no);text("[data-product-name]",p.name);text("[data-product-en]",p.en);text("[data-product-word]",p.word);text("[data-product-desc]",p.desc);text("[data-product-aroma]",p.aroma);text("[data-product-taste]",p.taste);text("[data-product-moment]",p.moment);text("[data-product-pair]",p.pair);text("[data-product-count]",p.no+" / 03");
      var link=hero.querySelector("[data-product-link]");if(link)link.href=p.link;
      [["aroma",p.meters[0]],["roast",p.meters[1]],["finish",p.meters[2]]].forEach(function(item){var bar=hero.querySelector("[data-meter-"+item[0]+"]"),val=hero.querySelector("[data-meter-"+item[0]+"-value]");if(bar)bar.style.width=item[1]+"%";if(val)val.textContent=item[1];});stage.classList.remove("is-swapping");
    },reduce?0:210);
  }
  tabs.forEach(function(tab,index){tab.addEventListener("click",function(){render(tab.dataset.experienceFlavor,false);});tab.addEventListener("keydown",function(e){if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft")return;e.preventDefault();var next=e.key==="ArrowRight"?(index+1)%tabs.length:(index-1+tabs.length)%tabs.length;render(tabs[next].dataset.experienceFlavor,true);});});
  var start=(location.hash||"").replace("#","");render(products[start]?start:"jasmine",false);
})();

