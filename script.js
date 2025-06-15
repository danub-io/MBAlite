document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const yearSpan = document.getElementById('current-year');

    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const toggleMenu = (show) => {
        if (show) {
            mobileMenu.classList.remove('hidden');
        } else {
            mobileMenu.classList.add('hidden');
        }
    };

    if (menuBtn && closeMenuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => toggleMenu(true));
        closeMenuBtn.addEventListener('click', () => toggleMenu(false));
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Fecha o menu móvel ao clicar em um link
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                toggleMenu(false);
            }

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});