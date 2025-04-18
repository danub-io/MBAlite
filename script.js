// Espera o DOM (Document Object Model) estar completamente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção de Elementos Globais ---
    const preloader = document.getElementById('preloader');
    const header = document.getElementById('main-header');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu a');
    const currentYearSpan = document.getElementById('current-year');
    const pageIndex = document.getElementById('page-index');

    const headerHeight = 75;
    let preloaderHidden = false; // Flag para controlar se o preloader já foi escondido

    // --- Funções ---

    /**
     * Esconde o preloader de forma segura.
     */
    const hidePreloader = () => {
        // Só executa se o preloader existir e ainda não tiver sido escondido
        if (preloader && !preloaderHidden) {
            try {
                preloader.classList.add('hidden');
                preloaderHidden = true; // Marca como escondido
                console.log("Preloader escondido."); // Log para depuração
            } catch (error) {
                console.error("Erro ao esconder o preloader:", error);
            }
        }
    };

    /**
     * Abre o menu mobile.
     */
    const openMenu = () => {
        if (!mobileMenu || !menuOverlay) return;
        try {
            mobileMenu.classList.remove('hidden');
            void mobileMenu.offsetWidth; // Force reflow
            mobileMenu.classList.add('open');
            menuOverlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error("Erro ao abrir o menu mobile:", error);
        }
    };

    /**
     * Fecha o menu mobile.
     */
    const closeMenu = () => {
        if (!mobileMenu || !menuOverlay) return;
        try {
            mobileMenu.classList.remove('open');
            menuOverlay.classList.remove('visible');
            document.body.style.overflow = '';

            setTimeout(() => {
                if (!mobileMenu.classList.contains('open')) {
                    mobileMenu.classList.add('hidden');
                }
            }, 300);
        } catch (error) {
            console.error("Erro ao fechar o menu mobile:", error);
        }
    };

    /**
     * Atualiza a aparência do header e a visibilidade do botão "voltar ao topo".
     */
    const handleScrollEffects = () => {
        try {
            const scrollY = window.scrollY;

            if (header) {
                if (scrollY > 50) {
                    header.classList.add('header-scrolled');
                } else {
                    header.classList.remove('header-scrolled');
                }
            }

            if (scrollToTopBtn) {
                if (scrollY > 300) {
                    scrollToTopBtn.classList.add('visible');
                } else {
                    scrollToTopBtn.classList.remove('visible');
                }
            }
        } catch (error) {
            console.error("Erro em handleScrollEffects:", error);
        }
    };

    /**
     * Rola a página suavemente para o topo.
     */
    const scrollToTop = () => {
        try {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } catch (error) {
            console.error("Erro em scrollToTop:", error);
        }
    };

    /**
     * Atualiza o ano no rodapé para o ano corrente.
     */
    const updateFooterYear = () => {
        if (currentYearSpan) {
            try {
                currentYearSpan.textContent = new Date().getFullYear();
            } catch (error) {
                console.error("Erro ao atualizar o ano no rodapé:", error);
            }
        }
    };

    /**
     * Implementa a rolagem suave para links internos (âncoras) na mesma página.
     */
    const handleSmoothScroll = () => {
        try {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    const href = this.getAttribute('href');
                    if (href && href.length > 1 && href.startsWith('#')) {
                        const targetId = href.substring(1);
                        try {
                            const targetElement = document.getElementById(targetId);
                            if (targetElement) {
                                e.preventDefault();
                                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                                const offsetPosition = elementPosition - headerHeight - 10;
                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth'
                                });
                                if (mobileMenu && mobileMenu.classList.contains('open')) {
                                    closeMenu();
                                }
                            }
                        } catch (error) {
                            console.error("Erro ao tentar encontrar ou rolar para o elemento:", targetId, error);
                        }
                    }
                });
            });
        } catch (error) {
            console.error("Erro ao configurar o smooth scroll:", error);
        }
    };

    /**
     * Atualiza qual link de navegação está ativo com base na seção visível (APENAS NA INDEX).
     */
    const updateActiveNavLink = () => {
        if (!pageIndex) return; // Sai se não estiver na página inicial

        try {
            const scrollY = window.scrollY;
            const activationOffset = headerHeight + 50;
            let currentSectionId = 'hero'; // Default section

            // Encontra a seção visível
            document.querySelectorAll('#page-index .scroll-target').forEach(section => {
                // Verifica se a seção é válida e visível antes de acessar offsetTop/offsetHeight
                if (section && section.offsetTop !== undefined && section.offsetHeight !== undefined) {
                     const sectionTop = section.offsetTop;
                     const sectionHeight = section.offsetHeight;
                     if (scrollY >= sectionTop - activationOffset && scrollY < sectionTop + sectionHeight - activationOffset) {
                         currentSectionId = section.id;
                     }
                } else {
                    console.warn("Seção inválida ou oculta encontrada:", section);
                }
            });

            const mainNavLinks = document.querySelectorAll('#main-nav a.nav-link');
            const mobileNavLinks = document.querySelectorAll('#mobile-menu a.mobile-menu-link');

            const updateLinkActivation = (links) => {
                links.forEach(link => {
                    link.classList.remove('active');
                    const linkHref = link.getAttribute('href');
                    if ((linkHref === 'index.html' || linkHref === '/') && currentSectionId === 'hero') {
                        link.classList.add('active');
                    } else if (linkHref === `#${currentSectionId}`) {
                        link.classList.add('active');
                    }
                });
            };

            updateLinkActivation(mainNavLinks);
            updateLinkActivation(mobileNavLinks);

            if (currentSectionId === 'hero') {
                document.querySelector('#main-nav a[href="index.html"]')?.classList.add('active');
                document.querySelector('#mobile-menu a[href="index.html"]')?.classList.add('active');
            }
        } catch (error) {
            console.error("Erro em updateActiveNavLink:", error);
        }
    };

    // --- Inicialização e Event Listeners ---

    // Atualiza o ano no rodapé imediatamente
    updateFooterYear();

    // Ativa a rolagem suave
    handleSmoothScroll();

    // Adiciona listeners para abrir/fechar menu mobile
    if (menuBtn) menuBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

    // Fecha o menu ao clicar em um link dentro dele
    mobileMenuLinks.forEach(link => {
        if (link.getAttribute('href') && (link.getAttribute('href').startsWith('#') || link.getAttribute('href').includes('.html'))) {
            link.addEventListener('click', closeMenu);
        }
    });

    // Adiciona listener para o botão "voltar ao topo"
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', scrollToTop);
    }

    // --- Eventos de Scroll e Load ---

    // Adiciona listeners de scroll após o DOM carregar
    window.addEventListener('scroll', () => {
        handleScrollEffects();
        updateActiveNavLink(); // A verificação da página é feita dentro da função
    });

    // Esconde o preloader após o carregamento completo da página (evento 'load')
    window.addEventListener('load', () => {
        console.log("Evento 'load' disparado."); // Log para depuração
        hidePreloader();
        // Chama as funções de scroll uma vez no load para definir o estado inicial
        handleScrollEffects();
        updateActiveNavLink();

        // Fallback: Esconde o preloader após 5 segundos se ainda não foi escondido
        setTimeout(() => {
            if (!preloaderHidden) {
                console.warn("Preloader fallback timeout: escondendo preloader."); // Aviso no console
                hidePreloader();
            }
        }, 5000); // 5 segundos
    });

    // --- Configuração Inicial ---
    // Esconde o menu mobile inicialmente (adicionando a classe hidden se não tiver)
    // Isso previne um flash rápido do menu em algumas situações
    if (mobileMenu && !mobileMenu.classList.contains('open')) {
         mobileMenu.classList.add('hidden');
    }


}); // Fim do DOMContentLoaded
