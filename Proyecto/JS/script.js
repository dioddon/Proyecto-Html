/**
 * SCRIPT GENERAL - PROYECTO WEB INTERACTIVO
 * Incluye todas las funcionalidades requeridas:
 * 1. Validación de formularios
 * 2. Manejo del DOM
 * 3. Funcionalidades dinámicas:
 *    - Lista dinámica
 *    - Carrusel de imágenes
 *    - Galería interactiva
 *    - Modo oscuro/claro
 *    - Calculadora simple
 */

// ===== CONSTANTES GLOBALES =====
const COLOR_PALETTE = {
    primary: ['#2D00F7', '#6A00F4', '#8900F2', '#A100F2', '#B100E8'],
    secondary: ['#BC00DD', '#D100D1', '#DB00B6', '#E500A4', '#F20089']
};

// ===== MÓDULO 1: VALIDACIÓN DE FORMULARIOS =====
const FormValidator = {
    /**
     * Valida un campo de texto (no vacío, longitud mínima/máxima)
     */
    validateText(input, minLength = 1, maxLength = 100) {
        const value = input.value.trim();
        const isValid = value.length >= minLength && value.length <= maxLength;

        this.showValidation(input, isValid,
            `Debe tener entre ${minLength} y ${maxLength} caracteres`);

        return isValid;
    },

    /**
     * Valida un campo de email
     */
    validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(input.value.trim());

        this.showValidation(input, isValid, 'Correo electrónico inválido');

        return isValid;
    },

    /**
     * Valida un campo numérico (rango)
     */
    validateNumber(input, min = 0, max = 100) {
        const value = parseInt(input.value);
        const isValid = !isNaN(value) && value >= min && value <= max;

        this.showValidation(input, isValid, `Debe ser un número entre ${min} y ${max}`);

        return isValid;
    },

    /**
     * Muestra u oculta mensajes de validación
     */
    showValidation(input, isValid, errorMessage) {
        const formGroup = input.closest('.form-group') || input.parentElement;
        let errorElement = formGroup.querySelector('.error-message');

        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }

        if (isValid) {
            input.classList.remove('error');
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        } else {
            input.classList.add('error');
            errorElement.classList.add('show');
            errorElement.textContent = errorMessage;
        }
    },

    /**
     * Valida un formulario completo
     */
    validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;

        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let allValid = true;

        inputs.forEach(input => {
            let isValid = false;

            switch (input.type) {
                case 'email':
                    isValid = this.validateEmail(input);
                    break;
                case 'number':
                    isValid = this.validateNumber(input);
                    break;
                default:
                    isValid = this.validateText(input, input.dataset.min || 1, input.dataset.max || 100);
            }

            if (!isValid) allValid = false;
        });

        return allValid;
    }
};

// ===== MÓDULO 2: MANEJO DEL DOM =====
const DOMManager = {
    /**
     * Crea un elemento HTML con atributos y contenido
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);

        // Agregar atributos
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'dataset') {
                Object.assign(element.dataset, attributes[key]);
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });

        // Agregar contenido (puede ser texto o elementos HTML)
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (Array.isArray(content)) {
            content.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else {
                    element.appendChild(child);
                }
            });
        } else if (content) {
            element.appendChild(content);
        }

        return element;
    },

    /**
     * Muestra u oculta un elemento con animación
     */
    toggleElement(elementId, show = true, animation = 'fade') {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (show) {
            element.style.display = 'block';
            element.classList.add(`animate-${animation}`);
            setTimeout(() => {
                element.classList.remove(`animate-${animation}`);
            }, 300);
        } else {
            element.classList.add(`animate-${animation}-out`);
            setTimeout(() => {
                element.style.display = 'none';
                element.classList.remove(`animate-${animation}-out`);
            }, 300);
        }
    },

    /**
     * Actualiza el contenido de un elemento
     */
    updateContent(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = content;
        }
    },

    /**
     * Agrega o remueve clases de un elemento
     */
    toggleClass(elementId, className, force = null) {
        const element = document.getElementById(elementId);
        if (element) {
            if (force === null) {
                element.classList.toggle(className);
            } else {
                element.classList.toggle(className, force);
            }
        }
    },

    /**
     * Agrega un listener de evento a un elemento
     */
    addListener(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
        }
    }
};

// ===== MÓDULO 3: LISTA DINÁMICA =====
const DynamicList = {
    items: [],
    containerId: 'lista-dinamica',
    emptyMessageId: 'lista-vacia-msg',

    /**
     * Inicializa la lista dinámica
     */
    init(containerId = 'lista-dinamica') {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.emptyMessage = document.getElementById(this.emptyMessageId);

        if (!this.container) return;

        // Cargar items del localStorage si existen
        const savedItems = localStorage.getItem('dynamicListItems');
        if (savedItems) {
            this.items = JSON.parse(savedItems);
            this.render();
        }
    },

    /**
     * Agrega un nuevo item a la lista
     */
    addItem(itemData) {
        const newItem = {
            id: Date.now(),
            ...itemData,
            createdAt: new Date().toISOString()
        };

        this.items.unshift(newItem); // Agregar al inicio
        this.saveToLocalStorage();
        this.render();

        return newItem;
    },

    /**
     * Elimina un item de la lista
     */
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveToLocalStorage();
        this.render();
    },

    /**
     * Renderiza todos los items en la lista
     */
    render() {
        if (!this.container) return;

        this.container.innerHTML = '';

        if (this.items.length === 0) {
            this.showEmptyMessage();
            return;
        }

        this.hideEmptyMessage();

        this.items.forEach(item => {
            const itemElement = this.createItemElement(item);
            this.container.appendChild(itemElement);
        });
    },

    /**
     * Crea el elemento HTML para un item
     */
    createItemElement(item) {
        const card = DOMManager.createElement('div', {
            className: 'card dynamic-item',
            dataset: { id: item.id }
        });

        const colorIndex = Math.floor(Math.random() * 5);
        const bgColor = COLOR_PALETTE.primary[colorIndex];

        card.innerHTML = `
            <div class="item-header" style="border-left: 4px solid ${bgColor}; padding-left: 1rem;">
                <h3 class="item-title">${item.title || 'Sin título'}</h3>
                <span class="item-date">${new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="item-content">
                <p>${item.description || 'Sin descripción'}</p>
                ${item.value ? `<div class="item-value">Valor: <strong>${item.value}</strong></div>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn btn-outline btn-sm delete-btn" data-id="${item.id}">
                    ❌ Eliminar
                </button>
            </div>
        `;

        // Agregar listener al botón de eliminar
        const deleteBtn = card.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.removeItem(item.id));
        }

        return card;
    },

    /**
     * Muestra el mensaje de lista vacía
     */
    showEmptyMessage() {
        if (this.emptyMessage) {
            this.emptyMessage.classList.remove('hidden');
        }
    },

    /**
     * Oculta el mensaje de lista vacía
     */
    hideEmptyMessage() {
        if (this.emptyMessage) {
            this.emptyMessage.classList.add('hidden');
        }
    },

    /**
     * Guarda los items en localStorage
     */
    saveToLocalStorage() {
        localStorage.setItem('dynamicListItems', JSON.stringify(this.items));
    },

    /**
     * Limpia toda la lista
     */
    clearAll() {
        this.items = [];
        this.saveToLocalStorage();
        this.render();
    }
};

// ===== MÓDULO 4: CARRUSEL DE IMÁGENES =====
const ImageCarousel = {
    currentIndex: 0,
    items: [],
    interval: null,
    autoPlayDelay: 5000, // 5 segundos
    isPlaying: true,

    /**
     * Inicializa el carrusel
     */
    init(containerId = 'carousel-container') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.slides = this.container.querySelectorAll('.carousel-item');
        this.items = Array.from(this.slides);
        this.indicatorsContainer = this.container.querySelector('.carousel-indicators');

        this.createIndicators();
        this.addEventListeners();
        this.showSlide(this.currentIndex);

        if (this.isPlaying) {
            this.startAutoPlay();
        }
    },

    /**
     * Crea los indicadores (puntos) del carrusel
     */
    createIndicators() {
        if (!this.indicatorsContainer) return;

        this.indicatorsContainer.innerHTML = '';

        this.items.forEach((_, index) => {
            const indicator = DOMManager.createElement('button', {
                className: 'indicator',
                dataset: { index: index },
                'aria-label': `Ir a imagen ${index + 1}`
            });

            indicator.addEventListener('click', () => this.goToSlide(index));
            this.indicatorsContainer.appendChild(indicator);
        });
    },

    /**
     * Muestra una slide específica
     */
    showSlide(index) {
        if (this.items.length === 0) return;

        // Asegurar que el índice esté en rango
        this.currentIndex = (index + this.items.length) % this.items.length;

        // Ocultar todas las slides
        this.items.forEach(item => {
            item.classList.remove('active');
        });

        // Mostrar la slide actual
        this.items[this.currentIndex].classList.add('active');

        // Actualizar indicadores
        this.updateIndicators();
    },

    /**
     * Actualiza el estado de los indicadores
     */
    updateIndicators() {
        const indicators = this.indicatorsContainer?.querySelectorAll('.indicator');
        if (!indicators) return;

        indicators.forEach((indicator, index) => {
            if (index === this.currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    },

    /**
     * Avanza a la siguiente slide
     */
    nextSlide() {
        this.showSlide(this.currentIndex + 1);
    },

    /**
     * Retrocede a la slide anterior
     */
    prevSlide() {
        this.showSlide(this.currentIndex - 1);
    },

    /**
     * Va a una slide específica
     */
    goToSlide(index) {
        this.pauseAutoPlay();
        this.showSlide(index);
        this.startAutoPlay();
    },

    /**
     * Inicia el autoplay
     */
    startAutoPlay() {
        if (this.interval) clearInterval(this.interval);

        this.interval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);

        this.isPlaying = true;
    },

    /**
     * Pausa el autoplay
     */
    pauseAutoPlay() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.isPlaying = false;
        }
    },

    /**
     * Alterna el autoplay
     */
    toggleAutoPlay() {
        if (this.isPlaying) {
            this.pauseAutoPlay();
        } else {
            this.startAutoPlay();
        }
    },

    /**
     * Agrega todos los event listeners necesarios
     */
    addEventListeners() {
        // Botones de navegación
        const prevBtn = this.container.querySelector('.carousel-button.prev');
        const nextBtn = this.container.querySelector('.carousel-button.next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.pauseAutoPlay();
                this.prevSlide();
                this.startAutoPlay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.pauseAutoPlay();
                this.nextSlide();
                this.startAutoPlay();
            });
        }

        // Pausar al hacer hover
        this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.container.addEventListener('mouseleave', () => this.startAutoPlay());

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (!this.container.contains(document.activeElement)) return;

            switch (e.key) {
                case 'ArrowLeft':
                    this.prevSlide();
                    break;
                case 'ArrowRight':
                    this.nextSlide();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAutoPlay();
                    break;
            }
        });
    },

    /**
     * Agrega una nueva imagen al carrusel
     */
    addImage(imageUrl, title = '', description = '') {
        const newSlide = DOMManager.createElement('div', {
            className: 'carousel-item'
        }, `
            <img src="${imageUrl}" alt="${title}" class="carousel-image" 
                 onerror="this.src='https://placehold.co/800x400/6A00F4/ffffff?text=Imagen+no+disponible'">
            <div class="carousel-caption">
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        `);

        this.container.querySelector('.carousel-items').appendChild(newSlide);
        this.items.push(newSlide);
        this.createIndicators();
    }
};

// ===== MÓDULO 5: GALERÍA INTERACTIVA =====
const InteractiveGallery = {
    images: [],
    currentIndex: 0,
    lightbox: null,

    /**
     * Inicializa la galería
     */
    init(containerId = 'gallery-container') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.images = Array.from(this.container.querySelectorAll('.gallery-item'));
        this.createLightbox();
        this.setupEventListeners();
    },

    /**
     * Crea el lightbox para vista ampliada
     */
    createLightbox() {
        this.lightbox = DOMManager.createElement('div', {
            id: 'gallery-lightbox',
            className: 'lightbox hidden'
        }, `
            <div class="lightbox-content">
                <button class="lightbox-close">&times;</button>
                <button class="lightbox-prev">‹</button>
                <img class="lightbox-image" src="" alt="">
                <button class="lightbox-next">›</button>
                <div class="lightbox-caption"></div>
            </div>
        `);

        document.body.appendChild(this.lightbox);

        // Agregar estilos al lightbox
        const style = document.createElement('style');
        style.textContent = `
            .lightbox {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .lightbox.hidden { display: none; }
            .lightbox-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
            }
            .lightbox-image {
                max-width: 100%;
                max-height: 70vh;
                object-fit: contain;
            }
            .lightbox-close, .lightbox-prev, .lightbox-next {
                position: absolute;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                border: none;
                padding: 10px;
                cursor: pointer;
                font-size: 24px;
            }
            .lightbox-close { top: -40px; right: 0; }
            .lightbox-prev { top: 50%; left: -40px; transform: translateY(-50%); }
            .lightbox-next { top: 50%; right: -40px; transform: translateY(-50%); }
            .lightbox-caption {
                color: white;
                text-align: center;
                padding: 10px;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Click en imágenes de la galería
        this.images.forEach((img, index) => {
            img.addEventListener('click', () => this.openLightbox(index));
        });

        // Eventos del lightbox
        const lightboxClose = this.lightbox.querySelector('.lightbox-close');
        const lightboxPrev = this.lightbox.querySelector('.lightbox-prev');
        const lightboxNext = this.lightbox.querySelector('.lightbox-next');

        lightboxClose.addEventListener('click', () => this.closeLightbox());
        lightboxPrev.addEventListener('click', () => this.prevImage());
        lightboxNext.addEventListener('click', () => this.nextImage());

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('hidden')) {
                switch (e.key) {
                    case 'Escape':
                        this.closeLightbox();
                        break;
                    case 'ArrowLeft':
                        this.prevImage();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        break;
                }
            }
        });
    },

    /**
     * Abre el lightbox con una imagen específica
     */
    openLightbox(index) {
        this.currentIndex = index;
        this.updateLightbox();
        this.lightbox.classList.remove('hidden');
    },

    /**
     * Cierra el lightbox
     */
    closeLightbox() {
        this.lightbox.classList.add('hidden');
    },

    /**
     * Muestra la imagen anterior
     */
    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateLightbox();
    },

    /**
     * Muestra la siguiente imagen
     */
    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateLightbox();
    },

    /**
     * Actualiza el contenido del lightbox
     */
    updateLightbox() {
        const currentImage = this.images[this.currentIndex];
        const imgSrc = currentImage.querySelector('img')?.src || currentImage.src;
        const caption = currentImage.dataset.caption || currentImage.alt || '';

        const lightboxImg = this.lightbox.querySelector('.lightbox-image');
        const lightboxCaption = this.lightbox.querySelector('.lightbox-caption');

        lightboxImg.src = imgSrc;
        lightboxImg.alt = caption;
        lightboxCaption.textContent = caption;
    },

    /**
     * Agrega una nueva imagen a la galería
     */
    addImage(imageUrl, caption = '') {
        const galleryItem = DOMManager.createElement('div', {
            className: 'gallery-item',
            dataset: { caption: caption }
        }, `
            <img src="${imageUrl}" alt="${caption}" 
                 onerror="this.src='https://placehold.co/300x200/6A00F4/ffffff?text=Imagen+no+disponible'">
        `);

        galleryItem.addEventListener('click', () => {
            const index = this.images.length;
            this.images.push(galleryItem);
            this.openLightbox(index);
        });

        this.container.appendChild(galleryItem);
    }
};

// ===== MÓDULO 6: MODO OSCURO/CLARO =====
const ThemeManager = {
    isDarkMode: false,

    /**
     * Inicializa el gestor de temas
     */
    init() {
        // Verificar preferencia guardada o del sistema
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            this.enableDarkMode();
        } else {
            this.enableLightMode();
        }

        this.setupEventListeners();
        this.updateThemeUI();
    },

    /**
     * Habilita el modo oscuro
     */
    enableDarkMode() {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        this.isDarkMode = true;
        localStorage.setItem('theme', 'dark');
    },

    /**
     * Habilita el modo claro
     */
    enableLightMode() {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        this.isDarkMode = false;
        localStorage.setItem('theme', 'light');
    },

    /**
     * Alterna entre modo oscuro y claro
     */
    toggleTheme() {
        if (this.isDarkMode) {
            this.enableLightMode();
        } else {
            this.enableDarkMode();
        }
        this.updateThemeUI();
    },

    /**
     * Actualiza la interfaz del tema (iconos, textos)
     */
    updateThemeUI() {
        const themeButtons = document.querySelectorAll('[data-theme-toggle]');
        const themeStatus = document.getElementById('theme-status');

        // Actualizar iconos en botones
        themeButtons.forEach(button => {
            const icon = button.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = this.isDarkMode ? '🌞' : '🌙';
            }
            button.setAttribute('aria-label',
                this.isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
        });

        // Actualizar texto de estado
        if (themeStatus) {
            themeStatus.textContent = this.isDarkMode ? 'Oscuro' : 'Claro';
        }

        // Actualizar colores dinámicamente
        this.updateDynamicColors();
    },

    /**
     * Actualiza colores dinámicos en la página
     */
    updateDynamicColors() {
        const root = document.documentElement;

        if (this.isDarkMode) {
            root.style.setProperty('--bg-primary', '#0f172a');
            root.style.setProperty('--bg-secondary', '#1e293b');
            root.style.setProperty('--text-primary', '#f8fafc');
            root.style.setProperty('--text-secondary', '#cbd5e1');
        } else {
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--bg-secondary', '#f1f5f9');
            root.style.setProperty('--text-primary', '#0f172a');
            root.style.setProperty('--text-secondary', '#475569');
        }
    },

    /**
     * Configura los event listeners para los botones de tema
     */
    setupEventListeners() {
        // Botones con data-theme-toggle
        document.querySelectorAll('[data-theme-toggle]').forEach(button => {
            button.addEventListener('click', () => this.toggleTheme());
        });

        // Botones específicos (para compatibilidad)
        const themeToggleBtn = document.getElementById('theme-toggle');
        const themeToggleMobile = document.getElementById('theme-toggle-mobile');

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        if (themeToggleMobile) {
            themeToggleMobile.addEventListener('click', () => this.toggleTheme());
        }

        // Escuchar cambios en la preferencia del sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) {
                    this.enableDarkMode();
                } else {
                    this.enableLightMode();
                }
                this.updateThemeUI();
            }
        });
    }
};

// ===== MÓDULO 7: CALCULADORA SIMPLE =====
const Calculator = {
    currentOperand: '0',
    previousOperand: '',
    operation: null,
    shouldResetScreen: false,

    /**
     * Inicializa la calculadora
     */
    init() {
        this.display = document.getElementById('calculator-display');
        this.previousDisplay = document.getElementById('previous-operand');

        if (!this.display) return;

        this.setupEventListeners();
        this.updateDisplay();
    },

    /**
     * Configura los event listeners de los botones
     */
    setupEventListeners() {
        // Botones de números
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.textContent);
                this.updateDisplay();
            });
        });

        // Botones de operaciones
        document.querySelectorAll('[data-operation]').forEach(button => {
            button.addEventListener('click', () => {
                this.chooseOperation(button.textContent);
                this.updateDisplay();
            });
        });

        // Botón de igual
        const equalsButton = document.querySelector('[data-equals]');
        if (equalsButton) {
            equalsButton.addEventListener('click', () => {
                this.compute();
                this.updateDisplay();
            });
        }

        // Botón de limpiar
        const clearButton = document.querySelector('[data-clear]');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clear();
                this.updateDisplay();
            });
        }

        // Botón de borrar
        const deleteButton = document.querySelector('[data-delete]');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                this.delete();
                this.updateDisplay();
            });
        }

        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key >= '0' && e.key <= '9') {
                this.appendNumber(e.key);
                this.updateDisplay();
            } else if (e.key === '.') {
                this.appendNumber('.');
                this.updateDisplay();
            } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
                this.chooseOperation(e.key);
                this.updateDisplay();
            } else if (e.key === 'Enter' || e.key === '=') {
                this.compute();
                this.updateDisplay();
            } else if (e.key === 'Escape') {
                this.clear();
                this.updateDisplay();
            } else if (e.key === 'Backspace') {
                this.delete();
                this.updateDisplay();
            }
        });
    },

    /**
     * Agrega un número al operando actual
     */
    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }

        if (number === '.' && this.currentOperand.includes('.')) return;

        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
    },

    /**
     * Selecciona una operación
     */
    chooseOperation(operation) {
        if (this.currentOperand === '') return;

        if (this.previousOperand !== '') {
            this.compute();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    },

    /**
     * Realiza el cálculo
     */
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    computation = 'Error: Div/0';
                } else {
                    computation = prev / current;
                }
                break;
            default:
                return;
        }

        if (typeof computation === 'number') {
            // Limitar decimales
            computation = parseFloat(computation.toFixed(10));
        }

        this.currentOperand = computation.toString();
        this.operation = null;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    },

    /**
     * Limpia la calculadora
     */
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
    },

    /**
     * Borra el último dígito
     */
    delete() {
        if (this.currentOperand.length === 1 || this.currentOperand === 'Error: Div/0') {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
    },

    /**
     * Formatea el número para mostrar
     */
    getDisplayNumber(number) {
        if (number === 'Error: Div/0') return number;

        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];

        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('es', {
                maximumFractionDigits: 0
            });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    },

    /**
     * Actualiza la pantalla de la calculadora
     */
    updateDisplay() {
        if (this.display) {
            this.display.textContent = this.getDisplayNumber(this.currentOperand);
        }

        if (this.previousDisplay) {
            if (this.operation != null) {
                this.previousDisplay.textContent =
                    `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
            } else {
                this.previousDisplay.textContent = '';
            }
        }
    }
};

// ===== MÓDULO 8: INICIALIZACIÓN GLOBAL =====
const App = {
    /**
     * Inicializa toda la aplicación
     */
    init() {
        console.log('Inicializando aplicación web...');

        // Inicializar gestor de temas
        ThemeManager.init();

        // Inicializar lista dinámica
        if (document.getElementById('lista-dinamica')) {
            DynamicList.init();
            this.setupFormValidation();
        }

        // Inicializar carrusel de imágenes
        if (document.getElementById('carousel-container')) {
            ImageCarousel.init();
        }

        // Inicializar galería interactiva
        if (document.getElementById('gallery-container')) {
            InteractiveGallery.init();
        }

        // Inicializar calculadora
        if (document.getElementById('calculator-display')) {
            Calculator.init();
        }

        // Configurar menú móvil
        this.setupMobileMenu();

        // Configurar enlaces suaves
        this.setupSmoothScrolling();

        console.log('Aplicación inicializada correctamente.');
    },

    /**
     * Configura la validación del formulario
     */
    setupFormValidation() {
        const form = document.getElementById('data-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (FormValidator.validateForm('data-form')) {
                // Obtener datos del formulario
                const formData = {
                    title: document.getElementById('item-title')?.value || 'Sin título',
                    description: document.getElementById('item-description')?.value || '',
                    value: document.getElementById('item-value')?.value || ''
                };

                // Agregar a la lista dinámica
                DynamicList.addItem(formData);

                // Mostrar mensaje de éxito
                this.showNotification('✅ Elemento agregado correctamente', 'success');

                // Limpiar formulario
                form.reset();
            } else {
                this.showNotification('❌ Por favor, corrige los errores del formulario', 'error');
            }
        });
    },

    /**
     * Configura el menú móvil
     */
    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                mobileMenuBtn.textContent = mobileMenu.classList.contains('hidden') ? '☰' : '✕';
            });

            // Cerrar menú al hacer clic en un enlace
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                    mobileMenuBtn.textContent = '☰';
                });
            });
        }
    },

    /**
     * Configura el scroll suave
     */
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    },

    /**
     * Muestra una notificación temporal
     */
    showNotification(message, type = 'info') {
        const notification = DOMManager.createElement('div', {
            className: `notification notification-${type}`,
            id: 'temp-notification'
        }, message);

        // Estilos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #6A00F4, #8900F2)';
        }

        document.body.appendChild(notification);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },

    /**
     * Función para cargar más contenido dinámicamente
     */
    loadMoreContent(containerId, itemsToAdd = 3) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Simulación de carga de contenido
        for (let i = 0; i < itemsToAdd; i++) {
            const newItem = DOMManager.createElement('div', {
                className: 'content-item'
            }, `
                <h3>Elemento dinámico #${container.children.length + 1}</h3>
                <p>Este es un contenido cargado dinámicamente.</p>
            `);

            container.appendChild(newItem);
        }
    }
};

// ===== INICIALIZAR AL CARGAR EL DOM =====
document.addEventListener('DOMContentLoaded', () => {
    App.init();

    // Exponer funcionalidades al scope global para acceso desde HTML
    window.App = App;
    window.FormValidator = FormValidator;
    window.DynamicList = DynamicList;
    window.ImageCarousel = ImageCarousel;
    window.InteractiveGallery = InteractiveGallery;
    window.ThemeManager = ThemeManager;
    window.Calculator = Calculator;
});

// ===== POLYFILLS Y FUNCIONES DE COMPATIBILIDAD =====
if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
        var el = this;
        if (!document.documentElement.contains(el)) return null;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function (s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) { }
            return i > -1;
        };
}