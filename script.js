document.addEventListener('DOMContentLoaded', function() {
    // Seletores de Elementos Globais
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const mainHeader = document.getElementById('main-header');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const navLinks = document.querySelectorAll('#main-nav a.nav-link');
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu nav a.mobile-menu-link');
    const pages = document.querySelectorAll('.page');
    const yearSpan = document.getElementById('current-year');
    const allLinks = document.querySelectorAll('a[href]');
    const faqItems = document.querySelectorAll('.faq-item');

    // Atualiza o ano no rodapé
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Inicializa a biblioteca de animação (AOS)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            once: true, // Garante que a animação ocorra apenas uma vez
            duration: 600,
            easing: 'ease-out-quad',
        });
    }

    // --- LÓGICA DO MENU MOBILE ---
    const toggleMenu = (open) => {
        if (!mobileMenu || !menuOverlay || !menuBtn) return;
        
        if (open) {
            mobileMenu.classList.remove('hidden-menu');
            menuOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            menuBtn.setAttribute('aria-expanded', 'true');
        } else {
            mobileMenu.classList.add('hidden-menu');
            menuOverlay.classList.add('hidden');
            document.body.style.overflow = '';
            menuBtn.setAttribute('aria-expanded', 'false');
        }
    };

    if (menuBtn && closeMenuBtn && mobileMenu && menuOverlay) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu(true);
        });
        closeMenuBtn.addEventListener('click', () => toggleMenu(false));
        menuOverlay.addEventListener('click', () => toggleMenu(false));
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => toggleMenu(false));
        });
    }

    // --- EFEITOS DE SCROLL ---
    // Header que muda ao rolar
    if (mainHeader) {
        const handleHeaderScroll = () => {
            if (window.scrollY > 50) {
                mainHeader.classList.add('header-scrolled');
            } else {
                mainHeader.classList.remove('header-scrolled');
            }
        };
        window.addEventListener('scroll', handleHeaderScroll, { passive: true });
        handleHeaderScroll();
    }

    // Botão "Voltar ao Topo"
    if (scrollToTopBtn) {
        const handleScrollToTopVisibility = () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        };
        window.addEventListener('scroll', handleScrollToTopVisibility, { passive: true });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        handleScrollToTopVisibility();
    }

    // --- LÓGICA DE NAVEGAÇÃO SPA (SINGLE-PAGE APPLICATION) ---
    const defaultPageId = 'page-index';
    const pageMap = new Map();

    pages.forEach(page => {
        if (!page.id) return;
        let path;
        switch (page.id) {
            case 'page-index': path = '/'; break;
            case 'page-content': path = '/modulos'; break;
            case 'page-publications': path = '/publicacoes'; break;
            case 'page-autor': path = '/autor'; break;
            case 'page-faq': path = '/faq'; break;
            case 'page-confirmation': path = '/confirmation'; break;
            default: path = `/${page.id.replace('page-', '')}`;
        }
        pageMap.set(path, page.id);
    });

    function getKeyByValue(map, searchValue) {
        for (let [key, value] of map.entries()) {
            if (value === searchValue) return key;
        }
        return undefined;
    }

    function updateActiveNavLink(activePageId) {
        const linksToUpdate = [...navLinks, ...mobileMenuLinks];
        linksToUpdate.forEach(link => {
            const pageId = link.getAttribute('href').split('#')[0];
            if (pageMap.get(pageId) === activePageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    function showPage(pageId, targetElementId = null, pushState = true, isPopState = false) {
        const pageToShow = document.getElementById(pageId);
        if (!pageToShow) {
            console.warn(`Página com ID "${pageId}" não encontrada. Mostrando a página padrão.`);
            return showPage(defaultPageId, null, true);
        }

        pages.forEach(p => p.classList.remove('active'));
        pageToShow.classList.add('active');
        
        updateActiveNavLink(pageId);

        // Lógica de Scroll
        if (targetElementId) {
            const targetElement = document.getElementById(targetElementId);
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50); // Pequeno delay para garantir que a página esteja visível
            } else {
                 if (!isPopState) window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else if (!isPopState) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Atualiza a URL na barra de endereço
        if (pushState) {
            const path = getKeyByValue(pageMap, pageId);
            const fullPath = targetElementId ? `${path}#${targetElementId}` : path;
            if (window.location.pathname + window.location.hash !== fullPath) {
                history.pushState({ pageId, targetElementId }, '', fullPath);
            }
        }
        
        // Re-inicializa as animações na nova página
        if (typeof AOS !== 'undefined') {
			AOS.refresh();
		}
    }

    // Adiciona listeners a todos os links internos
    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http') || link.target === '_blank') return;
        
        const url = new URL(href, window.location.origin);
        const targetPageId = pageMap.get(url.pathname);
        
        if (targetPageId) {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const targetElementId = url.hash ? url.hash.substring(1) : null;
                showPage(targetPageId, targetElementId, true);
                toggleMenu(false);
            });
        }
    });

    // Listener para o botão de voltar/avançar do navegador
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.pageId) {
            showPage(event.state.pageId, event.state.targetElementId, false, true);
        } else {
            // Fallback para o estado inicial se não houver state
            const initialPageId = pageMap.get(window.location.pathname) || defaultPageId;
            showPage(initialPageId, window.location.hash.substring(1), false, true);
        }
    });

    // --- INICIALIZAÇÃO DA PÁGINA ---
    // Esta função roda apenas uma vez no carregamento para configurar o estado inicial
    // sem causar atrasos de renderização.
    function initializePage() {
        let initialPath = window.location.pathname;
        let initialHash = window.location.hash ? window.location.hash.substring(1) : null;
        
        // Trata redirecionamentos de confirmação de e-mail
        if (window.location.search.includes('submission_confirmed=true')) {
            initialPath = '/confirmation';
        }
        
        const initialPageId = pageMap.get(initialPath) || defaultPageId;

        // Se a página correta não for a que já está ativa no HTML, faz a troca.
        // Isso é importante para quando o usuário acessa uma URL direta (ex: /autor).
        const activePage = document.querySelector('.page.active');
        if (!activePage || activePage.id !== initialPageId) {
            showPage(initialPageId, initialHash, false); 
        } else {
            // Se a página correta já está ativa, apenas atualiza o link e rola se necessário.
            updateActiveNavLink(initialPageId);
            if (initialHash) {
                const targetElement = document.getElementById(initialHash);
                if (targetElement) {
                    setTimeout(() => targetElement.scrollIntoView({ behavior: 'smooth' }), 100);
                }
            }
        }
    }

    initializePage();
});