(function () {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const menuOverlay = document.getElementById('menuOverlay');

    if (!menuToggle || !mainNav || !menuOverlay) {
        return;
    }

    function setMenuState(opened) {
        menuToggle.classList.toggle('is-open', opened);
        mainNav.classList.toggle('is-open', opened);
        menuOverlay.classList.toggle('is-open', opened);
        document.body.classList.toggle('menu-open', opened);
        menuToggle.setAttribute('aria-expanded', String(opened));
    }

    menuToggle.addEventListener('click', () => {
        const isOpened = !mainNav.classList.contains('is-open');
        setMenuState(isOpened);
    });

    menuOverlay.addEventListener('click', () => setMenuState(false));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            setMenuState(false);
        }
    });

    mainNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setMenuState(false));
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1100) {
            setMenuState(false);
        }
    });
})();
