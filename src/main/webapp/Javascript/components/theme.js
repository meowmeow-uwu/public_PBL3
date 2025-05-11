// Theme Management
const themeManager = {
    // Theme variables
    themes: {
        light: {
            '--theme-primary': '#2196F3',
            '--theme-text': '#333',
            '--theme-bg': '#fff',
            '--theme-card-bg': '#fff',
            '--theme-border': '#eee',
            '--theme-shadow': 'rgba(0, 0, 0, 0.1)',
            '--theme-hover': '#f5f5f5'
        },
        dark: {
            '--theme-primary': '#64B5F6',
            '--theme-text': '#fff',
            '--theme-bg': '#1a1a1a',
            '--theme-card-bg': '#2d2d2d',
            '--theme-border': '#404040',
            '--theme-shadow': 'rgba(0, 0, 0, 0.3)',
            '--theme-hover': '#404040'
        }
    },

    // Initialize theme
    init() {
        // Load saved theme or use system preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    },

    // Set theme
    setTheme(theme) {
        const root = document.documentElement;
        const themeColors = this.themes[theme];

        // Apply theme colors
        Object.entries(themeColors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Update theme class on body
        document.body.classList.toggle('theme-dark', theme === 'dark');

        // Update theme icons
        const themeIcons = document.querySelectorAll('.theme-btn i');
        themeIcons.forEach(icon => {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        });

        // Update theme text
        const themeTexts = document.querySelectorAll('.theme-btn span');
        themeTexts.forEach(text => {
            text.textContent = theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối';
        });

        // Save theme preference
        localStorage.setItem('theme', theme);
    },

    // Toggle theme
    toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
};

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
});
