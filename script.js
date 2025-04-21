document.addEventListener('DOMContentLoaded', function() {
	// --- Element Selection ---
	const preloader = document.getElementById('preloader');
	const menuBtn = document.getElementById('menu-btn');
	const closeMenuBtn = document.getElementById('close-menu-btn');
	const mobileMenu = document.getElementById('mobile-menu');
	const menuOverlay = document.getElementById('menu-overlay');
	const mainHeader = document.getElementById('main-header');
	const scrollToTopBtn = document.getElementById('scroll-to-top');
	const navLinks = document.querySelectorAll('#main-nav a'); // More specific selector
	const mobileMenuLinks = document.querySelectorAll('#mobile-menu nav a');
	const pages = document.querySelectorAll('.page'); // Used to hide all pages
	const yearSpan = document.getElementById('current-year');
	const allLinks = document.querySelectorAll('a[href]'); // Used for SPA routing setup
	const faqItems = document.querySelectorAll('.faq-item'); // For FAQ logic

	// --- Initial Setup ---

	// Update current year
	if (yearSpan) {
		yearSpan.textContent = new Date().getFullYear();
	} else {
		console.warn("Element with ID 'current-year' not found.");
	}

	// Preloader Hiding
	if (preloader) {
		window.addEventListener('load', () => {
			preloader.classList.add('hidden');
		});
	} else {
		console.warn("Element with ID 'preloader' not found.");
	}

	// AOS Initialization (Assumes AOS library is loaded)
	if (typeof AOS !== 'undefined') {
		AOS.init();
	} else {
		console.warn("AOS library not found. Animations will not initialize.");
	}

	// --- Mobile Menu Logic ---
	const toggleMenu = (open) => {
		if (mobileMenu && menuOverlay && menuBtn) { // Check all required elements
			if (open) {
				mobileMenu.classList.remove('hidden-menu');
				menuOverlay.classList.remove('hidden');
				document.body.style.overflow = 'hidden'; // Prevent scrolling
				menuBtn.setAttribute('aria-expanded', 'true');
			} else {
				mobileMenu.classList.add('hidden-menu');
				menuOverlay.classList.add('hidden');
				document.body.style.overflow = ''; // Restore scrolling
				menuBtn.setAttribute('aria-expanded', 'false');
			}
		} else {
			console.warn("One or more mobile menu elements (menuBtn, mobileMenu, menuOverlay) not found.");
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
			link.addEventListener('click', () => toggleMenu(false)); // Close menu on link click
		});
	} else {
		console.warn("Mobile menu buttons or containers not fully found. Menu toggle might not work.");
	}

	// --- Header Scroll Effect ---
	if (mainHeader) {
		const handleScroll = () => {
			// Check mainHeader again inside closure, just in case
			if (mainHeader) {
				if (window.scrollY > 50) {
					mainHeader.classList.add('header-scrolled');
				} else {
					mainHeader.classList.remove('header-scrolled');
				}
			}
		};
		window.addEventListener('scroll', handleScroll);
		handleScroll(); // Initial check
	} else {
		console.warn("Element with ID 'main-header' not found. Scroll effect disabled.");
	}

	// --- Scroll to Top Button Logic ---
	if (scrollToTopBtn) {
		const handleScrollToTopVisibility = () => {
			if (scrollToTopBtn) { // Check again inside closure
				if (window.scrollY > 300) {
					scrollToTopBtn.classList.add('visible');
				} else {
					scrollToTopBtn.classList.remove('visible');
				}
			}
		};

		window.addEventListener('scroll', handleScrollToTopVisibility);
		scrollToTopBtn.addEventListener('click', () => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
		handleScrollToTopVisibility(); // Initial check
	} else {
		console.warn("Element with ID 'scroll-to-top' not found. Button disabled.");
	}

	// --- Single Page Application (SPA) Navigation ---

	const defaultPageId = 'page-index'; // Your default page ID
	const pageMap = new Map(); // Map URL path to page ID

	// Populate pageMap based on page IDs found in the DOM
	pages.forEach(page => {
		if (page.id) {
			let path;
			switch (page.id) {
				case 'page-index': path = '/'; break;
				case 'page-content': path = '/conteudo'; break;
				case 'page-publications': path = '/publicacoes'; break;
				case 'page-autor': path = '/autor'; break;
				case 'page-faq': path = '/faq'; break;
				case 'page-confirmation': path = '/confirmation'; break;
				default: path = null; console.warn(`Page ID "${page.id}" not mapped to a known path.`);
			}
			if (path) {
				pageMap.set(path, page.id);
			}
		} else {
			console.warn("Found a .page element without an ID.", page);
		}
	});

	// Helper to get path (key) from pageId (value) in pageMap
	function getKeyByValue(map, value) {
		for (let [key, val] of map.entries()) {
			if (val === value) {
				return key;
			}
		}
		return undefined; // Return undefined if not found
	}

	// Function to display a specific page and update history/URL
	function showPage(pageId, targetElementId = null, pushState = true, isPopState = false) {
		console.log(`Attempting to show page: ${pageId}, target: ${targetElementId}`); // Debugging line

		// Ensure the target page exists before proceeding
		let pageToShow = document.getElementById(pageId);
		if (!pageToShow) {
			console.warn(`Page with ID "${pageId}" not found. Attempting to show default page "${defaultPageId}".`);
			pageId = defaultPageId;
			pageToShow = document.getElementById(pageId);
			// If default page also doesn't exist, something is very wrong
			if (!pageToShow) {
				console.error(`FATAL: Default page with ID "${defaultPageId}" not found. Cannot display content.`);
				// Optionally, display an error message directly in the body
				document.body.innerHTML = `<p style="color: red; padding: 20px;">Error: Could not load site content. Default page missing.</p>`;
				return; // Stop execution for this function
			}
		}

		// Hide all pages first
		pages.forEach(p => {
			p.classList.remove('active');
			p.style.display = 'none'; // Ensure it's hidden via style
		});

		// Show the target page (we already verified pageToShow exists)
		pageToShow.style.display = 'block'; // Make it visible
		setTimeout(() => {
			pageToShow.classList.add('active'); // Add class for potential CSS animations
		}, 0); // Timeout ensures display:block renders first

		updateActiveNavLink(pageId); // Update navigation highlights

		// Scroll logic: Only scroll if needed
		if (targetElementId) {
			const targetElement = document.getElementById(targetElementId);
			if (targetElement) {
				setTimeout(() => { // Allow page content to potentially reflow
					try {
						const headerOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 60;
						const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
						const offsetPosition = elementPosition - headerOffset - 20; // 20px extra padding

						window.scrollTo({
							top: offsetPosition,
							behavior: 'smooth'
						});
					} catch (e) {
						console.error(`Error calculating scroll position for ${targetElementId}:`, e);
						// Fallback scroll to top of page if calculation fails
						window.scrollTo({ top: 0, behavior: 'smooth' });
					}
				}, 100); // Delay might need adjustment based on content complexity
			} else {
				console.warn(`Target element ID "${targetElementId}" not found on page "${pageId}". Scrolling to top of page.`);
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		} else if (!isPopState) {
			// Scroll to top only on direct navigation, not on back/forward
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}

		// Update browser history and URL if required
		if (pushState) {
			const path = getKeyByValue(pageMap, pageId) || (pageId === defaultPageId ? '/' : '/' + pageId.replace('page-', '')); // Fallback path generation
			const fullPath = targetElementId ? `${path}#${targetElementId}` : path;
			const currentFullPath = window.location.pathname + window.location.hash;

			// Avoid pushing the exact same state onto the history stack
			if (currentFullPath !== fullPath) {
				try {
				    history.pushState({ pageId: pageId, targetElementId: targetElementId }, '', fullPath);
				} catch (e) {
				    console.error("Error pushing state to history:", e);
				}
			}
		}

		// Re-initialize AOS for the newly displayed page content
		if (typeof AOS !== 'undefined') {
			AOS.refresh();
		}
	}

	// Function to update the active state of navigation links
	function updateActiveNavLink(activePageId) {
		const linksToUpdate = [...navLinks, ...mobileMenuLinks];
		linksToUpdate.forEach(link => {
			if (link.dataset.pageId === activePageId) {
				link.classList.add('active');
			} else {
				link.classList.remove('active');
			}
		});
	}

	// --- Event Listeners for Navigation ---

	// Handle internal link clicks (<a> tags with href managed by SPA)
	allLinks.forEach(link => {
		const href = link.getAttribute('href');

		// Basic check to skip external links, mailto, tel, anchors, or blank targets
		if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || link.target === '_blank') {
			return; // Let the browser handle these normally
		}

		try {
			const url = new URL(href, window.location.origin);
			const targetPageId = pageMap.get(url.pathname);
			const targetElementId = url.hash ? url.hash.substring(1) : null; // Get ID from hash (#)

			// If the path maps to a known page ID in our SPA
			if (targetPageId) {
				link.addEventListener('click', (event) => {
					event.preventDefault(); // Prevent default browser navigation
					if (document.getElementById(targetPageId)) { // Check if target page exists before showing
						showPage(targetPageId, targetElementId, true);
					} else {
						console.error(`Link clicked for non-existent page ID: ${targetPageId}. Navigating to default.`);
						showPage(defaultPageId, null, true); // Navigate to default page instead
					}
					toggleMenu(false); // Close mobile menu if open
				});
			}
			// Else: Let the browser handle links not mapped in pageMap (could be external or unmanaged pages)
		} catch (e) {
			console.error(`Error processing link href "${href}":`, e);
			// Let the browser attempt to handle the link if URL parsing failed
		}
	});

	// Handle scroll target link clicks (<a> tags with data-scroll-target)
	document.querySelectorAll('a[data-scroll-target]').forEach(link => {
		link.addEventListener('click', (event) => {
			event.preventDefault();
			const targetPageId = link.dataset.pageId;
			const targetElementId = link.dataset.scrollTarget;
			const currentPageElement = document.querySelector('.page.active');
			const currentPageId = currentPageElement ? currentPageElement.id : null;

			if (!targetElementId) {
				console.warn("Scroll target link clicked without a data-scroll-target value.", link);
				return; // No target element to scroll to
			}

			if (targetPageId && targetPageId !== currentPageId) {
				// Navigate to a different page AND scroll
				if (document.getElementById(targetPageId)) {
					showPage(targetPageId, targetElementId, true);
				} else {
					console.error(`Scroll link targets non-existent page ID: ${targetPageId}. Navigating to default.`);
					showPage(defaultPageId, null, true);
				}
			} else if (currentPageId) {
				// Scroll within the current page (or stay on page if targetPageId matches currentPageId)
				const targetElement = document.getElementById(targetElementId);
				if (targetElement) {
					const headerOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 60;
					const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
					const offsetPosition = elementPosition - headerOffset - 20;

					window.scrollTo({
						top: offsetPosition,
						behavior: 'smooth'
					});

					// Update URL hash without adding a new history entry
					const path = getKeyByValue(pageMap, currentPageId) || (currentPageId === defaultPageId ? '/' : '/' + currentPageId.replace('page-', ''));
					const fullPath = `${path}#${targetElementId}`;
					const currentFullPath = window.location.pathname + window.location.hash;
					if (currentFullPath !== fullPath) {
						history.replaceState(history.state, '', fullPath); // Use replaceState for same-page hash changes
					}
				} else {
					console.warn(`Scroll target element ID "${targetElementId}" not found on current page "${currentPageId}".`);
					// Optionally scroll to top? window.scrollTo({ top: 0, behavior: 'smooth' });
				}
			} else {
				console.error("Could not determine current page for scroll link.", link);
			}
			toggleMenu(false); // Close mobile menu if open
		});
	});

	// Handle browser back/forward button clicks
	window.addEventListener('popstate', (event) => {
		let pageIdToShow = defaultPageId;
		let targetElementId = null;

		if (event.state && event.state.pageId) {
			pageIdToShow = event.state.pageId;
			targetElementId = event.state.targetElementId; // Restore target element if saved in state
		} else {
			// Fallback: Determine page from current URL if no state is present
			const currentPath = window.location.pathname;
			const currentHash = window.location.hash ? window.location.hash.substring(1) : null;
			pageIdToShow = pageMap.get(currentPath) || defaultPageId;
			targetElementId = currentHash;
			console.log(`Popstate fallback: path=${currentPath}, hash=${currentHash} -> pageId=${pageIdToShow}`); // Debugging
		}

		// Ensure the page determined from state or URL actually exists
		if (document.getElementById(pageIdToShow)) {
			showPage(pageIdToShow, targetElementId, false, true); // Show page, don't push state, indicate popstate
		} else {
			console.warn(`Popstate navigated to a non-existent page ID: ${pageIdToShow}. Showing default page.`);
			// Update the URL to reflect the default page without adding history
			const defaultPath = getKeyByValue(pageMap, defaultPageId) || '/';
			history.replaceState({ pageId: defaultPageId }, '', defaultPath);
			// Show the default page
			showPage(defaultPageId, null, false, true);
		}
	});


	// --- Initial Page Load ---
	const initialPath = window.location.pathname;
	const initialHash = window.location.hash ? window.location.hash.substring(1) : null;
	let initialPageId = pageMap.get(initialPath) || defaultPageId;

	// Special handling for confirmation page based on URL parameters (e.g., from ConvertKit)
	const confirmationPageId = 'page-confirmation';
	const isConfirmationRedirect = window.location.search.includes('submission_confirmed=true') || window.location.search.includes('ck_subscriber_id=');

	if (isConfirmationRedirect && pageMap.get('/confirmation')) { // Check if confirmation path is mapped
	    initialPageId = confirmationPageId;
	    const confirmationPath = getKeyByValue(pageMap, confirmationPageId);
	    // Use replaceState to clean the URL (remove query params) and show the correct path
	    if (confirmationPath && window.location.pathname !== confirmationPath) {
	        history.replaceState({ pageId: confirmationPageId }, '', confirmationPath);
	        console.log("Corrected URL for confirmation page.");
	    } else {
			// If already on the correct path, clear query params if needed
			if (window.location.search) {
				history.replaceState({ pageId: confirmationPageId }, '', window.location.pathname);
			}
		}
	}

	// Final check: Ensure the determined initial page exists before showing it
	if (document.getElementById(initialPageId)) {
		showPage(initialPageId, initialHash, false); // Show initial page, don't push state
	} else {
		console.error(`Initial page ID "${initialPageId}" derived from URL "${initialPath}" does not exist. Showing default page "${defaultPageId}".`);
		// Update URL to default if the derived one was invalid
		const defaultPath = getKeyByValue(pageMap, defaultPageId) || '/';
		if (window.location.pathname !== defaultPath) {
			history.replaceState({ pageId: defaultPageId }, '', defaultPath);
		}
		// Show the actual default page (assuming it exists)
		showPage(defaultPageId, null, false);
	}


	// --- FAQ Accordion --- (No major error handling needed here, typically safe)
	if (faqItems.length > 0) {
		faqItems.forEach(item => {
			const summary = item.querySelector('summary');
			// Optional: Add event listener logic if needed (e.g., for single-open behavior)
			// if(summary) { ... }
		});
	} else {
		// console.info("No FAQ items found with class '.faq-item'."); // Optional info message
	}

}); // End DOMContentLoaded