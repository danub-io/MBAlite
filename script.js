document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const preloader = document.getElementById('preloader');
    const header = document.getElementById('main-header');
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const mobileMenuLinks = document.querySelectorAll('#mobile-menu a[data-page-id]');
    const currentYearSpan = document.getElementById('current-year');
    const mainNavLinks = document.querySelectorAll('#main-nav a.nav-link'); // Desktop nav links only
    const allPages = document.querySelectorAll('.page');
    const headerHeight = 75; // Match CSS variable

    // --- Page Routing Map ---
    // Maps URL paths to the corresponding page div IDs
    const pageRoutes = {
        '/': 'page-index',
        '/publicacoes': 'page-publications',
        '/instructor': 'page-instructor',
        '/faq': 'page-faq'
        // Add other top-level pages here if needed
    };

    // --- Preloader ---
    // Hides the preloader and initializes AOS after the window loads
    window.addEventListener('load', () => {
        if(preloader) {
            preloader.classList.add('hidden');
        }
        // Initialize Animate On Scroll (AOS) library
        AOS.init({
            duration: 600, // Animation duration
            once: true, // Whether animation should happen only once
            offset: 80, // Offset (in px) from the original trigger point
            easing: 'ease-out-quad', // Default easing for AOS animations
        });
        // Handle the initial route based on the URL when the page loads
        handleRouteChange();
    });

    // --- Mobile Menu Toggle ---
    // Function to open the mobile menu
    const openMenu = () => {
        if (!mobileMenu || !menuOverlay) return; // Exit if elements don't exist
        mobileMenu.classList.remove('hidden', '-translate-x-full'); // Make visible and slide in
        mobileMenu.classList.add('translate-x-0');
        menuOverlay.classList.remove('hidden'); // Show the overlay
        document.body.style.overflow = 'hidden'; // Prevent scrolling the body
    };
    // Function to close the mobile menu
    const closeMenu = () => {
        if (!mobileMenu || !menuOverlay) return; // Exit if elements don't exist
        mobileMenu.classList.remove('translate-x-0'); // Slide out
        mobileMenu.classList.add('-translate-x-full');
        menuOverlay.classList.add('hidden'); // Hide the overlay
        setTimeout(() => {
            // Ensure menu is fully hidden after transition for accessibility
            if (mobileMenu.classList.contains('-translate-x-full')) {
                mobileMenu.classList.add('hidden');
            }
        }, 300); // Match transition duration (0.3s)
        document.body.style.overflow = ''; // Restore body scroll
    };

    // Hamburger button toggles the menu open/close
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            // Check if the menu is currently open
            if (mobileMenu && !mobileMenu.classList.contains('-translate-x-full') && !mobileMenu.classList.contains('hidden')) {
                closeMenu(); // If open, close it
            } else {
                openMenu(); // Otherwise, open it
            }
        });
    }

    // Close button closes the menu
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    // Clicking the overlay closes the menu
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);
    // Clicking a link in the mobile menu navigates and closes the menu
    mobileMenuLinks.forEach(link => link.addEventListener('click', (e) => {
        handleNavLinkClick(e, link); // Handle navigation
        closeMenu(); // Close menu
    }));

    // --- Footer Year ---
    // Dynamically sets the current year in the footer
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Sticky Header & Scroll-to-Top Button ---
    // Handles visual changes based on scroll position
    const handleScroll = () => {
        const scrollY = window.scrollY;
        // Add/remove scrolled class to header for styling
        if (header) {
            if (scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        }
        // Show/hide the scroll-to-top button
        if (scrollToTopBtn) {
            if (scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }
        // Update the active navigation link based on scroll position
        updateActiveNavLink();
    };
    window.addEventListener('scroll', handleScroll);

    // --- Scroll-to-Top Click Handler ---
    // Smoothly scrolls the page to the top when the button is clicked
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- SPA Navigation Logic ---

    /**
     * Shows the target page div and hides others. Scrolls to a target element if specified.
     * @param {string} targetPageId - The ID of the page div to show (e.g., 'page-index').
     * @param {string|null} [scrollTargetId=null] - The ID of the element to scroll to within the page.
     */
    function showPage(targetPageId, scrollTargetId = null) {
        let pageFound = false;
        // Hide all pages first, then show the target page
        allPages.forEach(page => {
            if (page.id === targetPageId) {
                page.style.display = 'block';
                // Use setTimeout to ensure 'display: block' applies before adding 'active' class for animation
                setTimeout(() => page.classList.add('active'), 10);
                pageFound = true;
            } else {
                page.style.display = 'none';
                page.classList.remove('active');
            }
        });

        // Fallback to index page if the target page ID is not found
        if (!pageFound) {
            console.warn(`Page ${targetPageId} not found. Showing index.`);
            targetPageId = 'page-index';
            const indexPage = document.getElementById(targetPageId);
            if (indexPage) {
                indexPage.style.display = 'block';
                setTimeout(() => indexPage.classList.add('active'), 10);
            } else {
                console.error("Index page not found!");
                return; // Stop if even the index page doesn't exist
            }
        }

        // Optional: Add the active page ID as a class to the body for page-specific styling
        document.body.className = `bg-bg-main text-text-body ${targetPageId}`;

        // Scroll to the target element within the page
        if (scrollTargetId) {
            const scrollElement = document.getElementById(scrollTargetId);
            if (scrollElement) {
                // Use setTimeout to ensure the element is visible and layout is calculated before scrolling
                setTimeout(() => {
                    const offset = headerHeight + 30; // Calculate offset considering the fixed header
                    const elementPosition = scrollElement.getBoundingClientRect().top + window.scrollY;
                    const offsetPosition = elementPosition - offset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    updateActiveNavLink(); // Update nav link highlighting after scroll attempt
                }, 100); // Delay might need adjustment based on page complexity
            } else {
                // Warn if scroll target not found and scroll to top instead
                console.warn(`Scroll target #${scrollTargetId} not found on page ${targetPageId}. Scrolling to top.`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                updateActiveNavLink();
            }
        } else {
            // If no scroll target, scroll to the top of the page,
            // unless it's the initial load and there's already a hash in the URL.
            if (!window.location.hash || scrollTargetId === null) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            updateActiveNavLink();
        }

        // Refresh AOS animations for the newly displayed content
         if (typeof AOS !== 'undefined') {
             // Use refreshHard to re-evaluate all elements on the new page
             setTimeout(() => AOS.refreshHard(), 150);
         }
    }

    /**
     * Handles clicks on navigation links, updating the browser history and showing the correct page.
     * @param {Event} event - The click event.
     * @param {HTMLAnchorElement} link - The clicked link element.
     */
    function handleNavLinkClick(event, link) {
        const href = link.getAttribute('href');
        const targetPageId = link.dataset.pageId; // Page ID defined in data-page-id
        const internalTargetId = link.dataset.internalTarget; // For links navigating within the hidden #page-content
        let scrollTargetId = link.dataset.scrollTarget || null; // Scroll target from data-scroll-target

        // Prioritize hash in href for scrolling, if present
        if (href && href.includes('#')) {
            const hashPart = href.substring(href.indexOf('#') + 1);
            if (hashPart) {
                scrollTargetId = hashPart;
            }
        }

        // --- Handle Internal Navigation (e.g., Modules -> Content Page) ---
        // These links show a specific hidden page (#page-content) and scroll, but don't change the URL path.
        if (internalTargetId) {
            event.preventDefault();
            showPage(internalTargetId, scrollTargetId);
            return; // Stop further processing
        }

        // --- Handle Standard Page Navigation (using URL paths) ---
        // Checks if the link starts with '/' (relative path) or the site's origin (absolute path)
        // and has a targetPageId defined.
        if (href && (href.startsWith('/') || href.startsWith(window.location.origin + '/')) && targetPageId) {
            event.preventDefault(); // Prevent the browser's default link navigation

            // Construct the target URL path and hash
            const targetPath = new URL(href, window.location.origin).pathname;
            const targetHref = targetPath + (scrollTargetId ? `#${scrollTargetId}` : '');

            // Update the browser's history and URL bar without a full page reload
            history.pushState({ pageId: targetPageId, scrollTarget: scrollTargetId }, '', targetHref);

            // Trigger the function to show the correct page based on the new URL/state
            handleRouteChange();
        }
        // --- Handle Internal Page Scroll Links (e.g., #contact on /instructor page) ---
        // Checks if the href is just a hash (#)
        else if (href && href.startsWith('#')) {
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            const activePage = document.querySelector('.page.active'); // Find the currently visible page

            // Check if the target element exists within the currently active page
            if (targetElement && activePage && activePage.contains(targetElement)) {
                event.preventDefault(); // Prevent the default jumpy scroll

                // Calculate scroll position with offset for the fixed header
                const offset = headerHeight + 30;
                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - offset;

                // Perform smooth scroll
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Update the URL hash silently (replaceState doesn't trigger popstate)
                history.replaceState(history.state, '', window.location.pathname + href);
                updateActiveNavLink(); // Update nav highlighting immediately
            }
            // Note: If the hash link points to an element on a *different* page,
            // the standard page navigation logic above should handle it if data-page-id is set.
        }
        // Allow default behavior for external links or links not handled above
    }

    /**
     * Reads the current URL path and hash, determines the correct page and scroll target,
     * and calls showPage(). This is used on initial load and for popstate events (back/forward).
     */
    function handleRouteChange() {
        const path = window.location.pathname;
        const hash = window.location.hash.substring(1); // Get ID from hash (e.g., #modules -> modules)

        // Determine the target page ID based on the path from the routes map
        let targetPageId = pageRoutes[path] || 'page-index'; // Default to index if path isn't in the map
        // Set the initial scroll target based on the hash
        let scrollTargetId = hash || null;

        // Special case: If the path is the root ('/') but there's a hash, assume it's for the index page
        if (path === '/' && hash) {
            targetPageId = 'page-index';
            scrollTargetId = hash;
        }

        // Check if the history state object (from pushState) has more specific info
        // This is useful for handling back/forward navigation correctly
         if (history.state && history.state.pageId) {
             targetPageId = history.state.pageId;
             // Use scrollTarget from state if available, otherwise stick with the hash
             scrollTargetId = history.state.scrollTarget !== undefined ? history.state.scrollTarget : scrollTargetId;
         }

        console.log(`Routing: Path=${path}, Hash=${hash}, TargetPage=${targetPageId}, ScrollTarget=${scrollTargetId}`);
        // Show the determined page and scroll if necessary
        showPage(targetPageId, scrollTargetId);
    }

    // Add click listeners to all relevant navigation links
    document.querySelectorAll('a[data-page-id], a[data-internal-target], a[href^="#"]').forEach(link => {
         // Exclude external links (target="_blank") or links to different protocols/domains
         if (link.getAttribute('target') === '_blank' || (link.protocol !== window.location.protocol && !link.href.startsWith('/'))) {
             return; // Skip adding the SPA listener
         }
         link.addEventListener('click', (e) => handleNavLinkClick(e, link));
    });


    // Listen for browser back/forward button clicks
    window.addEventListener('popstate', (event) => {
        console.log("Popstate triggered", event.state);
        // Re-run the routing logic when the history state changes
        handleRouteChange();
    });

    // --- Active Nav Link Highlighting ---
    // Updates the visual highlighting of the active link in the header/mobile menu
    function updateActiveNavLink() {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash.substring(1);
        // Determine the active page ID based on the current URL path
        const activePageId = pageRoutes[currentPath] || 'page-index';

        let currentSectionId = ''; // Will store the ID of the section currently in view
        const scrollY = window.scrollY;
        const offset = headerHeight + 50; // Offset for activation point

        const activePageElement = document.getElementById(activePageId);
        if (!activePageElement) return; // Exit if the active page element isn't found

        let foundSection = false;
        // Iterate through scroll target sections within the active page
        activePageElement.querySelectorAll('.scroll-target').forEach(section => {
            if (foundSection) return; // Stop checking once a section is found
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            // Check if the top of the section is within the activation offset range
            if (scrollY >= sectionTop - offset && scrollY < sectionTop + sectionHeight - offset) {
                currentSectionId = section.id;
                foundSection = true;
            }
        });

        // If no section is actively scrolled into view, check hash or default to top section
         if (!foundSection) {
             if (currentHash && document.getElementById(currentHash)) {
                 // Prioritize the hash in the URL if it exists and corresponds to an element
                 currentSectionId = currentHash;
             } else if (scrollY < offset * 2) { // Check if near the very top of the page
                 // Default to the primary 'hero' section of the current page if near the top
                 if (activePageId === 'page-index') currentSectionId = 'hero';
                 else if (activePageId === 'page-instructor') currentSectionId = 'home';
                 else if (activePageId === 'page-publications') currentSectionId = 'publications-hero';
                 // Add other page top sections if needed
             }
         }

        // Helper function to add/remove 'active' class from links
        const updateLinks = (links) => {
            links.forEach(link => {
                link.classList.remove('active'); // Reset all links first
                const linkPageId = link.dataset.pageId;
                const linkScrollTarget = link.dataset.scrollTarget;
                const linkPath = link.pathname; // Get the path the link points to

                // Normalize paths (remove trailing slash if not root) for accurate comparison
                const normalizedCurrentPath = currentPath.endsWith('/') && currentPath.length > 1 ? currentPath.slice(0, -1) : currentPath;
                const normalizedLinkPath = linkPath.endsWith('/') && linkPath.length > 1 ? linkPath.slice(0, -1) : linkPath;

                // Check if the link points to the currently active page path
                if (normalizedLinkPath === normalizedCurrentPath && linkPageId === activePageId) {
                     // If the link also has a scroll target, activate it if it matches the current section
                     if (linkScrollTarget && linkScrollTarget === currentSectionId) {
                         link.classList.add('active');
                     }
                     // If the link points to the page generally (no specific scroll target)
                     else if (!linkScrollTarget) {
                         // Activate based on the default top section for specific pages, or just by being on the page (FAQ)
                         if ((linkPageId === 'page-index' && currentSectionId === 'hero') ||
                             (linkPageId === 'page-instructor' && currentSectionId === 'home') ||
                             (linkPageId === 'page-publications' && currentSectionId === 'publications-hero') ||
                             (linkPageId === 'page-faq')) // FAQ link active if on FAQ page
                         {
                             link.classList.add('active');
                         }
                     }
                }
            });
        };

        // Update both desktop and mobile navigation links
        updateLinks(mainNavLinks);
        updateLinks(mobileMenuLinks);
    }


    // --- Initial Page Load Trigger ---
    // handleRouteChange is called within the window.onload listener above

    // --- Server Configuration Note ---
    // IMPORTANT: For the URL routing (e.g., /publicacoes) to work correctly when
    // a user directly accesses the URL, your web server (Apache, Nginx, Netlify, Vercel, etc.)
    // must be configured to serve the main index.html file for all defined routes
    // (/, /publicacoes, /instructor, /faq). This is often called "history mode" routing
    // or requires specific rewrite rules. The JavaScript handles the client-side routing
    // once the index.html is loaded.

});




