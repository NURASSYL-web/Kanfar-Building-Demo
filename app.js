'use strict';
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const projects = {
    panorama: {name:'Panorama', format:'ЖИЛОЙ КОМПЛЕКС', image:'assets/panorama.webp', address:'Шымкент, ул. Аргынбекова, 194/1', description:'Современный жилой комплекс с двумя выразительными башнями. Выберите свой формат городской жизни и обсудите с отделом продаж планировку, этаж и условия покупки.', facts:[['14 и 17','этажей в двух блоках'],['1–4','комнаты в проекте'],['Нурсат','район расположения']]},
    otbasy: {name:'Otbasy', format:'ЖИЛОЙ КОМПЛЕКС', image:'assets/otbasy.webp', address:'Шымкент, ул. Тулеметова, 106/3', description:'Жилой комплекс для повседневных семейных историй. Познакомьтесь с проектом и запросите варианты квартир с учётом вашего бюджета и пожеланий.', facts:[['Шымкент','город'],['Тулеметова','улица'],['Kanfar Building','застройщик']]},
    otyrar: {name:'Otyrar Premium', format:'КЛУБНЫЙ ДОМ', image:'assets/otyrar.webp', address:'Шымкент, ул. Торекулова, 2А', description:'Клубный формат с лаконичной архитектурой и выразительным фасадом. Обсудите с отделом продаж доступные квартиры и особенности проекта, важные для вас.', facts:[['Клубный дом','формат проекта'],['Аль-Фарабийский','район'],['Kanfar Building','застройщик']]}
  };
  const menu = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  const closeMenu = () => {mobileNav.hidden = true; menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Открыть меню');};
  menu.addEventListener('click', () => {const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');mobileNav.hidden = !open;});
  $$('#mobile-nav a').forEach(link => link.addEventListener('click',closeMenu));
  document.addEventListener('keydown', event => {if(event.key === 'Escape') closeMenu();});
  window.addEventListener('resize', () => {if(window.innerWidth > 780) closeMenu();}, {passive:true});

  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced.matches) {
    document.body.classList.add('js-motion');
    const observer = new IntersectionObserver(entries => {entries.forEach(entry => {if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}});}, {threshold:.06, rootMargin:'0px 0px -25px 0px'});
    revealItems.forEach(item => observer.observe(item));
  }

  const section = $('#experience');
  const panels = $$('.space-panel');
  const sceneButtons = $$('.scene-button');
  const count = $('#scene-current');
  const hero = $('.hero');
  const heroImage = $('.hero-image');
  const heroContent = $('.hero-content');
  const bar = $('.reading-progress');
  let activeScene = -1;
  let scheduled = false;
  let mouseX = 0;
  let mouseY = 0;
  const activateScene = index => {
    if(index === activeScene) return;
    activeScene = index;
    count.textContent = String(index+1).padStart(2,'0');
    sceneButtons.forEach((button,i) => {button.classList.toggle('active',i===index);button.setAttribute('aria-pressed',String(i===index));});
    panels.forEach((panel,i) => {panel.classList.toggle('reduced-active',i===index);panel.setAttribute('aria-hidden',String(i!==index));});
  };
  function renderMotion() {
    scheduled = false;
    const scroll = window.scrollY;
    const range = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${range > 0 ? clamp(scroll / range,0,1) : 0})`;
    if(reduced.matches || (window.innerWidth <= 780 && window.innerHeight <= 650)){
      activateScene(activeScene < 0 ? 0 : activeScene);
      panels.forEach((panel,i)=>{panel.style.transform='none';panel.style.opacity=String(i===activeScene?1:0);panel.style.zIndex=String(i===activeScene?10:0);});
      return;
    }
    const header = $('.header').offsetHeight;
    const heroRect = hero.getBoundingClientRect();
    if(heroRect.bottom > 0){
      const progress = clamp(scroll / hero.offsetHeight,0,1);
      heroImage.style.transform = `translate3d(${mouseX * 9}px,${progress * 80 + mouseY * 5}px,${progress * -35}px) rotateX(${mouseY * -.5}deg) rotateY(${mouseX * .8}deg) scale(${1.04 + progress * .04})`;
      heroContent.style.transform = `translate3d(0,${progress * -30}px,${progress * -45}px)`;
    }
    const rect = section.getBoundingClientRect();
    const sectionRange = section.offsetHeight - (window.innerHeight-header);
    const progress = clamp((header - rect.top) / Math.max(1,sectionRange),0,1);
    const step = progress * 2;
    if(rect.bottom > 0 && rect.top < window.innerHeight){
      const mobile = window.innerWidth <= 780;
      panels.forEach((panel,i) => {
        const distance = i - step;
        const depth = Math.abs(distance);
        const x = distance * (mobile?27:36);
        const y = depth * (mobile?2:3);
        const z = -depth * (mobile?330:540);
        const rotation = distance * (mobile?-13:-23);
        panel.style.transform = `translate3d(${x}%,${y}%,${z}px) rotateY(${rotation}deg) rotateX(${depth * 2}deg)`;
        panel.style.opacity = String(clamp(1-depth*.52,.02,1));
        panel.style.zIndex = String(10-Math.round(depth*3));
      });
      activateScene(clamp(Math.round(step),0,2));
    }
  }
  function requestMotion(){if(!scheduled){scheduled=true;window.requestAnimationFrame(renderMotion);}}
  window.addEventListener('scroll',requestMotion,{passive:true});
  window.addEventListener('resize',requestMotion,{passive:true});
  window.addEventListener('load',requestMotion,{once:true});
  reduced.addEventListener('change', () => {if(reduced.matches){document.body.classList.remove('js-motion');revealItems.forEach(item=>item.classList.add('in-view'));}requestMotion();});
  hero.addEventListener('pointermove', event => {if(event.pointerType==='touch'||reduced.matches)return;const rect=hero.getBoundingClientRect();mouseX=(event.clientX-rect.left)/rect.width-.5;mouseY=(event.clientY-rect.top)/rect.height-.5;requestMotion();},{passive:true});
  hero.addEventListener('pointerleave', () => {mouseX=0;mouseY=0;requestMotion();},{passive:true});
  sceneButtons.forEach(button=>button.addEventListener('click',()=>{
    const index = Number(button.dataset.scene);
    if(reduced.matches || (window.innerWidth <= 780 && window.innerHeight <= 650)){activateScene(index);requestMotion();return;}
    const header=$('.header').offsetHeight;
    const range=section.offsetHeight-(window.innerHeight-header);
    const top=section.getBoundingClientRect().top+window.scrollY-header+(index/2)*range;
    window.scrollTo({top:top+(index===2?-2:2),behavior:'smooth'});
  }));
  activateScene(0);
  requestMotion();

  const projectDialog = $('#project-dialog');
  const privacyDialog = $('#privacy-dialog');
  let selectedProject = 'panorama';
  function showDialog(dialog){dialog.showModal();document.body.classList.add('dialog-open');}
  function closeDialog(dialog){dialog.close();}
  [projectDialog,privacyDialog].forEach(dialog=>{
    $('.dialog-close',dialog).addEventListener('click',()=>closeDialog(dialog));
    dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog(dialog);});
    dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
  });
  $$('[data-project]').forEach(button=>button.addEventListener('click',()=>{
    selectedProject=button.dataset.project;
    const data=projects[selectedProject];
    $('#dialog-title').textContent=data.name;
    $('#dialog-format').textContent=data.format;
    $('#dialog-address').textContent=data.address;
    $('#dialog-description').textContent=data.description;
    $('#dialog-image').src=data.image;
    $('#dialog-image').alt=`Визуализация проекта ${data.name}`;
    const facts=$('#dialog-facts');
    facts.replaceChildren(...data.facts.map(([value,label])=>{const el=document.createElement('div');el.className='dialog-fact';const strong=document.createElement('strong');strong.textContent=value;const span=document.createElement('span');span.textContent=label;el.append(strong,span);return el;}));
    showDialog(projectDialog);
  }));
  $('#dialog-select').addEventListener('click',()=>{
    $('#lead-project').value=projects[selectedProject].name;
    closeDialog(projectDialog);
    $('#selection').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
    window.setTimeout(()=>$('#lead-project').focus({preventScroll:true}),reduced.matches?0:500);
  });
  $('#privacy-open').addEventListener('click',()=>showDialog(privacyDialog));
  $('[data-close-dialog]').addEventListener('click',()=>closeDialog(privacyDialog));

  $('#lead-form').addEventListener('submit',event=>{
    event.preventDefault();
    const form=event.currentTarget;
    if(!form.reportValidity())return;
    const data=new FormData(form);
    const name=String(data.get('name')||'').trim();
    const input=$('[name="name"]',form);
    if(!name){input.setCustomValidity('Укажите ваше имя.');input.reportValidity();return;}
    input.setCustomValidity('');
    const wishes=String(data.get('wishes')||'').trim();
    const lines=[`Здравствуйте! Меня зовут ${name}. Хочу подобрать квартиру в Kanfar Building.`,``,`Проект: ${data.get('project')}`,`Комнаты: ${data.get('rooms')}`,`Бюджет: ${data.get('budget')}`];
    if(wishes)lines.push(`Пожелания: ${wishes}`);
    lines.push('','Подскажите, пожалуйста, актуальные варианты, планировки и условия покупки.');
    const url=`https://wa.me/77000820007?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url,'_blank','noopener,noreferrer');
    const status=$('#form-status');
    status.replaceChildren(document.createTextNode('Запрос подготовлен. Если WhatsApp не открылся, '));
    const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='откройте его по ссылке';status.append(link,document.createTextNode('. Отправьте сообщение в приложении.'));status.hidden=false;
  });
  $('[name="name"]').addEventListener('input',event=>event.target.setCustomValidity(''));
  $$('.faq-list details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)$$('.faq-list details').forEach(other=>{if(other!==item)other.open=false;});}));
})();
