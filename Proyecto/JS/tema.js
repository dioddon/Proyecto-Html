/**
 * Sistema de Tema Unificado
 * Maneja el modo claro/oscuro en todas las páginas
 */

class SistemaTema {
    constructor() {
        this.isDarkMode = false;
        this.init();
    }

    init() {
        // Verificar preferencia guardada o del sistema
        this.cargarPreferencia();

        // Configurar event listeners
        this.configurarEventos();

        // Actualizar interfaz
        this.actualizarUI();
    }

    cargarPreferencia() {
        const htmlElement = document.documentElement;
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            htmlElement.classList.add('dark');
            document.body.classList.add('dark');
            this.isDarkMode = true;
        } else {
            htmlElement.classList.remove('dark');
            document.body.classList.remove('dark');
            this.isDarkMode = false;
        }
    }

    alternarTema() {
        const htmlElement = document.documentElement;
        const body = document.body;

        if (this.isDarkMode) {
            // Cambiar a modo claro
            htmlElement.classList.remove('dark');
            body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            this.isDarkMode = false;
        } else {
            // Cambiar a modo oscuro
            htmlElement.classList.add('dark');
            body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            this.isDarkMode = true;
        }

        this.actualizarUI();
    }

    configurarEventos() {
        // Botones con data-theme-toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-theme-toggle]')) {
                this.alternarTema();
            }

            // También manejar botones específicos
            if (e.target.id === 'theme-toggle' ||
                e.target.id === 'theme-toggle-mobile' ||
                e.target.closest('#theme-toggle') ||
                e.target.closest('#theme-toggle-mobile')) {
                this.alternarTema();
            }
        });

        // Botón principal en utilidades.html
        const themeSwitchBtn = document.getElementById('theme-switch-main');
        if (themeSwitchBtn) {
            themeSwitchBtn.addEventListener('click', () => this.alternarTema());
        }

        // Escuchar cambios en la preferencia del sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) {
                    this.isDarkMode = true;
                    document.documentElement.classList.add('dark');
                    document.body.classList.add('dark');
                } else {
                    this.isDarkMode = false;
                    document.documentElement.classList.remove('dark');
                    document.body.classList.remove('dark');
                }
                this.actualizarUI();
            }
        });
    }

    actualizarUI() {
        // Actualizar iconos en botones
        const themeButtons = document.querySelectorAll('[data-theme-toggle]');
        themeButtons.forEach(button => {
            const icon = button.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = this.isDarkMode ? '🌞' : '🌙';
            }
            button.setAttribute('aria-label',
                this.isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
        });

        // Actualizar botón principal en utilidades.html
        const switchIcon = document.getElementById('switch-icon');
        if (switchIcon) {
            switchIcon.textContent = this.isDarkMode ? '🌞' : '🌙';
        }

        // Actualizar estado en utilidades.html
        const themeStatus = document.getElementById('theme-status');
        if (themeStatus) {
            themeStatus.textContent = this.isDarkMode ? 'Oscuro' : 'Claro';
        }

        // Actualizar opciones de tema en utilidades.html
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.classList.remove('active');
            const savedTheme = localStorage.getItem('theme') || 'auto';
            if (option.dataset.theme === savedTheme) {
                option.classList.add('active');
            }
        });
    }

    // Métodos públicos para usar desde otras páginas
    cambiarAModoClaro() {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        this.isDarkMode = false;
        this.actualizarUI();
    }

    cambiarAModoOscuro() {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        this.isDarkMode = true;
        this.actualizarUI();
    }

    usarPreferenciaSistema() {
        localStorage.removeItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (systemPrefersDark) {
            this.cambiarAModoOscuro();
        } else {
            this.cambiarAModoClaro();
        }
    }
}

// Inicializar cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    window.sistemaTema = new SistemaTema();

    // También exponer métodos globales para retrocompatibilidad
    window.ThemeManager = {
        toggleTheme: () => window.sistemaTema.alternarTema(),
        enableDarkMode: () => window.sistemaTema.cambiarAModoOscuro(),
        enableLightMode: () => window.sistemaTema.cambiarAModoClaro(),
        init: () => window.sistemaTema.init()
    };
});