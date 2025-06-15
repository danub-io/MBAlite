document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const mainHeader = document.getElementById('main-header');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const allLinks = document.querySelectorAll('a');
    const pages = document.querySelectorAll('.page');
    const yearSpan = document.getElementById('current-year');

    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const toggleMenu = (open) => {
        if (mobileMenu && menuOverlay && menuBtn) {
            mobileMenu.classList.toggle('menu-open', open);
            menuOverlay.classList.toggle('overlay-visible', open);
            document.body.style.overflow = open ? 'hidden' : '';
            menuBtn.setAttribute('aria-expanded', open);
        }
    };

    if (menuBtn && closeMenuBtn && mobileMenu && menuOverlay) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu(true);
        });
        closeMenuBtn.addEventListener('click', () => toggleMenu(false));
        menuOverlay.addEventListener('click', () => toggleMenu(false));
    }

    if (mainHeader) {
        let lastScrollY = window.scrollY;
        let ticking = false;
        const handleScroll = () => {
            lastScrollY = window.scrollY;
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    mainHeader.classList.toggle('header-scrolled', lastScrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    if (scrollToTopBtn) {
        const handleScrollToTopVisibility = () => {
            scrollToTopBtn.classList.toggle('visible', window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScrollToTopVisibility, { passive: true });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        handleScrollToTopVisibility();
    }

    const pageMap = new Map([
        ['/', 'page-index'],
        ['/modulos', 'page-content'],
        ['/publicacoes', 'page-publications'],
        ['/autor', 'page-autor'],
        ['/faq', 'page-faq'],
        ['/confirmation', 'page-confirmation']
    ]);
    
    const defaultPageId = 'page-index';

    const getPathByPageId = (pageId) => {
        for (let [key, val] of pageMap.entries()) {
            if (val === pageId) return key;
        }
        return null;
    };

    const updateActiveNavLink = (activePageId) => {
        const activePath = getPathByPageId(activePageId);
        const linksToUpdate = document.querySelectorAll('#main-nav a, #mobile-menu nav a');
        linksToUpdate.forEach(link => {
            try {
                const linkUrl = new URL(link.href, window.location.origin);
                link.classList.toggle('active', linkUrl.pathname === activePath);
            } catch (e) {
                link.classList.remove('active');
            }
        });
    };

    const showPage = (pageId, targetElementId = null, pushState = true, isPopState = false) => {
        let pageToShow = document.getElementById(pageId) || document.getElementById(defaultPageId);
        const effectivePageId = pageToShow.id;

        pages.forEach(p => {
            p.style.display = 'none';
            p.classList.remove('active');
        });

        pageToShow.style.display = 'block';
        setTimeout(() => pageToShow.classList.add('active'), 10);
        
        updateActiveNavLink(effectivePageId);

        const scrollToTarget = () => {
            if (targetElementId) {
                const targetElement = document.getElementById(targetElementId);
                if (targetElement) {
                    const headerOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 60;
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerOffset - 20;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                } else if (!isPopState) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else if (!isPopState) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };

        setTimeout(scrollToTarget, 50);

        if (pushState) {
            const path = getPathByPageId(effectivePageId) || `/${effectivePageId.replace('page-', '')}`;
            const fullPath = targetElementId ? `${path}#${targetElementId}` : path;
            if ((window.location.pathname + window.location.hash) !== fullPath) {
                history.pushState({ pageId: effectivePageId, targetElementId }, '', fullPath);
            }
        }
    };
    
    const handleLinkClick = (event) => {
        const link = event.currentTarget;
        const href = link.getAttribute('href');

        if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') {
            return;
        }
        
        event.preventDefault();
        
        try {
            const url = new URL(href, window.location.origin);
            const targetPageId = pageMap.get(url.pathname);
            const targetElementId = url.hash.substring(1);

            if (targetPageId) {
                showPage(targetPageId, targetElementId);
            } else {
                showPage(defaultPageId);
            }
            toggleMenu(false);
        } catch (e) {
            window.location.href = href;
        }
    };

    allLinks.forEach(link => {
        link.addEventListener('click', handleLinkClick);
    });

    window.addEventListener('popstate', (event) => {
        const state = event.state || {};
        let pageIdToShow = state.pageId;
        let targetElementId = state.targetElementId;

        if (!pageIdToShow) {
            pageIdToShow = pageMap.get(window.location.pathname) || defaultPageId;
            targetElementId = window.location.hash.substring(1);
        }
        showPage(pageIdToShow, targetElementId, false, true);
    });
    
    const initialLoad = () => {
        const params = new URLSearchParams(window.location.search);
        let initialPageId, initialHash;

        if (params.has('submission_confirmed')) {
            initialPageId = 'page-confirmation';
            history.replaceState({ pageId: initialPageId }, '', '/confirmation');
        } else {
            initialPageId = pageMap.get(window.location.pathname) || defaultPageId;
            initialHash = window.location.hash.substring(1);
        }
        
        showPage(initialPageId, initialHash, true, true);
    };
    
    initialLoad();
});