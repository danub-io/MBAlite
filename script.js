// O JavaScript permanece funcionalmente o mesmo, apenas movido para cá
// e com ajuste na duração do AOS.

document.addEventListener('DOMContentLoaded', () => {
    // Seletores de Elementos (Cache para performance)
    const body = document.body;
    const header = document.querySelector('header');
    const mainContent = document.getElementById('main-content');
    const allPages = document.querySelectorAll('.page');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNavContainer = document.getElementById('mobile-nav-container');
    const moduleMenu = document.getElementById('module-menu');
    const moduleMenuSticky = document.getElementById('module-menu-sticky-mobile');
    const moduleMenuLinks = document.querySelectorAll('#module-menu a.content-nav-link, #module-menu-sticky-mobile a.content-nav-link'); // Mais específico
    const footer = document.querySelector('footer');

    // Configurações
    const pageTitles = {
        'page-index': 'MBA Lite - Gestão Estratégica Premium',
        'page-content': 'MBA Lite - Sumário Detalhado do Curso',
        'page-faq': 'MBA Lite - Perguntas Frequentes (FAQ)'
    };
    const mobileBreakpoint = 992; // Largura onde o layout mobile é ativado

    // Estado
    let contentSections = []; // Cache das seções de conteúdo para scroll spy

    // --- Funções Principais ---

    /**
     * Mostra a página alvo e esconde as outras. Atualiza título e classes do body.
     * @param {string} targetPageId ID da página a ser mostrada.
     * @param {string|null} scrollTargetId ID do elemento para scrollar (opcional).
     * @param {boolean} pushState Atualizar history API (opcional, default: true).
     */
    function showPage(targetPageId, scrollTargetId = null, pushState = true) {
        // Esconde todas as páginas
        allPages.forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });

        // Limpa classes específicas de página do body
        body.className = ''; // Remove todas as classes anteriores

        let targetPage = document.getElementById(targetPageId);

        // Fallback para page-index se a página não for encontrada
        if (!targetPage) {
            console.warn(`Página com ID '${targetPageId}' não encontrada. Redirecionando para 'page-index'.`);
            targetPageId = 'page-index';
            targetPage = document.getElementById(targetPageId);
        }

        if (targetPage) {
            // Mostra a página alvo
            targetPage.classList.add('active');
            targetPage.style.display = 'block';
            body.classList.add(targetPageId); // Adiciona classe da página atual ao body
            document.title = pageTitles[targetPageId] || 'MBA Lite'; // Atualiza título

            handleUIChanges(targetPageId); // Ajusta UI (sidebar/menu sticky)
            handleScrolling(scrollTargetId); // Realiza o scroll se necessário

            // Atualiza history (comentado no original, manter assim por enquanto)
            if (pushState && window.history && window.history.pushState) {
                const stateUrl = scrollTargetId ? `#${scrollTargetId}` : (targetPageId === 'page-index' ? '#' : `#${targetPageId}`);
                 // Evita push duplicado se o hash já for o correto
                if (window.location.hash !== stateUrl && stateUrl !== '#') {
                   // history.pushState({ page: targetPageId, scroll: scrollTargetId }, document.title, stateUrl);
                   // console.log("Pushing state:", stateUrl);
                }
            }

            closeMobileMenu(); // Fecha menu mobile ao navegar

            // Reativa AOS se necessário e atualiza links ativos do menu de conteúdo
            if (typeof AOS !== 'undefined') {
                AOS.refresh(); // Re-calcula posições dos elementos animados
            }
            if (targetPageId === 'page-content') {
                // Atualiza o link ativo no menu de conteúdo após um pequeno delay
                setTimeout(updateActiveContentLink, 150);
            } else {
                // Remove 'active' de todos os links do menu de conteúdo se não estiver na pág. conteúdo
                 moduleMenuLinks.forEach(link => link.classList.remove('active'));
            }

        } else {
            console.error(`Página de fallback 'page-index' também não encontrada! Navegação impossível.`);
        }
    }

    /**
     * Ajusta a visibilidade da sidebar e do menu sticky mobile
     * baseado na página atual e no tamanho da tela.
     * @param {string} currentPageId ID da página atual.
     */
    function handleUIChanges(currentPageId) {
        const isMobile = window.innerWidth <= mobileBreakpoint;
        const isContentPage = currentPageId === 'page-content';

        body.classList.toggle('mobile-view', isMobile); // Adiciona/remove classe mobile-view

        if (isContentPage) {
            if (isMobile) {
                // Mobile na página de conteúdo: Esconde sidebar, mostra sticky
                body.classList.remove('sidebar-visible');
                if (moduleMenuSticky) moduleMenuSticky.style.display = 'flex';
                if (moduleMenu) moduleMenu.style.display = 'none';
            } else {
                // Desktop na página de conteúdo: Mostra sidebar, esconde sticky
                body.classList.add('sidebar-visible');
                if (moduleMenuSticky) moduleMenuSticky.style.display = 'none';
                if (moduleMenu) moduleMenu.style.display = 'block';
            }
        } else {
            // Outras páginas: Esconde sidebar e sticky
            body.classList.remove('sidebar-visible');
            if (moduleMenuSticky) moduleMenuSticky.style.display = 'none';
            if (moduleMenu) moduleMenu.style.display = 'none';
        }
         // Força recalculo do layout para transições de margem/largura
        if (footer) footer.offsetHeight;
        if (mainContent) mainContent.offsetHeight;
    }

    /**
     * Realiza o scroll suave para um elemento alvo.
     * @param {string|null} scrollTargetId ID do elemento alvo.
     */
    function handleScrolling(scrollTargetId) {
        if (scrollTargetId) {
            const scrollElement = document.getElementById(scrollTargetId);
            if (scrollElement) {
                // Timeout pequeno para garantir que a página esteja visível antes do scroll
                setTimeout(() => {
                    scrollElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100); // Reduzido o delay
            } else {
                console.warn(`Elemento de scroll com ID '${scrollTargetId}' não encontrado.`);
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll para o topo como fallback
            }
        } else {
             // Scroll para o topo se nenhum alvo for especificado
             window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    /** Fecha o menu de navegação mobile. */
    function closeMobileMenu() {
        if (mobileNavContainer && mobileNavContainer.classList.contains('active')) {
            mobileNavContainer.classList.remove('active');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
            body.classList.remove('overflow-hidden');
            body.style.paddingRight = ''; // Remove padding de compensação da scrollbar
        }
    }

    /** Configura os event listeners principais. */
    function setupEventListeners() {
        // Delegação de eventos para links de navegação
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[data-nav-target]');
            if (link) {
                handleNavLinkClick(event, link);
            }
            // Clicar fora do menu mobile aberto para fechar (opcional)
            /*
            if (mobileNavContainer.classList.contains('active') &&
                !mobileNavContainer.contains(event.target) &&
                !menuToggle.contains(event.target)) {
                closeMobileMenu();
            }
            */
        });

        // Toggle do menu mobile
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                if (mobileNavContainer) {
                    const isActive = mobileNavContainer.classList.toggle('active');
                    menuToggle.setAttribute('aria-expanded', isActive);
                    body.classList.toggle('overflow-hidden', isActive);

                    // Compensar a scrollbar ao abrir o menu para evitar 'pulo' do layout
                    if (isActive) {
                        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
                        body.style.paddingRight = `${scrollbarWidth}px`;
                         // Pode ser necessário aplicar ao header fixo também
                         // if(header) header.style.paddingRight = `${scrollbarWidth}px`;
                    } else {
                        body.style.paddingRight = '';
                         // if(header) header.style.paddingRight = '';
                    }
                }
            });
        }

        // Scroll Spy e Resize Listener (com debounce)
        window.addEventListener('scroll', debounce(updateActiveContentLink, 50));
        window.addEventListener('resize', debounce(() => {
            const currentPageId = document.querySelector('.page.active')?.id || 'page-index';
            handleUIChanges(currentPageId); // Reajusta UI no resize
            updateActiveContentLink(); // Revalida link ativo no resize
        }, 100));

         // Listener para popstate (botão voltar/avançar do navegador)
         // Requer que history.pushState esteja ativo
         /*
         window.addEventListener('popstate', (event) => {
             if (event.state && event.state.page) {
                 console.log("Popstate event:", event.state);
                 showPage(event.state.page, event.state.scroll, false); // false para não dar push de novo
             } else {
                 // Se não houver state, voltar para a página inicial (ou baseado no hash)
                 const hash = window.location.hash.substring(1);
                 let initialPage = 'page-index';
                 let initialScroll = null;
                 if (hash) {
                     const targetElement = document.getElementById(hash);
                     if (targetElement) {
                         const parentPage = targetElement.closest('.page');
                         if (parentPage) {
                            initialPage = parentPage.id;
                            initialScroll = hash;
                         }
                     }
                 }
                 showPage(initialPage, initialScroll, false);
             }
         });
         */
    }

    /**
     * Manipula cliques nos links de navegação.
     * @param {Event} event O evento de clique.
     * @param {HTMLAnchorElement} link O elemento do link clicado.
     */
    function handleNavLinkClick(event, link) {
        event.preventDefault(); // Previne comportamento padrão do link
        const targetPageId = link.dataset.navTarget;
        const scrollTargetId = link.dataset.scrollTarget || null;

        // Caso especial: Link para "Inscreva-se" de outra página deve ir para #enroll na index
        if (link.dataset.scrollTarget === 'enroll' && targetPageId !== 'page-index') {
            sessionStorage.setItem('scrollToEnroll', 'true'); // Usa sessionStorage para lembrar
            showPage('page-index', null); // Mostra a index (o scroll será tratado no load)
        } else {
            const currentPageId = document.querySelector('.page.active')?.id || 'page-index';
            // Se já estiver na página correta, apenas scrolla
            if (currentPageId === targetPageId && scrollTargetId) {
                handleScrolling(scrollTargetId);
                closeMobileMenu(); // Fecha o menu se estiver aberto
            } else {
                // Muda de página
                showPage(targetPageId, scrollTargetId);
            }
        }
    }

    /** Faz cache das seções de conteúdo para o scroll spy. */
    function cacheContentSections() {
        contentSections = Array.from(document.querySelectorAll('#page-content .scroll-target'));
        // Ordena por posição top (geralmente já está correto, mas garante)
        contentSections.sort((a, b) => a.offsetTop - b.offsetTop);
    }

    /** Atualiza o link ativo nos menus da página de conteúdo baseado na posição do scroll. */
    function updateActiveContentLink() {
        // Só executa se estiver na página de conteúdo e houver seções
        if (!body.classList.contains('page-content') || contentSections.length === 0) {
             // Garante que links fiquem inativos se sair da página de conteúdo
             moduleMenuLinks.forEach(link => link.classList.remove('active'));
            return;
        }

        const scrollY = window.scrollY;
        // Calcula o offset dinamicamente considerando header e menu sticky (se visível)
        const currentHeaderHeight = header ? header.offsetHeight : (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 75);
        const isMobile = window.innerWidth <= mobileBreakpoint;
        const currentStickyMenuHeight = (isMobile && moduleMenuSticky && moduleMenuSticky.style.display !== 'none')
                                         ? moduleMenuSticky.offsetHeight
                                         : 0;
        const offset = currentHeaderHeight + currentStickyMenuHeight + 60; // Offset um pouco maior

        let currentSectionId = null;

        // Encontra a seção atual baseada no scroll e offset
        for (let i = contentSections.length - 1; i >= 0; i--) {
            const section = contentSections[i];
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - offset) {
                currentSectionId = section.getAttribute('id');
                break;
            }
        }

        // Se nenhuma seção foi encontrada (está acima da primeira), marca a primeira como ativa
        if (currentSectionId === null && contentSections.length > 0 && scrollY < contentSections[0].offsetTop - offset) {
           // currentSectionId = contentSections[0].id; // Ou pode deixar null para nenhum ativo no topo
        }

        // Verifica se está perto do final da página
        const nearBottom = (window.innerHeight + scrollY) >= document.body.offsetHeight - 150;
        if (nearBottom && contentSections.length > 0) {
            // Força ativação da última seção se estiver perto do fim
            currentSectionId = contentSections[contentSections.length - 1].id;
        }


        // Atualiza a classe 'active' nos links correspondentes
        let activeLinkFound = false;
        moduleMenuLinks.forEach(link => {
            const isActive = link.dataset.scrollTarget === currentSectionId;
            link.classList.toggle('active', isActive);
            if(isActive) activeLinkFound = true;
        });

        // Tenta fazer scroll do link ativo para a visão no menu lateral/sticky
        // (pode ser um pouco instável dependendo do CSS)
        /*
        const activeLinkElement = document.querySelector('#module-menu a.active, #module-menu-sticky-mobile a.active');
        if (activeLinkElement && (activeLinkElement.closest('#module-menu') || activeLinkElement.closest('#module-menu-sticky-mobile'))) {
            activeLinkElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        */
    }

    /** Função de inicialização ao carregar a página. */
    function handleInitialLoad() {
        cacheContentSections(); // Cache das seções para scroll spy

        // Determina a página inicial baseada no Hash ou sessionStorage
        const hash = window.location.hash.substring(1);
        let initialPage = 'page-index';
        let initialScroll = null;

        if (sessionStorage.getItem('scrollToEnroll') === 'true') {
            // Prioridade: Scroll para #enroll na index se veio de outra página
            initialPage = 'page-index';
            initialScroll = 'enroll';
            sessionStorage.removeItem('scrollToEnroll'); // Limpa o marcador
             // Remove o hash da URL se ele não for #enroll
             // if (window.location.hash && window.location.hash !== '#enroll') {
             //    history.replaceState(null, '', window.location.pathname + window.location.search);
             //}
        } else if (hash) {
            // Tenta encontrar o elemento pelo hash
            const targetElement = document.getElementById(hash);
            if (targetElement) {
                const parentPage = targetElement.closest('.page');
                if (parentPage) {
                    initialPage = parentPage.id;
                    initialScroll = hash;
                } else {
                     // Se o hash existe mas não está em uma .page (ex: link antigo), vai para index
                     initialPage = 'page-index';
                     initialScroll = null; // Não scrolla para hash inválido
                }
            } else {
                 // Se o hash não corresponde a nenhum ID, vai para a index
                 initialPage = 'page-index';
                 initialScroll = null;
                  // Opcional: Remover hash inválido da URL
                  // history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        }

        // Mostra a página inicial (sem dar push no history)
        showPage(initialPage, initialScroll, false);

        // Atualiza o ano no footer
        const currentYearSpan = document.getElementById('current-year');
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }

        // Inicializa a biblioteca de animação AOS (se existir)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 500, // <<< Duração reduzida da animação (era 700)
                once: true,     // Anima apenas uma vez
                offset: 80,     // Offset para disparar a animação
                easing: 'ease-out-cubic' // Easing suave
            });
        }
    }

    /**
     * Debounce: Agrupa chamadas repetidas de uma função em um curto período.
     * @param {Function} func Função a ser executada.
     * @param {number} wait Tempo de espera em milissegundos.
     * @returns {Function} Função "debounced".
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // --- Inicialização ---
    handleInitialLoad();
    setupEventListeners();

});
