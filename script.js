// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selections ---
    // Select elements needed across multiple functions
    const preloader = document.getElementById('preloader');
    const header = document.getElementById('main-header');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    // Select *all* links in the mobile menu for the close functionality
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu a');
    const currentYearSpan = document.getElementById('current-year');
    // Define header height constant (ensure this matches your CSS :root variable)
    const headerHeight = 75;

    // --- Preloader & Initializations ---
    // Runs after all page resources (images, etc.) are loaded
    window.addEventListener('load', () => {
        // Hide preloader
        if (preloader) {
            preloader.classList.add('hidden');
        }
        // Initialize Animate On Scroll (AOS) library
        // Ensure AOS is defined (loaded via CDN)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 600, // Animation duration
                once: true,    // Animation happens only once
                offset: 80,    // Trigger offset (px)
                easing: 'ease-out-quad', // Animation easing
            });
        }
        // Set initial state for header/scroll-top button based on initial scroll position
        handleScrollEffects();
    });

    // --- Mobile Menu Toggle Logic ---
    const openMenu = () => {
        if (!mobileMenu || !menuOverlay) return;
        mobileMenu.classList.remove('hidden', '-translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        menuOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent body scroll when menu is open
    };

    const closeMenu = () => {
        if (!mobileMenu || !menuOverlay) return;
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('-translate-x-full');
        menuOverlay.classList.add('hidden');
        // Add hidden class after transition for accessibility
        setTimeout(() => {
            if (mobileMenu.classList.contains('-translate-x-full')) {
                mobileMenu.classList.add('hidden');
            }
        }, 300); // Match CSS transition duration
        document.body.style.overflow = ''; // Restore body scroll
    };

    // Add event listeners for menu buttons and overlay
    if (menuBtn) menuBtn.addEventListener('click', openMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

    // Add event listeners to *all* mobile menu links to close the menu on click
    mobileMenuLinks.forEach(link => {
        // Check if it's a link that should close the menu (e.g., not an external link if you add any)
        if (link.getAttribute('href') && (link.getAttribute('href').startsWith('#') || link.getAttribute('href').includes('.html'))) {
             link.addEventListener('click', closeMenu);
        }
    });

    // --- Footer Year ---
    // Dynamically update the year in the footer
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Scroll-Based Effects (Header & Scroll-to-Top) ---
    const handleScrollEffects = () => {
        const scrollY = window.scrollY;

        // Sticky Header styling
        if (header) {
            if (scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        }

        // Scroll-to-Top Button visibility
        if (scrollToTopBtn) {
            if (scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }
    };

    // Add scroll event listener for the effects
    window.addEventListener('scroll', handleScrollEffects);

    // --- Scroll-to-Top Button Click Handler ---
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Smooth scroll to top
            });
        });
    }

    // --- Smooth Scrolling for Internal Page Links ---
    // Select all links starting with '#' (anchor links)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Ensure it's not just a '#' link and the target element exists
            if (href.length > 1 && href.startsWith('#')) {
                const targetId = href.substring(1); // Get the ID without the '#'
                const targetElement = document.getElementById(targetId);

                // Check if the target element actually exists on the current page
                if (targetElement) {
                    e.preventDefault(); // Prevent the default jumpy scroll

                    // Calculate the position to scroll to, considering the fixed header height
                    const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                    const offsetPosition = elementPosition - headerHeight - 30; // Adjust offset as needed

                    // Perform the smooth scroll
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
                // If the target element doesn't exist (e.g., link points to an ID on another page),
                // let the browser handle the navigation normally (or it might do nothing if same page).
            }
        });
    });

}); // End of DOMContentLoaded
