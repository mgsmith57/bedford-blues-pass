import QrScanner from './qr-scanner.min.js';

(function() {
    const body = document.querySelector('body');
    const qr = new QRious({
        element: document.getElementById('qr-code'),
        size: 400,
    });

    const Cards = function() {
        function showCard(cardId) {
            const cards = document.getElementsByClassName('card');
            for (let i = 0; i < cards.length; i++) {
                const oldDisplay = cards[i].style.display;
                const newDisplay = cards[i].id === cardId ? 'block' : 'none';
                cards[i].style.display = cardId === cards[i].id ? 'block' : 'none';
                if (oldDisplay !== newDisplay) {
                    const eventName = 'card.' + (cardId === cards[i].id ? 'show' : 'hide');
                    cards[i].dispatchEvent(new Event(eventName));
                }
            }
        }

        const cardSelectors = document.querySelectorAll('[data-target]');
        for (let i = 0; i < cardSelectors.length; i++) {
            cardSelectors[i].addEventListener('click', (e) => {
                e.preventDefault();
                showCard(cardSelectors[i].getAttribute('data-target'));
            });
        }

        return { show: showCard };
    }();

    function initQrScanner() {
        QrScanner.WORKER_PATH = 'js/qr-scanner-worker.min.js';
        QrScanner.hasCamera().then(hasCamera => body.classList.toggle('has-camera', hasCamera));
        const scanner = new QrScanner(
            document.getElementById('qr-video'),
            result => setValueAndShow(result),
            error => {});
        //window.scanner = scanner;
        // document.getElementById('scan-region').appendChild(scanner.$canvas);

        function startCamera() {
            scanner.start().then(() => {
                scanner.hasFlash().then(hasFlash => {
                    body.classList.toggle('has-flash', hasFlash);
                });
            });
        }

        document.getElementById('flash-toggle').addEventListener('click', () => {
            scanner.toggleFlash().then(() => document.getElementById('flash-state').textContent = scanner.isFlashOn() ? 'On' : 'Off');
        });

        const scanCard = document.getElementById('settings-scan');
        scanCard.addEventListener('card.show', () => startCamera());
        scanCard.addEventListener('card.hide', () => scanner.stop());

        const fileSelector = document.getElementById('file-selector');
        fileSelector.addEventListener('change', event => {
            const file = fileSelector.files[0];
            if (file) {
                QrScanner.scanImage(file)
                    .then(result => setValueAndShow(result))
                    .catch(e => alert(e || 'No QR code found.'));
            }
        });
    }

    function initManualSubmitter() {
        document.getElementById('manual-submit').addEventListener('click', event => {
            setValueAndShow(document.getElementById('manual-input').value);
        });
    }

    function initNav() {
        const nav = document.querySelector('nav');
        const navIcon = document.querySelector('.nav-icon');
        const navLinks = document.querySelectorAll('nav a');

        function toggleNav() {
            if (nav.classList.contains('open')) {
                nav.classList.remove('open');
                navIcon.classList.remove('open');
            } else {
                nav.classList.add('open');
                navIcon.classList.add('open');
            }
        }

        navIcon.addEventListener('click', toggleNav);
        navLinks.forEach((it) => {
            it.addEventListener('click', (e) => {
                e.preventDefault();
                toggleNav();
            });
        });
    }

    function init() {
        const value = window.localStorage.getItem('ticket');
        body.classList.toggle('has-ticket', value != null && value !== '');
        setValueAndShow(value);
        Cards.show('ticket');
    }

    function setValue(value) {
        if (!value || value === '') {
            return;
        }
        window.localStorage.setItem('ticket', value);
        document.getElementById('qr-result').innerHTML = value;
        qr.set({
            foreground: '#002859',
            size: 400,
            level: "Q",
            value: value
        });
    }

    function setValueAndShow(value) {
        setValue(value);
        Cards.show('ticket');
    }

    initNav();
    initQrScanner();
    initManualSubmitter();
    init();
})();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then(res => console.log('Service worker registered'))
            .catch(err => console.log('Service worker not registered', err))
    })
}
