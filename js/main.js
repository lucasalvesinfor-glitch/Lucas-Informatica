(() => {
  const WHATSAPP = '5511962636489';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);

  /* ---------- anos de experiência e ano atual ---------- */
  const year = new Date().getFullYear();
  document.querySelectorAll('[data-years]').forEach(el => { el.textContent = Math.max(1, year - 2019); });
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = year; });

  /* ---------- menu mobile ---------- */
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));

  /* ---------- animação de entrada ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    reveals.forEach(el => {
      const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
    });
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  }

  /* ---------- efeitos ligados à rolagem ---------- */
  const hero = document.querySelector('.hero');
  const stage = hero.querySelector('.stage');
  const lid = hero.querySelector('.lid');
  const works = document.querySelectorAll('.work');
  const zoom = document.querySelector('.zoom');
  const waFloat = document.querySelector('.wa-float');

  // progresso de uma seção "presa" (sticky): 0 no início, 1 quando termina
  const stickyProgress = el => {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / (r.height - innerHeight));
  };
  // progresso de um elemento passando pela tela: 0 entrando por baixo, 1 no centro
  const passProgress = el => {
    const r = el.getBoundingClientRect();
    return clamp((innerHeight - r.top) / (innerHeight * 0.5 + r.height * 0.5));
  };

  let heroTarget = 0;
  const measure = () => {
    // quanto o notebook precisa subir para ficar centralizado quando aberto
    hero.style.setProperty('--lap-y', '0px');
    hero.style.setProperty('--lap-s', '1');
    const sticky = hero.querySelector('.hero-sticky').getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    const lidH = lid.offsetHeight;
    heroTarget = (sticky.top + innerHeight * (innerWidth <= 734 ? 0.44 : 0.42) - lidH / 2) - s.top;
  };

  const update = () => {
    const small = innerWidth <= 734;

    // HERO: o notebook abre, sobe e troca de tela
    const p = reduced ? 0.5 : stickyProgress(hero);
    const open = ease(clamp(p / 0.45));
    hero.style.setProperty('--lid', `${(-86 + open * 86).toFixed(2)}deg`);
    hero.style.setProperty('--tilt', `${(-42 + open * 36).toFixed(2)}deg`);
    hero.style.setProperty('--copy-o', clamp(1 - p / 0.13).toFixed(3));
    hero.style.setProperty('--copy-y', `${(-p * 240).toFixed(1)}px`);
    hero.style.setProperty('--lap-y', `${(open * heroTarget).toFixed(1)}px`);
    hero.style.setProperty('--lap-s', (small ? 1 : 0.9 + open * 0.1).toFixed(3));
    hero.style.setProperty('--scr-b', clamp((p - 0.58) / 0.14).toFixed(3));
    hero.style.setProperty('--cap-o', clamp((p - 0.62) / 0.14).toFixed(3));

    // TRABALHOS: janelas e telefones giram conforme a rolagem
    works.forEach(w => {
      const wp = reduced ? 1 : ease(clamp((passProgress(w) - 0.1) / 0.8));
      w.style.setProperty('--wp', wp.toFixed(3));
    });

    // MANUTENÇÃO: aproximação da foto da placa-mãe
    if (zoom) zoom.style.setProperty('--zp', (reduced ? 1 : stickyProgress(zoom)).toFixed(3));

    // botão flutuante aparece depois do topo e some no contato
    const contact = document.getElementById('contato').getBoundingClientRect();
    waFloat.classList.toggle('show', hero.getBoundingClientRect().bottom < innerHeight * 0.5 && contact.top > innerHeight * 0.6);
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  };
  const onResize = () => { measure(); update(); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onResize);
  addEventListener('load', onResize);
  onResize();

  /* ---------- cartões que inclinam com o mouse ---------- */
  if (!reduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.tilt').forEach(card => {
      const max = card.classList.contains('tile-xl') ? 5 : 9;
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.classList.add('hovering');
        card.style.setProperty('--ry', `${((x - 0.5) * max * 2).toFixed(2)}deg`);
        card.style.setProperty('--rx', `${((0.5 - y) * max * 2).toFixed(2)}deg`);
        card.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
        card.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
        card.style.setProperty('--go', '1');
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('hovering');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--go', '0');
      });
    });
  }

  /* ---------- formulário → WhatsApp ---------- */
  document.getElementById('brief').addEventListener('submit', e => {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const servico = document.getElementById('servico').value;
    const msg = document.getElementById('mensagem').value.trim();
    const text = `Olá, Lucas! Meu nome é ${nome}.\nTenho interesse em: ${servico}.${msg ? `\n\n${msg}` : ''}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  });
})();
