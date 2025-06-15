document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const mainHeader = document.getElementById('main-header');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const navLinks = document.querySelectorAll('#main-nav a');
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu nav a');
    const pages = document.querySelectorAll('.page');
    const yearSpan = document.getElementById('current-year');
    const allLinks = document.querySelectorAll('a');

    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const toggleMenu = (open) => {
        if (mobileMenu && menuOverlay && menuBtn) {
            if (open) {
                mobileMenu.classList.add('menu-open');
                menuOverlay.classList.add('overlay-visible');
                document.body.style.overflow = 'hidden';
                menuBtn.setAttribute('aria-expanded', 'true');
            } else {
                mobileMenu.classList.remove('menu-open');
                menuOverlay.classList.remove('overlay-visible');
                document.body.style.overflow = '';
                menuBtn.setAttribute('aria-expanded', 'false');
            }
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
        const handleScroll = () => {
            if (window.scrollY > 50) {
                mainHeader.classList.add('header-scrolled');
            } else {
                mainHeader.classList.remove('header-scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
    }

    if (scrollToTopBtn) {
        const handleScrollToTopVisibility = () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        };
        window.addEventListener('scroll', handleScrollToTopVisibility);
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        handleScrollToTopVisibility();
    }

    const defaultPageId = 'page-index';
    const pageMap = new Map();
    pageMap.set('/', 'page-index');
    pageMap.set('/modulos', 'page-content');
    pageMap.set('/publicacoes', 'page-publications');
    pageMap.set('/autor', 'page-autor');
    pageMap.set('/faq', 'page-faq');
    pageMap.set('/confirmation', 'page-confirmation');

    function getPathByPageId(pageId) {
        for (let [key, val] of pageMap.entries()) {
            if (val === pageId) {
                return key;
            }
        }
        return null;
    }

    function showPage(pageId, targetElementId = null, pushState = true, isPopState = false) {
        let pageToShow = document.getElementById(pageId);
        if (!pageToShow) {
            pageId = defaultPageId;
            pageToShow = document.getElementById(pageId);
        }

        pages.forEach(p => {
            p.classList.remove('active');
            p.style.display = 'none';
        });

        pageToShow.style.display = 'block';
        pageToShow.classList.add('active');

        updateActiveNavLink(pageId);

        if (targetElementId) {
            const targetElement = document.getElementById(targetElementId);
            if (targetElement) {
                setTimeout(() => {
                    const headerOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 60;
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerOffset - 20;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }, 100);
            } else {
                 if (!isPopState) window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else if (!isPopState) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (pushState) {
            const path = getPathByPageId(pageId) || `/${pageId.replace('page-', '')}`;
            const fullPath = targetElementId ? `${path}#${targetElementId}` : path;
            if ((window.location.pathname + window.location.hash) !== fullPath) {
                history.pushState({ pageId: pageId, targetElementId: targetElementId }, '', fullPath);
            }
        }
    }
    
    function updateActiveNavLink(activePageId) {
        const linksToUpdate = [...navLinks, ...mobileMenuLinks];
        const activePath = getPathByPageId(activePageId);

        linksToUpdate.forEach(link => {
            try {
                 const linkUrl = new URL(link.href, window.location.origin);
                 if (linkUrl.pathname === activePath) {
                     link.classList.add('active');
                 } else {
                     link.classList.remove('active');
                 }
            } catch(e){}
        });
    }

    function handleLinkClick(event) {
        const link = event.currentTarget;
        const href = link.getAttribute('href');

        if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') {
            return;
        }

        const scrollTarget = link.dataset.scrollTarget;
        if (href.startsWith('/#') && scrollTarget) {
            event.preventDefault();
            const targetPageId = 'page-index';
            const targetElement = document.getElementById(scrollTarget);
            if (document.body.contains(targetElement)) {
                 showPage(targetPageId, scrollTarget, true);
            }
            toggleMenu(false);
            return;
        }
        
        event.preventDefault();
        try {
            const url = new URL(href, window.location.origin);
            const targetPageId = pageMap.get(url.pathname);
            const targetElementId = url.hash ? url.hash.substring(1) : null;

            if (targetPageId && document.getElementById(targetPageId)) {
                showPage(targetPageId, targetElementId, true);
            } else {
                showPage(defaultPageId, null, true);
            }
            toggleMenu(false);
        } catch (e) {
            window.location.href = href;
        }
    }

    allLinks.forEach(link => {
        link.addEventListener('click', handleLinkClick);
    });

    window.addEventListener('popstate', (event) => {
        const state = event.state || {};
        let pageIdToShow = state.pageId;
        let targetElementId = state.targetElementId;

        if (!pageIdToShow) {
            const currentPath = window.location.pathname;
            pageIdToShow = pageMap.get(currentPath) || defaultPageId;
            targetElementId = window.location.hash ? window.location.hash.substring(1) : null;
        }
        showPage(pageIdToShow, targetElementId, false, true);
    });
    
    function initialLoad() {
        const initialPath = window.location.pathname;
        const initialHash = window.location.hash ? window.location.hash.substring(1) : null;
        let initialPageId = pageMap.get(initialPath) || defaultPageId;
        
        const isConfirmation = window.location.search.includes('submission_confirmed=true');
        if (isConfirmation && pageMap.get('/confirmation')) {
            initialPageId = 'page-confirmation';
            history.replaceState({ pageId: initialPageId }, '', '/confirmation');
        }

        showPage(initialPageId, initialHash, true, true);
    }
    
    initialLoad();
});
