// Vocabulary page JavaScript

let vocabularyData = [];
let filteredData = [];
let categories = [];

// DOM elements
let vocabularyGrid;
let searchInput;
let categoryFilter;
let totalWordsElement;
let currentCategoryElement;
let loadingElement;
let noResultsElement;

// Initialize vocabulary page
document.addEventListener('DOMContentLoaded', function() {
    initializeVocabularyPage();
});

function initializeVocabularyPage() {
    // Get DOM elements
    vocabularyGrid = document.getElementById('vocabularyGrid');
    searchInput = document.getElementById('searchInput');
    categoryFilter = document.getElementById('categoryFilter');
    totalWordsElement = document.getElementById('totalWords');
    currentCategoryElement = document.getElementById('currentCategory');
    loadingElement = document.getElementById('loading');
    noResultsElement = document.getElementById('noResults');
    
    // Load initial data
    loadVocabularyData();
    loadCategories();
    
    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterVocabulary();
        });
    }
    
    // Category filter
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterVocabulary();
        });
    }
}

async function loadVocabularyData() {
    try {
        showLoading();
        vocabularyData = await ChineseLearningApp.fetchAPI('/api/vocabulary');
        filteredData = [...vocabularyData];
        renderVocabulary();
        updateStats();
    } catch (error) {
        console.error('Error loading vocabulary:', error);
        ChineseLearningApp.showError('Failed to load vocabulary data', vocabularyGrid.parentNode);
    } finally {
        hideLoading();
    }
}

async function loadCategories() {
    try {
        categories = await ChineseLearningApp.fetchAPI('/api/categories');
        populateCategoryFilter();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function populateCategoryFilter() {
    if (!categoryFilter) return;
    
    // Clear existing options (except "All Categories")
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = capitalizeFirst(category);
        categoryFilter.appendChild(option);
    });
}

function filterVocabulary() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    
    filteredData = vocabularyData.filter(word => {
        const matchesSearch = !searchTerm || 
            word.chinese.toLowerCase().includes(searchTerm) ||
            word.pinyin.toLowerCase().includes(searchTerm) ||
            word.indonesian.toLowerCase().includes(searchTerm);
        
        const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    renderVocabulary();
    updateStats();
}

function renderVocabulary() {
    if (!vocabularyGrid) return;
    
    vocabularyGrid.innerHTML = '';
    
    if (filteredData.length === 0) {
        showNoResults();
        return;
    }
    
    hideNoResults();
    
    filteredData.forEach(word => {
        const card = createVocabularyCard(word);
        vocabularyGrid.appendChild(card);
    });
    
    // Trigger animation for new cards
    setTimeout(() => {
        vocabularyGrid.querySelectorAll('.vocab-card').forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }, 10);
}

function createVocabularyCard(word) {
    const card = document.createElement('div');
    card.className = 'vocab-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.3s ease';
    
    card.innerHTML = `
        <div class="chinese">${word.chinese}</div>
        <div class="pinyin">${word.pinyin}</div>
        <div class="indonesian">${word.indonesian}</div>
        <span class="category-tag">${capitalizeFirst(word.category)}</span>
    `;
    
    // Add click event to open modal
    card.addEventListener('click', function() {
        openVocabularyModal(word);
    });
    
    return card;
}

function openVocabularyModal(word) {
    // Update modal content
    document.getElementById('modalChinese').textContent = word.chinese;
    document.getElementById('modalPinyin').textContent = word.pinyin;
    document.getElementById('modalIndonesian').textContent = word.indonesian;
    document.getElementById('modalCategory').textContent = capitalizeFirst(word.category);
    
    // Set up pronounce button
    const pronounceBtn = document.getElementById('pronounceBtn');
    if (pronounceBtn) {
        pronounceBtn.onclick = function() {
            ChineseLearningApp.speakChinese(word.chinese);
        };
    }
    
    // Set up practice button
    const practiceBtn = document.getElementById('practiceBtn');
    if (practiceBtn) {
        practiceBtn.onclick = function() {
            // Close modal and redirect to quiz
            ChineseLearningApp.closeModal('vocabularyModal');
            window.location.href = '/quiz';
        };
    }
    
    // Open modal
    ChineseLearningApp.openModal('vocabularyModal');
}

function updateStats() {
    if (totalWordsElement) {
        totalWordsElement.textContent = filteredData.length;
    }
    
    if (currentCategoryElement) {
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        currentCategoryElement.textContent = selectedCategory === 'all' ? 'Semua' : capitalizeFirst(selectedCategory);
    }
}

function showLoading() {
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }
    if (vocabularyGrid) {
        vocabularyGrid.style.display = 'none';
    }
}

function hideLoading() {
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    if (vocabularyGrid) {
        vocabularyGrid.style.display = 'grid';
    }
}

function showNoResults() {
    if (noResultsElement) {
        noResultsElement.style.display = 'block';
    }
    if (vocabularyGrid) {
        vocabularyGrid.style.display = 'none';
    }
}

function hideNoResults() {
    if (noResultsElement) {
        noResultsElement.style.display = 'none';
    }
    if (vocabularyGrid) {
        vocabularyGrid.style.display = 'grid';
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Focus search on Ctrl+F or Cmd+F
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Clear search on Escape
    if (e.key === 'Escape' && searchInput && document.activeElement === searchInput) {
        searchInput.value = '';
        filterVocabulary();
        searchInput.blur();
    }
});

// Export functions for external use
window.VocabularyPage = {
    loadVocabularyData,
    filterVocabulary,
    openVocabularyModal
};