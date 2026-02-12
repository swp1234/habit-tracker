/**
 * Habit Tracker - Main Application Logic
 */

class HabitTracker {
    constructor() {
        this.habits = [];
        this.completions = {}; // { 'habitId_YYYY-MM-DD': true/false }
        this.quotes = [
            { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
            { text: "You are what you repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
            { text: "The secret of your success is determined by your daily habits.", author: "Unknown" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
            { text: "Excellence is not a destination; it is a continuous journey.", author: "Unknown" },
            { text: "Start where you are, use what you have, do what you can.", author: "Arthur Ashe" },
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Your limitation—it's only your imagination. Push beyond.", author: "Unknown" },
            { text: "Great things never came from comfort zones.", author: "Unknown" },
            { text: "Dream bigger. Do bigger.", author: "Unknown" }
        ];
        this.templates = [
            { name: 'water', icon: '💧', category: 'health' },
            { name: 'exercise', icon: '🏃', category: 'exercise' },
            { name: 'reading', icon: '📚', category: 'learning' },
            { name: 'meditation', icon: '🧘', category: 'mindfulness' },
            { name: 'music', icon: '🎵', category: 'learning' },
            { name: 'cycling', icon: '🚴', category: 'exercise' },
            { name: 'strength', icon: '💪', category: 'exercise' },
            { name: 'swimming', icon: '🏊', category: 'exercise' }
        ];
        this.currentEditingId = null;
        this.init();
    }

    async init() {
        try {
            // Wait for i18n to be ready
            if (typeof i18n !== 'undefined' && !i18n.initialized) {
                await new Promise(resolve => {
                    const checkInterval = setInterval(() => {
                        if (i18n.initialized) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 50);
                    // Safety timeout: proceed after 1s even if i18n fails
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        resolve();
                    }, 1000);
                });
            }

            this.loadData();
            this.setupEventListeners();
            this.renderUI();
            this.showDailyQuote();

            // Show welcome onboarding for first-time users
            if (this.isFirstVisit) {
                this.showWelcomeOnboarding();
            }

            // Listen for language changes
            document.addEventListener('languageChanged', () => {
                this.updateSampleHabitNames();
                this.renderUI();
            });
        } catch (e) {
            console.error('HabitTracker init error:', e);
        } finally {
            // Always hide app loader, even if init fails
            const loader = document.getElementById('app-loader');
            if (loader) {
                loader.classList.add('hidden');
                setTimeout(() => loader.remove(), 300);
            }
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Add habit buttons (Habits tab + Today tab)
        document.getElementById('add-habit-btn').addEventListener('click', () => {
            this.currentEditingId = null;
            this.openHabitModal();
        });
        const addHabitTodayBtn = document.getElementById('add-habit-today-btn');
        if (addHabitTodayBtn) {
            addHabitTodayBtn.addEventListener('click', () => {
                this.currentEditingId = null;
                this.openHabitModal();
            });
        }

        // Modal actions
        document.getElementById('close-modal').addEventListener('click', () => this.closeHabitModal());
        document.getElementById('habit-form').addEventListener('submit', (e) => this.saveHabit(e));
        document.getElementById('delete-btn').addEventListener('click', () => this.deleteHabit());

        // Icon picker
        document.querySelectorAll('.icon-picker').forEach(picker => {
            const icons = picker.textContent.split(' ').filter(i => i.length > 0);
            picker.innerHTML = '';
            icons.forEach(icon => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'icon-btn';
                btn.textContent = icon;
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    document.getElementById('habit-icon').value = icon;
                });
                picker.appendChild(btn);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Premium modal
        document.getElementById('close-premium')?.addEventListener('click', () => {
            document.getElementById('premium-modal').classList.add('hidden');
        });

        // Click outside to close modals
        document.addEventListener('click', (e) => {
            const habitModal = document.getElementById('habit-modal');
            if (habitModal && !habitModal.classList.contains('hidden') &&
                !habitModal.querySelector('.modal-content').contains(e.target) &&
                e.target.id !== 'add-habit-btn' && e.target.id !== 'add-habit-today-btn') {
                this.closeHabitModal();
            }
        });
    }

    /**
     * Helper: safely call i18n.t() with fallback
     */
    _t(key, fallback) {
        try {
            if (typeof i18n !== 'undefined' && i18n.t) {
                const val = i18n.t(key);
                if (val && val !== key) return val;
            }
        } catch (e) { /* ignore */ }
        return fallback || key;
    }

    /**
     * Load data from localStorage
     */
    loadData() {
        const saved = localStorage.getItem('habits');
        const completions = localStorage.getItem('completions');
        this.isFirstVisit = false;

        if (saved) {
            this.habits = JSON.parse(saved);
        } else {
            // First visit: add 3 localized sample habits
            this.isFirstVisit = true;
            const now = new Date().toISOString();
            this.habits = [
                { id: 'sample-1', name: this._t('templates.water', 'Drink Water'), icon: '💧', category: 'health', frequency: 'daily', goal: 30, createdAt: now, isSample: true },
                { id: 'sample-2', name: this._t('templates.exercise', 'Exercise'), icon: '🏃', category: 'exercise', frequency: 'daily', goal: 30, createdAt: now, isSample: true },
                { id: 'sample-3', name: this._t('templates.reading', 'Reading'), icon: '📚', category: 'learning', frequency: 'daily', goal: 30, createdAt: now, isSample: true }
            ];
            this.saveData();
        }
        if (completions) this.completions = JSON.parse(completions);
    }

    /**
     * Update sample habit names when language changes
     */
    updateSampleHabitNames() {
        let changed = false;
        this.habits.forEach(h => {
            if (h.isSample) {
                const templateKey = { 'sample-1': 'water', 'sample-2': 'exercise', 'sample-3': 'reading' }[h.id];
                if (templateKey) {
                    const newName = this._t(`templates.${templateKey}`, h.name);
                    if (newName !== h.name) {
                        h.name = newName;
                        changed = true;
                    }
                }
            }
        });
        if (changed) this.saveData();
    }

    /**
     * Save data to localStorage
     */
    saveData() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
        localStorage.setItem('completions', JSON.stringify(this.completions));
    }

    /**
     * Switch between tabs
     */
    switchTab(tab) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(`${tab}-tab`).classList.add('active');
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Render tab-specific content
        if (tab === 'today') this.renderTodayTab();
        if (tab === 'habits') this.renderHabitsTab();
        if (tab === 'stats') this.renderStatsTab();
        if (tab === 'heatmap') this.renderHeatmapTab();
    }

    /**
     * Open habit modal for adding/editing
     */
    openHabitModal() {
        const modal = document.getElementById('habit-modal');
        const titleEl = document.getElementById('modal-title');
        const deleteBtn = document.getElementById('delete-btn');
        const form = document.getElementById('habit-form');

        form.reset();
        deleteBtn.style.display = 'none';

        if (this.currentEditingId) {
            titleEl.setAttribute('data-i18n', 'modal.edit');
            titleEl.textContent = this._t('modal.edit', 'Edit Habit');
            const habit = this.habits.find(h => h.id === this.currentEditingId);
            if (habit) {
                document.getElementById('habit-name').value = habit.name;
                document.getElementById('habit-icon').value = habit.icon;
                document.getElementById('habit-category').value = habit.category;
                document.getElementById('habit-frequency').value = habit.frequency;
                document.getElementById('habit-goal').value = habit.goal;
                document.querySelector(`[value="${habit.icon}"]`)?.classList.add('selected');
                deleteBtn.style.display = 'block';
            }
        } else {
            titleEl.setAttribute('data-i18n', 'modal.add');
            titleEl.textContent = this._t('modal.add', 'Add Habit');
            document.getElementById('habit-icon').value = '🏃';
            document.querySelector('[value="🏃"]')?.classList.add('selected');
        }

        modal.classList.remove('hidden');
    }

    /**
     * Close habit modal
     */
    closeHabitModal() {
        document.getElementById('habit-modal').classList.add('hidden');
        this.currentEditingId = null;
    }

    /**
     * Save habit (add/edit)
     */
    saveHabit(e) {
        e.preventDefault();
        const name = document.getElementById('habit-name').value.trim();
        const icon = document.getElementById('habit-icon').value;
        const category = document.getElementById('habit-category').value;
        const frequency = document.getElementById('habit-frequency').value;
        const goal = parseInt(document.getElementById('habit-goal').value);

        if (!name) return alert('Please enter a habit name');

        if (this.currentEditingId) {
            const habit = this.habits.find(h => h.id === this.currentEditingId);
            if (habit) {
                habit.name = name;
                habit.icon = icon;
                habit.category = category;
                habit.frequency = frequency;
                habit.goal = goal;
            }
        } else {
            this.habits.push({
                id: Date.now().toString(),
                name,
                icon,
                category,
                frequency,
                goal,
                createdAt: new Date().toISOString()
            });
        }

        this.saveData();
        this.closeHabitModal();
        this.renderUI();
    }

    /**
     * Delete habit
     */
    deleteHabit() {
        if (!confirm('Are you sure you want to delete this habit?')) return;
        this.habits = this.habits.filter(h => h.id !== this.currentEditingId);
        // Clean up completions
        Object.keys(this.completions).forEach(key => {
            if (key.startsWith(this.currentEditingId)) {
                delete this.completions[key];
            }
        });
        this.saveData();
        this.closeHabitModal();
        this.renderUI();
    }

    /**
     * Toggle habit completion for today
     */
    toggleHabitCompletion(habitId) {
        const today = this.getDateString();
        const key = `${habitId}_${today}`;
        this.completions[key] = !this.completions[key];
        this.saveData();

        // Auto-dismiss onboarding after first completion
        if (this.completions[key] && !localStorage.getItem('onboardingDismissed')) {
            this.dismissWelcome();
        }

        this.renderUI();
    }

    /**
     * Get today's date as YYYY-MM-DD
     */
    getDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Get streak count for a habit
     */
    getStreak(habitId) {
        let streak = 0;
        let currentDate = new Date();

        for (let i = 0; i < 365; i++) {
            const dateStr = this.getDateString(currentDate);
            const key = `${habitId}_${dateStr}`;
            if (this.completions[key]) {
                streak++;
            } else if (i === 0) {
                break;
            } else {
                break;
            }
            currentDate.setDate(currentDate.getDate() - 1);
        }

        return streak;
    }

    /**
     * Show daily motivation quote
     */
    showDailyQuote() {
        const today = this.getDateString();
        const savedQuoteDate = localStorage.getItem('quoteDate');

        let quote;
        if (savedQuoteDate === today) {
            quote = JSON.parse(localStorage.getItem('currentQuote'));
        } else {
            quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
            localStorage.setItem('quoteDate', today);
            localStorage.setItem('currentQuote', JSON.stringify(quote));
        }

        document.getElementById('daily-quote').textContent = `"${quote.text}"`;
        document.getElementById('quote-author').textContent = `— ${quote.author}`;
    }

    /**
     * Show welcome onboarding for first-time users
     */
    showWelcomeOnboarding() {
        const quoteEl = document.getElementById('daily-quote');
        const authorEl = document.getElementById('quote-author');
        if (quoteEl) {
            quoteEl.textContent = this._t('onboarding.welcomeQuote', 'Small habits create big changes');
            quoteEl.style.fontSize = '1.3rem';
        }
        if (authorEl) {
            authorEl.textContent = this._t('header.subtitle', 'Build better habits daily');
        }

        // Add pulse animation to Add Habit buttons
        const addBtnToday = document.getElementById('add-habit-today-btn');
        const addBtnHabits = document.getElementById('add-habit-btn');
        if (addBtnToday) addBtnToday.classList.add('btn-pulse');
        if (addBtnHabits) addBtnHabits.classList.add('btn-pulse');
    }

    /**
     * Dismiss the welcome banner and remove onboarding hints
     */
    dismissWelcome() {
        localStorage.setItem('onboardingDismissed', 'true');
        const banner = document.getElementById('welcome-banner');
        if (banner) {
            banner.style.transition = 'opacity 0.3s ease, max-height 0.3s ease';
            banner.style.opacity = '0';
            banner.style.maxHeight = '0';
            banner.style.overflow = 'hidden';
            banner.style.padding = '0';
            banner.style.margin = '0';
            setTimeout(() => banner.remove(), 300);
        }
        // Remove checkbox highlights
        document.querySelectorAll('.onboarding-highlight').forEach(el => {
            el.classList.remove('onboarding-highlight');
        });
        // Remove tooltip
        document.querySelectorAll('.onboarding-tooltip').forEach(el => {
            el.classList.remove('onboarding-tooltip');
        });
    }

    /**
     * Render TODAY tab
     */
    renderTodayTab() {
        const container = document.getElementById('todays-habits');
        const today = this.getDateString();
        const showOnboarding = this.isFirstVisit && !localStorage.getItem('onboardingDismissed');
        const hasAnyCompletion = Object.values(this.completions).some(v => v);

        if (this.habits.length === 0) {
            container.innerHTML = `
                <div class="empty-state-onboarding">
                    <div class="empty-state-emoji">🎯</div>
                    <div class="empty-state-title">${this._t('today.emptyState', 'Create your first habit!')}</div>
                    <div class="empty-state-subtitle">${this._t('today.emptySubtitle', 'Small habits create big changes')}</div>
                    <button class="btn btn-primary btn-large btn-pulse" onclick="app.currentEditingId=null;app.openHabitModal();">
                        ${this._t('today.addHabit', 'Add Habit')}
                    </button>
                </div>`;
            return;
        }

        // Build welcome banner HTML for first-time users
        let welcomeHtml = '';
        if (showOnboarding && !hasAnyCompletion) {
            welcomeHtml = `
                <div class="welcome-banner" id="welcome-banner">
                    <div class="welcome-banner-title">${this._t('onboarding.title', 'Welcome! Here\'s how it works')}</div>
                    <div class="welcome-banner-steps">
                        <div class="welcome-step">
                            <div class="welcome-step-num">1</div>
                            <div class="welcome-step-text">${this._t('onboarding.step1', 'Tap the circle to complete')}</div>
                        </div>
                        <div class="welcome-step">
                            <div class="welcome-step-num">2</div>
                            <div class="welcome-step-text">${this._t('onboarding.step2', 'Build your streak')}</div>
                        </div>
                        <div class="welcome-step">
                            <div class="welcome-step-num">3</div>
                            <div class="welcome-step-text">${this._t('onboarding.step3', 'Track your progress')}</div>
                        </div>
                    </div>
                    <button class="welcome-dismiss" onclick="app.dismissWelcome()">${this._t('onboarding.dismiss', 'Got it!')}</button>
                </div>`;
        }

        container.innerHTML = welcomeHtml + this.habits.map((habit, index) => {
            const key = `${habit.id}_${today}`;
            const isCompleted = this.completions[key] || false;
            const streak = this.getStreak(habit.id);
            // Highlight first uncompleted checkbox for onboarding
            const isFirstUncompleted = showOnboarding && !hasAnyCompletion && !isCompleted && index === 0;
            const checkboxClass = `habit-checkbox ${isCompleted ? 'checked' : ''} ${isFirstUncompleted ? 'onboarding-highlight' : ''}`;
            const tooltipAttr = isFirstUncompleted ? `class="onboarding-tooltip" data-tooltip="${this._t('onboarding.tapHere', 'Tap here!')}"` : '';

            return `
                <div class="habit-item ${isCompleted ? 'completed' : ''}" ${tooltipAttr}>
                    <button class="${checkboxClass}"
                            onclick="app.toggleHabitCompletion('${habit.id}')"
                            aria-label="Toggle habit completion">
                        ${isCompleted ? '✓' : ''}
                    </button>
                    <div class="habit-content">
                        <div class="habit-name">${habit.icon} ${habit.name}</div>
                        <div class="habit-meta">${habit.category} • ${this._t(`form.${habit.frequency}`, habit.frequency)}</div>
                    </div>
                    <div class="habit-streak">
                        ${streak > 0 ? `🔥 ${streak}` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Update completion stats
        const completedCount = this.habits.filter(h => this.completions[`${h.id}_${today}`]).length;
        const totalCount = this.habits.length;
        const rate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        document.getElementById('completed-count').textContent = completedCount;
        document.getElementById('total-count').textContent = totalCount;
        document.getElementById('completion-rate').textContent = rate;
    }

    /**
     * Render HABITS tab
     */
    renderHabitsTab() {
        // Render templates
        const templatesContainer = document.getElementById('templates-list');
        templatesContainer.innerHTML = this.templates.map(template => {
            return `
                <button class="template-btn" onclick="app.addFromTemplate('${template.name}', '${template.icon}', '${template.category}')">
                    <div class="template-icon">${template.icon}</div>
                    <div class="template-name">${this._t(`templates.${template.name}`, template.name)}</div>
                </button>
            `;
        }).join('');

        // Render habits list
        const habitsList = document.getElementById('habits-list');
        if (this.habits.length === 0) {
            habitsList.innerHTML = `<p class="empty-state">${this._t('habits.empty', 'No habits yet. Create your first habit!')}</p>`;
            return;
        }

        habitsList.innerHTML = this.habits.map(habit => {
            const streak = this.getStreak(habit.id);
            return `
                <div class="habit-item">
                    <div class="habit-content">
                        <div class="habit-name">${habit.icon} ${habit.name}</div>
                        <div class="habit-meta">
                            ${habit.category} • ${this._t(`form.${habit.frequency}`, habit.frequency)} • ${this._t('form.goal', 'Goal')}: ${habit.goal}
                        </div>
                    </div>
                    <div class="habit-streak">
                        ${streak > 0 ? `🔥 ${streak}` : ''}
                    </div>
                    <div class="habit-actions">
                        <button onclick="app.editHabit('${habit.id}')" title="Edit">✏️</button>
                        <button onclick="app.premiumAnalysis('${habit.id}')" title="AI Analysis">🤖</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Add habit from template
     */
    addFromTemplate(templateName, icon, category) {
        this.habits.push({
            id: Date.now().toString(),
            name: this._t(`templates.${templateName}`, templateName),
            icon,
            category,
            frequency: 'daily',
            goal: 30,
            createdAt: new Date().toISOString()
        });
        this.saveData();
        this.renderHabitsTab();
    }

    /**
     * Edit habit
     */
    editHabit(habitId) {
        this.currentEditingId = habitId;
        this.openHabitModal();
    }

    /**
     * Premium analysis (watch ad)
     */
    premiumAnalysis(habitId) {
        const modal = document.getElementById('premium-modal');
        const result = document.getElementById('premium-result');
        const watchBtn = document.getElementById('watch-ad-btn');

        result.classList.add('hidden');
        watchBtn.style.display = 'block';

        watchBtn.onclick = () => {
            watchBtn.style.display = 'none';
            this.generateAnalysis(habitId);
            result.classList.remove('hidden');
        };

        modal.classList.remove('hidden');
    }

    /**
     * Generate AI habit analysis
     */
    generateAnalysis(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        const streak = this.getStreak(habitId);
        const completedDays = Object.keys(this.completions).filter(k => k.startsWith(habitId) && this.completions[k]).length;

        const analysis = `
            <div class="analysis-item">
                <strong>${this._t('analysis.consistency', 'Consistency')}</strong>
                <p>${streak > 0 ? `Great! You have a ${streak}-day streak. Keep it up!` : 'Start building your streak!'}</p>
            </div>
            <div class="analysis-item">
                <strong>${this._t('analysis.pattern', 'Pattern Analysis')}</strong>
                <p>You've completed "${habit.name}" ${completedDays} times. You're on the right track!</p>
            </div>
            <div class="analysis-item">
                <strong>${this._t('analysis.recommendation', 'Recommendation')}</strong>
                <p>To succeed, try completing this habit at the same time each day. Consistency is key!</p>
            </div>
            <div class="analysis-item">
                <strong>${this._t('analysis.insight', 'Insight')}</strong>
                <p>Research shows it takes 21 days to form a habit. You're ${Math.min(completedDays, 21)} days in!</p>
            </div>
        `;

        document.getElementById('premium-result').innerHTML = analysis;
    }

    /**
     * Render STATISTICS tab
     */
    renderStatsTab() {
        // Weekly stats
        const weeklyStats = this.calculateWeeklyStats();
        const weeklyContainer = document.getElementById('weekly-stats');
        weeklyContainer.innerHTML = weeklyStats.map(stat => `
            <div class="chart-row">
                <div class="chart-label">${stat.day}</div>
                <div class="chart-bar">
                    <div class="chart-fill" style="width: ${stat.percentage}%">
                        ${stat.percentage}%
                    </div>
                </div>
                <div class="chart-value">${stat.completed}/${stat.total}</div>
            </div>
        `).join('');

        // Monthly stats
        const monthlyStats = this.calculateMonthlyStats();
        const monthlyContainer = document.getElementById('monthly-stats');
        monthlyContainer.innerHTML = monthlyStats.map(stat => `
            <div class="chart-row">
                <div class="chart-label">Week ${stat.week}</div>
                <div class="chart-bar">
                    <div class="chart-fill" style="width: ${stat.percentage}%">
                        ${stat.percentage}%
                    </div>
                </div>
                <div class="chart-value">${stat.completed}/${stat.total}</div>
            </div>
        `).join('');

        // Badges
        this.renderBadges();
    }

    /**
     * Calculate weekly stats
     */
    calculateWeeklyStats() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const stats = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = this.getDateString(date);
            const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];

            let completed = 0;
            this.habits.forEach(habit => {
                if (this.completions[`${habit.id}_${dateStr}`]) completed++;
            });

            const total = this.habits.length;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

            stats.push({ day: dayName, completed, total, percentage });
        }

        return stats;
    }

    /**
     * Calculate monthly stats
     */
    calculateMonthlyStats() {
        const stats = [];
        const today = new Date();
        const days = today.getDate();

        for (let week = Math.ceil(days / 7); week > 0; week--) {
            let completed = 0;
            let total = 0;

            for (let day = 1; day <= 7; day++) {
                const dateNum = (week - 1) * 7 + day;
                if (dateNum <= days) {
                    const date = new Date(today.getFullYear(), today.getMonth(), dateNum);
                    const dateStr = this.getDateString(date);

                    this.habits.forEach(habit => {
                        total++;
                        if (this.completions[`${habit.id}_${dateStr}`]) completed++;
                    });
                }
            }

            if (total > 0) {
                const percentage = Math.round((completed / total) * 100);
                stats.unshift({ week, completed, total, percentage });
            }
        }

        return stats;
    }

    /**
     * Render badges
     */
    renderBadges() {
        const badgesContainer = document.getElementById('badges-list');
        const badges = [
            { id: 'streak7', name: 'badges.streak7', icon: '🔥', requirement: 7 },
            { id: 'streak30', name: 'badges.streak30', icon: '🏆', requirement: 30 },
            { id: 'streak100', name: 'badges.streak100', icon: '👑', requirement: 100 },
            { id: 'early', name: 'badges.early', icon: '🌅', requirement: 'custom' },
            { id: 'consistent', name: 'badges.consistent', icon: '⭐', requirement: 'custom' },
            { id: 'allstar', name: 'badges.allstar', icon: '✨', requirement: 'custom' }
        ];

        badgesContainer.innerHTML = badges.map(badge => {
            let unlocked = false;
            let progress = 0;

            if (badge.requirement === 'custom') {
                const avgStreak = this.habits.length > 0
                    ? this.habits.reduce((sum, h) => sum + this.getStreak(h.id), 0) / this.habits.length
                    : 0;
                unlocked = avgStreak >= 10;
                progress = Math.min(Math.round((avgStreak / 10) * 100), 100);
            } else {
                const maxStreak = this.habits.length > 0
                    ? Math.max(...this.habits.map(h => this.getStreak(h.id)))
                    : 0;
                unlocked = maxStreak >= badge.requirement;
                progress = Math.min(Math.round((maxStreak / badge.requirement) * 100), 100);
            }

            return `
                <div class="badge ${unlocked ? 'unlocked' : 'locked'}">
                    <div class="badge-icon">${badge.icon}</div>
                    <div class="badge-name">${this._t(badge.name, badge.id)}</div>
                    <div class="badge-progress">${progress}%</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render HEATMAP tab
     */
    renderHeatmapTab() {
        // Populate habit selector
        const selector = document.getElementById('heatmap-habit');
        selector.innerHTML = '<option value="">All Habits</option>' + this.habits.map(h =>
            `<option value="${h.id}">${h.icon} ${h.name}</option>`
        ).join('');

        this.generateHeatmap();

        // Handle habit selection change
        selector.onchange = () => this.generateHeatmap();

        // Share button
        document.getElementById('share-btn').onclick = () => this.shareHeatmap();
    }

    /**
     * Generate heatmap
     */
    generateHeatmap() {
        const habitId = document.getElementById('heatmap-habit').value;
        const heatmapContainer = document.getElementById('heatmap');
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const grid = document.createElement('div');
        grid.className = 'heatmap-grid';

        let current = new Date(oneYearAgo);
        while (current <= today) {
            const dateStr = this.getDateString(current);
            let level = 0;

            if (habitId) {
                level = this.completions[`${habitId}_${dateStr}`] ? 4 : 0;
            } else {
                let completed = 0;
                this.habits.forEach(h => {
                    if (this.completions[`${h.id}_${dateStr}`]) completed++;
                });
                if (this.habits.length > 0) {
                    const ratio = completed / this.habits.length;
                    if (ratio === 1) level = 4;
                    else if (ratio >= 0.75) level = 3;
                    else if (ratio >= 0.5) level = 2;
                    else if (ratio > 0) level = 1;
                }
            }

            const cell = document.createElement('div');
            cell.className = `heatmap-cell ${level === 0 ? 'empty' : `level${level}`}`;
            cell.title = dateStr;
            cell.setAttribute('data-date', dateStr);

            grid.appendChild(cell);
            current.setDate(current.getDate() + 1);
        }

        heatmapContainer.innerHTML = '';
        heatmapContainer.appendChild(grid);
    }

    /**
     * Share heatmap as image
     */
    shareHeatmap() {
        const heatmapEl = document.getElementById('heatmap');
        if (!heatmapEl) return;

        // Create canvas from heatmap
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 500;
        canvas.height = 200;

        // Draw background
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw title
        ctx.fillStyle = '#2ecc71';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('My Annual Habit Heatmap', 10, 30);

        // Draw heatmap simplified
        const cellSize = 2;
        const cellGap = 1;
        let x = 10;
        let y = 60;

        document.querySelectorAll('.heatmap-cell').forEach((cell, idx) => {
            const level = cell.className.match(/level\d|empty/)[0];
            switch (level) {
                case 'level4': ctx.fillStyle = '#2ecc71'; break;
                case 'level3': ctx.fillStyle = '#27ae60'; break;
                case 'level2': ctx.fillStyle = '#1f8e4d'; break;
                case 'level1': ctx.fillStyle = '#186d3b'; break;
                default: ctx.fillStyle = '#1a1a2e';
            }

            ctx.fillRect(x, y, cellSize, cellSize);
            x += cellSize + cellGap;

            if ((idx + 1) % 52 === 0) {
                x = 10;
                y += cellSize + cellGap;
            }
        });

        // Download image
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'habit-heatmap.png';
            a.click();
        });
    }

    /**
     * Render all UI
     */
    renderUI() {
        this.renderTodayTab();
        this.renderHabitsTab();
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const isDark = document.body.classList.toggle('light-mode');
        const theme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }
}

// Initialize app
const app = new HabitTracker();

// Load theme preference
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
}
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
}