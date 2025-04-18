// Espera o DOM (Document Object Model) estar completamente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- Seleção de Elementos Globais ---
    // Seleciona os elementos que são usados em várias funções para evitar repetição
    const preloader = document.getElementById('preloader');
    const header = document.getElementById('main-header');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu a'); // Links dentro do menu mobile
    const currentYearSpan = document.getElementById('current-year');
    const pageIndex = document.getElementById('page-index'); // Elemento específico da página inicial

    // Define a altura do cabeçalho (deve corresponder ao valor no CSS)
    const headerHeight = 75; // Ajuste se a altura no CSS for diferente

    // --- Funções ---

    /**
     * Esconde o preloader.
     * Chamada quando a página e todos os recursos (imagens, etc.) terminam de carregar.
     */
    const hidePreloader = () => {
        if (preloader) {
            preloader.classList.add('hidden'); // Adiciona classe para esconder (estilo via CSS)
        }
    };

    /**
     * Abre o menu mobile.
     */
    const openMenu = () => {
        if (!mobileMenu || !menuOverlay) return; // Sai se os elementos não existirem
        mobileMenu.classList.remove('hidden'); // Remove 'hidden' primeiro
        // Força um reflow para garantir que a transição funcione após remover 'hidden'
        void mobileMenu.offsetWidth;
        mobileMenu.classList.add('open'); // Adiciona classe que aplica 'transform: translateX(0)'
        menuOverlay.classList.add('visible'); // Mostra o overlay
        document.body.style.overflow = 'hidden'; // Impede o scroll do corpo da página
    };

    /**
     * Fecha o menu mobile.
     */
    const closeMenu = () => {
        if (!mobileMenu || !menuOverlay) return; // Sai se os elementos não existirem
        mobileMenu.classList.remove('open'); // Remove a classe que aplica 'transform: translateX(0)'
        menuOverlay.classList.remove('visible'); // Esconde o overlay
        document.body.style.overflow = ''; // Restaura o scroll do corpo da página

        // Adiciona 'hidden' de volta após a transição CSS terminar (300ms)
        // Isso ajuda na acessibilidade e garante que o menu não interfira
        setTimeout(() => {
            // Verifica se o menu ainda está fechado antes de adicionar 'hidden'
            if (!mobileMenu.classList.contains('open')) {
                mobileMenu.classList.add('hidden');
            }
        }, 300); // Deve corresponder à duração da transição no CSS
    };

    /**
     * Atualiza a aparência do header e a visibilidade do botão "voltar ao topo"
     * com base na posição de rolagem da página.
     */
    const handleScrollEffects = () => {
        const scrollY = window.scrollY;

        // Estiliza o header fixo ao rolar
        if (header) {
            if (scrollY > 50) { // Adiciona a classe após rolar 50 pixels
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        }

        // Mostra/esconde o botão "voltar ao topo"
        if (scrollToTopBtn) {
            if (scrollY > 300) { // Mostra o botão após rolar 300 pixels
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }
    };

    /**
     * Rola a página suavemente para o topo.
     */
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Efeito de rolagem suave
        });
    };

    /**
     * Atualiza o ano no rodapé para o ano corrente.
     */
    const updateFooterYear = () => {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    };

    /**
     * Implementa a rolagem suave para links internos (âncoras) na mesma página.
     * Seleciona todos os links que começam com '#'
     */
    const handleSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');

                // Verifica se é um link de âncora válido (não apenas '#')
                if (href && href.length > 1 && href.startsWith('#')) {
                    const targetId = href.substring(1); // Remove o '#'
                    try {
                        const targetElement = document.getElementById(targetId);

                        // Verifica se o elemento de destino existe na página atual
                        if (targetElement) {
                            e.preventDefault(); // Impede o comportamento padrão de salto

                            // Calcula a posição de destino, descontando a altura do header e um pequeno offset
                            const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                            const offsetPosition = elementPosition - headerHeight - 10; // Offset de 10px abaixo do header

                            // Realiza a rolagem suave
                            window.scrollTo({
                                top: offsetPosition,
                                behavior: 'smooth'
                            });

                            // Fecha o menu mobile se estiver aberto (útil para navegação mobile)
                            if (mobileMenu && mobileMenu.classList.contains('open')) {
                                closeMenu();
                            }
                        }
                        // Se o targetElement não existir, o navegador seguirá o link normalmente
                        // (útil se o link apontar para outra página, embora não seja o caso aqui)

                    } catch (error) {
                        console.error("Erro ao tentar encontrar o elemento para scroll suave:", targetId, error);
                        // Permite o comportamento padrão se houver erro
                    }
                }
            });
        });
    };

    /**
     * Atualiza qual link de navegação está ativo com base na seção visível na página.
     * ESSA FUNÇÃO SÓ DEVE EXECUTAR NA PÁGINA INICIAL (INDEX.HTML).
     */
    const updateActiveNavLink = () => {
        // --- VERIFICA SE ESTÁ NA PÁGINA INICIAL ---
        if (!pageIndex) {
            return; // Sai da função se não encontrar o #page-index
        }
        // --- FIM DA VERIFICAÇÃO ---

        const scrollY = window.scrollY;
        // Offset para ativar o link um pouco antes da seção chegar ao topo
        const activationOffset = headerHeight + 50;
        let currentSectionId = 'hero'; // Seção padrão (topo)

        // Encontra a seção visível
        document.querySelectorAll('#page-index .scroll-target').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            // Verifica se o topo da seção está dentro da área de ativação
            if (scrollY >= sectionTop - activationOffset && scrollY < sectionTop + sectionHeight - activationOffset) {
                currentSectionId = section.id;
            }
        });

        // Seleciona todos os links de navegação (desktop e mobile)
        const mainNavLinks = document.querySelectorAll('#main-nav a.nav-link');
        const mobileNavLinks = document.querySelectorAll('#mobile-menu a.mobile-menu-link'); // Links específicos do menu mobile

        // Função auxiliar para atualizar a classe 'active'
        const updateLinkActivation = (links) => {
            links.forEach(link => {
                link.classList.remove('active'); // Remove 'active' de todos
                const linkHref = link.getAttribute('href');

                // Verifica se o link corresponde à seção atual
                // Trata o link "Início" (index.html ou /) e a seção "hero"
                if ((linkHref === 'index.html' || linkHref === '/') && currentSectionId === 'hero') {
                    link.classList.add('active');
                }
                // Trata os links de âncora (#modules, #enroll, etc.)
                else if (linkHref === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        };

        // Atualiza os links do desktop e do mobile
        updateLinkActivation(mainNavLinks);
        updateLinkActivation(mobileNavLinks);

        // Garante que "Início" esteja ativo quando no topo (reforço)
        if (currentSectionId === 'hero') {
             document.querySelector('#main-nav a[href="index.html"]')?.classList.add('active');
             document.querySelector('#mobile-menu a[href="index.html"]')?.classList.add('active');
        }
    };


    // --- Inicialização e Event Listeners ---

    // Esconde o preloader após o carregamento completo da página
    window.addEventListener('load', () => {
        hidePreloader();
        // Chama a função de scroll uma vez no load para definir o estado inicial
        handleScrollEffects();
        // Chama a função de highlight do link ativo uma vez no load (se estiver na index)
        updateActiveNavLink();
    });

    // Adiciona listeners para abrir/fechar menu mobile
    if (menuBtn) menuBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

    // Adiciona listener para fechar o menu mobile ao clicar em um link *dentro* dele
    mobileMenuLinks.forEach(link => {
        // Verifica se é um link interno ou para outra página do site
        if (link.getAttribute('href') && (link.getAttribute('href').startsWith('#') || link.getAttribute('href').includes('.html'))) {
            link.addEventListener('click', closeMenu);
        }
    });

    // Adiciona listener para efeitos de scroll (header, botão topo)
    window.addEventListener('scroll', handleScrollEffects);

    // Adiciona listener para o botão "voltar ao topo"
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', scrollToTop);
    }

    // Atualiza o ano no rodapé
    updateFooterYear();

    // Ativa a rolagem suave para links internos
    handleSmoothScroll();

    // Adiciona listener para atualizar o link ativo durante o scroll (se estiver na index)
    // A verificação se está na index é feita dentro da própria função updateActiveNavLink
    window.addEventListener('scroll', updateActiveNavLink);

}); // Fim do DOMContentLoaded
```

Este arquivo `script.js` contém toda a lógica necessária para as interações do site. Ele está bem comentado para explicar cada parte.

Agora que temos todos os arquivos HTML otimizados e o `script.js` pronto, o último passo seria criar o `style.css`. Quer prosseguir com a criação do `style.cs
