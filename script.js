document.addEventListener('DOMContentLoaded', function() {
	const preloader = document.getElementById('preloader');
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
	const allLinks = document.querySelectorAll('a[href]');
	const faqItems = document.querySelectorAll('.faq-item');

	if (yearSpan) {
		yearSpan.textContent = new Date().getFullYear();
	} else {
		console.warn("Element with ID 'current-year' not found.");
	}

    if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
} 

	if (preloader) {
		window.addEventListener('load', () => {
			preloader.classList.add('hidden');
		});
	} else {
		console.warn("Element with ID 'preloader' not found.");
	}

	if (typeof AOS !== 'undefined') {
		AOS.init();
	} else {
		console.warn("AOS library not found. Animations will not initialize.");
	}

	const toggleMenu = (open) => {
		if (mobileMenu && menuOverlay && menuBtn) {
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
			link.addEventListener('click', () => toggleMenu(false));
		});
	} else {
		console.warn("Mobile menu buttons or containers not fully found. Menu toggle might not work.");
	}

	if (mainHeader) {
		const handleScroll = () => {
			if (mainHeader) {
				if (window.scrollY > 50) {
					mainHeader.classList.add('header-scrolled');
				} else {
					mainHeader.classList.remove('header-scrolled');
				}
			}
		};
		window.addEventListener('scroll', handleScroll);
		handleScroll();
	} else {
		console.warn("Element with ID 'main-header' not found. Scroll effect disabled.");
	}

	if (scrollToTopBtn) {
		const handleScrollToTopVisibility = () => {
			if (scrollToTopBtn) {
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
		handleScrollToTopVisibility();
	} else {
		console.warn("Element with ID 'scroll-to-top' not found. Button disabled.");
	}

	const defaultPageId = 'page-index';
	const pageMap = new Map();

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

	function getKeyByValue(map, value) {
		for (let [key, val] of map.entries()) {
			if (val === value) {
				return key;
			}
		}
		return undefined;
	}

	function showPage(pageId, targetElementId = null, pushState = true, isPopState = false) {
		console.log(`Attempting to show page: ${pageId}, target: ${targetElementId}`);

		let pageToShow = document.getElementById(pageId);
		if (!pageToShow) {
			console.warn(`Page with ID "${pageId}" not found. Attempting to show default page "${defaultPageId}".`);
			pageId = defaultPageId;
			pageToShow = document.getElementById(pageId);
			if (!pageToShow) {
				console.error(`FATAL: Default page with ID "${defaultPageId}" not found. Cannot display content.`);
				document.body.innerHTML = `<p style="color: red; padding: 20px;">Error: Could not load site content. Default page missing.</p>`;
				return;
			}
		}

		pages.forEach(p => {
			p.classList.remove('active');
			p.style.display = 'none';
		});

		pageToShow.style.display = 'block';
		setTimeout(() => {
			pageToShow.classList.add('active');
		}, 0);

		updateActiveNavLink(pageId);

		if (targetElementId) {
			const targetElement = document.getElementById(targetElementId);
			if (targetElement) {
				setTimeout(() => {
					try {
						const headerOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 60;
						const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
						const offsetPosition = elementPosition - headerOffset - 20;

						window.scrollTo({
							top: offsetPosition,
							behavior: 'smooth'
						});
					} catch (e) {
						console.error(`Error calculating scroll position for ${targetElementId}:`, e);
						window.scrollTo({ top: 0, behavior: 'smooth' });
					}
				}, 100);
			} else {
				console.warn(`Target element ID "${targetElementId}" not found on page "${pageId}". Scrolling to top of page.`);
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		} else if (!isPopState) {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}

		if (pushState) {
			const path = getKeyByValue(pageMap, pageId) || (pageId === defaultPageId ? '/' : '/' + pageId.replace('page-', ''));
			const fullPath = targetElementId ? `${path}#${targetElementId}` : path;
			const currentFullPath = window.location.pathname + window.location.hash;

			if (currentFullPath !== fullPath) {
				try {
				    history.pushState({ pageId: pageId, targetElementId: targetElementId }, '', fullPath);
				} catch (e) {
				    console.error("Error pushing state to history:", e);
				}
			}
		}

		if (typeof AOS !== 'undefined') {
			AOS.refresh();
		}
	}

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

	allLinks.forEach(link => {
		const href = link.getAttribute('href');

		if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || link.target === '_blank') {
			return;
		}

		try {
			const url = new URL(href, window.location.origin);
			const targetPageId = pageMap.get(url.pathname);
			const targetElementId = url.hash ? url.hash.substring(1) : null;

			if (targetPageId) {
				link.addEventListener('click', (event) => {
					event.preventDefault();
					if (document.getElementById(targetPageId)) {
						showPage(targetPageId, targetElementId, true);
					} else {
						console.error(`Link clicked for non-existent page ID: ${targetPageId}. Navigating to default.`);
						showPage(defaultPageId, null, true);
					}
					toggleMenu(false);
				});
			}
		} catch (e) {
			console.error(`Error processing link href "${href}":`, e);
		}
	});

	document.querySelectorAll('a[data-scroll-target]').forEach(link => {
		link.addEventListener('click', (event) => {
			event.preventDefault();
			const targetPageId = link.dataset.pageId;
			const targetElementId = link.dataset.scrollTarget;
			const currentPageElement = document.querySelector('.page.active');
			const currentPageId = currentPageElement ? currentPageElement.id : null;

			if (!targetElementId) {
				console.warn("Scroll target link clicked without a data-scroll-target value.", link);
				return;
			}

			if (targetPageId && targetPageId !== currentPageId) {
				if (document.getElementById(targetPageId)) {
					showPage(targetPageId, targetElementId, true);
				} else {
					console.error(`Scroll link targets non-existent page ID: ${targetPageId}. Navigating to default.`);
					showPage(defaultPageId, null, true);
				}
			} else if (currentPageId) {
				const targetElement = document.getElementById(targetElementId);
				if (targetElement) {
					const headerOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 60;
					const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
					const offsetPosition = elementPosition - headerOffset - 20;

					window.scrollTo({
						top: offsetPosition,
						behavior: 'smooth'
					});

					const path = getKeyByValue(pageMap, currentPageId) || (currentPageId === defaultPageId ? '/' : '/' + currentPageId.replace('page-', ''));
					const fullPath = `${path}#${targetElementId}`;
					const currentFullPath = window.location.pathname + window.location.hash;
					if (currentFullPath !== fullPath) {
						history.replaceState(history.state, '', fullPath);
					}
				} else {
					console.warn(`Scroll target element ID "${targetElementId}" not found on current page "${currentPageId}".`);
				}
			} else {
				console.error("Could not determine current page for scroll link.", link);
			}
			toggleMenu(false);
		});
	});

	window.addEventListener('popstate', (event) => {
		let pageIdToShow = defaultPageId;
		let targetElementId = null;

		if (event.state && event.state.pageId) {
			pageIdToShow = event.state.pageId;
			targetElementId = event.state.targetElementId;
		} else {
			const currentPath = window.location.pathname;
			const currentHash = window.location.hash ? window.location.hash.substring(1) : null;
			pageIdToShow = pageMap.get(currentPath) || defaultPageId;
			targetElementId = currentHash;
			console.log(`Popstate fallback: path=${currentPath}, hash=${currentHash} -> pageId=${pageIdToShow}`);
		}

		if (document.getElementById(pageIdToShow)) {
			showPage(pageIdToShow, targetElementId, false, true);
		} else {
			console.warn(`Popstate navigated to a non-existent page ID: ${pageIdToShow}. Showing default page.`);
			const defaultPath = getKeyByValue(pageMap, defaultPageId) || '/';
			history.replaceState({ pageId: defaultPageId }, '', defaultPath);
			showPage(defaultPageId, null, false, true);
		}
	});

	const initialPath = window.location.pathname;
	const initialHash = window.location.hash ? window.location.hash.substring(1) : null;
	let initialPageId = pageMap.get(initialPath) || defaultPageId;

	const confirmationPageId = 'page-confirmation';
	const isConfirmationRedirect = window.location.search.includes('submission_confirmed=true') || window.location.search.includes('ck_subscriber_id=');

	if (isConfirmationRedirect && pageMap.get('/confirmation')) {
	    initialPageId = confirmationPageId;
	    const confirmationPath = getKeyByValue(pageMap, confirmationPageId);
	    if (confirmationPath && window.location.pathname !== confirmationPath) {
	        history.replaceState({ pageId: confirmationPageId }, '', confirmationPath);
	        console.log("Corrected URL for confirmation page.");
	    } else {
			if (window.location.search) {
				history.replaceState({ pageId: confirmationPageId }, '', window.location.pathname);
			}
		}
	}

	if (document.getElementById(initialPageId)) {
		showPage(initialPageId, initialHash, false);
	} else {
		console.error(`Initial page ID "${initialPageId}" derived from URL "${initialPath}" does not exist. Showing default page "${defaultPageId}".`);
		const defaultPath = getKeyByValue(pageMap, defaultPageId) || '/';
		if (window.location.pathname !== defaultPath) {
			history.replaceState({ pageId: defaultPageId }, '', defaultPath);
		}
		showPage(defaultPageId, null, false);
	}

	if (faqItems.length > 0) {
		faqItems.forEach(item => {
			const summary = item.querySelector('summary');
		});
	}

});